/**
 * ARCHITECTURE & FLOW: ForgotPassword.tsx
 * 
 * Uses Firebase Auth's `sendPasswordResetEmail` to help users recover their accounts.
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building, ArrowRight, ArrowLeft } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { motion } from 'framer-motion';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rate Limiting Logic
    const MAX_ATTEMPTS = 3;
    const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

    const storedLockout = localStorage.getItem('forgotPasswordLockout');
    if (storedLockout) {
      const lockoutTime = parseInt(storedLockout, 10);
      if (Date.now() < lockoutTime) {
        const remainingMinutes = Math.ceil((lockoutTime - Date.now()) / 60000);
        setMessage({ type: 'error', text: `Too many attempts. Please try again in ${remainingMinutes} minute(s).` });
        return;
      } else {
        localStorage.removeItem('forgotPasswordLockout');
        localStorage.removeItem('forgotPasswordAttempts');
      }
    }

    const currentAttempts = parseInt(localStorage.getItem('forgotPasswordAttempts') || '0', 10);
    if (currentAttempts >= MAX_ATTEMPTS) {
      const newLockout = Date.now() + LOCKOUT_DURATION;
      localStorage.setItem('forgotPasswordLockout', newLockout.toString());
      setMessage({ type: 'error', text: 'Too many attempts. Please try again in 15 minutes.' });
      return;
    }

    localStorage.setItem('forgotPasswordAttempts', (currentAttempts + 1).toString());

    setMessage(null);
    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage({ type: 'success', text: 'Password reset email sent! Please check your inbox.' });
    } catch (err: any) {
      console.error(err);
      let errorMessage = 'An error occurred. Please try again.';
      if (err.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (err.code === 'auth/user-not-found') {
        errorMessage = 'No user found with this email address.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full font-sans bg-[#181c20] text-white selection:bg-indigo-500/30">
      {/* Left side - Decorative */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center border-r border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-[#181c20] to-electric-900 z-0"></div>
        {/* Animated Orbs */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen"
        ></motion.div>
        
        <div className="relative z-10 p-16 max-w-2xl">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center space-x-4 mb-8"
          >
            <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/20">
              <Building className="w-10 h-10 text-indigo-400" />
            </div>
            <span className="text-4xl font-bold tracking-tight text-white">SocietyEase</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-5xl md:text-6xl font-bold leading-tight tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-indigo-400"
          >
            Recover your access.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-xl text-indigo-200/80 leading-relaxed max-w-lg"
          >
            We'll help you get back into your account securely and quickly.
          </motion.p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 relative">
        <div className="absolute inset-0 bg-[#181c20] lg:hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px]"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md relative z-10"
        >
          <Link to="/login" className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors mb-8 group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to login
          </Link>

          <div className="lg:hidden flex items-center space-x-3 mb-12">
            <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-md border border-white/20">
              <Building className="w-6 h-6 text-indigo-400" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">SocietyEase</span>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Forgot Password</h2>
            <p className="text-gray-400">Enter your email address to receive a password reset link.</p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-6">
            {message && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className={`rounded-xl border p-4 text-sm backdrop-blur-md ${
                  message.type === 'success' 
                    ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}
              >
                {message.text}
              </motion.div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="m@example.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20 h-12"
              />
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-12 bg-white text-[#181c20] hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98] transition-all rounded-xl font-semibold text-base mt-4 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-[#181c20]/30 border-t-[#181c20] rounded-full animate-spin" />
                  <span>Sending link...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span>Send Reset Link</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
