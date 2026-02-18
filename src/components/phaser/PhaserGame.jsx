import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import CourtScene from './scenes/CourtScene';

const PhaserGame = ({
    court, // Singular
    players,
    settings,
    isFinished, // New Prop
    winningTeam, // New Prop
    onPlayerClick,
    onCourtClick
}) => {
    const gameRef = useRef(null);
    const containerRef = useRef(null);

    // Initialize Game
    useEffect(() => {
        if (!containerRef.current) return;

        // Initialize Phaser Game
        const config = {
            type: Phaser.AUTO,
            parent: containerRef.current,
            width: '100%',
            height: '100%',
            transparent: true,
            scene: [CourtScene],
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 0 },
                    debug: false
                }
            },
            scale: {
                mode: Phaser.Scale.RESIZE,
                autoCenter: Phaser.Scale.CENTER_BOTH
            }
        };

        const game = new Phaser.Game(config);
        gameRef.current = game;

        // Pass initial data to scene after boot
        game.events.once('ready', () => {
            const scene = game.scene.getScene('CourtScene');
            if (scene) {
                // Initialize scene state
                if (court) scene.settings = { ...scene.settings, ...settings };
                // Send court data + isFinished flag + winningTeam
                if (court) scene.events.emit('update-court', { ...court, isFinished, winningTeam });
                scene.events.emit('update-settings', settings);
            }
        });

        // Listen for internal events affecting React
        const handlePlayerClick = (id) => {
            const player = players ? players.find(p => p.id === id) : null;
            if (player && onPlayerClick) onPlayerClick(player);
        };

        const handleCourtClick = (id) => {
            if (onCourtClick) onCourtClick(id);
        };

        game.events.on('player-click', handlePlayerClick);
        game.events.on('court-click', handleCourtClick); // MainScene emits this

        // Cleanup
        return () => {
            game.destroy(true);
        };
    }, []); // Only run once on mount

    // Handle updates (React -> Phaser prop sync)
    useEffect(() => {
        const game = gameRef.current;
        if (!game) return;

        const scene = game.scene.getScene('CourtScene');
        if (scene) {
            if (court) scene.events.emit('update-court', { ...court, isFinished, winningTeam });
            scene.events.emit('update-settings', settings);
        }
    }, [court, players, settings, isFinished, winningTeam]);

    return (
        <div
            ref={containerRef}
            id="phaser-container"
            className="absolute inset-0 w-full h-full pointer-events-auto"
        />
    );
};

export default PhaserGame;
