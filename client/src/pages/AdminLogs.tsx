import React, { useEffect, useMemo, useState } from "react";
import adminAPI from "@/services/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, Info, CheckCircle, XCircle, ScrollText, RefreshCw, LayoutDashboard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface Log {
  _id: string;
  action_type?: string;
  action?: string;
  admin_id?: string;
  admin?: string;
  timestamp?: string;
  created_at?: string;
  details?: unknown;
  message?: string;
  level?: string;
  ip?: string;
  user_agent?: string;
}

const AdminLogs: React.FC = () => {
  const { toast } = useToast();
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const params = { page: currentPage, limit: 20 };
  
      const response = await adminAPI.getAdminLogs(params);
      
      setLogs(response.data.logs || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('❌ Error fetching admin logs:', error);
      setErrorMessage("Unable to load activity logs");
      toast({
        title: "Error",
        description: "Failed to fetch admin logs.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line
  }, [currentPage]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "-" : date.toLocaleString();
  };

  const getLogIcon = (level?: string, action?: string) => {
    const levelStr = typeof level === 'string' ? level.toLowerCase() : '';
    const actionStr = typeof action === 'string' ? action.toLowerCase() : '';
    
    if (levelStr === 'error' || actionStr.includes('error')) return <XCircle className="h-4 w-4 text-yt-error" />;
    if (levelStr === 'warn' || actionStr.includes('warn')) return <AlertCircle className="h-4 w-4 text-yt-yellow" />;
    if (levelStr === 'info' || actionStr.includes('info')) return <Info className="h-4 w-4 text-yt-info" />;
    return <CheckCircle className="h-4 w-4 text-yt-success" />;
  };

  const getLogLevelBadge = (level?: string) => {
    if (!level || typeof level !== 'string') return null;
    const levelStr = level.toLowerCase();
    const colors = {
      error: 'bg-yt-error/10 text-yt-error border border-yt-error/20',
      warn: 'bg-yt-yellow/15 text-yt-text border border-yt-yellow/30',
      info: 'bg-yt-info/10 text-yt-info border border-yt-info/20',
      debug: 'bg-muted text-muted-foreground border border-border'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[levelStr as keyof typeof colors] || colors.debug}`}>
        {levelStr.toUpperCase()}
      </span>
    );
  };

  const isEmptyState = useMemo(() => !loading && !errorMessage && logs.length === 0, [errorMessage, loading, logs.length]);
  const isErrorState = useMemo(() => !loading && !!errorMessage && logs.length === 0, [errorMessage, loading, logs.length]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-heading font-semibold text-foreground">Admin Activity Logs</h2>
          <div className="text-sm text-muted-foreground mt-1">Track product changes, order actions, and admin updates.</div>
        </div>
        <Button 
          onClick={fetchLogs} 
          disabled={loading}
          variant="outline"
          size="sm"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Refresh Logs
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-64 text-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <div className="text-sm text-muted-foreground">Loading activity logs…</div>
            </div>
          ) : isErrorState ? (
            <div className="min-h-64 flex items-center justify-center">
              <div className="max-w-md text-center space-y-4">
                <div className="mx-auto h-12 w-12 rounded-full bg-yt-error/10 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-yt-error" />
                </div>
                <div className="space-y-1">
                  <div className="text-lg font-heading font-semibold text-foreground">Unable to load activity logs</div>
                  <div className="text-sm text-muted-foreground">
                    Please check your connection or try again in a moment.
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Button onClick={fetchLogs} disabled={loading}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/admin">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Go to Dashboard
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ) : isEmptyState ? (
            <div className="min-h-64 flex items-center justify-center">
              <div className="max-w-md text-center space-y-4">
                <div className="mx-auto h-12 w-12 rounded-full bg-yt-yellow/15 flex items-center justify-center">
                  <ScrollText className="h-6 w-6 text-yt-text" />
                </div>
                <div className="space-y-1">
                  <div className="text-lg font-heading font-semibold text-foreground">No activity yet</div>
                  <div className="text-sm text-muted-foreground">
                    Admin actions like product updates, orders, and settings changes will appear here.
                  </div>
                  <div className="text-xs text-muted-foreground">Your recent actions will automatically appear here.</div>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Button onClick={fetchLogs} disabled={loading}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Logs
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/admin">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Go to Dashboard
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left p-3 font-semibold text-muted-foreground">Type</th>
                    <th className="text-left p-3 font-semibold text-muted-foreground">Action</th>
                    <th className="text-left p-3 font-semibold text-muted-foreground">Admin</th>
                    <th className="text-left p-3 font-semibold text-muted-foreground">Timestamp</th>
                    <th className="text-left p-3 font-semibold text-muted-foreground">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, index) => (
                    <tr key={log._id || `log-${index}`} className="border-b hover:bg-muted/40 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {getLogIcon(log.level, log.action_type || log.action)}
                          {getLogLevelBadge(log.level)}
                        </div>
                      </td>
                      <td className="p-3 font-medium">
                        {typeof (log.action_type || log.action || log.message) === 'string' 
                          ? (log.action_type || log.action || log.message || 'Unknown Action')
                          : 'Unknown Action'
                        }
                      </td>
                      <td className="p-3">
                        {typeof (log.admin_id || log.admin) === 'string'
                          ? (log.admin_id || log.admin || 'System')
                          : 'System'
                        }
                      </td>
                      <td className="p-3 text-sm">
                        {formatDate(log.timestamp || log.created_at)}
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">
                        <div className="max-w-md">
                          {log.details ? (
                            <pre className="whitespace-pre-wrap break-all bg-muted/40 border border-border p-3 rounded-lg text-xs text-foreground">
                              {typeof log.details === 'string' 
                                ? log.details 
                                : typeof log.details === 'object' 
                                  ? JSON.stringify(log.details, null, 2)
                                  : String(log.details)
                              }
                            </pre>
                          ) : log.message ? (
                            <span className="text-muted-foreground">
                              {typeof log.message === 'string' ? log.message : String(log.message)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">No details</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4 space-x-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogs; 
