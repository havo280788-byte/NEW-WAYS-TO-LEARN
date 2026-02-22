import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { QuestLeaderboardEntry } from '../types';
import { LEARNING_QUEST_POOL } from '../constants';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { db } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot, deleteDoc, doc } from 'firebase/firestore';

interface LearningQuestLeaderboardProps {
    onClose: () => void;
}

export const LearningQuestLeaderboard: React.FC<LearningQuestLeaderboardProps> = ({ onClose }) => {
    const [entries, setEntries] = useState<QuestLeaderboardEntry[]>([]);
    const [allEntries, setAllEntries] = useState<QuestLeaderboardEntry[]>([]);
    const [isFull, setIsFull] = useState(false);
    const [statsData, setStatsData] = useState<any[]>([]);
    const [skillsData, setSkillsData] = useState<any[]>([]);
    const [snapshot, setSnapshot] = useState({
        teamsJoined: 0,
        completionRate: 0,
        avgAccuracy: 0,
        fastest80: 0
    });
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error' | 'offline'>('connecting');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleReset = async () => {
        if (confirm('Are you sure you want to PERMANENTLY delete all leaderboard data for EVERYONE? This cannot be undone.')) {
            // Local Clear
            localStorage.removeItem('leaderboardLEARNINGQUEST');

            // Firestore Clear (Iterate and delete)
            // Note: For large collections, cloud functions are better, but for <1000 this is fine for an admin tool.
            try {
                const deletePromises = entries.map(entry => {
                    if (entry.id) {
                        return deleteDoc(doc(db, 'leaderboard', entry.id));
                    }
                    return Promise.resolve();
                });
                await Promise.all(deletePromises);
                alert('Leaderboard has been reset for all users.');
            } catch (error) {
                console.error("Error clearing leaderboard:", error);
                alert('Failed to clear some online records. Check console.');
            }

            setEntries([]);
            setIsFull(false);
        }
    };

    useEffect(() => {
        // Real-time Firestore Listener
        const q = query(collection(db, 'leaderboard'), orderBy('score', 'desc'), orderBy('time', 'asc'), limit(1000));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            setConnectionStatus('connected');
            setErrorMessage(null);
            const fetchedEntries: QuestLeaderboardEntry[] = [];
            querySnapshot.forEach((doc) => {
                fetchedEntries.push({ id: doc.id, ...doc.data() } as QuestLeaderboardEntry);
            });


            // If connected to Firestore, we trust its state (even if empty)
            setEntries(fetchedEntries.slice(0, 10)); // Top 10
            setAllEntries(fetchedEntries);
            if (fetchedEntries.length >= 999) setIsFull(true);


            // Process real data for charts
            if (fetchedEntries.length > 0) {
                // 1. Question Success Rates
                const qStats = LEARNING_QUEST_POOL.map((q, i) => {
                    const total = fetchedEntries.filter(e => e.selectedAnswers?.[q.id] !== undefined).length;
                    const correct = fetchedEntries.filter(e => e.selectedAnswers?.[q.id] === q.correctAnswerId).length;
                    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
                    return { name: `Q${i + 1}`, accuracy, count: correct, total };
                });
                setStatsData(qStats);

                // 2. Class Snapshot
                const uniqueClasses = new Set(fetchedEntries.map(e => e.className)).size;
                const completedCount = fetchedEntries.filter(e => e.score > 0).length;
                const avgAcc = Math.round((fetchedEntries.reduce((acc, curr) => acc + (curr.score || 0), 0) / fetchedEntries.length / 80) * 100);
                const fastest80Time = fetchedEntries.filter(e => (e.score || 0) >= 64).sort((a, b) => a.time - b.time)[0]?.time || 0;

                setSnapshot({
                    teamsJoined: uniqueClasses,
                    completionRate: Math.round((completedCount / fetchedEntries.length) * 100),
                    avgAccuracy: avgAcc,
                    fastest80: fastest80Time
                });

                // 3. AI Reading Skills
                const skillGroups = {
                    'Fact Retrieval': ['lq1', 'lq7'],
                    'Reference': ['lq3'],
                    'Inference': ['lq4', 'lq5', 'lq6'],
                    'Detail/Scanning': ['lq2', 'lq8']
                };

                const sData = Object.entries(skillGroups).map(([skill, qIds]) => {
                    let totalPossible = 0;
                    let totalCorrect = 0;

                    qIds.forEach(qId => {
                        const qObj = LEARNING_QUEST_POOL.find(p => p.id === qId);
                        if (qObj) {
                            const correctCount = fetchedEntries.filter(e => e.selectedAnswers?.[qId] === qObj.correctAnswerId).length;
                            const answerCount = fetchedEntries.filter(e => e.selectedAnswers?.[qId] !== undefined).length;
                            totalCorrect += correctCount;
                            totalPossible += answerCount;
                        }
                    });

                    const percentage = totalPossible > 0 ? Math.round((totalCorrect / totalPossible) * 100) : 0;
                    const colors = {
                        'Fact Retrieval': '#34d399',
                        'Reference': '#818cf8',
                        'Inference': '#f472b6',
                        'Detail/Scanning': '#fbbf24'
                    };
                    return { name: skill, value: percentage, color: colors[skill as keyof typeof colors] };
                });
                setSkillsData(sData);
            }

        }, (error) => {
            console.error("Error getting leaderboard: ", error);
            setConnectionStatus('error');
            setErrorMessage(error.message);
            // Fallback to local storage on error
            const saved = localStorage.getItem('leaderboardLEARNINGQUEST');
            if (saved) {
                const parsed: QuestLeaderboardEntry[] = JSON.parse(saved);
                const sorted = parsed.sort((a, b) => {
                    const valA = a.score || 0;
                    const valB = b.score || 0;
                    if (valA !== valB) return valB - valA;
                    return a.time - b.time;
                });
                setEntries(sorted.slice(0, 10));
                if (parsed.length >= 999) setIsFull(true);
            }
        });

        return () => unsubscribe();
    }, []);


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-900/40 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden relative z-10 flex flex-col md:flex-row max-h-[90vh] md:max-h-[90vh] h-[90vh] md:h-auto"
            >
                {/* Left Side: Charts & Stats */}
                <div className="w-full md:w-2/3 bg-slate-50 p-4 md:p-8 flex flex-col gap-4 md:gap-6 overflow-y-auto shrink-0 md:shrink custom-scrollbar-thin">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-xl md:text-2xl font-black text-indigo-900 mb-1">
                                Class Performance
                            </h2>
                            <p className="text-slate-500 text-xs md:text-sm">Real-time statistics from all players</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        {/* Bar Chart - Correct Answer Rate */}
                        <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex items-center gap-2 mb-3 md:mb-4">
                                <div className="w-1 h-5 md:h-6 bg-indigo-500 rounded-full"></div>
                                <h3 className="font-bold text-slate-700 text-sm md:text-base">Correct Answer Rate</h3>
                            </div>
                            <div className="h-40 md:h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={statsData}>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                        <YAxis hide domain={[0, 100]} />
                                        <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value: number) => [`${value}%`, 'Accuracy']} />
                                        <Bar dataKey="accuracy" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Donut Chart */}
                        <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex items-center gap-2 mb-3 md:mb-4">
                                <div className="w-1 h-5 md:h-6 bg-purple-500 rounded-full"></div>
                                <h3 className="font-bold text-slate-700 text-sm md:text-base">Skills Breakdown</h3>
                            </div>
                            <div className="h-40 md:h-48 flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={skillsData}
                                            innerRadius={50}
                                            outerRadius={70}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {skillsData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Additional Stats Cards */}
                    <div className="grid grid-cols-3 gap-2 md:gap-4">
                        <div className="bg-indigo-50 p-2 md:p-4 rounded-xl md:rounded-2xl border border-indigo-100 text-center md:text-left">
                            <div className="text-indigo-400 text-[8px] md:text-xs font-bold uppercase tracking-wider mb-1">Total Players</div>
                            <div className="text-xl md:text-3xl font-black text-indigo-700">{allEntries.length}</div>
                        </div>
                        <div className="bg-indigo-50 p-2 md:p-4 rounded-xl md:rounded-2xl border border-indigo-100 text-center md:text-left">
                            <div className="text-indigo-400 text-[8px] md:text-xs font-bold uppercase tracking-wider mb-1">Fastest Time</div>
                            <div className="text-xl md:text-3xl font-black text-indigo-700">{allEntries.length > 0 ? allEntries.sort((a, b) => a.time - b.time)[0].time + 's' : '-'}</div>
                        </div>
                        <div className="bg-orange-50 p-2 md:p-4 rounded-xl md:rounded-2xl border border-orange-100 text-center md:text-left">
                            <div className="text-orange-400 text-[8px] md:text-xs font-bold uppercase tracking-wider mb-1">Completion Rate</div>
                            <div className="text-xl md:text-3xl font-black text-orange-700">100%</div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Leaderboard List */}
                <div className="w-full md:w-1/3 bg-white flex flex-col border-t md:border-t-0 md:border-l border-slate-100 shadow-xl z-20 flex-1 min-h-0">
                    <div className="p-6 bg-gradient-to-br from-indigo-600 to-purple-700 text-white shrink-0 relative">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                        <h2 className="text-xl font-black uppercase tracking-wider mb-1">Leaderboard</h2>
                        <p className="text-indigo-100 text-xs font-bold opacity-80 mb-2">TOP 10 PLAYERS</p>
                        <button
                            onClick={handleReset}
                            className="text-[10px] bg-red-500/20 hover:bg-red-500/40 text-red-200 px-2 py-1 rounded border border-red-500/30 transition-colors"
                        >
                            Reset Data
                        </button>
                        <div className="mt-2 flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-indigo-400' : connectionStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' : 'bg-red-500'}`}></span>
                            <span className="text-[10px] font-mono opacity-80 uppercase tracking-widest">
                                {connectionStatus === 'connected' ? 'LIVE SYNC' : connectionStatus === 'error' ? 'OFFLINE (LOCAL)' : 'CONNECTING...'}
                            </span>
                        </div>
                        {errorMessage && <div className="text-[9px] text-red-200 mt-1 max-w-[200px] leading-tight bg-red-900/50 p-1 rounded">{errorMessage}</div>}
                    </div>

                    <div className="flex-1 overflow-y-auto p-0">
                        {isFull && <div className="bg-red-100 text-red-800 text-xs font-bold p-2 text-center">FULL LEADERBOARD (999 people).</div>}
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
                                        </div>
                                        <div className="font-bold text-indigo-600 text-sm shrink-0">
                                            {entry.score || 0} pts
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
            </motion.div >

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar-thin::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar-thin::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
                .custom-scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
                
                @keyframes sliceInQ {
                    from { opacity: 0; transform: translateX(-10px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .slice-in-q {
                    animation: sliceInQ 0.4s ease forwards;
                }
            `}} />
        </div >
    );
};
