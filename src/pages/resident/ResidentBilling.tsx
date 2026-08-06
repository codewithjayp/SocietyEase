import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useBills, useUpdateBillStatus } from '../../hooks/useFirestore';
import { CreditCard, CheckCircle2, AlertCircle, Clock, Share2 } from 'lucide-react';
import { shareContent } from '../../utils/share';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/Dialog';

export default function ResidentBilling() {
  // Retrieve the resident's profile (including their UID) from the auth context
  const { userProfile } = useAuth();
  
  // 1. Fetch only the bills belonging to THIS specific resident
  const { data: bills, isLoading } = useBills(userProfile?.uid);
  
  // 2. Access the mutation hook to update a bill to "paid" status
  const updateBillMutation = useUpdateBillStatus();

  // Local state for handling the payment simulation UI workflow
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Derive summary statistics (total outstanding) for the dashboard card
  const pendingBills = bills?.filter(b => b.status === 'unpaid') || [];
  const totalPending = pendingBills.reduce((sum, bill) => sum + bill.amount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Triggered when a resident clicks "Pay Now" on a specific bill
  const handlePayClick = (billId: string) => {
    setSelectedBillId(billId);
    setPaymentSuccess(false);
    setPaymentModalOpen(true);
  };

  // Simulates a payment gateway process
  const processPayment = async () => {
    if (!selectedBillId) return;
    
    // Updates the specific bill's status to 'paid' in Firestore
    await updateBillMutation.mutateAsync({
      id: selectedBillId,
      status: 'paid'
    });
    
    // Show the success animation in the modal
    setPaymentSuccess(true);
    
    // Close the modal automatically after 2 seconds
    setTimeout(() => {
      setPaymentModalOpen(false);
      setSelectedBillId(null);
    }, 2000); 
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">My Bills & Dues</h1>
        <p className="text-gray-400">View and pay your society maintenance charges</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-red-500/10 border-red-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 border-b-0 bg-transparent">
            <CardTitle className="text-sm font-medium text-red-300">Total Outstanding</CardTitle>
            <AlertCircle className="w-4 h-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-400">{formatCurrency(totalPending)}</div>
            <p className="text-xs text-red-400 mt-1">{pendingBills.length} unpaid bill(s)</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2 text-gray-400" />
            Billing History
          </CardTitle>
          <CardDescription>Your recent maintenance bills</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <p className="text-center text-gray-400 py-8">Loading your bills...</p>
            ) : bills?.length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-lg border border-dashed border-white/10">
                <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-gray-400">You have no bills history.</p>
              </div>
            ) : (
              bills?.map(bill => (
                <div key={bill.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg hover:shadow-md transition-shadow gap-4">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full ${bill.status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {bill.status === 'paid' ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white">{bill.month} Maintenance</h4>
                      <p className="text-sm text-gray-400 mt-1">Due: {new Date(bill.dueDate as string).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end sm:space-x-4 w-full sm:w-auto">
                    <div className="text-xl font-bold text-white">
                      {formatCurrency(bill.amount)}
                    </div>
                    <button
                      onClick={() => shareContent(`Maintenance Bill - ${bill.month}`, `Amount: ${formatCurrency(bill.amount)}\nDue Date: ${new Date(bill.dueDate as string).toLocaleDateString()}\nStatus: ${bill.status}`)}
                      className="p-2 text-gray-400 hover:text-indigo-400 transition-colors rounded-full hover:bg-white/10"
                      title="Share Bill"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                    {bill.status === 'unpaid' && (
                      <Button onClick={() => handlePayClick(bill.id!)}>
                        Pay Now
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Simulation Modal */}
      <Dialog isOpen={paymentModalOpen} onClose={() => !updateBillMutation.isPending && setPaymentModalOpen(false)}>
        {!paymentSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle>Complete Payment</DialogTitle>
            </DialogHeader>
            <DialogContent>
              <div className="space-y-4 text-center py-6">
                <CreditCard className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
                <p className="text-gray-300">You are about to pay your maintenance bill securely.</p>
                <div className="bg-white/10 p-4 rounded-lg font-mono text-lg font-bold text-white">
                  {formatCurrency(bills?.find(b => b.id === selectedBillId)?.amount || 0)}
                </div>
                <p className="text-xs text-gray-500 italic mt-4">*This is a simulated checkout. No real money will be charged.</p>
              </div>
            </DialogContent>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPaymentModalOpen(false)} disabled={updateBillMutation.isPending}>
                Cancel
              </Button>
              <Button onClick={processPayment} disabled={updateBillMutation.isPending}>
                {updateBillMutation.isPending ? 'Processing...' : 'Confirm Payment'}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <DialogContent>
            <div className="text-center py-10 space-y-4">
              <CheckCircle2 className="w-20 h-20 text-green-400 mx-auto animate-bounce" />
              <h2 className="text-2xl font-bold text-green-400">Payment Successful!</h2>
              <p className="text-gray-400">Thank you for your payment.</p>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
