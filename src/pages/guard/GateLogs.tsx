import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { useGateLogs } from '../../hooks/useFirestore';
import { FileClock, CheckCircle2, LogOut, Share2 } from 'lucide-react';
import { shareContent } from '../../utils/share';
import type { GateLog } from '../../types';

export default function GateLogs() {
  const { data: gateLogs, isLoading } = useGateLogs();

  const formatTime = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    // Firestore timestamp handling
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Gate Logs</h1>
          <p className="text-gray-400">Comprehensive entry and exit records</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileClock className="w-5 h-5 mr-2 text-gray-400" />
            Visitor History
          </CardTitle>
          <CardDescription>All recorded entries and exits</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-gray-400">Loading logs...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-300 uppercase bg-white/10 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-3">Visitor Name</th>
                    <th className="px-6 py-3">Destination / Pass ID</th>
                    <th className="px-6 py-3">Entry Time</th>
                    <th className="px-6 py-3">Exit Time</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {gateLogs?.map((log: GateLog) => (
                    <tr key={log.id} className="bg-white/5 border-b border-white/10 hover:bg-white/10 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{log.visitorName}</td>
                      <td className="px-6 py-4">
                        {log.passId ? (
                          <span className="inline-block px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                            Pass: {log.passId.slice(0, 8)}...
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-1 bg-white/10 text-gray-300 rounded text-xs">
                            Walk-in: {log.hostId}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-400">{formatTime(log.entryTime)}</td>
                      <td className="px-6 py-4 text-gray-400">{log.exitTime ? formatTime(log.exitTime) : '-'}</td>
                      <td className="px-6 py-4 flex items-center space-x-2">
                        {!log.exitTime ? (
                          <span className="flex items-center text-green-400 font-medium">
                            <CheckCircle2 className="w-4 h-4 mr-1" /> Inside
                          </span>
                        ) : (
                          <span className="flex items-center text-gray-400 font-medium">
                            <LogOut className="w-4 h-4 mr-1" /> Exited
                          </span>
                        )}
                        <button
                          onClick={() => shareContent(`Gate Log: ${log.visitorName}`, `Entry: ${formatTime(log.entryTime)}\nExit: ${log.exitTime ? formatTime(log.exitTime) : 'Inside'}`)}
                          className="p-1 text-gray-400 hover:text-indigo-400 transition-colors rounded-full hover:bg-white/10"
                          title="Share Log"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {gateLogs?.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                        No entries recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
