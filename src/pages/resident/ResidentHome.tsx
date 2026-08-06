import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Bell, CreditCard, AlertTriangle, QrCode, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useComplaints, useNotices, useAddComplaint, useGeneratePass } from '../../hooks/useFirestore';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/Dialog';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import QRCode from 'react-qr-code';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function ResidentHome() {
  const { userProfile } = useAuth();
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  
  // Data Fetching
  const { data: complaints, isLoading: loadingComplaints } = useComplaints(userProfile?.uid);
  const { data: notices, isLoading: loadingNotices } = useNotices();
  
  // Mutations
  const addComplaintMutation = useAddComplaint();
  const generatePassMutation = useGeneratePass();

  // Pass Form State
  const [visitorName, setVisitorName] = useState('');
  const [visitorType, setVisitorType] = useState<'guest' | 'delivery' | 'service'>('guest');
  const [expectedDate, setExpectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [generatedPassCode, setGeneratedPassCode] = useState<string | null>(null);

  // Form State
  const [complaintTitle, setComplaintTitle] = useState('');
  const [complaintDesc, setComplaintDesc] = useState('');

  const handleAddComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.uid) return;

    await addComplaintMutation.mutateAsync({
      title: complaintTitle,
      description: complaintDesc,
      status: 'pending',
      reportedBy: userProfile.uid,
    });

    setComplaintTitle('');
    setComplaintDesc('');
    setIsComplaintModalOpen(false);
  };

  const handleGeneratePass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.uid) return;

    // Generate a random 6-digit alphanumeric code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    await generatePassMutation.mutateAsync({
      passCode: code,
      visitorName,
      visitorType,
      expectedDate,
      generatedBy: userProfile.uid,
      status: 'active'
    });

    setGeneratedPassCode(code);
  };

  const closePassModal = () => {
    setIsPassModalOpen(false);
    setGeneratedPassCode(null);
    setVisitorName('');
  };

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
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Welcome, <span className="text-indigo-400">{userProfile?.name}</span>!</h1>
        <p className="text-gray-400 text-lg">Resident Dashboard</p>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={item}>
          <Card 
            className="hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.3)] transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 border-l-4 border-l-indigo-500 group"
            onClick={() => setIsPassModalOpen(true)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 border-b-0 bg-transparent">
              <CardTitle className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Generate Pass</CardTitle>
              <div className="p-2 bg-indigo-500/20 rounded-lg group-hover:bg-indigo-500 transition-colors">
                <QrCode className="w-5 h-5 text-indigo-400 group-hover:text-white transition-colors" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">New Visitor</div>
              <p className="text-sm text-gray-400 mt-1">Create a QR pass for your guests</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card 
            className="hover:shadow-[0_0_30px_-5px_rgba(239,68,68,0.3)] transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-gradient-to-br from-red-500/10 to-red-500/5 border-l-4 border-l-red-500 group"
            onClick={() => setIsComplaintModalOpen(true)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 border-b-0 bg-transparent">
              <CardTitle className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Complaints</CardTitle>
              <div className="p-2 bg-red-500/20 rounded-lg group-hover:bg-red-500 transition-colors">
                <AlertTriangle className="w-5 h-5 text-red-400 group-hover:text-white transition-colors" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">Report Issue</div>
              <p className="text-sm text-gray-400 mt-1">Track and register complaints</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Link to="/resident/billing">
            <Card className="hover:shadow-[0_0_30px_-5px_rgba(34,197,94,0.3)] transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-gradient-to-br from-green-500/10 to-green-500/5 border-l-4 border-l-green-500 group">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 border-b-0 bg-transparent">
                <CardTitle className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Maintenance</CardTitle>
                <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500 transition-colors">
                  <CreditCard className="w-5 h-5 text-green-400 group-hover:text-white transition-colors" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">Pay Dues</div>
                <p className="text-sm text-gray-400 mt-1">View and pay maintenance bills</p>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        <motion.div variants={item}>
          <a href="#notices-section" className="block cursor-pointer">
            <Card className="hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)] transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 border-b-0 bg-transparent">
                <CardTitle className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Notices</CardTitle>
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Bell className="w-5 h-5 text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-white">{notices?.length || 0}</div>
                <p className="text-sm text-gray-400 mt-1">Total society announcements</p>
              </CardContent>
            </Card>
          </a>
        </motion.div>
      </motion.div>

      <motion.div 
        id="notices-section"
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-7"
      >
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Notices</CardTitle>
            <CardDescription>Updates from the society admin</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loadingNotices ? (
                <p className="text-sm text-gray-400">Loading notices...</p>
              ) : notices?.length === 0 ? (
                <p className="text-sm text-gray-400">No recent notices.</p>
              ) : (
                notices?.slice(0, 5).map((notice) => (
                  <div key={notice.id} className="flex items-start space-x-4 border-b border-white/10 pb-4 last:border-0">
                    <div className={`w-2 h-2 mt-2 rounded-full ${notice.isImportant ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                    <div>
                      <p className="text-sm font-medium leading-none text-white">{notice.title}</p>
                      <p className="text-sm text-gray-400 mt-1">{notice.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Your Complaints</CardTitle>
              <CardDescription>Status of reported issues</CardDescription>
            </div>
            <Button size="icon" variant="outline" onClick={() => setIsComplaintModalOpen(true)}>
              <Plus className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loadingComplaints ? (
                <p className="text-sm text-gray-400">Loading complaints...</p>
              ) : complaints?.length === 0 ? (
                <p className="text-sm text-gray-400">You haven't reported any issues.</p>
              ) : (
                complaints?.slice(0, 5).map((complaint) => (
                  <div key={complaint.id} className="flex items-center justify-between border-b border-white/10 pb-4 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-white">{complaint.title}</p>
                      <p className="text-xs text-gray-400 truncate max-w-[150px]">{complaint.description}</p>
                    </div>
                    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                      complaint.status === 'pending' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' :
                      complaint.status === 'in_progress' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                      'bg-green-500/20 text-green-300 border-green-500/30'
                    }`}>
                      {complaint.status.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* New Complaint Modal */}
      <Dialog isOpen={isComplaintModalOpen} onClose={() => setIsComplaintModalOpen(false)}>
        <form onSubmit={handleAddComplaint}>
          <DialogHeader>
            <DialogTitle>Register a Complaint</DialogTitle>
          </DialogHeader>
          <DialogContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Issue Title</Label>
                <Input 
                  id="title" 
                  placeholder="e.g., Plumbing Leak in Kitchen" 
                  value={complaintTitle}
                  onChange={(e) => setComplaintTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Description</Label>
                <textarea 
                  id="desc"
                  className="flex min-h-[100px] w-full rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm px-3 py-2 text-sm text-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 focus-visible:bg-white/10 transition-all duration-200"
                  placeholder="Please describe the issue in detail..."
                  value={complaintDesc}
                  onChange={(e) => setComplaintDesc(e.target.value)}
                  required
                />
              </div>
            </div>
          </DialogContent>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsComplaintModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={addComplaintMutation.isPending}>
              {addComplaintMutation.isPending ? 'Submitting...' : 'Submit Complaint'}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Generate Pass Modal */}
      <Dialog isOpen={isPassModalOpen} onClose={closePassModal}>
        {generatedPassCode ? (
          <div className="text-center p-6 space-y-6">
            <h3 className="text-2xl font-bold text-white">Pass Generated!</h3>
            <p className="text-gray-400 text-sm">Screenshot and share this QR code with your visitor.</p>
            
            <div className="bg-white p-4 inline-block rounded-xl border border-white/10 shadow-sm mx-auto">
              <QRCode value={generatedPassCode} size={200} />
            </div>
            
            <div className="bg-indigo-500/10 py-3 rounded-lg border border-indigo-500/30">
              <p className="text-sm font-medium text-indigo-300">Pass Code (For Manual Entry)</p>
              <p className="text-3xl font-mono font-bold tracking-widest text-indigo-400 mt-1">{generatedPassCode}</p>
            </div>
            
            <Button className="w-full" onClick={closePassModal}>
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleGeneratePass}>
            <DialogHeader>
              <DialogTitle>Generate Visitor Pass</DialogTitle>
            </DialogHeader>
            <DialogContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="visitorName">Visitor Name</Label>
                  <Input 
                    id="visitorName" 
                    placeholder="John Doe" 
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="visitorType">Visitor Type</Label>
                  <select 
                    id="visitorType"
                    className="flex h-11 w-full rounded-xl border border-white/10 bg-[#181c20]/50 backdrop-blur-sm px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
                    value={visitorType}
                    onChange={(e) => setVisitorType(e.target.value as any)}
                  >
                    <option value="guest" className="bg-[#181c20]">Guest</option>
                    <option value="delivery" className="bg-[#181c20]">Delivery</option>
                    <option value="service" className="bg-[#181c20]">Service/Repair</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedDate">Expected Date</Label>
                  <Input 
                    id="expectedDate" 
                    type="date"
                    value={expectedDate}
                    onChange={(e) => setExpectedDate(e.target.value)}
                    required
                  />
                </div>
              </div>
            </DialogContent>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closePassModal}>
                Cancel
              </Button>
              <Button type="submit" disabled={generatePassMutation.isPending}>
                {generatePassMutation.isPending ? 'Generating...' : 'Generate Pass'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </Dialog>
    </div>
  );
}
