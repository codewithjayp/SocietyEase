import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Building, ArrowRight } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const userDocRef = doc(db, 'SOCIETY_001', 'data', 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (!userDocSnap.exists()) {
        await auth.signOut();
        setError('No society profile found for this account. Please ask an administrator to set up your profile, or register a new account.');
        setIsLoading(false);
        return;
      }

      navigate('/');
    } catch (err: any) {
      console.error(err);
      let errorMessage = 'An error occurred during login. Please try again.';
      if (err.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (err.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled by an administrator.';
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errorMessage = 'Incorrect email or password. Please try again.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later.';
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection and disable any ad-blockers, then try again.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
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
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-cyan-600/20 rounded-full blur-[100px] mix-blend-screen"
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
            Smart society management, elevated.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-xl text-indigo-200/80 leading-relaxed max-w-lg"
          >
            Experience the next generation of residential administration. Beautiful, fast, and remarkably powerful.
          </motion.p>
        </div>
      </div>

      {/* Right side - Login Form */}
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
          <div className="lg:hidden flex items-center space-x-3 mb-12">
            <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-md border border-white/20">
              <Building className="w-6 h-6 text-indigo-400" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">SocietyEase</span>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome back</h2>
            <p className="text-gray-400">Please enter your details to sign in.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 backdrop-blur-md"
              >
                {error}
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

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <Link to="/forgot-password" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-12 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20 h-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-12 bg-white text-[#181c20] hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98] transition-all rounded-xl font-semibold text-base mt-4 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-[#181c20]/30 border-t-[#181c20] rounded-full animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              )}
            </Button>

            <div className="text-center mt-8">
              <p className="text-gray-400">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-white hover:text-indigo-400 transition-colors underline underline-offset-4 decoration-white/30 hover:decoration-indigo-400/50">
                  Register here
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
