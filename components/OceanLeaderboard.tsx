import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { OceanLeaderboardEntry } from '../types';

interface OceanLeaderboardProps {
    onClose: () => void;
}

export const OceanLeaderboard: React.FC<OceanLeaderboardProps> = ({ onClose }) => {
    const [leaders, setLeaders] = useState<OceanLeaderboardEntry[]>([]);
    const [isFull, setIsFull] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('leaderboardNEWWAYSTOLEARN');
        if (saved) {
            const parsed: OceanLeaderboardEntry[] = JSON.parse(saved);
            // Sort by time (ascending)
            const sorted = parsed.sort((a, b) => a.time - b.time);
            setLeaders(sorted.slice(0, 50)); // Only top 50
            if (parsed.length >= 999) setIsFull(true);
        }
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-900/90 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden"
            >
                <div className="p-6 border-b bg-gradient-to-r from-indigo-600 to-blue-600 text-white flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold uppercase">🏆 LEADERBOARD</h2>
                        <p className="text-indigo-200 text-xs">Top 50 Fastest Achievements</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-0 bg-slate-50">
                    {isFull && (
                        <div className="bg-amber-100 text-amber-800 p-3 text-center text-sm font-bold border-b border-amber-200">
                            FULL LEADERBOARD (999 people). New records may not be saved.
                        </div>
                    )}

                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-100 sticky top-0 shadow-sm z-10">
                            <tr>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Rank</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Class</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {leaders.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-400">No records yet. Be the first!</td>
                                </tr>
                            ) : (
                                leaders.map((entry, idx) => (
                                    <tr key={idx} className="bg-white hover:bg-blue-50 transition-colors">
                                        <td className="p-4">
                                            <span className={`
                                        inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs
                                        ${idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                                                    idx === 1 ? 'bg-slate-300 text-slate-800' :
                                                        idx === 2 ? 'bg-amber-600 text-amber-100' : 'bg-slate-100 text-slate-500'}
                                    `}>
                                                {idx + 1}
                                            </span>
                                        </td>
                                        <td className="p-4 font-bold text-slate-700">{entry.name}</td>
                                        <td className="p-4 text-slate-500 text-sm">{entry.className}</td>
                                        <td className="p-4 text-right font-mono text-blue-600 font-bold">
                                            {Math.floor(entry.time / 60)}m {entry.time % 60}s
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
};
