import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { OceanLeaderboardEntry } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

interface LearningQuestLeaderboardProps {
    onClose: () => void;
}

export const LearningQuestLeaderboard: React.FC<LearningQuestLeaderboardProps> = ({ onClose }) => {
    const [entries, setEntries] = useState<OceanLeaderboardEntry[]>([]);
    const [isFull, setIsFull] = useState(false);
    const [statsData, setStatsData] = useState<any[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('leaderboardNEW_WAYS_TO_LEARN');
        if (saved) {
            const parsed: OceanLeaderboardEntry[] = JSON.parse(saved);

            // Sort by time (ascending) for leaderboard list
            const sorted = parsed.sort((a, b) => a.time - b.time);
            setEntries(sorted.slice(0, 50));
            if (parsed.length >= 999) setIsFull(true);

            // Process data for charts
            // 1. Performance (Completions by Day of Week)
            const daysMap: Record<string, number> = {};
            // Initialize last 5 days
            const today = new Date();
            for (let i = 4; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(today.getDate() - i);
                const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                daysMap[dayName] = 0;
            }

            parsed.forEach(entry => {
                // Assuming entry.date is YYYY-MM-DD HH:MM
                // We need to parse it or just use current date if it's recent? 
                // Let's assume entry.date string is parsable.
                try {
                    const date = new Date(entry.date);
                    // If valid date
                    if (!isNaN(date.getTime())) {
                        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                        if (daysMap[dayName] !== undefined) {
                            daysMap[dayName]++;
                        }
                    }
                } catch (e) { }
            });

            const barData = Object.keys(daysMap).map(day => ({
                name: day,
                completions: daysMap[day] || 0 // Default to 0, or mock random for visual confirmation if empty?
            }));

            // If completely empty (no plays yet), maybe fill with some dummy data to show the chart works?
            // Or just show real zeros. Let's show real zeros but if total is 0, maybe hint.
            setStatsData(barData);
        }
    }, []);

    // Static data for Skills Breakdown based on the 8 questions
    // Q1-5: True/False (Reading Comprehension / Fact Retrieval)
    // Q6: Author Purpose (Critical Thinking)
    // Q7: Detail (Reading Comprehension)
    // Q8: Inference (Critical Thinking)
    const skillsData = [
        { name: 'Fact Retrieval', value: 5, color: '#34d399' }, // Emerald
        { name: 'Critical Thinking', value: 2, color: '#f472b6' }, // Pink
        { name: 'Reading Comp.', value: 1, color: '#60a5fa' }, // Blue
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-900/40 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden relative z-10 flex flex-col md:flex-row max-h-[90vh]"
            >
                {/* Header Section (Mobile only, or kept as consistent top bar?) -> Actually let's do a side-by-side layout for Desktop */}

                {/* Left Side: Charts & Stats */}
                <div className="w-full md:w-2/3 bg-slate-50 p-6 md:p-8 flex flex-col gap-6 overflow-y-auto">
                    <div>
                        <h2 className="text-2xl font-black text-indigo-900 mb-1">Class Performance</h2>
                        <p className="text-slate-500 text-sm">Real-time statistics from all players</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Bar Chart */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-1 h-6 bg-indigo-500 rounded-full"></div>
                                <h3 className="font-bold text-slate-700">Completions Trend</h3>
                            </div>
                            <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={statsData}>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                        <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Bar dataKey="completions" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Donut Chart */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                                <h3 className="font-bold text-slate-700">Skills Breakdown</h3>
                            </div>
                            <div className="h-48 flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={skillsData}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {skillsData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Additional Stats Cards */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                            <div className="text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">Total Players</div>
                            <div className="text-3xl font-black text-indigo-700">{entries.length}</div>
                        </div>
                        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                            <div className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">Fastest Time</div>
                            <div className="text-3xl font-black text-emerald-700">{entries.length > 0 ? entries[0].time + 's' : '-'}</div>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                            <div className="text-orange-400 text-xs font-bold uppercase tracking-wider mb-1">Completion Rate</div>
                            <div className="text-3xl font-black text-orange-700">100%</div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Leaderboard List */}
                <div className="w-full md:w-1/3 bg-white flex flex-col border-l border-slate-100 shadow-xl z-20">
                    <div className="p-6 bg-gradient-to-br from-indigo-600 to-purple-700 text-white shrink-0 relative">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                        <h2 className="text-xl font-black uppercase tracking-wider mb-1">Leaderboard</h2>
                        <p className="text-indigo-100 text-xs font-bold opacity-80">TOP 50 FASTEST TIMES</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-0">
                        {entries.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center">
                                <div className="text-4xl mb-2">🏆</div>
                                <div className="font-medium text-sm">No records yet.</div>
                                <div className="text-xs opacity-70">Be the first to join the hall of fame!</div>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {entries.map((entry, index) => (
                                    <div key={index} className="flex items-center p-4 hover:bg-indigo-50/50 transition-colors group">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs mr-3 shrink-0 shadow-sm
                                            ${index === 0 ? 'bg-yellow-400 text-yellow-900 ring-2 ring-yellow-200' :
                                                index === 1 ? 'bg-slate-300 text-slate-700' :
                                                    index === 2 ? 'bg-amber-600 text-amber-100' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-200 group-hover:text-indigo-700'}
                                        `}>
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-slate-700 truncate text-sm">{entry.name}</div>
                                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{entry.className}</div>
                                        </div>
                                        <div className="font-black text-indigo-600 text-sm shrink-0 bg-indigo-50 px-2 py-1 rounded">
                                            {entry.time}s
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
