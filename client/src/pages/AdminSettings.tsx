import React, { useEffect, useMemo, useState } from "react";
import adminAPI from "@/services/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2, Save } from "lucide-react";
import { Bell, CreditCard, Shield, Store, Truck } from "lucide-react";

type SettingsData = {
  store: {
    name: string;
    description: string;
    email: string;
    phone: string;
    address: string;
    currency: string;
    timezone: string;
    logoUrl: string;
  };
  payments: {
    razorpayEnabled: boolean;
    razorpayKeyId: string;
    razorpayKeySecretSet?: boolean;
    codEnabled: boolean;
    minOrderAmount: number;
    maxOrderAmount: number;
  };
  shipping: {
    freeShippingThreshold: number;
    standardShipping: number;
    expressShipping: number;
    internationalShipping: number;
    shippingTax: number;
    pickupPincode: string;
    chargeDelivery: boolean;
    chargeGST: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    orderNotifications: boolean;
    lowStockAlerts: boolean;
    customerRegistration: boolean;
    weeklyReports: boolean;
  };
  version?: number;
  updatedAt?: string;
};

type SettingsSection = "store" | "payments" | "shipping" | "notifications" | "security";

const emptySettings: SettingsData = {
  store: {
    name: "",
    description: "",
    email: "",
    phone: "",
    address: "",
    currency: "INR",
    timezone: "Asia/Kolkata",
    logoUrl: "",
  },
  payments: {
    razorpayEnabled: false,
    razorpayKeyId: "",
    razorpayKeySecretSet: false,
    codEnabled: true,
    minOrderAmount: 0,
    maxOrderAmount: 0,
  },
  shipping: {
    freeShippingThreshold: 0,
    standardShipping: 0,
    expressShipping: 0,
    internationalShipping: 0,
    shippingTax: 0,
    pickupPincode: "",
    chargeDelivery: false,
    chargeGST: false,
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: false,
    orderNotifications: true,
    lowStockAlerts: true,
    customerRegistration: true,
    weeklyReports: true,
  },
};

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const AdminSettings: React.FC = () => {
  const { toast } = useToast();

  const [activeSection, setActiveSection] = useState<SettingsSection>("store");
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<SettingsSection | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [settings, setSettings] = useState<SettingsData>(emptySettings);
  const [originalSettings, setOriginalSettings] = useState<SettingsData>(emptySettings);

  const [razorpaySecretDraft, setRazorpaySecretDraft] = useState("");
  const [showRazorpaySecret, setShowRazorpaySecret] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await adminAPI.getSettings();
      if (!res?.success) {
        throw new Error(res?.message || "Failed to load settings");
      }

      const incoming = res.data?.settings as SettingsData | undefined;
      if (!incoming) {
        throw new Error("Settings payload missing");
      }

      setSettings(incoming);
      setOriginalSettings(incoming);
    } catch (error) {
      console.error("Error fetching settings:", error);
      setErrorMessage("Unable to load settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchSettings();
  }, []);

  const navItems = useMemo(
    () =>
      [
        { id: "store" as const, label: "Store", icon: Store },
        { id: "payments" as const, label: "Payments", icon: CreditCard },
        { id: "shipping" as const, label: "Shipping", icon: Truck },
        { id: "notifications" as const, label: "Notifications", icon: Bell },
        { id: "security" as const, label: "Security", icon: Shield },
      ],
    []
  );

  const saveStore = async () => {
    const next = settings.store;
    if (!next.name.trim()) {
      toast({ title: "Store name required", description: "Please enter a store name.", variant: "destructive" });
      return;
    }
    if (next.email && !isValidEmail(next.email)) {
      toast({ title: "Invalid email", description: "Please enter a valid store email address.", variant: "destructive" });
      return;
    }

    const patch: Partial<SettingsData["store"]> = {};
    for (const key of Object.keys(next) as Array<keyof SettingsData["store"]>) {
      if (next[key] !== originalSettings.store[key]) patch[key] = next[key];
    }
    if (!Object.keys(patch).length) {
      toast({ title: "No changes", description: "Store settings are already up to date." });
      return;
    }

    setSavingSection("store");
    try {
      const res = await adminAPI.updateSettingsGroup("store", patch);
      if (!res?.success) throw new Error(res?.message || "Failed to save store settings");
      const updated = res.data?.settings as SettingsData | undefined;
      if (updated) {
        setSettings(updated);
        setOriginalSettings(updated);
      }
      toast({ title: "Settings saved", description: "Store settings saved successfully." });
    } catch (error) {
      console.error(error);
      toast({ title: "Save failed", description: "Unable to save store settings.", variant: "destructive" });
    } finally {
      setSavingSection(null);
    }
  };

  const savePayments = async () => {
    const next = settings.payments;
    const patch: Record<string, unknown> = {};
    for (const key of Object.keys(next) as Array<keyof SettingsData["payments"]>) {
      if (key === "razorpayKeySecretSet") continue;
      if (next[key] !== originalSettings.payments[key]) patch[key] = next[key];
    }
    if (razorpaySecretDraft.trim()) {
      patch.razorpayKeySecret = razorpaySecretDraft.trim();
    }
    if (!Object.keys(patch).length) {
      toast({ title: "No changes", description: "Payment settings are already up to date." });
      return;
    }

    setSavingSection("payments");
    try {
      const res = await adminAPI.updateSettingsGroup("payments", patch);
      if (!res?.success) throw new Error(res?.message || "Failed to save payment settings");
      const updated = res.data?.settings as SettingsData | undefined;
      if (updated) {
        setSettings(updated);
        setOriginalSettings(updated);
      }
      setRazorpaySecretDraft("");
      setShowRazorpaySecret(false);
      toast({ title: "Settings saved", description: "Payment settings saved successfully." });
    } catch (error) {
      console.error(error);
      toast({ title: "Save failed", description: "Unable to save payment settings.", variant: "destructive" });
    } finally {
      setSavingSection(null);
    }
  };

  const saveShipping = async () => {
    const next = settings.shipping;
    if (next.pickupPincode && !/^\d{6}$/.test(next.pickupPincode)) {
      toast({ title: "Invalid pickup pincode", description: "Pickup pincode must be 6 digits.", variant: "destructive" });
      return;
    }
    const patch: Partial<SettingsData["shipping"]> = {};
    for (const key of Object.keys(next) as Array<keyof SettingsData["shipping"]>) {
      if (next[key] !== originalSettings.shipping[key]) patch[key] = next[key];
    }
    if (!Object.keys(patch).length) {
      toast({ title: "No changes", description: "Shipping settings are already up to date." });
      return;
    }

    setSavingSection("shipping");
    try {
      const res = await adminAPI.updateSettingsGroup("shipping", patch);
      if (!res?.success) throw new Error(res?.message || "Failed to save shipping settings");
      const updated = res.data?.settings as SettingsData | undefined;
      if (updated) {
        setSettings(updated);
        setOriginalSettings(updated);
      }
      toast({ title: "Settings saved", description: "Shipping settings saved successfully." });
    } catch (error) {
      console.error(error);
      toast({ title: "Save failed", description: "Unable to save shipping settings.", variant: "destructive" });
    } finally {
      setSavingSection(null);
    }
  };

  const saveNotifications = async () => {
    const next = settings.notifications;
    const patch: Partial<SettingsData["notifications"]> = {};
    for (const key of Object.keys(next) as Array<keyof SettingsData["notifications"]>) {
      if (next[key] !== originalSettings.notifications[key]) patch[key] = next[key];
    }
    if (!Object.keys(patch).length) {
      toast({ title: "No changes", description: "Notification settings are already up to date." });
      return;
    }

    setSavingSection("notifications");
    try {
      const res = await adminAPI.updateSettingsGroup("notifications", patch);
      if (!res?.success) throw new Error(res?.message || "Failed to save notification settings");
      const updated = res.data?.settings as SettingsData | undefined;
      if (updated) {
        setSettings(updated);
        setOriginalSettings(updated);
      }
      toast({ title: "Settings saved", description: "Notification settings saved successfully." });
    } catch (error) {
      console.error(error);
      toast({ title: "Save failed", description: "Unable to save notification settings.", variant: "destructive" });
    } finally {
      setSavingSection(null);
    }
  };

  const savePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast({ title: "Missing fields", description: "Please enter your current and new password.", variant: "destructive" });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast({ title: "Weak password", description: "New password must be at least 8 characters.", variant: "destructive" });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({ title: "Passwords do not match", description: "Please confirm your new password.", variant: "destructive" });
      return;
    }

    setSavingSection("security");
    try {
      const res = await adminAPI.updatePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      if (!res?.success) throw new Error(res?.message || "Failed to update password");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast({ title: "Password updated", description: "Your password has been updated successfully." });
    } catch (error) {
      console.error(error);
      toast({ title: "Update failed", description: "Unable to update password.", variant: "destructive" });
    } finally {
      setSavingSection(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading settings…
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-64 flex items-center justify-center">
        <div className="max-w-md text-center space-y-4">
          <div className="text-lg font-heading font-semibold text-foreground">Unable to load settings</div>
          <div className="text-sm text-muted-foreground">{errorMessage}</div>
          <Button onClick={fetchSettings}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Centralized configuration for store, payments, shipping, and notifications.</p>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-6 items-start">
        <Card className="rounded-xl shadow-sm lg:sticky lg:top-24">
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-base">Sections</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    active ? "bg-yt-yellow/15 text-yt-text" : "hover:bg-yt-yellow/10 text-muted-foreground hover:text-yt-text"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className={active ? "font-semibold" : "font-medium"}>{item.label}</span>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {activeSection === "store" && (
            <Card className="rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle className="font-heading text-lg flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Store Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 [&_label]:mb-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="storeName">Store Name</Label>
                    <Input
                      id="storeName"
                      value={settings.store.name}
                      placeholder="e.g., Yellow Tea"
                      onChange={(e) => setSettings((prev) => ({ ...prev, store: { ...prev.store, name: e.target.value } }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="storeEmail">Store Email</Label>
                    <Input
                      id="storeEmail"
                      type="email"
                      value={settings.store.email}
                      placeholder="e.g., support@yellowtea.in"
                      onChange={(e) => setSettings((prev) => ({ ...prev, store: { ...prev.store, email: e.target.value } }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="storePhone">Store Phone</Label>
                    <Input
                      id="storePhone"
                      value={settings.store.phone}
                      placeholder="e.g., +91 98765 43210"
                      onChange={(e) => setSettings((prev) => ({ ...prev, store: { ...prev.store, phone: e.target.value } }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={settings.store.currency} onValueChange={(value) => setSettings((prev) => ({ ...prev, store: { ...prev.store, currency: value } }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="storeDescription">Store Description</Label>
                  <Textarea
                    id="storeDescription"
                    value={settings.store.description}
                    placeholder="e.g., Premium whole leaf tea sourced ethically from India."
                    onChange={(e) => setSettings((prev) => ({ ...prev, store: { ...prev.store, description: e.target.value } }))}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="storeAddress">Store Address</Label>
                  <Textarea
                    id="storeAddress"
                    value={settings.store.address}
                    placeholder="e.g., 123 Tea Garden, Assam, India"
                    onChange={(e) => setSettings((prev) => ({ ...prev, store: { ...prev.store, address: e.target.value } }))}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={saveStore} disabled={savingSection === "store"}>
                    {savingSection === "store" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Store
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === "payments" && (
            <Card className="rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle className="font-heading text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 [&_label]:mb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-foreground">Razorpay Integration</div>
                    <div className="text-sm text-muted-foreground">Enable online payments via Razorpay.</div>
                  </div>
                  <Switch checked={settings.payments.razorpayEnabled} onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, payments: { ...prev.payments, razorpayEnabled: checked } }))} />
                </div>

                {settings.payments.razorpayEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="razorpayKeyId">Razorpay Key ID</Label>
                      <Input
                        id="razorpayKeyId"
                        value={settings.payments.razorpayKeyId}
                        onChange={(e) => setSettings((prev) => ({ ...prev, payments: { ...prev.payments, razorpayKeyId: e.target.value } }))}
                        placeholder="e.g., rzp_live_..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="razorpayKeySecret">Razorpay Key Secret</Label>
                      <div className="relative">
                        <Input
                          id="razorpayKeySecret"
                          type={showRazorpaySecret ? "text" : "password"}
                          value={razorpaySecretDraft}
                          onChange={(e) => setRazorpaySecretDraft(e.target.value)}
                          placeholder={settings.payments.razorpayKeySecretSet ? "•••••••• (set)" : "••••••••"}
                        />
                        <button
                          type="button"
                          onClick={() => setShowRazorpaySecret((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showRazorpaySecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Leave blank to keep the existing secret.</div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-foreground">Cash on Delivery</div>
                    <div className="text-sm text-muted-foreground">Allow customers to pay on delivery.</div>
                  </div>
                  <Switch checked={settings.payments.codEnabled} onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, payments: { ...prev.payments, codEnabled: checked } }))} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minOrder">Minimum Order Amount (₹)</Label>
                    <Input
                      id="minOrder"
                      type="number"
                      value={settings.payments.minOrderAmount}
                      onChange={(e) => setSettings((prev) => ({ ...prev, payments: { ...prev.payments, minOrderAmount: Number(e.target.value) || 0 } }))}
                      placeholder="e.g., 500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxOrder">Maximum Order Amount (₹)</Label>
                    <Input
                      id="maxOrder"
                      type="number"
                      value={settings.payments.maxOrderAmount}
                      onChange={(e) => setSettings((prev) => ({ ...prev, payments: { ...prev.payments, maxOrderAmount: Number(e.target.value) || 0 } }))}
                      placeholder="e.g., 50000"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={savePayments} disabled={savingSection === "payments"}>
                    {savingSection === "payments" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Payments
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === "shipping" && (
            <Card className="rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle className="font-heading text-lg flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipping
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 [&_label]:mb-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="freeShipping">Free Shipping Threshold (₹)</Label>
                    <Input id="freeShipping" type="number" value={settings.shipping.freeShippingThreshold} onChange={(e) => setSettings((prev) => ({ ...prev, shipping: { ...prev.shipping, freeShippingThreshold: Number(e.target.value) || 0 } }))} />
                  </div>
                  <div>
                    <Label htmlFor="standardShipping">Standard Shipping (₹)</Label>
                    <Input id="standardShipping" type="number" value={settings.shipping.standardShipping} onChange={(e) => setSettings((prev) => ({ ...prev, shipping: { ...prev.shipping, standardShipping: Number(e.target.value) || 0 } }))} />
                  </div>
                  <div>
                    <Label htmlFor="expressShipping">Express Shipping (₹)</Label>
                    <Input id="expressShipping" type="number" value={settings.shipping.expressShipping} onChange={(e) => setSettings((prev) => ({ ...prev, shipping: { ...prev.shipping, expressShipping: Number(e.target.value) || 0 } }))} />
                  </div>
                  <div>
                    <Label htmlFor="internationalShipping">International Shipping (₹)</Label>
                    <Input id="internationalShipping" type="number" value={settings.shipping.internationalShipping} onChange={(e) => setSettings((prev) => ({ ...prev, shipping: { ...prev.shipping, internationalShipping: Number(e.target.value) || 0 } }))} />
                  </div>
                  <div>
                    <Label htmlFor="shippingTax">Shipping Tax (%)</Label>
                    <Input id="shippingTax" type="number" value={settings.shipping.shippingTax} onChange={(e) => setSettings((prev) => ({ ...prev, shipping: { ...prev.shipping, shippingTax: Number(e.target.value) || 0 } }))} />
                  </div>
                  <div>
                    <Label htmlFor="pickupPincode">Pickup Pincode</Label>
                    <Input
                      id="pickupPincode"
                      type="text"
                      value={settings.shipping.pickupPincode}
                      onChange={(e) => setSettings((prev) => ({ ...prev, shipping: { ...prev.shipping, pickupPincode: e.target.value } }))}
                      maxLength={6}
                      pattern="[0-9]{6}"
                      placeholder="e.g., 741165"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between rounded-lg border border-border p-4 bg-card">
                    <div>
                      <div className="font-medium text-foreground">Charge Delivery</div>
                      <div className="text-sm text-muted-foreground">Enable delivery charge calculation.</div>
                    </div>
                    <Switch checked={settings.shipping.chargeDelivery} onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, shipping: { ...prev.shipping, chargeDelivery: checked } }))} />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border p-4 bg-card">
                    <div>
                      <div className="font-medium text-foreground">Charge GST</div>
                      <div className="text-sm text-muted-foreground">Enable GST on shipping totals.</div>
                    </div>
                    <Switch checked={settings.shipping.chargeGST} onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, shipping: { ...prev.shipping, chargeGST: checked } }))} />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={saveShipping} disabled={savingSection === "shipping"}>
                    {savingSection === "shipping" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Shipping
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === "notifications" && (
            <Card className="rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle className="font-heading text-lg flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(
                  [
                    { key: "emailNotifications", label: "Email notifications", hint: "Receive notifications via email." },
                    { key: "smsNotifications", label: "SMS notifications", hint: "Receive notifications via SMS." },
                    { key: "orderNotifications", label: "Order notifications", hint: "Get notified about new orders." },
                    { key: "lowStockAlerts", label: "Low stock alerts", hint: "Alert when products are low in stock." },
                    { key: "customerRegistration", label: "Customer registration", hint: "Notify when new customers register." },
                    { key: "weeklyReports", label: "Weekly reports", hint: "Receive weekly sales reports." },
                  ] as const
                ).map((item) => (
                  <div key={item.key} className="flex items-center justify-between rounded-lg border border-border p-4 bg-card">
                    <div>
                      <div className="font-medium text-foreground">{item.label}</div>
                      <div className="text-sm text-muted-foreground">{item.hint}</div>
                    </div>
                    <Switch
                      checked={settings.notifications[item.key]}
                      onCheckedChange={(checked) =>
                        setSettings((prev) => ({ ...prev, notifications: { ...prev.notifications, [item.key]: checked } }))
                      }
                    />
                  </div>
                ))}

                <div className="flex justify-end">
                  <Button onClick={saveNotifications} disabled={savingSection === "notifications"}>
                    {savingSection === "notifications" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Notifications
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === "security" && (
            <Card className="rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle className="font-heading text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 [&_label]:mb-2">
                <div className="space-y-3">
                  <div className="text-sm font-heading font-medium text-foreground">Change Password</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                      />
                    </div>
                    <div />
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={savePassword} disabled={savingSection === "security"}>
                    {savingSection === "security" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Update Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
