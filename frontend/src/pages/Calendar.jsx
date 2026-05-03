import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [schedule, setSchedule] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedDateStr, setSelectedDateStr] = useState(null);

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const { data } = await api.get('/problems/calendar');
                setSchedule(data);
                
                // Select today by default if it has problems
                const todayStr = new Date().toISOString().split('T')[0];
                setSelectedDateStr(todayStr); // Always show today's stats on load if possible
            } catch (err) {
                toast.error('Failed to load schedule');
            } finally {
                setLoading(false);
            }
        };
        fetchSchedule();
    }, []);

    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        const totalDays = daysInMonth(year, month);
        const startingDay = firstDayOfMonth(year, month);
        
        let days = [];
        const todayStr = new Date().toISOString().split('T')[0];

        // Fill empty cells before the 1st
        for (let i = 0; i < startingDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-24 md:h-32 border border-brand-500/10 bg-brand-500/5 opacity-50" />);
        }

        for (let i = 1; i <= totalDays; i++) {
            const dateObj = new Date(year, month, i);
            // Adjust for timezone to get strict YYYY-MM-DD
            const _dateForStr = new Date(dateObj.getTime() - (dateObj.getTimezoneOffset() * 60000));
            const dateStr = _dateForStr.toISOString().split('T')[0];

            const problemsDue = schedule[dateStr] || [];
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDateStr;
            const hasProblems = problemsDue.length > 0;

            days.push(
                <motion.div
                    key={dateStr}
                    whileHover={{ scale: 0.98 }}
                    onClick={() => setSelectedDateStr(dateStr)}
                    className={`h-24 md:h-32 border p-2 cursor-pointer transition-colors relative flex flex-col justify-between 
                        ${isSelected ? 'bg-brand-600/20 border-brand-500/50 outline outline-1 outline-brand-400 z-10' : 'border-brand-500/10 hover:bg-brand-500/5'}
                        ${isToday && !isSelected ? 'bg-brand-500/10' : ''}
                    `}
                >
                    <div className="flex justify-between items-start">
                        <span className={`text-sm md:text-base font-bold w-7 h-7 flex items-center justify-center rounded-full
                            ${isToday ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/40' : 'text-slate-400'}
                        `}>
                            {i}
                        </span>
                        {hasProblems && (
                            <span className="text-xs font-bold text-slate-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                                {problemsDue.length}
                            </span>
                        )}
                    </div>

                    {hasProblems && (
                        <div className="mt-auto hidden sm:flex flex-wrap gap-1">
                            <div className="w-full flex -space-x-1 overflow-hidden">
                                {problemsDue.slice(0, 3).map((_, idx) => (
                                    <div key={idx} className="w-2.5 h-2.5 rounded-full bg-brand-400 ring-2 ring-transparent" />
                                ))}
                                {problemsDue.length > 3 && (
                                    <div className="text-[10px] text-slate-500 ml-2 font-bold select-none text-brand-400">
                                        +{problemsDue.length - 3}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </motion.div>
            );
        }

        return days;
    };

    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const goToToday = () => {
        setCurrentDate(new Date());
        setSelectedDateStr(new Date().toISOString().split('T')[0]);
    };

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-brand-600/20 border-t-brand-500 rounded-full animate-spin" />
            </div>
        );
    }

    const selectedProblems = selectedDateStr ? (schedule[selectedDateStr] || []) : [];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex flex-col lg:flex-row gap-8">
            
            {/* Calendar Section */}
            <div className="flex-1 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-extrabold text-slate-100 tracking-tight">
                            Revision <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Calendar</span>
                        </h1>
                        <p className="text-slate-400 mt-2">Plan your spaced repetition sessions.</p>
                    </div>
                </div>

                <div className="card glass p-0 overflow-hidden shadow-2xl">
                    {/* Calendar Header Controls */}
                    <div className="p-4 sm:p-6 flex items-center justify-between bg-brand-500/5 border-b border-brand-500/10">
                        <div className="flex items-center gap-4">
                            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-100 w-48">
                                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                            </h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={goToToday} className="btn-secondary px-3 py-1.5 text-xs font-bold mr-2 hidden sm:block">
                                Today
                            </button>
                            <button onClick={prevMonth} className="btn-secondary p-2 text-slate-300">
                                ◀
                            </button>
                            <button onClick={nextMonth} className="btn-secondary p-2 text-slate-300">
                                ▶
                            </button>
                        </div>
                    </div>

                    {/* Days of Week */}
                    <div className="grid grid-cols-7 bg-brand-500/10 border-b border-brand-500/10">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-7 bg-transparent">
                        {renderCalendar()}
                    </div>
                </div>
            </div>

            {/* Side Panel: Selected Day Details */}
            <div className="w-full lg:w-96 shrink-0 space-y-6 lg:pt-24">
                <div className="card glass sticky top-24">
                    <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                        <span>Revisions for {selectedDateStr ? new Date(selectedDateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '...'}</span>
                        <span className="bg-brand-500/10 px-2 py-0.5 rounded text-brand-400">{selectedProblems.length}</span>
                    </h3>

                    <div className="space-y-3 min-h-[300px] max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                        <AnimatePresence mode="popLayout">
                            {selectedProblems.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-12 text-slate-500"
                                >
                                    <div className="text-4xl mb-3">🌴</div>
                                    <p>No revisions scheduled.</p>
                                    <p className="text-xs mt-1">Take a break or add new problems!</p>
                                </motion.div>
                            ) : (
                                selectedProblems.map((title, idx) => (
                                    <motion.div
                                        key={`${title}-${idx}`}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="p-3 bg-brand-500/5 hover:bg-brand-500/10 hover:border-brand-500/30 border border-brand-500/10 rounded-xl transition-colors flex items-center gap-3 group"
                                    >
                                        <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/40" />
                                        <div className="truncate text-sm font-medium text-slate-200 group-hover:text-brand-400 transition-colors">
                                            {title}
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>

                    {selectedProblems.length > 0 && selectedDateStr === new Date().toISOString().split('T')[0] && (
                        <div className="mt-6 pt-4 border-t border-brand-500/10">
                            <Link to="/review" className="btn-primary w-full py-2 shadow-emerald-600/20 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border-none">
                                Start Review Session 🚀
                            </Link>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}
