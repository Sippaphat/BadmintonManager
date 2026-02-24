import React from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { calculateWinRate } from '../../utils/eloSystem';
import PlayerStatsModal from './PlayerStatsModal';

const PlayerList = ({
  players,
  onEdit,
  onDelete,
  onToggleRest,
  sortMode = 'queue',
  showStats = true,
  t,
  className = '',
  groupId,
}) => {
  const [selectedStatsPlayer, setSelectedStatsPlayer] = React.useState(null);

  const sortedPlayers = [...players].sort((a, b) => {
    if (sortMode === 'queue') {
      // Sort by play count (ascending) - least played first
      const playDiff = (a.playCount || 0) - (b.playCount || 0);
      if (playDiff !== 0) return playDiff;
      return (a.lastFinishTime || 0) - (b.lastFinishTime || 0);
    } else {
      // Sort by win count (descending) - most wins first
      const winDiff = (b.winCount || 0) - (a.winCount || 0);
      if (winDiff !== 0) return winDiff;
      // Secondary sort by win rate
      return calculateWinRate(b) - calculateWinRate(a);
    }
  });

  return (
    <Card title={sortMode === 'queue' ? t('queue') : t('leaderboard')} className={className}>
      <div className="space-y-2">
        {sortedPlayers.map((player, index) => (
          <div
            key={player.id}
            className={`
              flex items-center justify-between p-3 rounded-lg
              border border-gray-200 dark:border-gray-700
              transition-all duration-200 hover:shadow-md
              ${player.isPlaying ? 'bg-primary/5 border-primary/30' : 'bg-gray-50 dark:bg-gray-800'}
            `.trim().replace(/\s+/g, ' ')}
          >
            <div className="flex items-center gap-3 flex-1">
              {/* Rank/Position */}
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                ${index === 0 && sortMode === 'leaderboard' ? 'bg-yellow-400 text-gray-900' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}
              `.trim().replace(/\s+/g, ' ')}>
                {index === 0 && sortMode === 'leaderboard' ? '👑' : index + 1}
              </div>

              {/* Player Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                    {player.name}
                  </h4>
                  {player.isPlaying && (
                    <Badge variant="warning" size="sm">⚡ Playing</Badge>
                  )}
                  {!player.isResting && (player.consecutiveGames || 0) >= 3 && (
                    <Badge variant="danger" size="sm">😰 Need Rest</Badge>
                  )}
                  {player.isResting && (
                    <Badge variant="warning" size="sm">☕ Resting</Badge>
                  )}
                  {!player.isPlaying && (player.consecutiveGames || 0) === 0 && player.gamesPlayed > 0 && (
                    <Badge variant="success" size="sm">✨ Rested</Badge>
                  )}
                </div>

                {showStats && (
                  <div className="flex gap-3 text-xs text-gray-600 dark:text-gray-400 mt-1">
                    <span>
                      {t('gamesPlayed')}: <strong>{player.gamesPlayed || 0}</strong>
                    </span>
                    <span>
                      Wins: <strong className="text-primary">{player.winCount || 0}</strong>
                    </span>
                    <span>
                      {t('winRate')}: <strong>{calculateWinRate(player)}%</strong>
                    </span>
                    <span>
                      ELO: <strong>{Math.round(player.elo || 1500)}</strong>
                    </span>
                    {(player.consecutiveGames || 0) > 0 && (
                      <span className="text-orange-600 dark:text-orange-400">
                        🔥 Streak: <strong>{player.consecutiveGames}</strong>
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 ml-2">
              <button
                onClick={() => onToggleRest(player)}
                className={`
                  px-2 py-1 rounded text-sm font-semibold transition-colors
                  ${player.isResting
                    ? 'text-white bg-red-500 hover:bg-red-600'
                    : 'text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20'}
                `}
                title={player.isResting ? t('stopRest') : t('startRest')}
              >
                {player.isResting ? '🏃 Play' : '☕ Rest'}
              </button>
              <button
                onClick={() => onEdit(player)}
                className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 py-1 rounded text-sm font-semibold transition-colors"
                title={t('edit')}
              >
                ✏️
              </button>
              <button
                onClick={() => setSelectedStatsPlayer(player)}
                className="text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 px-2 py-1 rounded text-sm font-semibold transition-colors"
                title="View Advanced Stats"
              >
                📊
              </button>
              <button
                onClick={() => onDelete(player.id)}
                className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded text-sm font-semibold transition-colors"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}

        {players.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {t('notEnoughPlayers')}
          </div>
        )}
      </div>
      <PlayerStatsModal
        isOpen={!!selectedStatsPlayer}
        onClose={() => setSelectedStatsPlayer(null)}
        player={selectedStatsPlayer}
        groupId={groupId}
      />
    </Card>
  );
};

export default PlayerList;
