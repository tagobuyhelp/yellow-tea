import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import adminAPI from "@/services/admin";

type DraftMode = "create" | "edit";

type DraftImageEntry =
  | { kind: "url"; url: string }
  | { kind: "file"; key: string; name: string; type: string; lastModified: number };

type DraftRecord<T> = {
  meta: {
    draftId: string | null;
    clientId: string;
    tabId: string;
    mode: DraftMode;
    productId: string | null;
    revision: number;
    updatedAt: string;
    lastSavedAt: string | null;
    lastSyncedAt: string | null;
    conflictWithRevision: number | null;
  };
  data: T & { images?: DraftImageEntry[] };
};

type SyncQueueItem = {
  draftKey: string;
  payload: {
    mode: DraftMode;
    productId?: string;
    data: unknown;
    clientId: string;
    revision: number;
    updatedAt: string;
  };
  attempts: number;
  nextAttemptAt: number;
  blockedByConflict: boolean;
};

const DRAFT_DB_NAME = "yellow-tea-drafts";
const DRAFT_DB_VERSION = 1;
const FILE_STORE = "files";

const SYNC_QUEUE_KEY = "yt:draftSyncQueue:v1";
const TAB_ID_KEY = "yt:tabId";

const openDb = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DRAFT_DB_NAME, DRAFT_DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(FILE_STORE)) {
        db.createObjectStore(FILE_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const idbPut = async (key: string, value: unknown) => {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(FILE_STORE, "readwrite");
    const store = tx.objectStore(FILE_STORE);
    store.put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
};

const idbGet = async (key: string): Promise<unknown | null> => {
  const db = await openDb();
  return await new Promise((resolve, reject) => {
    const tx = db.transaction(FILE_STORE, "readonly");
    const store = tx.objectStore(FILE_STORE);
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
};

const idbDelete = async (key: string) => {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(FILE_STORE, "readwrite");
    const store = tx.objectStore(FILE_STORE);
    store.delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
};

const getOrCreateTabId = () => {
  const existing = sessionStorage.getItem(TAB_ID_KEY);
  if (existing) return existing;
  const next = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  sessionStorage.setItem(TAB_ID_KEY, next);
  return next;
};

const getOrCreateClientId = () => {
  const key = "yt:clientId";
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const next = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  localStorage.setItem(key, next);
  return next;
};

const safeParse = <T,>(value: string | null): T | null => {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

const readQueue = (): SyncQueueItem[] => safeParse<SyncQueueItem[]>(localStorage.getItem(SYNC_QUEUE_KEY)) || [];

const writeQueue = (items: SyncQueueItem[]) => {
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(items));
};

const fingerprintFile = (file: File) => `${file.name}|${file.size}|${file.lastModified}|${file.type}`;

const isFile = (value: unknown): value is File => typeof File !== "undefined" && value instanceof File;

export type DraftUiStatus = "idle" | "saving" | "saved" | "offline" | "error" | "conflict";

export const useProductDraft = <T extends { images?: Array<string | File> }>({
  enabled,
  mode,
  productId,
  getData,
  applyData,
}: {
  enabled: boolean;
  mode: DraftMode;
  productId?: string;
  getData: () => T;
  applyData: (data: T) => void;
}) => {
  const draftKey = useMemo(() => `yt:draftProduct:${mode}:${productId || "new"}`, [mode, productId]);

  const tabId = useMemo(() => getOrCreateTabId(), []);
  const clientId = useMemo(() => getOrCreateClientId(), []);

  const [uiStatus, setUiStatus] = useState<DraftUiStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [recoveryInfo, setRecoveryInfo] = useState<{ updatedAt: Date; source: "local" | "server" } | null>(null);
  const [conflictInfo, setConflictInfo] = useState<{ serverRevision: number; serverUpdatedAt: Date } | null>(null);

  const draftIdRef = useRef<string | null>(null);
  const revisionRef = useRef<number>(0);
  const lastSerializedRef = useRef<string>("");
  const lastPersistedSnapshotRef = useRef<string>("");
  const saveTimerRef = useRef<number | null>(null);
  const isOnlineRef = useRef<boolean>(typeof navigator !== "undefined" ? navigator.onLine : true);
  const fileKeyMapRef = useRef<Map<string, string>>(new Map());

  const serializeDraft = useCallback(async (data: T) => {
    const images = Array.isArray(data.images) ? data.images : [];
    const imageEntries: DraftImageEntry[] = [];

    for (const img of images) {
      if (typeof img === "string") {
        if (img.trim()) imageEntries.push({ kind: "url", url: img });
        continue;
      }
      if (isFile(img)) {
        const fp = fingerprintFile(img);
        let key = fileKeyMapRef.current.get(fp);
        if (!key) {
          key = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
          fileKeyMapRef.current.set(fp, key);
        }
        await idbPut(key, { blob: img, name: img.name, type: img.type, lastModified: img.lastModified });
        imageEntries.push({ kind: "file", key, name: img.name, type: img.type, lastModified: img.lastModified });
      }
    }

    const cloned = { ...(data as Record<string, unknown>) } as Record<string, unknown>;
    cloned.images = imageEntries;
    return cloned as T & { images: DraftImageEntry[] };
  }, []);

  const hydrateDraft = useCallback(async (draftData: T & { images?: DraftImageEntry[] }) => {
    const images: Array<string | File> = [];
    const entries = Array.isArray(draftData.images) ? draftData.images : [];

    for (const entry of entries) {
      if (entry.kind === "url") {
        images.push(entry.url);
      } else if (entry.kind === "file") {
        const stored = await idbGet(entry.key);
        if (stored && typeof stored === "object") {
          const blob = (stored as { blob?: Blob }).blob;
          const name = (stored as { name?: string }).name || entry.name;
          const type = (stored as { type?: string }).type || entry.type;
          const lastModified = (stored as { lastModified?: number }).lastModified || entry.lastModified;
          if (blob) {
            images.push(new File([blob], name, { type, lastModified }));
          }
        }
      }
    }

    const cloned = { ...(draftData as Record<string, unknown>) } as Record<string, unknown>;
    cloned.images = images;
    applyData(cloned as T);
  }, [applyData]);

  const writeLocalDraft = useCallback(async (data: T) => {
    setUiStatus(isOnlineRef.current ? "saving" : "offline");
    const now = new Date();
    const updatedAt = now.toISOString();
    revisionRef.current = revisionRef.current + 1;

    const serializedData = await serializeDraft(data);
    const record: DraftRecord<T> = {
      meta: {
        draftId: draftIdRef.current,
        clientId,
        tabId,
        mode,
        productId: productId || null,
        revision: revisionRef.current,
        updatedAt,
        lastSavedAt: updatedAt,
        lastSyncedAt: lastSyncedAt ? lastSyncedAt.toISOString() : null,
        conflictWithRevision: conflictInfo ? conflictInfo.serverRevision : null,
      },
      data: serializedData,
    };

    localStorage.setItem(draftKey, JSON.stringify(record));
    lastPersistedSnapshotRef.current = lastSerializedRef.current;
    setLastSavedAt(now);
    if (isOnlineRef.current) setUiStatus("saved");
  }, [clientId, conflictInfo, draftKey, lastSyncedAt, mode, productId, serializeDraft, tabId]);

  const enqueueSync = useCallback((data: DraftRecord<T>) => {
    const queue = readQueue();
    const existingIndex = queue.findIndex((q) => q.draftKey === draftKey);
    const nextItem: SyncQueueItem = {
      draftKey,
      payload: {
        mode: data.meta.mode,
        productId: data.meta.productId || undefined,
        data: data.data,
        clientId: data.meta.clientId,
        revision: data.meta.revision,
        updatedAt: data.meta.updatedAt,
      },
      attempts: existingIndex >= 0 ? queue[existingIndex].attempts : 0,
      nextAttemptAt: Date.now(),
      blockedByConflict: false,
    };

    if (existingIndex >= 0) {
      queue[existingIndex] = nextItem;
    } else {
      queue.push(nextItem);
    }
    writeQueue(queue);
  }, [draftKey]);

  const processQueue = useCallback(async () => {
    if (!isOnlineRef.current) return;

    const queue = readQueue();
    const now = Date.now();
    const runnable = queue.filter((q) => q.nextAttemptAt <= now && !q.blockedByConflict);
    if (!runnable.length) return;

    for (const item of runnable) {
      try {
        const res = await adminAPI.saveDraftProduct(item.payload);
        if (res?.success && res?.data?._id) {
          draftIdRef.current = res.data._id;
          setLastSyncedAt(new Date());
          setUiStatus("saved");

          const nextQueue = readQueue().filter((q) => q.draftKey !== item.draftKey);
          writeQueue(nextQueue);

          const local = safeParse<DraftRecord<T>>(localStorage.getItem(item.draftKey));
          if (local) {
            const updated: DraftRecord<T> = {
              ...local,
              meta: {
                ...local.meta,
                draftId: res.data._id,
                lastSyncedAt: new Date().toISOString(),
                conflictWithRevision: null,
              },
            };
            localStorage.setItem(item.draftKey, JSON.stringify(updated));
          }
        } else if (res?.statusCode === 409 && res?.data?.revision != null && res?.data?.updated_at) {
          const serverRevision = Number(res.data.revision) || 0;
          const serverUpdatedAt = new Date(res.data.updated_at);
          setConflictInfo({ serverRevision, serverUpdatedAt });
          setUiStatus("conflict");

          const nextQueue = readQueue().map((q) => (q.draftKey === item.draftKey ? { ...q, blockedByConflict: true } : q));
          writeQueue(nextQueue);
        } else {
          throw new Error(res?.message || "Draft sync failed");
        }
      } catch {
        const nextQueue = readQueue().map((q) => {
          if (q.draftKey !== item.draftKey) return q;
          const attempts = q.attempts + 1;
          const delay = Math.min(5 * 60_000, 2_000 * Math.pow(2, attempts));
          return { ...q, attempts, nextAttemptAt: Date.now() + delay };
        });
        writeQueue(nextQueue);
        setUiStatus(isOnlineRef.current ? "error" : "offline");
      }
    }
  }, []);

  const flushSave = useCallback(async () => {
    if (!enabled) return;
    const snapshot = JSON.stringify({
      ...getData(),
      images: (Array.isArray(getData().images) ? getData().images : []).map((img) => (typeof img === "string" ? img : isFile(img) ? fingerprintFile(img) : "")),
    });
    if (snapshot === lastPersistedSnapshotRef.current) return;

    lastSerializedRef.current = snapshot;
    const data = getData();
    await writeLocalDraft(data);
    const record = safeParse<DraftRecord<T>>(localStorage.getItem(draftKey));
    if (record) enqueueSync(record);
    void processQueue();
  }, [draftKey, enabled, enqueueSync, getData, processQueue, writeLocalDraft]);

  const flushSaveWith = useCallback(async (data: T) => {
    if (!enabled) return;
    const snapshot = JSON.stringify({
      ...data,
      images: (Array.isArray(data.images) ? data.images : []).map((img) => (typeof img === "string" ? img : isFile(img) ? fingerprintFile(img) : "")),
    });
    if (snapshot === lastPersistedSnapshotRef.current) return;

    lastSerializedRef.current = snapshot;
    await writeLocalDraft(data);
    const record = safeParse<DraftRecord<T>>(localStorage.getItem(draftKey));
    if (record) enqueueSync(record);
    void processQueue();
  }, [draftKey, enabled, enqueueSync, processQueue, writeLocalDraft]);

  const scheduleSave = useCallback(() => {
    if (!enabled) return;
    const data = getData();
    const snapshot = JSON.stringify({
      ...data,
      images: (Array.isArray(data.images) ? data.images : []).map((img) => (typeof img === "string" ? img : isFile(img) ? fingerprintFile(img) : "")),
    });

    if (snapshot === lastPersistedSnapshotRef.current) return;
    lastSerializedRef.current = snapshot;

    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      void flushSave();
    }, 2500);
  }, [enabled, flushSave, getData]);

  const clearDraft = useCallback(async () => {
    const local = safeParse<DraftRecord<T>>(localStorage.getItem(draftKey));
    localStorage.removeItem(draftKey);

    const queue = readQueue().filter((q) => q.draftKey !== draftKey);
    writeQueue(queue);

    if (local?.meta?.draftId) {
      try {
        await adminAPI.deleteDraftProduct(local.meta.draftId);
      } catch (error) {
        void error;
      }
    }

    const entries = Array.isArray(local?.data?.images) ? (local?.data?.images as DraftImageEntry[]) : [];
    const fileKeys = entries.filter((e) => e.kind === "file").map((e) => e.key);
    for (const key of fileKeys) {
      try {
        await idbDelete(key);
      } catch (error) {
        void error;
      }
    }

    draftIdRef.current = null;
    revisionRef.current = 0;
    setConflictInfo(null);
    setUiStatus("idle");
    setLastSavedAt(null);
    setLastSyncedAt(null);
  }, [draftKey]);

  const resolveConflictKeepLocal = useCallback(async () => {
    if (!conflictInfo) return;
    const local = safeParse<DraftRecord<T>>(localStorage.getItem(draftKey));
    if (!local) return;

    const nextRevision = Math.max(local.meta.revision, conflictInfo.serverRevision + 1);
    const updatedAt = new Date().toISOString();
    const updated: DraftRecord<T> = {
      ...local,
      meta: {
        ...local.meta,
        revision: nextRevision,
        updatedAt,
        conflictWithRevision: null,
      },
    };
    localStorage.setItem(draftKey, JSON.stringify(updated));
    revisionRef.current = nextRevision;
    setConflictInfo(null);
    setUiStatus(isOnlineRef.current ? "saving" : "offline");

    const queue = readQueue().map((q) => (q.draftKey === draftKey ? { ...q, blockedByConflict: false } : q));
    writeQueue(queue);
    enqueueSync(updated);
    void processQueue();
  }, [conflictInfo, draftKey, enqueueSync, processQueue]);

  const restoreLatestDraft = useCallback(async () => {
    const local = safeParse<DraftRecord<T>>(localStorage.getItem(draftKey));
    const server = isOnlineRef.current ? await adminAPI.getDraftProduct({ mode, productId }) : null;
    const serverDraft = server?.success ? server?.data : null;

    const localUpdatedAt = local?.meta?.updatedAt ? new Date(local.meta.updatedAt) : null;
    const serverUpdatedAt = serverDraft?.updated_at ? new Date(serverDraft.updated_at) : null;

    const useServer = Boolean(serverDraft) && (localUpdatedAt ? Boolean(serverUpdatedAt) && serverUpdatedAt.getTime() > localUpdatedAt.getTime() : Boolean(serverUpdatedAt));

    const selected = useServer ? serverDraft : local;

    if (!selected) {
      setIsRecoveryOpen(false);
      setRecoveryInfo(null);
      return;
    }

    if (useServer) {
      draftIdRef.current = serverDraft._id;
      revisionRef.current = Number(serverDraft.revision) || 0;
      const data = serverDraft.data as T & { images?: DraftImageEntry[] };
      await hydrateDraft(data);
    } else if (local) {
      draftIdRef.current = local.meta.draftId;
      revisionRef.current = local.meta.revision || 0;
      await hydrateDraft(local.data);
    }

    setIsRecoveryOpen(false);
  }, [draftKey, hydrateDraft, mode, productId]);

  const discardDraft = useCallback(async () => {
    await clearDraft();
    setIsRecoveryOpen(false);
  }, [clearDraft]);

  useEffect(() => {
    if (!enabled) return;

    isOnlineRef.current = navigator.onLine;
    setUiStatus(isOnlineRef.current ? "idle" : "offline");

    const onOnline = () => {
      isOnlineRef.current = true;
      setUiStatus("saving");
      void processQueue();
    };
    const onOffline = () => {
      isOnlineRef.current = false;
      setUiStatus("offline");
    };

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [enabled, processQueue]);

  useEffect(() => {
    if (!enabled) return;

    const local = safeParse<DraftRecord<T>>(localStorage.getItem(draftKey));
    if (local?.meta?.draftId) draftIdRef.current = local.meta.draftId;
    if (typeof local?.meta?.revision === "number") revisionRef.current = local.meta.revision;
    if (local?.meta?.lastSavedAt) setLastSavedAt(new Date(local.meta.lastSavedAt));
    if (local?.meta?.lastSyncedAt) setLastSyncedAt(new Date(local.meta.lastSyncedAt));

    const checkRecovery = async () => {
      const localDraft = safeParse<DraftRecord<T>>(localStorage.getItem(draftKey));
      const hasLocal = Boolean(localDraft?.meta?.updatedAt);

      let serverDraft: { _id?: string; revision?: number; updated_at?: string; data?: unknown } | null = null;
      if (isOnlineRef.current) {
        try {
          const res = await adminAPI.getDraftProduct({ mode, productId });
          if (res?.success) serverDraft = res.data;
        } catch (error) {
          void error;
        }
      }

      const localUpdatedAt = hasLocal ? new Date(localDraft!.meta.updatedAt) : null;
      const serverUpdatedAt = serverDraft?.updated_at ? new Date(serverDraft.updated_at) : null;

      if (!hasLocal && !serverUpdatedAt) return;

      const useServer = serverUpdatedAt ? (!localUpdatedAt || serverUpdatedAt.getTime() > localUpdatedAt.getTime()) : false;

      setRecoveryInfo(
        useServer
          ? { updatedAt: serverUpdatedAt!, source: "server" }
          : { updatedAt: localUpdatedAt!, source: "local" }
      );
      setIsRecoveryOpen(true);
    };

    void checkRecovery();
  }, [draftKey, enabled, mode, productId]);

  useEffect(() => {
    if (!enabled) return;
    scheduleSave();
  });

  useEffect(() => {
    if (!enabled) return;

    const onStorage = (e: StorageEvent) => {
      if (e.key !== draftKey) return;
      const next = safeParse<DraftRecord<T>>(e.newValue);
      if (!next) return;
      if (next.meta.tabId === tabId) return;
      if (next.meta.updatedAt && lastSavedAt && new Date(next.meta.updatedAt).getTime() > lastSavedAt.getTime()) {
        setUiStatus("conflict");
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [draftKey, enabled, lastSavedAt, tabId]);

  useEffect(() => {
    if (!enabled) return;

    const onBeforeUnload = () => {
      try {
        const data = getData();
        const snapshot = JSON.stringify({
          ...data,
          images: (Array.isArray(data.images) ? data.images : []).map((img) => (typeof img === "string" ? img : "")),
        });
        if (snapshot !== lastPersistedSnapshotRef.current) {
          const now = new Date();
          const record = safeParse<DraftRecord<T>>(localStorage.getItem(draftKey));
          const nextRecord = record || {
            meta: {
              draftId: draftIdRef.current,
              clientId,
              tabId,
              mode,
              productId: productId || null,
              revision: revisionRef.current,
              updatedAt: now.toISOString(),
              lastSavedAt: null,
              lastSyncedAt: null,
              conflictWithRevision: null,
            },
            data,
          };
          nextRecord.meta.updatedAt = now.toISOString();
          nextRecord.meta.lastSavedAt = now.toISOString();
          localStorage.setItem(draftKey, JSON.stringify(nextRecord));
          lastPersistedSnapshotRef.current = snapshot;
        }
      } catch (error) {
        void error;
      }
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [clientId, draftKey, enabled, getData, mode, productId, tabId]);

  return {
    draftKey,
    uiStatus,
    isOnline: isOnlineRef.current,
    lastSavedAt,
    lastSyncedAt,
    isRecoveryOpen,
    recoveryInfo,
    openRecovery: () => setIsRecoveryOpen(true),
    closeRecovery: () => setIsRecoveryOpen(false),
    restoreLatestDraft,
    discardDraft,
    scheduleSave,
    flushSave,
    flushSaveWith,
    clearDraft,
    conflictInfo,
    resolveConflictKeepLocal,
  };
};

export const useDraftAutoSave = useProductDraft;
