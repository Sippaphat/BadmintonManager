import React from 'react';
import PixelPlayer from './PixelPlayer';

const PixelPlayerList = ({
    players,
    sortMode,
    setSortMode,
    onEdit,
    onDelete,
    onToggleRest,
    t
}) => {

    // Sort players based on mode
    const sortedPlayers = [...players].sort((a, b) => {
        if (sortMode === 'leaderboard') {
            // Sort by ELO descending
            return (b.elo || 1200) - (a.elo || 1200);
        } else {
            // Sort by games played ascending (Queue)
            return (a.gamesPlayed || 0) - (b.gamesPlayed || 0);
        }
    });

    return (
        <div className="w-full max-w-4xl mx-auto mt-8 pixel-border bg-gray-800 text-white p-4">
            {/* Header / Tabs */}
            <div className="flex justify-center gap-4 mb-6">
                <button
                    className={`pixel-btn ${sortMode === 'queue' ? 'bg-yellow-400 text-black' : 'bg-gray-600 text-gray-300'}`}
                    onClick={() => setSortMode('queue')}
                >
                    ⏳ QUEUE
                </button>
                <button
                    className={`pixel-btn ${sortMode === 'leaderboard' ? 'bg-yellow-400 text-black' : 'bg-gray-600 text-gray-300'}`}
                    onClick={() => setSortMode('leaderboard')}
                >
                    🏆 LEADERBOARD
                </button>
            </div>

            {/* List */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar p-2">
                {sortedPlayers.map((player, index) => (
                    <div
                        key={player.id}
                        className="flex items-center justify-between bg-gray-700 p-2 border-2 border-black hover:bg-gray-600 transition-colors"
                    >
                        {/* Rank / Info */}
                        <div className="flex items-center gap-4 flex-1">
                            <div className="w-8 h-8 flex items-center justify-center font-bold text-yellow-400 text-xl font-pixel outline-text">
                                #{index + 1}
                            </div>

                            <div className="w-10 h-10">
                                {/* Mini Face */}
                                <div className="w-full h-full overflow-hidden border-2 border-white rounded-none">
                                    {player.photo ? (
                                        <img src={typeof player.photo === 'string' ? player.photo : URL.createObjectURL(player.photo)} alt="" className="w-full h-full object-cover pixel-art" />
                                    ) : (
                                        <div className="w-full h-full bg-blue-500"></div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <div className="font-pixel text-yellow-300 text-sm">{player.name}</div>
                                <div className="text-[10px] text-gray-300 font-pixel">
                                    W:{player.wins || 0} / G:{player.gamesPlayed || 0}
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-6 mr-4">
                            <div className="text-center w-16">
                                <div className="text-[10px] text-gray-400">WIN RATE</div>
                                <div className="text-green-400 font-pixel">
                                    {player.gamesPlayed > 0
                                        ? Math.round(((player.wins || 0) / player.gamesPlayed) * 100)
                                        : 0}%
                                </div>
                            </div>
                            <div className="text-center w-16">
                                <div className="text-[10px] text-gray-400">ELO</div>
                                <div className="text-cyan-400 font-pixel text-lg">
                                    {player.elo || 1200}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => onToggleRest(player)}
                                className={`p-2 pixel-btn text-[10px] ${player.isResting ? 'bg-red-400' : 'bg-green-400'} text-black`}
                                title="Toggle Rest"
                            >
                                {player.isResting ? '💤' : '⚡'}
                            </button>
                            <button
                                onClick={() => onEdit(player)}
                                className="p-2 pixel-btn bg-blue-400 text-black text-[10px]"
                                title="Edit"
                            >
                                ✏️
                            </button>
                        </div>
                    </div>
                ))}

                {sortedPlayers.length === 0 && (
                    <div className="text-center py-8 text-gray-500 font-pixel">
                        NO PLAYERS FOUND
                    </div>
                )}
            </div>
        </div>
    );
};

export default PixelPlayerList;
