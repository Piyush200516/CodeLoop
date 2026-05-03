import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import PremiumPaywall from './PremiumPaywall';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || 'coderecallapp@gmail.com').toLowerCase().trim();

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isPaywallOpen, setIsPaywallOpen] = useState(false);
    const [paywallFeature, setPaywallFeature] = useState('');

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/login');
    };

    const isPremiumUser = user?.isPremium || user?.isPaid || user?.email?.toLowerCase().trim() === ADMIN_EMAIL;

    const links = [
        { to: '/', label: 'Dashboard', icon: '📊', isPremium: false },
        { to: '/algorithms', label: 'Visualize', icon: '🔮', isPremium: false },
        { to: '/manage', label: 'Manage', icon: '📋', isPremium: false },
        { to: '/calendar', label: 'Calendar', icon: '📅', isPremium: true },
        { to: '/review', label: 'Review', icon: '🔁', isPremium: false },
        { to: '/recall', label: 'Recall', icon: '🧠', isPremium: true },
        { to: '/code-visualizer', label: 'Code Lab', icon: '🧪', isPremium: false },
        { to: '/add', label: 'Add', icon: '➕', isPremium: false },
    ];

    const handleLinkClick = (e, link) => {
        if (link.isPremium && !isPremiumUser) {
            e.preventDefault();
            setPaywallFeature(link.label);
            setIsPaywallOpen(true);
            setMenuOpen(false);
        }
    };

    if (user?.email?.toLowerCase().trim() === ADMIN_EMAIL) {
        links.push({ to: '/admin', label: 'Admin', icon: '🛡️', isPremium: false });
    }

    const isActive = (path) =>
        path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-brand-500/10 transition-colors duration-300">
            <PremiumPaywall 
                isOpen={isPaywallOpen} 
                onClose={() => setIsPaywallOpen(false)} 
                featureName={paywallFeature} 
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 w-full gap-4">
                    <div className="flex items-center gap-4 lg:gap-8 min-w-0">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
                            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-brand-600/40">
                                CR
                            </div>
                            <span className="font-bold text-slate-100 hidden sm:block whitespace-nowrap">
                                Code<span className="text-brand-400">Recall</span>
                            </span>
                        </Link>

                        {/* Desktop Links - compact on smaller screens */}
                        <div className="hidden lg:flex items-center gap-1 overflow-x-auto no-scrollbar">
                            {links.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    title={link.label}
                                    onClick={(e) => handleLinkClick(e, link)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${isActive(link.to)
                                        ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30'
                                        : 'text-slate-400 hover:text-brand-400 hover:bg-brand-500/10'
                                        }`}
                                >
                                    <span>{link.icon}</span>
                                    <span className="hidden xl:inline">{link.label}</span>
                                    {link.isPremium && !isPremiumUser && <span className="text-[10px]">🔒</span>}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Right side stuff */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-xl bg-slate-500/10 hover:bg-slate-500/20 text-slate-400 transition-all duration-200 flex-shrink-0"
                        >
                            {theme === 'dark' ? '☀️' : '🌙'}
                        </button>

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="hidden sm:flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all flex-shrink-0"
                            >
                                <div className="w-7 h-7 bg-brand-600/30 rounded-full flex items-center justify-center text-brand-400 font-bold text-xs border border-brand-500/30">
                                    {user?.name?.[0]?.toUpperCase()}
                                </div>
                                <span className="font-medium text-slate-300 text-sm hidden md:inline max-w-[100px] truncate">{user?.name}</span>
                                <span className="text-[10px] text-slate-500">▼</span>
                            </button>

                            <AnimatePresence>
                                {dropdownOpen && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 mt-2 w-48 rounded-2xl shadow-2xl z-20 overflow-hidden"
                                            style={{ 
                                                backgroundColor: 'var(--bg-secondary)', 
                                                border: '1px solid var(--border-color)' 
                                            }}
                                        >
                                            <div className="p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                                                <p className="text-sm font-black truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
                                                <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>{isPremiumUser ? '💎 Premium' : 'Free Plan'}</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setDropdownOpen(false);
                                                    handleLogout();
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 transition-colors text-left font-bold"
                                            >
                                                <span>👋</span> Logout
                                            </button>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Mobile menu and direct logout on small screen */}
                        <button
                            onClick={() => {
                                setMenuOpen(!menuOpen);
                                setDropdownOpen(false);
                            }}
                            className="lg:hidden text-slate-400 hover:text-slate-200 p-2 ml-1 flex-shrink-0"
                        >
                            {menuOpen ? '✕' : '☰'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="lg:hidden glass border-t border-brand-500/10 px-4 py-4 space-y-2 bg-[var(--bg-primary)] shadow-2xl overflow-y-auto max-h-[calc(100vh-4rem)]"
                    >
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            {links.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    onClick={(e) => handleLinkClick(e, link)}
                                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl text-xs font-bold transition-all border ${isActive(link.to)
                                        ? 'bg-brand-600/20 text-brand-400 border-brand-500/30'
                                        : 'text-slate-400 border-transparent hover:bg-brand-500/10'
                                        }`}
                                >
                                    <span className="text-xl">{link.icon}</span>
                                    {link.label}
                                    {link.isPremium && !isPremiumUser && <span className="absolute top-2 right-2 text-[10px]">🔒</span>}
                                </Link>
                            ))}
                        </div>

                        <div className="border-t border-brand-500/10 pt-4 px-2">
                            <div className="flex items-center gap-3 mb-4 p-2">
                                <div className="w-10 h-10 bg-brand-600/30 rounded-full flex items-center justify-center text-brand-400 font-bold border border-brand-500/30">
                                    {user?.name?.[0]?.toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-200">{user?.name}</p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">{isPremiumUser ? 'Premium' : 'Free Plan'}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    setMenuOpen(false);
                                    handleLogout();
                                }}
                                className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-red-500/10 text-red-500 font-black text-sm hover:bg-red-500/20 transition-all border border-red-500/20"
                            >
                                👋 Logout
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
