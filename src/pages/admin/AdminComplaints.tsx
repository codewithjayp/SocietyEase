import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { useComplaints, useUpdateComplaintStatus } from '../../hooks/useFirestore';
import { AlertTriangle, CheckCircle2, Clock, Share2 } from 'lucide-react';
import { shareContent } from '../../utils/share';
import type { Complaint } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminComplaints() {
  const { data: complaints, isLoading } = useComplaints();
  const updateStatus = useUpdateComplaintStatus();
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'resolved'>('all');

  const filteredComplaints = complaints?.filter(c => filter === 'all' || c.status === filter) || [];

  const handleStatusChange = async (id: string, newStatus: Complaint['status']) => {
    await updateStatus.mutateAsync({ id, status: newStatus });
  };

  const getStatusIcon = (status: Complaint['status']) => {
    switch(status) {
      case 'pending': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'in_progress': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'resolved': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Complaints Management</h1>
          <p className="text-gray-400">View and resolve resident issues</p>
        </div>
        
        <div className="flex bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-1 shadow-sm">
          {['all', 'pending', 'in_progress', 'resolved'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`relative px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-colors z-10 ${
                filter === f ? 'text-white' : 'text-gray-400 hover:text-indigo-400'
              }`}
            >
              {filter === f && (
                <motion.div 
                  layoutId="filter-pill"
                  className="absolute inset-0 bg-white/10 rounded-lg -z-10"
                />
              )}
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>All Complaints</CardTitle>
          <CardDescription>
            {filteredComplaints.length} {filter !== 'all' ? filter.replace('_', ' ') : ''} complaints found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredComplaints.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 bg-white/5 backdrop-blur-sm rounded-xl border border-dashed border-white/10"
              >
                <CheckCircle2 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 font-medium">No complaints found for this filter.</p>
              </motion.div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredComplaints.map(complaint => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={complaint.id} 
                    className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-sm hover:shadow-md hover:bg-white/10 transition-all gap-4 group"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="mt-1 bg-white/5 p-3 rounded-2xl shadow-sm border border-white/10">
                        {getStatusIcon(complaint.status)}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">{complaint.title}</h4>
                        <p className="text-sm text-gray-400 mt-1 max-w-2xl">{complaint.description}</p>
                        <div className="flex items-center space-x-4 mt-3 text-xs font-medium text-gray-400">
                          <span className="bg-white/10 px-2 py-1 rounded-md text-gray-300">Reported by: {complaint.reportedBy}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 md:w-48 shrink-0">
                      <button
                        onClick={() => shareContent(`Complaint: ${complaint.title}`, `Status: ${complaint.status}\nDescription: ${complaint.description}`)}
                        className="p-2 text-gray-400 hover:text-indigo-400 transition-colors rounded-full hover:bg-white/10"
                        title="Share Complaint"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                      <select
                        value={complaint.status}
                        onChange={(e) => handleStatusChange(complaint.id!, e.target.value as Complaint['status'])}
                        disabled={updateStatus.isPending}
                        className={`block w-full rounded-lg border py-2.5 pl-3 pr-10 text-sm font-semibold focus:ring-2 focus:outline-none cursor-pointer appearance-none ${
                          complaint.status === 'pending' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30 focus:ring-orange-500' :
                          complaint.status === 'in_progress' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30 focus:ring-blue-500' :
                          'bg-green-500/20 text-green-300 border-green-500/30 focus:ring-green-500'
                        }`}
                      >
                        <option value="pending" className="bg-[#181c20]">Pending</option>
                        <option value="in_progress" className="bg-[#181c20]">In Progress</option>
                        <option value="resolved" className="bg-[#181c20]">Resolved</option>
                      </select>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
