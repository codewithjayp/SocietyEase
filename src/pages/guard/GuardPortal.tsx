import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Scan, UserPlus, FileClock, PhoneCall, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useVerifyPass, useLogEntry, useGateLogs } from '../../hooks/useFirestore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/Dialog';
import type { VisitorPass } from '../../types';
import { motion } from 'framer-motion';
import { QRScanner } from '../../components/QRScanner';

export default function GuardPortal() {
  const { userProfile } = useAuth();
  
  // Queries & Mutations
  const verifyPassMutation = useVerifyPass();
  const logEntryMutation = useLogEntry();
  const { data: gateLogs } = useGateLogs();

  // Modal States
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);

  // Scan State
  const [scanCode, setScanCode] = useState('');
  const [scannedPass, setScannedPass] = useState<VisitorPass | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanMode, setScanMode] = useState<'qr' | 'manual'>('qr');

  // Walk-in State
  const [walkInName, setWalkInName] = useState('');
  const [walkInFlat, setWalkInFlat] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setScanError(null);
    try {
      const pass = await verifyPassMutation.mutateAsync(scanCode);
      setScannedPass(pass);
    } catch (err: any) {
      setScanError(err.message || 'Invalid Pass');
    }
  };

  const handleQRScan = async (decodedText: string) => {
    setScanCode(decodedText);
    setScanError(null);
    try {
      const pass = await verifyPassMutation.mutateAsync(decodedText);
      setScannedPass(pass);
    } catch (err: any) {
      setScanError(err.message || 'Invalid Pass');
    }
  };

  const handleConfirmEntry = async () => {
    if (!scannedPass || !userProfile?.uid) return;
    
    await logEntryMutation.mutateAsync({
      visitorName: scannedPass.visitorName,
      passId: scannedPass.id,
      loggedBy: userProfile.uid,
      hostId: scannedPass.generatedBy,
    });

    closeScanModal();
  };

  const handleWalkIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.uid) return;

    await logEntryMutation.mutateAsync({
      visitorName: walkInName,
      loggedBy: userProfile.uid,
      hostId: walkInFlat // Storing flat string instead of UID for simplicity in walk-in
    });

    closeWalkInModal();
  };

  const closeScanModal = () => {
    setIsScanModalOpen(false);
    setScanCode('');
    setScannedPass(null);
    setScanError(null);
    setScanMode('qr');
  };

  const closeWalkInModal = () => {
    setIsWalkInModalOpen(false);
    setWalkInName('');
    setWalkInFlat('');
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
        <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Security Portal</h1>
        <p className="text-gray-400 text-lg">Duty Officer: <span className="font-semibold text-indigo-400">{userProfile?.name}</span></p>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={item}>
          <Card 
            className="hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)] transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-l-4 border-l-blue-500 group"
            onClick={() => setIsScanModalOpen(true)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 border-b-0 bg-transparent">
              <CardTitle className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Scan Pass</CardTitle>
              <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-600 transition-colors">
                <Scan className="w-5 h-5 text-blue-400 group-hover:text-white transition-colors" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium text-blue-300">Verify 6-digit visitor code</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card 
            className="hover:shadow-[0_0_30px_-5px_rgba(107,114,128,0.3)] transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-gradient-to-br from-gray-500/10 to-gray-500/5 border-l-4 border-l-gray-500 group"
            onClick={() => setIsWalkInModalOpen(true)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 border-b-0 bg-transparent">
              <CardTitle className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Walk-in</CardTitle>
              <div className="p-2 bg-gray-500/20 rounded-lg group-hover:bg-gray-600 transition-colors">
                <UserPlus className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium text-gray-300">Register unannounced guest</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.3)] transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 border-l-4 border-l-indigo-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 border-b-0 bg-transparent">
              <CardTitle className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Today's Entries</CardTitle>
              <div className="p-2 bg-indigo-500/20 rounded-lg">
                <FileClock className="w-5 h-5 text-indigo-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-white">{gateLogs?.length || 0}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="hover:shadow-[0_0_30px_-5px_rgba(239,68,68,0.3)] transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-gradient-to-br from-red-500/10 to-red-500/5 border-l-4 border-l-red-500 group">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 border-b-0 bg-transparent">
              <CardTitle className="text-sm font-semibold text-red-400 uppercase tracking-wider">Emergency</CardTitle>
              <div className="p-2 bg-red-500/20 rounded-lg group-hover:bg-red-600 transition-colors">
                <PhoneCall className="w-5 h-5 text-red-400 group-hover:text-white transition-colors" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium text-red-300">Sound alarm / Call Admin</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Entries (Live)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-300 uppercase bg-white/10 border-b border-white/10">
                <tr>
                  <th className="px-6 py-3">Visitor Name</th>
                  <th className="px-6 py-3">Type / Destination</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {gateLogs?.slice(0, 5).map(log => (
                  <tr key={log.id} className="bg-white/5 border-b border-white/10">
                    <td className="px-6 py-4 font-medium text-white">{log.visitorName}</td>
                    <td className="px-6 py-4 text-gray-300">{log.passId ? 'Verified Pass' : `Walk-in: ${log.hostId}`}</td>
                    <td className="px-6 py-4 text-green-400 font-medium flex items-center">
                      <CheckCircle2 className="w-4 h-4 mr-1" /> Inside
                    </td>
                  </tr>
                ))}
                {gateLogs?.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-400">
                      No entries logged yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Simulated Scanner Modal */}
      <Dialog isOpen={isScanModalOpen} onClose={closeScanModal}>
        <DialogHeader>
          <DialogTitle>Verify Visitor Pass</DialogTitle>
        </DialogHeader>
        <DialogContent>
          {!scannedPass ? (
            <div className="space-y-4">
              <div className="flex justify-center space-x-4 mb-4">
                <Button 
                  type="button" 
                  variant={scanMode === 'qr' ? 'default' : 'outline'} 
                  onClick={() => setScanMode('qr')}
                >
                  Scan QR
                </Button>
                <Button 
                  type="button" 
                  variant={scanMode === 'manual' ? 'default' : 'outline'} 
                  onClick={() => setScanMode('manual')}
                >
                  Manual Entry
                </Button>
              </div>
              
              {scanError && (
                <div className="bg-red-500/20 text-red-400 p-3 rounded-md text-sm flex items-center border border-red-500/30">
                  <XCircle className="w-4 h-4 mr-2" />
                  {scanError}
                </div>
              )}

              {scanMode === 'qr' ? (
                <div className="mt-2">
                  <QRScanner 
                    onScanSuccess={handleQRScan} 
                    onScanFailure={() => {
                      // Optionally log or handle scan failures, though html5-qrcode triggers this often when no QR is found
                    }} 
                  />
                  <p className="text-center text-sm text-gray-500 mt-2">Point camera at the visitor's QR code</p>
                </div>
              ) : (
                <form onSubmit={handleVerify} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="scanCode">Enter 6-Digit Pass Code</Label>
                    <Input 
                      id="scanCode"
                      className="font-mono text-xl tracking-widest uppercase"
                      placeholder="e.g. A1B2C3" 
                      value={scanCode}
                      onChange={(e) => setScanCode(e.target.value.toUpperCase())}
                      maxLength={6}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={verifyPassMutation.isPending}>
                    {verifyPassMutation.isPending ? 'Verifying...' : 'Verify Code'}
                  </Button>
                </form>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-2" />
                <h3 className="text-lg font-bold text-green-300">Valid Pass</h3>
                <p className="text-sm text-green-400">Code: {scannedPass.passCode}</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between border-b border-white/10 pb-1">
                  <span className="text-gray-400">Visitor Name</span>
                  <span className="font-medium text-white">{scannedPass.visitorName}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-1">
                  <span className="text-gray-400">Type</span>
                  <span className="font-medium text-white capitalize">{scannedPass.visitorType}</span>
                </div>
              </div>
              <Button onClick={handleConfirmEntry} className="w-full bg-green-600 hover:bg-green-700" disabled={logEntryMutation.isPending}>
                {logEntryMutation.isPending ? 'Logging...' : 'Confirm Entry'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Walk-in Modal */}
      <Dialog isOpen={isWalkInModalOpen} onClose={closeWalkInModal}>
        <form onSubmit={handleWalkIn}>
          <DialogHeader>
            <DialogTitle>Register Walk-in Visitor</DialogTitle>
          </DialogHeader>
          <DialogContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="walkInName">Full Name</Label>
                <Input 
                  id="walkInName" 
                  placeholder="e.g. Delivery Driver" 
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="walkInFlat">Destination (Flat No.)</Label>
                <Input 
                  id="walkInFlat" 
                  placeholder="e.g. A-402" 
                  value={walkInFlat}
                  onChange={(e) => setWalkInFlat(e.target.value)}
                  required
                />
              </div>
            </div>
          </DialogContent>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeWalkInModal}>Cancel</Button>
            <Button type="submit" disabled={logEntryMutation.isPending}>
              {logEntryMutation.isPending ? 'Logging...' : 'Log Entry'}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
