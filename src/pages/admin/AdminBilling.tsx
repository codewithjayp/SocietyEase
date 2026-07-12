import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { useBills, useAddBill, useUsers } from '../../hooks/useFirestore';
import { FileText, Plus, AlertCircle, CheckCircle2, Share2 } from 'lucide-react';
import { shareContent } from '../../utils/share';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/Dialog';

export default function AdminBilling() {
  const { data: bills, isLoading: loadingBills } = useBills();
  const { data: residents, isLoading: loadingResidents } = useUsers('resident');
  const addBillMutation = useAddBill();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [amount, setAmount] = useState('');
  const [month, setMonth] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleAddBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    await addBillMutation.mutateAsync({
      userId: selectedUser,
      amount: parseFloat(amount),
      month,
      status: 'unpaid',
      dueDate
    });

    setIsModalOpen(false);
    setSelectedUser('');
    setAmount('');
    setMonth('');
    setDueDate('');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getResidentName = (uid: string) => {
    return residents?.find(r => r.uid === uid)?.name || 'Unknown Resident';
  };

  const getResidentFlat = (uid: string) => {
    return residents?.find(r => r.uid === uid)?.flatNumber || 'N/A';
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Maintenance Billing</h1>
          <p className="text-gray-400">Manage resident dues and generate bills</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Generate Bill
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2 text-gray-400" />
            Issued Bills
          </CardTitle>
          <CardDescription>Track payment status across all residents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-300 uppercase bg-white/10 border-b border-white/10">
                <tr>
                  <th className="px-6 py-3">Resident</th>
                  <th className="px-6 py-3">Flat</th>
                  <th className="px-6 py-3">Billing Month</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Due Date</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {loadingBills ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">Loading bills...</td>
                  </tr>
                ) : bills?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">No bills generated yet.</td>
                  </tr>
                ) : (
                  bills?.map(bill => (
                    <tr key={bill.id} className="bg-white/5 border-b border-white/10 hover:bg-white/10 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{getResidentName(bill.userId)}</td>
                      <td className="px-6 py-4 text-gray-300">{getResidentFlat(bill.userId)}</td>
                      <td className="px-6 py-4 text-gray-300">{bill.month}</td>
                      <td className="px-6 py-4 font-bold text-white">{formatCurrency(bill.amount)}</td>
                      <td className="px-6 py-4 text-gray-400">{new Date(bill.dueDate as string).toLocaleDateString()}</td>
                      <td className="px-6 py-4 flex items-center space-x-2">
                        {bill.status === 'paid' ? (
                          <span className="flex items-center text-green-400 font-medium">
                            <CheckCircle2 className="w-4 h-4 mr-1" /> Paid
                          </span>
                        ) : (
                          <span className="flex items-center text-red-400 font-medium">
                            <AlertCircle className="w-4 h-4 mr-1" /> Unpaid
                          </span>
                        )}
                        <button
                          onClick={() => shareContent(`Bill for ${getResidentName(bill.userId)}`, `Month: ${bill.month}\nAmount: ${formatCurrency(bill.amount)}\nStatus: ${bill.status}`)}
                          className="p-1 text-gray-400 hover:text-indigo-400 transition-colors rounded-full hover:bg-white/10"
                          title="Share Bill"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleAddBill}>
          <DialogHeader>
            <DialogTitle>Generate Maintenance Bill</DialogTitle>
          </DialogHeader>
          <DialogContent>
            <div className="space-y-4">
              
              <div className="space-y-2">
                <Label htmlFor="resident">Select Resident</Label>
                <select 
                  id="resident"
                  className="flex h-10 w-full rounded-md border border-white/10 bg-[#020617] px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  required
                >
                  <option value="" disabled>Select a resident</option>
                  {residents?.map(resident => (
                    <option key={resident.uid} value={resident.uid}>
                      {resident.name} ({resident.flatNumber || 'No Flat'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="month">Billing Month</Label>
                <Input 
                  id="month" 
                  placeholder="e.g., July 2026" 
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input 
                  id="amount" 
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 2500" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input 
                  id="dueDate" 
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>

            </div>
          </DialogContent>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={addBillMutation.isPending || loadingResidents}>
              {addBillMutation.isPending ? 'Generating...' : 'Generate Bill'}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
