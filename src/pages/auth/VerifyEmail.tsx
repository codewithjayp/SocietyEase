import { useState, useEffect } from 'react';
import { sendEmailVerification } from 'firebase/auth';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { useNavigate } from 'react-router-dom';

export default function VerifyEmail() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (currentUser?.emailVerified) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleResend = async () => {
    if (!currentUser) return;
    setIsSending(true);
    setMessage(null);
    try {
      await sendEmailVerification(currentUser);
      setMessage({ type: 'success', text: 'Verification email sent! Please check your inbox.' });
    } catch (error: any) {
      console.error(error);
      setMessage({ type: 'error', text: error.message || 'Failed to send verification email. Try again later.' });
    } finally {
      setIsSending(false);
    }
  };

  const handleRefresh = async () => {
    if (!currentUser) {
      window.location.reload();
      return;
    }
    
    try {
      await currentUser.reload();
      if (currentUser.emailVerified) {
        navigate('/');
      } else {
        setMessage({ type: 'error', text: 'Email not verified yet. Please click the link in your email and try again.' });
      }
    } catch (error) {
      console.error(error);
      window.location.reload();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#020617] p-4 relative overflow-hidden">
      {/* Background glowing orbs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-4000"></div>

      <Card className="w-full max-w-md shadow-2xl border-white/10 bg-white/5 backdrop-blur-xl text-center relative z-10">
        <CardHeader className="space-y-1">
          <div className="mx-auto w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">
            Verify Your Email
          </CardTitle>
          <CardDescription className="text-gray-400">
            You need to verify your email address to access your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-300">
            We sent an email to <strong className="text-white">{currentUser?.email}</strong>. Please click the link in the email to verify your account.
          </p>
          
          {message && (
            <div className={`p-3 rounded-md text-sm border ${message.type === 'success' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
              {message.text}
            </div>
          )}

          <div className="pt-4 flex flex-col space-y-3">
            <Button 
              onClick={handleRefresh}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white border-0"
            >
              I've Verified My Email
            </Button>
            <Button 
              onClick={handleResend}
              variant="outline"
              disabled={isSending}
              className="w-full bg-transparent border-white/20 text-gray-300 hover:bg-white/10 hover:text-white"
            >
              {isSending ? 'Sending...' : 'Resend Verification Email'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
