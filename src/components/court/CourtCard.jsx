import React from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import CourtVisualization from './CourtVisualization';
import ScoreBoard from './ScoreBoard';

const CourtCard = ({ 
  court, 
  courtNumber,
  onManage,
  onRandom,
  onFinish,
  onSwitchServe,
  onIncrementScore,
  onDecrementScore,
  t,
  className = '',
}) => {
  const isOccupied = court.team1 && court.team1.length > 0;
  
  return (
    <Card className={`${className}`} padding={false}>
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-primary">
          {t('court')} {courtNumber}
        </h3>
        <Badge variant={isOccupied ? 'warning' : 'success'}>
          {isOccupied ? t('playing') : t('free')}
        </Badge>
      </div>
      
      <div className="p-4">
        {isOccupied ? (
          <div className="space-y-4">
            {/* Scoreboard */}
            <ScoreBoard
              team1Score={court.score?.team1 || 0}
              team2Score={court.score?.team2 || 0}
              onIncrement={(team) => onIncrementScore(court.id, team)}
              onDecrement={(team) => onDecrementScore(court.id, team)}
              team1Label={t('team1')}
              team2Label={t('team2')}
            />
            
            {/* Court Visualization */}
            <CourtVisualization
              team1={court.team1}
              team2={court.team2}
              servingPlayer={court.servingPlayer}
            />
            
            {/* Actions */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="warning"
                size="sm"
                onClick={() => onSwitchServe(court.id)}
              >
                🔄 {t('switchServe')}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onManage(court.id)}
              >
                ⚙️ {t('manage')}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onFinish(court.id)}
                fullWidth
                className="col-span-2"
              >
                🏁 {t('finishGame')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Empty Court */}
            <div className="flex flex-col items-center justify-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg">
              <div className="text-6xl mb-4 opacity-30">🏸</div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                {t('emptyCourt')}
              </p>
            </div>
            
            {/* Actions */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => onRandom(court.id)}
              >
                🎲 {t('random')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onManage(court.id)}
              >
                ⚙️ {t('manual')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default CourtCard;
