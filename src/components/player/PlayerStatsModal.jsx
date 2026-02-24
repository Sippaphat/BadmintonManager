import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { getPlayerStatistics } from '../../services/playerService';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { Trophy, Target, Activity, Users, Frown, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUrl';

const PlayerStatsModal = ({ isOpen, onClose, player, groupId }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && player && groupId) {
            loadStats();
        }
    }, [isOpen, player, groupId]);

    const loadStats = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getPlayerStatistics(groupId, player.id);
            setStats(data);
        } catch (err) {
            console.error("Failed to load player stats:", err);
            setError("Could not load advanced statistics at this time.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !player) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`${player.name}'s Advanced Statistics`}
            size="3xl"
        >
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-2 -m-4 sm:-m-6 pb-6">

                {/* Header Profile Section */}
                <div className="flex items-center gap-6 p-6 mb-6">
                    <div className="relative group">
                        {player.photo ? (
                            <img src={getImageUrl(player.photo)} alt={player.name} className="w-24 h-24 rounded-full object-cover shadow-lg border-4 border-white dark:border-gray-700" />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-accent text-white flex items-center justify-center text-3xl font-bold shadow-lg border-4 border-white dark:border-gray-700">
                                {player.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 p-1.5 rounded-full shadow-md">
                            <Trophy className="w-5 h-5 text-yellow-500" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">{player.name}</h2>
                        <div className="flex gap-3 flex-wrap">
                            <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 font-bold rounded-full text-sm shadow-sm">
                                ELO: {stats?.currentElo || Math.round(player.elo || 1500)}
                            </span>
                            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 font-bold rounded-full text-sm shadow-sm">
                                {stats?.totalGames || player.gamesPlayed || 0} Games
                            </span>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : error ? (
                    <div className="text-center text-red-500 py-10">{error}</div>
                ) : stats && (
                    <div className="space-y-6 px-6">

                        {/* Top Stat Cars */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatCard title="Win Rate" value={`${stats.winPercentage}%`} icon={<Target className="text-green-500" />} />
                            <StatCard title="Rest Ratio" value={`${stats.restRatio}%`} icon={<Clock className="text-blue-500" />} subtitle="Time spent resting" />
                            <StatCard
                                title="Point Diff"
                                value={stats.avgPointDiff > 0 ? `+${stats.avgPointDiff}` : stats.avgPointDiff}
                                icon={stats.avgPointDiff >= 0 ? <TrendingUp className="text-green-500" /> : <TrendingDown className="text-red-500" />}
                                subtitle="Avg point gap"
                                color={stats.avgPointDiff >= 0 ? 'text-green-600' : 'text-red-600'}
                            />
                            <StatCard
                                title="Rotation"
                                value={`${stats.rotationProgress.percentage}%`}
                                icon={<Activity className="text-purple-500" />}
                                subtitle={`${stats.rotationProgress.uniquePartners} / ${stats.rotationProgress.totalPossible} partners`}
                            />
                        </div>

                        {/* Elo Trend Chart */}
                        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-primary" /> ELO Trend (Last 10 Matches)
                            </h3>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={stats.eloTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={(tick) => new Date(tick).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fontSize: 12 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            domain={['dataMin - 50', 'dataMax + 50']}
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fontSize: 12 }}
                                            dx={-10}
                                        />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            labelFormatter={(label) => new Date(label).toLocaleString()}
                                            formatter={(value) => [`${value} ELO`, 'Rating']}
                                        />
                                        <Line type="stepAfter" dataKey="elo" stroke="#3b82f6" strokeWidth={4} activeDot={{ r: 8 }} animationDuration={1000} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Partners & Opponents */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Best Partner */}
                            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-green-100 dark:border-green-900/30 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 dark:bg-green-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                                <h3 className="font-bold text-green-700 dark:text-green-400 mb-4 flex items-center gap-2">
                                    <Users className="w-5 h-5" /> Best Partner
                                </h3>
                                {stats.bestPartner ? (
                                    <div className="flex items-center gap-4">
                                        <Avatar src={stats.bestPartner.photo} name={stats.bestPartner.name} />
                                        <div>
                                            <div className="font-extrabold text-xl text-gray-900 dark:text-white">{stats.bestPartner.name}</div>
                                            <div className="text-sm font-medium text-green-600 dark:text-green-400">
                                                {stats.bestPartner.winRate}% Win Rate ({stats.bestPartner.winsTogether}/{stats.bestPartner.timesPartnered})
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400 italic">No partnerships recorded yet.</p>
                                )}
                            </div>

                            {/* Toughest Opponent */}
                            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-red-100 dark:border-red-900/30 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 dark:bg-red-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                                <h3 className="font-bold text-red-700 dark:text-red-400 mb-4 flex items-center gap-2">
                                    <Frown className="w-5 h-5" /> Toughest Opponent
                                </h3>
                                {stats.toughestOpponent ? (
                                    <div className="flex items-center gap-4">
                                        <Avatar src={stats.toughestOpponent.photo} name={stats.toughestOpponent.name} />
                                        <div>
                                            <div className="font-extrabold text-xl text-gray-900 dark:text-white">{stats.toughestOpponent.name}</div>
                                            <div className="text-sm font-medium text-red-600 dark:text-red-400">
                                                {stats.toughestOpponent.losses} Losses against them
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400 italic">No formidable opponents yet.</p>
                                )}
                            </div>
                        </div>

                        {/* Rotation Progress Bar */}
                        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="flex justify-between items-end mb-2">
                                <h3 className="font-bold text-gray-800 dark:text-gray-200">Pairing Rotation Progress</h3>
                                <span className="text-sm font-bold text-gray-500">{stats.rotationProgress.uniquePartners} / {stats.rotationProgress.totalPossible} Players</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-purple-500 to-indigo-500 h-4 rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${stats.rotationProgress.percentage}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                When the bar fills up, pairing penalties are reset to ensure fresh rotations.
                            </p>
                        </div>

                    </div>
                )}
            </div>
        </Modal>
    );
};

const StatCard = ({ title, value, icon, subtitle, color = "text-gray-900 dark:text-white" }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">{title}</h4>
            <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">{icon}</div>
        </div>
        <div>
            <div className={`text-2xl font-black ${color}`}>{value}</div>
            {subtitle && <div className="text-xs text-gray-400 mt-1 font-medium">{subtitle}</div>}
        </div>
    </div>
);

const Avatar = ({ src, name }) => (
    src ? (
        <img src={getImageUrl(src)} alt={name} className="w-14 h-14 rounded-full object-cover shadow border-2 border-white dark:border-gray-700" />
    ) : (
        <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center text-xl font-bold shadow border-2 border-white dark:border-gray-700">
            {name.charAt(0).toUpperCase()}
        </div>
    )
);

export default PlayerStatsModal;
