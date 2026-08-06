import React, { useState } from 'react';
import { Outlet, Navigate, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Building, LogOut, LayoutDashboard, AlertTriangle, Bell, Shield, FileClock, IndianRupee, CreditCard, ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { motion, AnimatePresence } from 'framer-motion';

export default function MainLayout() {
  const { currentUser, userProfile, loading } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#181c20]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = async () => {
    await signOut(auth);
  };

  const role = userProfile?.role;

  const NavItem = ({ to, icon: Icon, children }: { to: string, icon: LucideIcon, children: React.ReactNode }) => {
    const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
    const handleClick = () => {
      if (window.innerWidth < 768) {
        setMobileMenuOpen(false);
      }
    };
    return (
      <NavLink
        to={to}
        onClick={handleClick}
        className={`relative flex items-center px-4 py-3 my-1 rounded-xl transition-colors group ${
          isActive ? 'text-white' : 'text-gray-400 hover:text-indigo-400'
        }`}
      >
        {isActive && (
          <motion.div
            layoutId="active-nav-pill"
            className="absolute inset-0 bg-indigo-600/20 border border-indigo-500/30 rounded-xl -z-10"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
        <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'} shrink-0`} />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="ml-3 font-medium whitespace-nowrap overflow-hidden"
            >
              {children}
            </motion.span>
          )}
        </AnimatePresence>
      </NavLink>
    );
  };

  const NavSection = ({ title }: { title: string }) => (
    <AnimatePresence>
      {!collapsed && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="pt-6 pb-2 px-4 text-xs font-bold text-gray-400/80 uppercase tracking-wider overflow-hidden"
        >
          {title}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="flex h-screen bg-[#181c20] overflow-hidden selection:bg-indigo-500/30 selection:text-white font-sans text-white relative">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] bg-indigo-600/30 rounded-full blur-[120px] mix-blend-screen"
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-cyan-600/20 rounded-full blur-[100px] mix-blend-screen"
        />
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <motion.aside 
        animate={{ width: collapsed && !mobileMenuOpen ? 80 : 280 }}
        className={`fixed md:relative top-0 left-0 h-[calc(100vh-2rem)] md:h-auto bg-[#0f172a]/95 md:bg-white/5 backdrop-blur-3xl md:backdrop-blur-2xl border border-white/10 flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.3)] md:shadow-[0_8px_30px_rgb(0,0,0,0.12)] m-4 rounded-[2rem] z-40 transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-[150%] md:translate-x-0'
        }`}
      >
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:block absolute -right-3 top-10 bg-white/10 backdrop-blur-md border border-white/20 shadow-md rounded-full p-1.5 text-gray-300 hover:text-white z-50 transition-transform hover:scale-110"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Mobile close button */}
        <button 
          onClick={() => setMobileMenuOpen(false)}
          className="md:hidden absolute right-4 top-6 text-gray-400 hover:text-white z-50 p-2"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-6 border-b border-white/10 flex items-center justify-center h-28 shrink-0">
          <div className="flex items-center justify-center space-x-3 w-full">
            <div className="bg-gradient-to-br from-indigo-500 to-cyan-500 p-2.5 rounded-2xl shadow-lg shadow-indigo-500/20 shrink-0 border border-white/20">
              <Building className="w-6 h-6 text-white" />
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.span 
                  initial={{ opacity: 0, x: -10, width: 0 }}
                  animate={{ opacity: 1, x: 0, width: 'auto' }}
                  exit={{ opacity: 0, width: 0, x: -10 }}
                  className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300 tracking-tight overflow-hidden whitespace-nowrap"
                >
                  SocietyEase
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-4 custom-scrollbar">
          <NavItem to="/" icon={LayoutDashboard}>Dashboard</NavItem>

          {role === 'resident' && (
            <NavItem to="/resident/billing" icon={CreditCard}>My Bills</NavItem>
          )}

          {role === 'admin' && (
            <>
              <NavSection title="Management" />
              <NavItem to="/admin/complaints" icon={AlertTriangle}>Complaints</NavItem>
              <NavItem to="/admin/notices" icon={Bell}>Notice Board</NavItem>
              
              <NavSection title="Financials" />
              <NavItem to="/admin/expenses" icon={IndianRupee}>Society Expenses</NavItem>
              <NavItem to="/admin/billing" icon={CreditCard}>Resident Billing</NavItem>
            </>
          )}

          {role === 'guard' && (
            <>
              <NavSection title="Gate Security" />
              <NavItem to="/guard/dashboard" icon={Shield}>Scanner / Duty</NavItem>
              <NavItem to="/guard/logs" icon={FileClock}>Gate Logs</NavItem>
            </>
          )}
        </nav>

        <div className="p-5 border-t border-white/10 shrink-0">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3 px-2'} mb-4 transition-all overflow-hidden`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 border border-indigo-500/50 flex items-center justify-center shadow-inner shrink-0">
              <span className="text-sm font-bold text-white">
                {userProfile?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div 
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex-1 min-w-0 whitespace-nowrap overflow-hidden"
                >
                  <p className="text-sm font-bold text-white truncate">
                    {userProfile?.name}
                  </p>
                  <p className="text-xs text-indigo-400 font-medium truncate capitalize mt-0.5">
                    {role}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button 
            onClick={handleLogout}
            className={`flex items-center justify-center w-full space-x-3 py-2.5 text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 rounded-xl transition-all group ${collapsed ? 'px-0' : 'px-4'}`}
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  Sign out
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile Topbar */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-white/5 backdrop-blur-md z-20">
          <div className="flex items-center space-x-2">
            <Building className="w-6 h-6 text-indigo-400" />
            <span className="text-xl font-bold text-white">SocietyEase</span>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 text-gray-300 hover:text-white bg-white/10 rounded-xl"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        <main className="flex-1 overflow-y-auto custom-scrollbar relative px-4 md:px-8 pt-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] md:py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="min-h-full max-w-7xl mx-auto pb-10"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
