import React from 'react';
import pixelCourt from '../../assets/pixel/pixel_court_theme_1_1770886146122.png';
import PixelPlayer from './PixelPlayer';

const PixelCourt = ({
    court,
    courtNumber,
    isCelebrating,
    winningTeam,
    onClick,
    onPlayerClick,
    onFinish,
    gameMode = 'doubles'
}) => {
    const { team1, team2, servingPlayer, score } = court;
    const isMatchActive = team1.length > 0 && team2.length > 0;

    const getPlayerState = (player, teamId) => {
        if (isCelebrating) {
            if (winningTeam === teamId) return 'win';
            return 'idle';
        }
        // Force 'playing' state if they are on an active court
        return 'playing';
    };

    return (
        <div className="relative inline-block m-8 group">
            {/* Court Number / Scoreboard - Floating above */}
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 flex flex-col items-center z-20">
                <div className="bg-black/70 px-4 py-2 rounded-t pixel-border border-white text-white font-pixel text-sm whitespace-nowrap shadow-lg">
                    <span className="text-gray-300 mr-2">COURT {courtNumber}</span>
                    <span className="text-yellow-400 text-lg">{score.team1} - {score.team2}</span>
                </div>
            </div>

            {/* Court Image Background - Slightly larger */}
            <div
                className="relative w-[360px] h-[240px] bg-cover bg-center pixel-art transition-transform hover:scale-105"
                style={{ backgroundImage: `url(${pixelCourt})` }}
                onClick={() => onClick && onClick(court.id)}
            >
                {/* Confetti / Celebration Overlay */}
                {isCelebrating && (
                    <div className="absolute inset-0 pointer-events-none z-30 flex flex-col items-center justify-center bg-black/60">
                        {/* Winning Team Photos */}
                        <div className="flex gap-4 mb-2 animate-bounce">
                            {(winningTeam === 1 ? team1 : team2).map(player => (
                                <div key={player.id} className="w-12 h-12 border-2 border-yellow-400 bg-gray-800 shadow-[0_0_10px_rgba(250,204,21,0.5)]">
                                    {player.photo ? (
                                        <img
                                            src={typeof player.photo === 'string' ? player.photo : URL.createObjectURL(player.photo)}
                                            alt=""
                                            className="w-full h-full object-cover pixel-art"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-blue-500" />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="text-yellow-300 font-pixel text-4xl animate-pulse drop-shadow-[4px_4px_0_#000]">
                            WINNER!
                        </div>
                    </div>
                )}

                {/* Team 1 (Bottom Left / Near side) */}
                <div className="absolute bottom-6 left-12 flex gap-6 z-10">
                    {team1.map((player, idx) => (
                        <PixelPlayer
                            key={player.id}
                            name={player.name}
                            photo={player.photo}
                            team={1}
                            state={getPlayerState(player, 1)}
                            onClick={(e) => {
                                e.stopPropagation();
                                onPlayerClick && onPlayerClick(player, 'team1', idx);
                            }}
                        />
                    ))}
                </div>

                {/* Team 2 (Top Right / Far side) */}
                <div className="absolute top-10 right-12 flex gap-6 z-10">
                    {team2.map((player, idx) => (
                        <PixelPlayer
                            key={player.id}
                            name={player.name}
                            photo={player.photo}
                            team={2}
                            state={getPlayerState(player, 2)}
                            onClick={(e) => {
                                e.stopPropagation();
                                onPlayerClick && onPlayerClick(player, 'team2', idx);
                            }}
                        />
                    ))}
                </div>

                {/* Finish Button - Appears on hover or if game is active */}
                {isMatchActive && !isCelebrating && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            className="pixel-btn bg-yellow-400 text-black border-2 border-black shadow-[4px_4px_0_#000] hover:translate-y-1 hover:shadow-none"
                            onClick={(e) => {
                                e.stopPropagation();
                                onFinish && onFinish(court.id);
                            }}
                        >
                            🏁 FINISH
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PixelCourt;
