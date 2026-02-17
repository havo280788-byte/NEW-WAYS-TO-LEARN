import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { OceanLeaderboardEntry } from '../types'; // Reuse type or create new one if fields differ slightly

interface LearningQuestLeaderboardProps {
    onClose: () => void;
}

export const LearningQuestLeaderboard: React.FC<LearningQuestLeaderboardProps> = ({ onClose }) => {
    const [entries, setEntries] = useState<OceanLeaderboardEntry[]>([]);
    const [isFull, setIsFull] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('leaderboardNEW_WAYS_TO_LEARN');
        if (saved) {
            const parsed: OceanLeaderboardEntry[] = JSON.parse(saved);
            // Sort by time (ascending)
            const sorted = parsed.sort((a, b) => a.time - b.time);
            setEntries(sorted.slice(0, 10)); // Top 10 only for display
            if (parsed.length >= 999) setIsFull(true);
        }
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-900/40 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 flex flex-col max-h-[90vh]"
            >
                <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center relative shrink-0">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/70 hover:text-white"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                    <h2 className="text-2xl font-black uppercase tracking-wider mb-1">Leaderboard</h2>
                    <p className="text-indigo-100 text-sm font-medium">TOP 10 FASTEST CHAMPIONS</p>
                    {isFull && <div className="mt-2 bg-white/20 text-xs font-bold py-1 px-3 rounded-full inline-block">FULL LEADERBOARD (999 players)</div>}
                </div>

                <div className="p-0 overflow-y-auto flex-1 bg-slate-50">
                    {entries.length === 0 ? (
                        <div className="p-10 text-center text-slate-400 font-medium">
                            No records yet. Be the first!
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {entries.map((entry, index) => (
                                <div key={index} className="flex items-center p-4 hover:bg-white transition-colors">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mr-4 shrink-0
                                        ${index === 0 ? 'bg-yellow-400 text-yellow-900' :
                                            index === 1 ? 'bg-slate-300 text-slate-700' :
                                                index === 2 ? 'bg-amber-600 text-amber-100' : 'bg-slate-200 text-slate-500'}
                                    `}>
                                        #{index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-slate-800 truncate">{entry.name}</div>
                                        <div className="text-xs text-slate-500 font-medium">{entry.className} • {entry.date}</div>
                                    </div>
                                    <div className="font-black text-indigo-600 text-lg shrink-0">
                                        {entry.time}s
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};
