import React from 'react';
import { Trophy } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUrl';
import { getInitials } from '../../utils/helpers';

const CourtVisualization = ({
  team1,
  team2,
  servingPlayer = null,
  onSelectServe = null,
  selectingServe = false,
  className = '',
}) => {
  const renderPlayer = (player, teamIndex, playerIndex) => {
    const isServing = servingPlayer && servingPlayer.team === teamIndex && servingPlayer.index === playerIndex;
    const canSelect = selectingServe;

    if (!player) {
      return (
        <div className="aspect-square flex items-center justify-center bg-white/10 border-2 border-dashed border-white/30 rounded-lg opacity-60">
          <span className="text-white/50 text-4xl">👤</span>
        </div>
      );
    }

    return (
      <div
        className={`
          relative aspect - square flex flex - col items - center justify - center
bg - gradient - to - br from - white to - gray - 100
rounded - lg shadow - player transition - all duration - 200
          ${isServing ? 'from-yellow-400 to-orange-400 animate-pulse-slow shadow-serve' : ''}
          ${canSelect ? 'cursor-pointer hover:scale-105 border-2 border-dashed border-green-500/50 hover:border-green-500' : ''}
`.trim().replace(/\s+/g, ' ')}
        onClick={() => canSelect && onSelectServe && onSelectServe(teamIndex, playerIndex)}
      >
        {isServing && (
          <div className="absolute -top-2 -right-2 text-xl animate-bounce-slow filter drop-shadow">
            🏸
          </div>
        )}

        {canSelect && (
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 bg-white/90 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-green-600 whitespace-nowrap">
            Tap to serve
          </div>
        )}

        {player.photo ? (
          <div className="w-14 h-14 overflow-hidden rounded-full border-4 border-white shadow-md relative z-10 bg-white">
            <img
              src={getImageUrl(player.photo)}
              alt={player.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-white/85 px-1 py-0.5 text-center">
              <span className={`text - xs font - bold ${isServing ? 'text-black' : 'text-gray-900'} `}>
                {player.name}
              </span>
            </div>
          </div>
        ) : (
          <>
            <div className="text-3xl mb-1">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-lg font-bold shadow">
                {getInitials(player.name)}
              </div>
            </div>
            <span className={`text - xs font - bold text - center px - 1 ${isServing ? 'text-black' : 'text-gray-900'} `}>
              {player.name}
            </span>
          </>
        )}
      </div>
    );
  };

  return (
    <div className={`bg - gradient - to - b from - court - green to - court - green - light rounded - xl p - 3 shadow - court ${className} `}>
      {/* Team 1 Side */}
      <div className="bg-white/5 border-2 border-white/30 rounded-lg p-2 mb-1">
        <div className="grid grid-cols-2 gap-2">
          {renderPlayer(team1?.[0], 1, 0)}
          {renderPlayer(team1?.[1], 1, 1)}
        </div>
      </div>

      {/* Net */}
      <div className="relative h-8 flex items-center justify-center my-1">
        <div className="absolute w-full h-0.5 court-net opacity-80" />
        <div className="relative bg-black/30 text-white px-3 py-0.5 rounded-full text-xs font-bold tracking-wider z-10">
          NET
        </div>
      </div>

      {/* Team 2 Side */}
      <div className="bg-white/5 border-2 border-white/30 rounded-lg p-2">
        <div className="grid grid-cols-2 gap-2">
          {renderPlayer(team2?.[0], 2, 0)}
          {renderPlayer(team2?.[1], 2, 1)}
        </div>
      </div>
    </div>
  );
};

export default CourtVisualization;
