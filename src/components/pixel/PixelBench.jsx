import React from 'react';
import pixelBench from '../../assets/pixel/pixel_bench_1770886196720.png';
import PixelPlayer from './PixelPlayer';

const PixelBench = ({ players, totalPlayers = 12, onPlayerClick, onToggleRest }) => {
    // Split players into two rows for stadium seating
    const midPoint = Math.ceil(players.length / 2);
    const backRowPlayers = players.slice(midPoint);
    const frontRowPlayers = players.slice(0, midPoint);

    // Dynamic Width Calculation based on TOTAL initial players (capacity)
    // Layout: 2 rows. Capacity per row = ceil(totalPlayers / 2).
    // Width estimation: ~80px per slot (player + gap) + padding
    const capacityPerRow = Math.ceil(totalPlayers / 2);
    const minBenchWidth = Math.max(360, (capacityPerRow * 80) + 64);

    const BenchRow = ({ users, isBack }) => {
        return (
            <div
                className={`relative flex justify-center items-end gap-6 px-12 transition-all duration-300 ${isBack ? 'scale-90 opacity-90 -mb-8 z-0' : 'z-10'}`}
                style={{ minWidth: `${minBenchWidth}px` }}
            >
                {/* Bench Structure (CSS Draw) */}
                <div className="absolute bottom-2 left-0 right-0 h-4 bg-[#8B4513] border-2 border-black shadow-[4px_4px_0_rgba(0,0,0,0.3)]"></div>
                <div className="absolute bottom-6 left-0 right-0 h-8 bg-[#A0522D] border-2 border-black border-b-0"></div>

                {/* Legs */}
                <div className="absolute bottom-0 left-4 w-2 h-4 bg-black"></div>
                <div className="absolute bottom-0 right-4 w-2 h-4 bg-black"></div>
                <div className="absolute bottom-0 left-1/2 w-2 h-4 bg-black"></div>

                {users.map((player) => (
                    <div key={player.id} className="relative group mb-4 transition-transform hover:-translate-y-2">
                        <PixelPlayer
                            name={player.name}
                            photo={player.photo}
                            state={player.isResting ? 'sleep' : 'idle'}
                            variant="sitting"
                            onClick={() => onPlayerClick(player)}
                        />
                    </div>
                ))}

                {users.length === 0 && (
                    <div className="h-20 w-full flex items-center justify-center text-white/50 font-pixel text-[10px]">
                        {isBack ? '' : 'Empty Bench...'}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="relative w-full max-w-6xl mx-auto mt-8 mb-12 z-10 flex flex-col items-center">
            <h3 className="font-pixel text-white text-center mb-4 drop-shadow-md text-sm bg-black/40 inline-block px-3 py-1 rounded">
                WAITING AREA
            </h3>

            {/* Container allowed to scroll if very wide, but centered if not */}
            <div className="w-full overflow-x-auto custom-scrollbar flex flex-col items-center pt-12 pb-4 px-4">
                {/* Back Row */}
                <BenchRow users={backRowPlayers} isBack={true} />

                {/* Front Row */}
                <BenchRow users={frontRowPlayers} isBack={false} />
            </div>
        </div>
    );
};

export default PixelBench;
