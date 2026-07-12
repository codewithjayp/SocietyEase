
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Users, FileText, AlertTriangle, ShieldCheck, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useComplaints, useNotices, useUsersCount, useGuardsCount, usePendingComplaintsCount } from '../../hooks/useFirestore';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { userProfile } = useAuth();

  const { data: notices } = useNotices();
  const { data: complaints, isLoading: loadingComplaints } = useComplaints(); // all complaints for admin
  const { data: usersCount } = useUsersCount();
  const { data: guardsCount } = useGuardsCount();
  const { data: pendingComplaintsCount } = usePendingComplaintsCount();

  const container: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item: any = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Admin Control Panel</h1>
          <p className="text-gray-400 text-lg">Welcome back, <span className="font-semibold text-indigo-400">{userProfile?.name}</span></p>
        </div>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={item}>
          <Link to="/admin/billing" className="block">
            <Card className="cursor-pointer hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.3)] transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 border-l-4 border-l-indigo-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 border-b-0 bg-transparent">
                <CardTitle className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Total Residents</CardTitle>
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                  <Users className="w-5 h-5 text-indigo-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-white">{usersCount ?? '-'}</div>
                <p className="text-sm text-gray-400 mt-1">Active resident accounts</p>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        <motion.div variants={item}>
          <Link to="/admin/complaints" className="block">
            <Card className="cursor-pointer hover:shadow-[0_0_30px_-5px_rgba(239,68,68,0.3)] transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-red-500/10 to-red-500/5 border-l-4 border-l-red-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 border-b-0 bg-transparent">
                <CardTitle className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Pending Complaints</CardTitle>
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-white">{pendingComplaintsCount ?? '-'}</div>
                <p className="text-sm text-gray-400 mt-1">Require attention</p>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        <motion.div variants={item}>
          <Link to="/admin/notices" className="block">
            <Card className="cursor-pointer hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)] transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 border-b-0 bg-transparent">
                <CardTitle className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Active Notices</CardTitle>
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-white">{notices?.length ?? '-'}</div>
                <p className="text-sm text-gray-400 mt-1">Broadcasted to residents</p>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        <motion.div variants={item}>
          <div className="block cursor-pointer">
            <Card className="hover:shadow-[0_0_30px_-5px_rgba(34,197,94,0.3)] transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-green-500/10 to-green-500/5 border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 border-b-0 bg-transparent">
                <CardTitle className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Security Staff</CardTitle>
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <ShieldCheck className="w-5 h-5 text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-white">{guardsCount ?? '-'}</div>
                <p className="text-sm text-gray-400 mt-1">Active guard accounts</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-7"
      >
        <motion.div variants={item} className="col-span-4">
          <Card className="h-full">
            <CardHeader className="border-b border-white/10 pb-4">
              <CardTitle>Society Complaints</CardTitle>
              <CardDescription>Latest issues reported by residents</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
               <div className="space-y-5">
                {loadingComplaints ? (
                  <div className="flex justify-center p-4">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : complaints?.length === 0 ? (
                  <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-sm text-gray-400">No complaints logged.</p>
                  </div>
                ) : (
                  complaints?.slice(0, 5).map(complaint => (
                    <div key={complaint.id} className="flex items-center justify-between border-b border-white/10 pb-5 last:border-0 last:pb-0 group">
                      <div>
                        <p className="text-base font-semibold text-white group-hover:text-indigo-400 transition-colors">{complaint.title}</p>
                        <p className="text-sm text-gray-400 mt-1 line-clamp-1">{complaint.description}</p>
                      </div>
                      <div className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold tracking-wide ${
                        complaint.status === 'pending' ? 'bg-orange-500/20 border-orange-500/30 text-orange-300' :
                        complaint.status === 'in_progress' ? 'bg-blue-500/20 border-blue-500/30 text-blue-300' :
                        'bg-green-500/20 border-green-500/30 text-green-300'
                      }`}>
                        {complaint.status.toUpperCase()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item} className="col-span-3">
          <Card className="h-full bg-white/5 border border-white/10 text-white shadow-xl shadow-indigo-500/10">
            <CardHeader className="border-b border-white/10 bg-transparent">
              <CardTitle className="text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <Link to="/admin/notices" className="w-full flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-medium hover:bg-white/10 hover:border-white/20 transition-all group">
                <span className="text-white">Broadcast Notice</span>
                <ChevronRight className="w-5 h-5 text-indigo-400 group-hover:text-white group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/admin/billing" className="w-full flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-medium hover:bg-white/10 hover:border-white/20 transition-all group">
                <span className="text-white">Manage Bills</span>
                <ChevronRight className="w-5 h-5 text-indigo-400 group-hover:text-white group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/admin/complaints" className="w-full flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-medium hover:bg-white/10 hover:border-white/20 transition-all group">
                <span className="text-white">View Complaints</span>
                <ChevronRight className="w-5 h-5 text-indigo-400 group-hover:text-white group-hover:translate-x-1 transition-transform" />
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
