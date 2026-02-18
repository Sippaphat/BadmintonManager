import React, { useState, useEffect } from 'react';
import PhaserGame from '../phaser/PhaserGame';
import PixelBench from './PixelBench';
import PixelPlayerList from './PixelPlayerList';
import PixelPlayer from './PixelPlayer';
import bgVideo from '../../assets/pixel/bg_video.mp4';
import '../../styles/pixel-theme.css';

const PixelLayout = ({
    courts,
    players,
    celebratingCourtId,
    celebratingTeam,
    sortMode,
    setSortMode,
    onAssignRandom,
    onOpenCourtModal,
    onAddPlayerToPosition,
    onRemovePlayerFromPosition,
    onSwapPlayers,
    onSetServingPlayer,
    onFinishMatch,
    onIncrementScore,
    onDecrementScore,
    onSwitchServe,
    onEditPlayer,
    onDeletePlayer,
    onToggleRest,
    onResetStats,
    onResetGame,
    t
}) => {
    const [selectedCourtId, setSelectedCourtId] = useState(null);
    const [showDashboard, setShowDashboard] = useState(false);

    // Dynamic Court Settings
    const [courtSettings, setCourtSettings] = useState({
        floor: 'wood',
        location: 'stadium',
        weather: 'clear'
    });

    // Toggle Settings
    const cycleSetting = (key, options) => {
        setCourtSettings(prev => {
            const currentIdx = options.indexOf(prev[key]);
            const nextIdx = (currentIdx + 1) % options.length;
            return { ...prev, [key]: options[nextIdx] };
        });
    };

    const [isAssigning, setIsAssigning] = useState(false);

    const handleAssignRandom = async () => {
        setIsAssigning(true);
        await onAssignRandom(null);
        setTimeout(() => setIsAssigning(false), 1000);
    };

    const handleCourtClick = (courtId) => {
        setSelectedCourtId(courtId);
        onOpenCourtModal && onOpenCourtModal(courtId);
    };

    const handleCourtPlayerClick = (player) => {
        onEditPlayer(player);
    };

    const handleBenchPlayerClick = (player) => {
        onToggleRest(player);
    };

    const handleScanCourt = (courtId) => {
        onFinishMatch(courtId);
    }

    const activePlayers = players.filter(p => !p.isPlaying);

    // --- Animation Logic ---
    const [animatingPlayers, setAnimatingPlayers] = useState([]);
    const [prevPlayers, setPrevPlayers] = useState(players);
    const prevCourtsRef = React.useRef(courts);

    useEffect(() => {
        // Detect players transitioning
        const newPlaying = players.filter(p => p.isPlaying);
        const oldPlaying = prevPlayers.filter(p => p.isPlaying);

        // Enter: !isPlaying -> isPlaying (Bench -> Court)
        const entering = newPlaying.filter(np => !oldPlaying.find(op => op.id === np.id));

        // Exit: isPlaying -> !isPlaying (Court -> Bench)
        const exiting = oldPlaying.filter(op => !newPlaying.find(np => np.id === op.id));

        const anims = [];

        // Handle Entering
        entering.forEach(player => {
            // Find target court in CURRENT courts
            const targetCourt = courts.find(c => c.team1.find(p => p.id === player.id) || c.team2.find(p => p.id === player.id));

            let endX = '50%';
            let endY = '30%'; // Approx Court Y (Top)

            if (targetCourt) {
                const index = courts.indexOf(targetCourt);
                // Court 1 (Left) ~ 30%, Court 2 (Right) ~ 70%
                if (index === 0) endX = '30%';
                if (index === 1) endX = '70%';
            }

            anims.push({
                id: player.id,
                player,
                type: 'enter',
                startX: '50%', // Bench Center
                startY: '90%', // Bench Y (Bottom)
                endX,
                endY
            });
        });

        // Handle Exiting
        exiting.forEach(player => {
            // Find source court in PREVIOUS courts
            const sourceCourt = prevCourtsRef.current.find(c => c.team1.find(p => p.id === player.id) || c.team2.find(p => p.id === player.id));

            let startX = '50%';
            let startY = '30%'; // Court Y

            if (sourceCourt) {
                const index = prevCourtsRef.current.indexOf(sourceCourt);
                if (index === 0) startX = '30%';
                if (index === 1) startX = '70%';
            }

            // To Bench
            const endX = '50%';
            const endY = '90%';

            anims.push({
                id: player.id,
                player,
                type: 'exit',
                startX,
                startY,
                endX,
                endY
            });
        });

        if (anims.length > 0) {
            setAnimatingPlayers(prev => [...prev, ...anims]);
            setTimeout(() => {
                setAnimatingPlayers(prev => prev.filter(p => !anims.find(a => a.id === p.id)));
            }, 1000); // 1s duration
        }

        setPrevPlayers(players);
        prevCourtsRef.current = courts;
    }, [players, courts]);
    // -----------------------

    return (
        <div className="min-h-screen text-white font-pixel overflow-hidden relative flex flex-col">
            {/* Background Video */}
            <video
                autoPlay
                loop
                muted
                className="absolute top-0 left-0 w-full h-full object-cover z-0 opacity-60"
            >
                <source src={bgVideo} type="video/mp4" />
            </video>

            {/* Overlay to darken bg slightly for contrast */}
            <div className="absolute inset-0 bg-black/40 pointer-events-none z-0" />

            {/* Content Container */}
            <div className="relative z-10 flex-1 flex flex-col">

                {/* Top: Title */}
                <div className="text-center pt-4 pb-2">
                    <h1 className="text-3xl text-yellow-400 drop-shadow-[4px_4px_0_rgba(0,0,0,1)] tracking-widest">
                        BADMINTON MANAGER
                    </h1>
                </div>

                {/* Middle: Courts (Swapped to Top) */}
                <div className="flex-1 flex items-center justify-center py-4">
                    <div className="flex flex-wrap justify-center gap-8 perspective-1000">
                        {courts.map((court, index) => (
                            <div key={court.id} className="relative group w-[800px] h-[500px] bg-black/50 shadow-2xl rounded-lg overflow-hidden border-4 border-black">
                                {/* Phaser Canvas */}
                                <PhaserGame
                                    court={court}
                                    settings={courtSettings}
                                    isFinished={celebratingCourtId === court.id} // Pass game state
                                    winningTeam={celebratingCourtId === court.id ? celebratingTeam : null}
                                    onClick={() => handleCourtClick(court.id)}
                                    onPlayerClick={handleCourtPlayerClick}
                                />

                                {/* Overlay: Scoreboard (Keep React overlay for crisp text) */}
                                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 flex flex-col items-center pointer-events-none z-20">
                                    <div className="bg-black/70 px-4 py-2 rounded-t pixel-border border-white text-white font-pixel text-sm whitespace-nowrap shadow-lg">
                                        <span className="text-gray-300 mr-2">COURT {index + 1}</span>
                                        <span className="text-yellow-400 text-lg">{court.score.team1} - {court.score.team2}</span>
                                    </div>
                                </div>

                                {/* Winner Animation Overlay (Restored) */}
                                {celebratingCourtId === court.id && (
                                    <div className="absolute inset-0 pointer-events-none z-30 flex flex-col items-center justify-center bg-black/60 rounded-lg">
                                        <div className="flex gap-4 mb-2 animate-bounce">
                                            {(celebratingTeam === 1 ? court.team1 : court.team2).map(player => (
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

                                {/* Overlay: Controls (Finish Button) */}
                                {court.team1.length > 0 && (
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            className="pixel-btn bg-yellow-400 text-black border-2 border-black shadow-[4px_4px_0_#000] hover:translate-y-1 hover:shadow-none pointer-events-auto"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleScanCourt(court.id);
                                            }}
                                        >
                                            🏁 FINISH
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Middle-Bottom: Waiting Area (Bench) (Swapped to Bottom) */}
                <div className="flex-none mb-4">
                    <PixelBench
                        players={activePlayers}
                        totalPlayers={players.length}
                        onPlayerClick={handleBenchPlayerClick}
                    />
                </div>

                {/* Dashboard Section */}
                {showDashboard && (
                    <div className="flex-none bg-black/80 p-4 border-t-4 border-white mb-0 animate-slide-up max-h-[50vh] overflow-hidden flex flex-col">
                        <div className="overflow-y-auto custom-scrollbar flex-1">
                            <PixelPlayerList
                                players={players}
                                sortMode={sortMode}
                                setSortMode={setSortMode}
                                onEdit={onEditPlayer}
                                onDelete={onDeletePlayer}
                                onToggleRest={onToggleRest}
                                t={t}
                            />
                        </div>
                    </div>
                )}

                {/* Bottom: Dashboard/Controls */}
                <div className="flex-none mt-auto bg-black/80 border-t-4 border-white p-4 sticky bottom-0 z-50">
                    <div className="max-w-7xl mx-auto flex justify-between items-center">
                        <div className="text-xs text-gray-400 flex items-center gap-4">
                            <div>QUEUE: <span className="text-white text-lg">{activePlayers.length}</span></div>
                            <div>ACTIVE: <span className="text-white text-lg">{courts.filter(c => c.team1.length > 0).length}/{courts.length}</span></div>

                            <button
                                className={`pixel-btn text-[10px] sm:text-xs ${showDashboard ? 'bg-yellow-400 text-black' : 'bg-gray-700 text-white'}`}
                                onClick={() => setShowDashboard(!showDashboard)}
                            >
                                {showDashboard ? '🔽 HIDE DASHBOARD' : '📊 DASHBOARD'}
                            </button>

                            {/* Court Customization Controls */}
                            <div className="flex gap-2 border-l border-gray-600 pl-4">
                                <button className="pixel-btn text-[10px] bg-green-900 border-green-500 text-green-200" onClick={() => cycleSetting('floor', ['wood', 'rubber', 'acrylic'])}>
                                    🏟️ {courtSettings.floor.toUpperCase()}
                                </button>
                                <button className="pixel-btn text-[10px] bg-purple-900 border-purple-500 text-purple-200" onClick={() => cycleSetting('location', ['stadium', 'gym', 'beach', 'space', 'city'])}>
                                    🌍 {courtSettings.location.toUpperCase()}
                                </button>
                                <button className="pixel-btn text-[10px] bg-blue-900 border-blue-500 text-blue-200" onClick={() => cycleSetting('weather', ['clear', 'night', 'rain', 'snow', 'hot'])}>
                                    ☁️ {courtSettings.weather.toUpperCase()}
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                className={`pixel-btn bg-blue-400 text-black hover:scale-105 active:scale-95 transition-transform ${isAssigning ? 'animate-pulse bg-blue-200' : ''}`}
                                onClick={() => handleAssignRandom()}
                                disabled={isAssigning}
                            >
                                {isAssigning ? '🎲 ...' : '🎲 AUTO'}
                            </button>
                            <button
                                className="pixel-btn bg-red-500 text-white hover:scale-105 active:scale-95 transition-transform"
                                onClick={onResetGame}
                            >
                                ⚠️ RESET
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Animation Overlay Layer */}
            {animatingPlayers.map(anim => (
                <div
                    key={`anim-${anim.id}-${anim.type}`}
                    className="fixed z-50 pointer-events-none animate-walking-path"
                    style={{
                        '--start-x': anim.startX,
                        '--start-y': anim.startY,
                        '--end-x': anim.endX,
                        '--end-y': anim.endY,
                        animationDelay: `${anim.delay}ms`
                    }}
                >
                    <div className="transform scale-150 drop-shadow-lg">
                        <PixelPlayer
                            name={anim.player.name}
                            photo={anim.player.photo}
                            state="walking"
                            variant="standing"
                            showName={true}
                        />
                    </div>
                </div>
            ))}

            {/* Animation styles moved to global CSS to avoid React warning */}
        </div>
    );
};

export default PixelLayout;
