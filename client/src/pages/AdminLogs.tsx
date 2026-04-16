import React, { useEffect, useState } from "react";
import adminAPI from "@/services/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, Info, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = { page: currentPage, limit: 20 };
  
      const response = await adminAPI.getAdminLogs(params);
      
      setLogs(response.data.logs || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('❌ Error fetching admin logs:', error);
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
    
    if (levelStr === 'error' || actionStr.includes('error')) return <XCircle className="h-4 w-4 text-red-500" />;
    if (levelStr === 'warn' || actionStr.includes('warn')) return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    if (levelStr === 'info' || actionStr.includes('info')) return <Info className="h-4 w-4 text-blue-500" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getLogLevelBadge = (level?: string) => {
    if (!level || typeof level !== 'string') return null;
    const levelStr = level.toLowerCase();
    const colors = {
      error: 'bg-red-100 text-red-800',
      warn: 'bg-yellow-100 text-yellow-800',
      info: 'bg-blue-100 text-blue-800',
      debug: 'bg-gray-100 text-gray-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[levelStr as keyof typeof colors] || colors.debug}`}>
        {levelStr.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Admin Activity Logs</h2>
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
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No logs found</h3>
              <p className="text-gray-500 mb-4">There are no admin activity logs to display at the moment.</p>
              <Button onClick={fetchLogs} variant="outline" size="sm">
                Refresh
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3 font-semibold text-gray-700">Type</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Action</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Admin</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Timestamp</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, index) => (
                    <tr key={log._id || `log-${index}`} className="border-b hover:bg-gray-50">
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
                      <td className="p-3 text-xs text-gray-600">
                        <div className="max-w-md">
                          {log.details ? (
                            <pre className="whitespace-pre-wrap break-all bg-gray-100 p-2 rounded text-xs">
                              {typeof log.details === 'string' 
                                ? log.details 
                                : typeof log.details === 'object' 
                                  ? JSON.stringify(log.details, null, 2)
                                  : String(log.details)
                              }
                            </pre>
                          ) : log.message ? (
                            <span className="text-gray-500">
                              {typeof log.message === 'string' ? log.message : String(log.message)}
                            </span>
                          ) : (
                            <span className="text-gray-400">No details</span>
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
