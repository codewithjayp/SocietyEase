import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Building, ArrowRight, CheckCircle2 } from 'lucide-react';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { motion, AnimatePresence } from 'framer-motion';
import type { Role } from '../../types';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('resident');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasscode, setShowPasscode] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (role === 'admin' && passcode !== 'ADMIN_SECURE_123') {
      setError('Invalid admin passcode');
      setIsLoading(false);
      return;
    }
    if (role === 'guard' && passcode !== 'ADMIN_SECURE_123') {
      setError('Invalid guard passcode');
      setIsLoading(false);
      return;
    }
    if (role === 'resident' && passcode !== 'RESIDENT_789') {
      setError('Invalid society passcode');
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await sendEmailVerification(user);

      await setDoc(doc(db, 'SOCIETY_001', 'data', 'users', user.uid), {
        uid: user.uid,
        name,
        email,
        role,
        isActive: true,
        createdAt: serverTimestamp()
      });

      setIsRegistered(true);
    } catch (err: any) {
      console.error(err);
      let errorMessage = 'Registration failed. Please try again.';
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'An account already exists with this email address.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Your password is too weak. It must be at least 6 characters long.';
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full font-sans bg-[#020617] text-white selection:bg-indigo-500/30">
      {/* Left side - Form */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-8 lg:p-20 relative overflow-y-auto custom-scrollbar">
        <div className="absolute inset-0 bg-[#020617] lg:hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px]"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-[480px] relative z-10 py-10"
        >
          <div className="lg:hidden flex items-center space-x-3 mb-10">
            <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-md border border-white/20">
              <Building className="w-6 h-6 text-indigo-400" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">SocietyEase</span>
          </div>

          <AnimatePresence mode="wait">
            {isRegistered ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 15 }}
                  className="mx-auto w-20 h-20 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center mb-8 shadow-[0_0_40px_-10px_rgba(34,197,94,0.4)]"
                >
                  <CheckCircle2 className="w-10 h-10 text-green-400" />
                </motion.div>
                <h3 className="text-3xl font-bold tracking-tight text-white mb-4">Check your inbox</h3>
                <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                  We've sent a verification link to <span className="text-white font-medium">{email}</span>.<br />
                  Please verify your email before logging in.
                </p>
                <Link to="/login">
                  <Button className="h-12 bg-white text-[#020617] hover:bg-gray-100 hover:scale-[1.02] transition-all rounded-xl font-semibold text-base px-8 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]">
                    Return to Sign In
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="mb-10">
                  <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Create an account</h2>
                  <p className="text-gray-400">Join SocietyEase by creating your profile.</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-5">
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 backdrop-blur-md"
                    >
                      {error}
                    </motion.div>
                  )}

                  <div className="grid grid-cols-2 gap-5">
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="name" className="text-gray-300">Full Name</Label>
                      <Input 
                        id="name" 
                        type="text" 
                        placeholder="John Doe" 
                        required 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20 h-12"
                      />
                    </div>

                    <div className="col-span-2 space-y-2">
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
                      <Label htmlFor="role" className="text-gray-300">Role</Label>
                      <select 
                        id="role"
                        className="flex h-12 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 appearance-none"
                        value={role}
                        onChange={(e) => setRole(e.target.value as Role)}
                        style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                      >
                        <option value="resident" className="bg-[#020617]">Resident</option>
                        <option value="guard" className="bg-[#020617]">Security Guard</option>
                        <option value="admin" className="bg-[#020617]">Administrator</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="passcode" className="text-gray-300">Passcode</Label>
                      <div className="relative">
                        <Input 
                          id="passcode" 
                          type={showPasscode ? "text" : "password"} 
                          placeholder="Admin code" 
                          required 
                          value={passcode}
                          onChange={(e) => setPasscode(e.target.value)}
                          className="pr-10 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20 h-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasscode(!showPasscode)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-300 transition-colors"
                        >
                          {showPasscode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="password" className="text-gray-300">Password</Label>
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
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full h-12 bg-white text-[#020617] hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98] transition-all rounded-xl font-semibold text-base mt-8 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-[#020617]/30 border-t-[#020617] rounded-full animate-spin" />
                        <span>Creating Account...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <span>Register</span>
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </div>
                    )}
                  </Button>

                  <div className="text-center mt-8 pt-4 border-t border-white/5">
                    <p className="text-gray-400">
                      Already have an account?{' '}
                      <Link to="/login" className="font-medium text-white hover:text-indigo-400 transition-colors underline underline-offset-4 decoration-white/30 hover:decoration-indigo-400/50">
                        Sign in
                      </Link>
                    </p>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Right side - Decorative (hidden on mobile) */}
      <div className="hidden lg:flex w-[45%] relative overflow-hidden items-center justify-center border-l border-white/10 bg-[#020617]">
        <div className="absolute inset-0 bg-gradient-to-bl from-indigo-900 via-[#020617] to-cyan-900 z-0"></div>
        {/* Animated Orbs */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 -right-1/4 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[100px] mix-blend-screen"
        ></motion.div>
        
        <div className="relative z-10 p-12 max-w-lg text-center flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white/5 p-6 rounded-3xl backdrop-blur-md border border-white/10 shadow-2xl mb-12"
          >
            <Building className="w-20 h-20 text-indigo-400" />
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl font-bold leading-tight tracking-tight mb-4 text-white"
          >
            Join SocietyEase
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-lg text-indigo-200/70"
          >
            Streamline your residential community with powerful tools, seamless communication, and a beautiful interface.
          </motion.p>
        </div>
      </div>
    </div>
  );
}
