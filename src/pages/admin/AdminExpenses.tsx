import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { useExpenses, useAddExpense } from '../../hooks/useFirestore';
import { useAuth } from '../../context/AuthContext';
import { IndianRupee, TrendingUp, Plus, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/Dialog';

export default function AdminExpenses() {
  const { userProfile } = useAuth();
  const { data: expenses, isLoading } = useExpenses();
  const addExpenseMutation = useAddExpense();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const totalExpenses = expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.uid) return;

    await addExpenseMutation.mutateAsync({
      title,
      amount: parseFloat(amount),
      date: date,
      recordedBy: userProfile.uid
    });

    setIsModalOpen(false);
    setTitle('');
    setAmount('');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Society Expenses</h1>
          <p className="text-gray-400">Track and manage society maintenance costs</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Log Expense
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-blue-500/10 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-blue-300">Total Expenditure</CardTitle>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-300">{formatCurrency(totalExpenses)}</div>
            <p className="text-xs text-blue-400 mt-1">All time</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <IndianRupee className="w-5 h-5 mr-2 text-gray-400" />
            Recent Expenses
          </CardTitle>
          <CardDescription>A chronological list of all society spending</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <p className="text-center text-gray-400 py-8">Loading expenses...</p>
            ) : expenses?.length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-lg border border-dashed border-white/10">
                <IndianRupee className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">No expenses recorded yet.</p>
              </div>
            ) : (
              expenses?.map(expense => (
                <div key={expense.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors gap-2">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white/10 p-3 rounded-full">
                      <IndianRupee className="w-5 h-5 text-gray-300" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white">{expense.title}</h4>
                      <div className="flex items-center text-sm text-gray-400 mt-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(expense.date as string).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-xl font-bold text-white">
                    {formatCurrency(expense.amount)}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleAddExpense}>
          <DialogHeader>
            <DialogTitle>Log New Expense</DialogTitle>
          </DialogHeader>
          <DialogContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Expense Description</Label>
                <Input 
                  id="title" 
                  placeholder="e.g., Lift Maintenance - Block A" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
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
                  placeholder="e.g. 5000" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date of Expense</Label>
                <Input 
                  id="date" 
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
            </div>
          </DialogContent>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={addExpenseMutation.isPending}>
              {addExpenseMutation.isPending ? 'Logging...' : 'Save Expense'}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
