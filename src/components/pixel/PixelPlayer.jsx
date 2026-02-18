import React from 'react';
import playerSheet from '../../assets/pixel/pixel_player_sheet_1770886170422.png';

const PixelPlayer = ({
    name,
    photo, // Keep for backward compatibility/reference
    state = 'idle', // idle, walking, playing, sleep, win
    team = 1,
    showName = true,
    variant = 'standing', // 'standing' or 'sitting'
    onClick
}) => {

    // Use generated sprite sheet or fallback
    // For now, simpler approach: Use the photo if available as a "face" bubble.

    const getAnimationClass = () => {
        let classes = '';
        if (variant === 'sitting') {
            classes += 'hover:-translate-y-1 ';
        }

        switch (state) {
            case 'walking': return classes + 'animate-walk';
            case 'playing': return classes + 'animate-bounce';
            case 'sleep': return classes + 'opacity-60 grayscale filter brightness-75'; // Stronger effect
            case 'win': return classes + 'animate-float';
            default: return classes;
        }
    };

    return (
        <div
            onClick={onClick}
            className={`
        relative flex flex-col items-center cursor-pointer transition-transform
        ${variant === 'standing' ? 'hover:scale-110' : ''}
        ${getAnimationClass()}
      `}
        >
            {/* NPC Name Tag (Floating above for sitters) */}
            {showName && variant === 'sitting' && (
                <div className="absolute -top-8 bg-black/80 text-white text-[10px] font-pixel px-2 py-0.5 rounded border border-white/20 whitespace-nowrap z-20 animate-bounce-slight">
                    {name}
                    {/* Tiny Triangle Pointer */}
                    <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-black/80"></div>
                </div>
            )}

            {/* Character Sprite Container */}
            <div className="relative flex flex-col items-center">

                {/* HEAD */}
                <div className={`
                    relative 
                    ${variant === 'sitting' ? 'w-10 h-10 sm:w-12 sm:h-12 z-10' : 'w-12 h-12 sm:w-16 sm:h-16'}
                `}>
                    {state === 'sleep' && <div className="zzz-bubble absolute top-0 right-0 z-20" />}

                    {/* Head Frame */}
                    <div className={`
                        w-full h-full bg-white pixel-border overflow-hidden
                        ${team === 1 ? 'border-blue-500' : 'border-red-500'}
                    `}>
                        {photo ? (
                            <img
                                src={typeof photo === 'string' ? photo : URL.createObjectURL(photo)}
                                alt={name}
                                className="w-full h-full object-cover pixel-art"
                            />
                        ) : (
                            <div className={`
                                w-full h-full flex items-center justify-center text-xs font-pixel
                                ${team === 1 ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}
                            `}>
                                {name.charAt(0)}
                            </div>
                        )}
                    </div>
                </div>

                {/* BODY (Sitting Only) */}
                {variant === 'sitting' && (
                    <div className="flex flex-col items-center -mt-1">
                        {/* Torso */}
                        <div className="w-8 h-6 bg-blue-600 border-x-2 border-b-2 border-black/30 relative">
                            {/* Collar/Detail */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-white/20"></div>
                        </div>
                        {/* Legs (Sitting) */}
                        <div className="flex gap-1 -mt-1">
                            <div className="w-3 h-4 bg-gray-800 border-2 border-black/30 rounded-b-sm"></div>
                            <div className="w-3 h-4 bg-gray-800 border-2 border-black/30 rounded-b-sm"></div>
                        </div>
                    </div>
                )}
            </div>

            {/* Name Tag (Below for Standing) */}
            {showName && variant === 'standing' && (
                <div className="mt-1 px-2 py-0.5 bg-black/70 text-white text-[10px] font-pixel rounded whitespace-nowrap z-10">
                    {name}
                </div>
            )}
        </div>
    );
};

export default PixelPlayer;
