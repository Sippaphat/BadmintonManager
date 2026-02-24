import Phaser from 'phaser';

// Import Assets (We will use placeholders or generated assets here)
// In a real app, these would be separate files. For now, we reuse existing + generate new placeholders
import pixelCourt from '../../../assets/pixel/pixel_court_theme_1_1770886146122.png'; // Fallback
import woodFloor from '../../../assets/pixel/pixel_court_layered_wood_1770893361339.png'; // Generated
import netSprite from '../../../assets/pixel/pixel_net_sprite_1770893381026.png'; // Generated
import { getImageUrl } from '../../../utils/imageUrl';
// import parkBg from '../../../assets/pixel/pixel_bg_park_1770892975461.png'; // Use provided park BG if available or fallback

export default class CourtScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CourtScene' });
        this.players = new Map();

        // Settings State
        this.settings = {
            floor: 'wood',
            location: 'stadium',
            weather: 'clear'
        };
    }

    preload() {
        // Load Layer Assets
        if (!this.textures.exists('court_wood')) {
            this.load.image('court_wood', woodFloor);
        }
        if (!this.textures.exists('net')) {
            this.load.image('net', netSprite);
        }
        if (!this.textures.exists('pixel_crowd')) {
            this.load.image('pixel_crowd', 'src/assets/pixel/pixel_crowd_bg.png');
        }
        if (!this.textures.exists('pixel_referee')) {
            this.load.image('pixel_referee', 'src/assets/pixel/pixel_referee.png');
        }
        // Fallback for location/other floors
        if (!this.textures.exists('court_basic')) {
            this.load.image('court_basic', pixelCourt);
        }
    }

    create(data) {
        this.settings = data.settings || this.settings;
        const { width, height } = this.scale;

        // --- Layer 1: Background (Location) ---
        // Replaced Rectangle with Graphics for procedural scenery
        this.bgGraphics = this.add.graphics();
        this.bgGraphics.setDepth(-1); // Behind everything

        // Create Graphics for Court
        this.courtGraphics = this.add.graphics();
        this.courtGraphics.setDepth(5);

        this.drawCourt();

        // --- Players ---
        this.playerGroup = this.add.group();
        if (data && data.court) {
            this.updatePlayers(data.court);
        }

        // --- Weather ---
        this.weatherParticles = null;
        this.updateWeather(this.settings.weather);

        // Listeners
        this.events.on('update-court', (newCourtData) => {
            this.updatePlayers(newCourtData);
        });

        this.events.on('update-settings', (newSettings) => {
            this.settings = { ...this.settings, ...newSettings };
            this.updateEnvironment();
            this.updateWeather(this.settings.weather);
        });

        // Initial Draw
        this.updateEnvironment();
    }

    drawCourt() {
        const width = this.scale.width;
        const height = this.scale.height;

        this.courtGraphics.clear();

        // 1. Define 4 Corners for Isometric Diagonal View
        // Adjust these to match the "Green One" reference (Diamond shape)
        // BL = Back Left (Logical) -> Screen Left
        // BR = Back Right (Logical) -> Screen Top
        // FL = Front Left (Logical) -> Screen Bottom
        // FR = Front Right (Logical) -> Screen Right

        // ISOMETRIC DIAMOND COORDINATES (Responsive)
        // Adjusted to fill MORE space as requested
        const marginX = width * 0.05; // 5% margin sides (was 10%)
        const topY = height * 0.15;  // 15% from top (was 25%)
        const botY = height * 0.90;   // 90% from top (10% from bottom) (was 80%)

        this.courtScaleFactor = Math.min(width / 480, height / 320); // Base scale ref 480x320

        const p00 = { x: marginX, y: height / 2 };           // Back Left -> Left Screen
        const p10 = { x: width / 2, y: topY };               // Back Right -> Top Screen
        const p01 = { x: width / 2, y: botY };               // Front Left -> Bottom Screen
        const p11 = { x: width - marginX, y: height / 2 };   // Front Right -> Right Screen

        // Bilinear Interpolation Helper
        const getPoint = (u, v) => {
            // u = x ratio (0-1), v = y ratio (0-1)
            // Interpolate X
            const topX = p00.x + (p10.x - p00.x) * u;
            const botX = p01.x + (p11.x - p01.x) * u;
            const x = topX + (botX - topX) * v;

            // Interpolate Y
            const topY = p00.y + (p10.y - p00.y) * u;
            const botY = p01.y + (p11.y - p01.y) * v;
            const y = topY + (botY - topY) * v;

            return { x, y };
        };
        this.getProjectedPoint = getPoint;

        // Draw Field Background
        // Use Green if "stadium" or specific match, simpler colors for 8-bit
        let floorColor = 0xDEB887; // Wood (Default)
        if (this.settings.floor === 'rubber') floorColor = 0x2E8B57; // Seagreen
        if (this.settings.floor === 'acrylic') floorColor = 0x4169E1; // Royal Blue

        this.courtGraphics.fillStyle(floorColor, 1);
        this.courtGraphics.beginPath();
        this.courtGraphics.moveTo(p00.x, p00.y);
        this.courtGraphics.lineTo(p10.x, p10.y);
        this.courtGraphics.lineTo(p11.x, p11.y);
        this.courtGraphics.lineTo(p01.x, p01.y);
        this.courtGraphics.closePath();
        this.courtGraphics.fillPath();

        // Draw Court Lines (White)
        const lineWidth = 2 * (this.courtScaleFactor || 1);
        this.courtGraphics.lineStyle(lineWidth, 0xFFFFFF, 0.9);

        // Outline
        const drawLine = (u1, v1, u2, v2) => {
            const start = getPoint(u1, v1);
            const end = getPoint(u2, v2);
            this.courtGraphics.moveTo(start.x, start.y);
            this.courtGraphics.lineTo(end.x, end.y);
        };

        this.courtGraphics.beginPath();
        drawLine(0, 0, 1, 0); // Back
        drawLine(1, 0, 1, 1); // Right
        drawLine(1, 1, 0, 1); // Front
        drawLine(0, 1, 0, 0); // Left
        this.courtGraphics.strokePath();

        // Internal Lines
        this.courtGraphics.beginPath();
        this.courtGraphics.lineStyle(2, 0xFFFFFF, 0.6);

        // Singles (Sides)
        const sideMargin = 0.1;
        drawLine(sideMargin, 0, sideMargin, 1);
        drawLine(1 - sideMargin, 0, 1 - sideMargin, 1);

        // Service Lines
        drawLine(0, 0.35, 1, 0.35); // Front Service (Team 1?)
        drawLine(0, 0.65, 1, 0.65); // Front Service (Team 2?)

        // Center Line (Vertical relative to court)
        drawLine(0.5, 0, 0.5, 0.35); // Back to Short Service
        drawLine(0.5, 0.65, 0.5, 1); // Short Service to Front

        this.courtGraphics.strokePath();

        // --- NET (Diagonal) ---
        if (this.netContainer) this.netContainer.destroy();
        this.netContainer = this.add.container(0, 0);
        this.netContainer.setDepth(20); // Higher than players usually? Depends on Z

        const netGfx = this.add.graphics();

        // Net Posts at mid-left and mid-right
        const postLeft = getPoint(0, 0.5); // Logical Mid Left
        const postRight = getPoint(1, 0.5); // Logical Mid Right

        const postH = 35;

        // Draw Posts
        netGfx.fillStyle(0x222222, 1);
        netGfx.fillRect(postLeft.x - 2, postLeft.y - postH, 4, postH);
        netGfx.fillRect(postRight.x - 2, postRight.y - postH, 4, postH);

        // Draw Net Mesh
        const steps = 15;
        const dx = (postRight.x - postLeft.x) / steps;
        const dy = (postRight.y - postLeft.y) / steps;

        // Top Tape
        netGfx.lineStyle(3, 0xFFFFFF, 1);
        netGfx.beginPath();
        netGfx.moveTo(postLeft.x, postLeft.y - postH);
        netGfx.lineTo(postRight.x, postRight.y - postH);
        netGfx.strokePath();

        // Bottom Cord
        netGfx.lineStyle(1, 0xFFFFFF, 0.5);
        netGfx.beginPath();
        netGfx.moveTo(postLeft.x, postLeft.y - 10);
        netGfx.lineTo(postRight.x, postRight.y - 10);
        netGfx.strokePath();

        // Vertical Mesh
        netGfx.lineStyle(1, 0xDDDDDD, 0.3);
        netGfx.beginPath();
        for (let i = 0; i <= steps; i++) {
            const cx = postLeft.x + dx * i;
            const cy = postLeft.y + dy * i;
            netGfx.moveTo(cx, cy - postH);
            netGfx.lineTo(cx, cy - 10);
        }
        netGfx.strokePath();

        // Horizontal Mesh (Follow slope)
        const vSteps = 4;
        const vSlice = (postH - 10) / vSteps;
        for (let j = 0; j < vSteps; j++) {
            const offset = 10 + j * vSlice;
            netGfx.moveTo(postLeft.x, postLeft.y - offset);
            netGfx.lineTo(postRight.x, postRight.y - offset);
        }
        netGfx.strokePath();

        this.netContainer.add(netGfx);
        this.netPos = { midLeft: postLeft, midRight: postRight };

        // --- REFEREE (Procedural) ---
        if (this.refContainer) this.refContainer.destroy();

        // Ref sits at one of the posts. Let's say PostLeft (Bottom-Leftish).
        const refPos = postLeft;

        this.refContainer = this.add.container(refPos.x, refPos.y);
        this.refContainer.setDepth(20); // Same as net

        this.drawPixelReferee(this.refContainer);
    }

    drawPixelReferee(container) {
        const gfx = this.add.graphics();

        // Chair Base (offset from post)
        // Position relative to container (which is at post base)
        const offsetX = -20;
        const offsetY = 10;

        // 1. High Chair
        gfx.fillStyle(0x8B4513, 1); // Wood
        // Legs
        gfx.fillRect(offsetX, offsetY, 3, -40); // Front Left
        gfx.fillRect(offsetX + 10, offsetY - 5, 3, -40); // Back Right (iso)

        // Seat
        gfx.fillStyle(0x654321, 1);
        gfx.fillRect(offsetX - 2, offsetY - 40, 16, 4);

        // 2. Human Referee
        // Legs (Sitting)
        gfx.fillStyle(0x222222, 1); // Pants
        gfx.fillRect(offsetX, offsetY - 42, 4, 12); // Leg down
        // Body
        gfx.fillStyle(0xFFD700, 1); // Yellow Shirt
        gfx.fillRect(offsetX, offsetY - 54, 8, 14);
        // Head
        gfx.fillStyle(0xFFA07A, 1); // Skin
        gfx.fillRect(offsetX + 1, offsetY - 60, 6, 6);
        // Hat
        gfx.fillStyle(0x222222, 1);
        gfx.fillRect(offsetX, offsetY - 62, 8, 2);
        container.add(gfx);
    }

    updateEnvironment() {
        const width = this.scale.width;
        const height = this.scale.height;

        this.bgGraphics.clear();

        // Reset Crowd Image visibility (if used)
        if (this.crowdBg) this.crowdBg.setVisible(false);

        // Make background transparent by default for "Free Space" feel
        // We only draw elements, not a full box, unless essentially needed.

        switch (this.settings.location) {
            case 'gym':
                this.drawGym(width, height);
                break;
            case 'beach':
                this.drawBeach(width, height);
                break;
            case 'space':
                this.drawSpace(width, height);
                break;
            case 'city':
                this.drawCity(width, height);
                break;
            case 'stadium':
            default:
                this.drawStadium(width, height);
                break;
        }

        // Space Stars Logic (Particles)
        if (this.settings.location === 'space' && !this.stars) {
            if (!this.textures.exists('star_particle')) {
                const g = this.make.graphics({ x: 0, y: 0, add: false });
                g.fillStyle(0xffffff, 1);
                g.fillRect(0, 0, 2, 2);
                g.generateTexture('star_particle', 2, 2);
            }

            this.stars = this.add.particles(0, 0, 'star_particle', {
                x: { min: 0, max: width },
                y: { min: 0, max: height },
                scale: { min: 0.5, max: 1 },
                alpha: { min: 0.2, max: 0.8 },
                quantity: 40,
                lifespan: -1,
            });
            this.stars.setDepth(-2);
        }
        if (this.stars) this.stars.setVisible(this.settings.location === 'space');

        this.drawCourt();
    }

    drawGym(w, h) {
        // Simple Wall + Floor lines
        this.bgGraphics.fillStyle(0xDDDDDD, 1);
        this.bgGraphics.fillRect(0, 0, w, h * 0.4); // Wall
        this.bgGraphics.fillStyle(0xAAAAAA, 1);
        this.bgGraphics.fillRect(0, h * 0.4, w, 2); // Baseboard

        // Vertical pillars
        this.bgGraphics.fillStyle(0xCCCCCC, 1);
        for (let x = 20; x < w; x += 60) {
            this.bgGraphics.fillRect(x, 0, 10, h * 0.4);
        }
    }

    drawBeach(w, h) {
        // Sky gradient (manual steps)
        this.bgGraphics.fillStyle(0x87CEEB, 1); // Sky
        this.bgGraphics.fillRect(0, 0, w, h * 0.3);

        // Ocean
        this.bgGraphics.fillStyle(0x1E90FF, 1);
        this.bgGraphics.fillRect(0, h * 0.3, w, h * 0.1);

        // Sand
        this.bgGraphics.fillStyle(0xF4A460, 1);
        this.bgGraphics.fillRect(0, h * 0.4, w, h * 0.6); // Fill bottom behind court

        // Sun
        this.bgGraphics.fillStyle(0xFFD700, 1);
        this.bgGraphics.fillCircle(w * 0.8, h * 0.15, 20);
    }

    drawCity(w, h) {
        // Night Sky (Deep Blue)
        this.bgGraphics.fillStyle(0x1a1a2e, 1);
        this.bgGraphics.fillRect(0, 0, w, h); // Fill all to be safe, or just top

        // Skyline
        this.bgGraphics.fillStyle(0x0f0f1a, 1); // Darker silhouettes
        let startX = 0;
        while (startX < w) {
            const bWidth = 20 + Math.random() * 30;
            const bHeight = 40 + Math.random() * 80;
            this.bgGraphics.fillRect(startX, h / 2 - bHeight, bWidth, bHeight);

            // Windows
            this.bgGraphics.fillStyle(0xFFFF00, 0.5);
            if (Math.random() > 0.5) {
                for (let wy = 0; wy < bHeight; wy += 10) {
                    if (Math.random() > 0.3) this.bgGraphics.fillRect(startX + 5, h / 2 - bHeight + wy, 4, 6);
                }
            }
            this.bgGraphics.fillStyle(0x0f0f1a, 1); // Reset 

            startX += bWidth;
        }

        // Ground
        this.bgGraphics.fillStyle(0x111111, 1);
        this.bgGraphics.fillRect(0, h / 2, w, h / 2);
    }

    drawSpace(w, h) {
        // Just transparent! Let the video show through.
        // Maybe slight tint?
        // NO, user wants "Free Space". Transparent is best.
        // But we need a "floor" plane reference maybe?
        // Actually, let's keep it fully transparent to show the "Cool React Video".
    }

    drawStadium(w, h) {
        // Use crowd image if exists, else procedural dots
        if (this.textures.exists('pixel_crowd')) {
            if (!this.crowdBg) {
                this.crowdBg = this.add.image(w / 2, h / 2, 'pixel_crowd');
                this.crowdBg.setDepth(-1);
                const scaleX = w / this.crowdBg.width;
                const scaleY = h / this.crowdBg.height;
                const finalScale = Math.max(scaleX, scaleY);
                this.crowdBg.setScale(finalScale);
                this.crowdBg.setAlpha(1); // Full opacity for stadium feel
            }
            this.crowdBg.setVisible(true);
        } else {
            // Procedural Crowd
            this.bgGraphics.fillStyle(0x222222, 1);
            this.bgGraphics.fillRect(0, 0, w, h / 2); // Stands

            // Crowds (Noise)
            for (let y = 10; y < h / 2; y += 4) {
                for (let x = 0; x < w; x += 4) {
                    if (Math.random() > 0.5) {
                        this.bgGraphics.fillStyle(Math.random() > 0.5 ? 0xFFFFFF : 0xAAAAAA, 0.3);
                        this.bgGraphics.fillRect(x, y, 2, 2);
                    }
                }
            }
        }
    }

    updateWeather(type) {
        // Clear previous particles
        if (this.weatherParticles) {
            this.weatherParticles.destroy();
            this.weatherParticles = null;
        }

        // Clear previous overlays/celestial bodies
        if (this.weatherOverlay) {
            this.weatherOverlay.destroy();
            this.weatherOverlay = null;
        }
        if (this.celestialBody) {
            this.celestialBody.destroy();
            this.celestialBody = null;
        }

        const width = this.scale.width;
        const height = this.scale.height;

        // Geometry - Sun/Moon
        if (type === 'hot' || (this.settings.location === 'beach' && type === 'clear')) {
            // Draw Sun
            this.celestialBody = this.add.graphics();
            this.celestialBody.fillStyle(0xFFD700, 1);
            this.celestialBody.fillCircle(0, 0, 18); // Sun
            // Rays
            this.celestialBody.lineStyle(2, 0xFFAA00, 0.8);
            for (let i = 0; i < 12; i++) {
                const angle = i * (Math.PI / 6);
                this.celestialBody.moveTo(0 + Math.cos(angle) * 22, 0 + Math.sin(angle) * 22);
                this.celestialBody.lineTo(0 + Math.cos(angle) * 30, 0 + Math.sin(angle) * 30);
            }
            this.celestialBody.strokePath();

            // Position: Top Right
            this.celestialBody.x = width * 0.85;
            this.celestialBody.y = height * 0.15;
            // Depth: In front of BG (-1) but behind Court (5)
            this.celestialBody.setDepth(1);
        }
        else if (type === 'night') {
            // Draw Moon
            this.celestialBody = this.add.graphics();
            this.celestialBody.fillStyle(0xFFFFFF, 1);
            this.celestialBody.fillCircle(0, 0, 14); // Moon base
            this.celestialBody.fillStyle(0x1a1a2e, 1); // Dark circle to create crescent
            this.celestialBody.fillCircle(-6, -3, 12);

            this.celestialBody.x = width * 0.15; // Top Left for Moon maybe? Or keep Right.
            this.celestialBody.y = height * 0.15;
            this.celestialBody.setDepth(1);
        }

        // Particles & Overlays
        if (type === 'rain') {
            this.weatherParticles = this.add.particles(0, 0, 'rain_drop', {
                x: { min: -20, max: width + 20 },
                y: -50,
                lifetime: 1200,
                speedY: { min: 300, max: 500 },
                speedX: { min: -10, max: 10 },
                scale: 0.8,
                quantity: 4,
                alpha: 0.7
            });
            // Auto-gen texture
            if (!this.textures.exists('rain_drop')) {
                const g = this.make.graphics({ x: 0, y: 0, add: false });
                g.fillStyle(0x99ccff, 1);
                g.fillRect(0, 0, 2, 6);
                g.generateTexture('rain_drop', 2, 6);
            }

            // Darken scene slightly
            this.weatherOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.3);
            this.weatherOverlay.setDepth(100);
        }
        else if (type === 'snow') {
            if (!this.textures.exists('snow_flake')) {
                const g = this.make.graphics({ x: 0, y: 0, add: false });
                g.fillStyle(0xffffff, 1);
                g.fillCircle(2, 2, 2);
                g.generateTexture('snow_flake', 4, 4);
            }
            this.weatherParticles = this.add.particles(0, 0, 'snow_flake', {
                x: { min: -20, max: width + 20 },
                y: -50,
                lifetime: 5000,
                speedY: { min: 30, max: 70 },
                speedX: { min: -20, max: 20 },
                rotate: { min: 0, max: 360 },
                scale: { start: 0.6, end: 0.2 },
                quantity: 1,
            });
        }
        else if (type === 'night') {
            // Night Overlay - Dark Blue tint
            this.weatherOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000033, 0.4);
            this.weatherOverlay.setDepth(100); // On top of everything to tint it
            // Ensure blend mode is normal (multiply/subtract might be better but normal with alpha is safest)
        }
        else if (type === 'hot') {
            // Hot Overlay - Orange/Red glow
            // Use lighter alpha
            this.weatherOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0xffaa00, 0.15);
            this.weatherOverlay.setDepth(100);
            this.weatherOverlay.setBlendMode(Phaser.BlendModes.ADD);
        }

        if (this.weatherParticles) {
            this.weatherParticles.setDepth(101); // Top layer (above overlay)
        }
    }

    updatePlayers(courtData) {
        const { team1, team2 } = courtData;

        const currentIds = new Set();

        const syncPlayer = (player, teamId, index) => {
            currentIds.add(player.id);

            let xRatio, yRatio;

            // Adjust spread for doubles
            // U goes p00->p10 (LeftScreen->TopScreen).
            const uPos = index === 0 ? 0.5 : (index % 2 === 0 ? 0.7 : 0.3);

            xRatio = uPos;

            if (teamId === 1) {
                // Team 1: "Front" / Bottom-Right side
                yRatio = 0.75;
            } else {
                // Team 2: "Back" / Top-Left side
                yRatio = 0.25;
            }

            // Use Projection
            let x = 0, y = 0;
            if (this.getProjectedPoint) {
                const pos = this.getProjectedPoint(xRatio, yRatio);
                x = pos.x;
                y = pos.y - 15; // Feet offset
            }

            // --- Dynamic Texture Loading ---
            const textureKey = `player-${player.id}`;
            if (!this.textures.exists(textureKey) && player.photo) {
                const src = getImageUrl(player.photo);

                // Load image
                this.load.image(textureKey, src);

                // Add listener with unique key for this texture
                this.load.once(`filecomplete-image-${textureKey}`, () => {
                    // Refresh if player still exists
                    if (this.players.has(player.id)) {
                        const container = this.players.get(player.id);
                        if (container) {
                            const sprite = container.getByName('avatar');
                            if (sprite) {
                                sprite.setTexture(textureKey);
                                sprite.setVisible(true);
                                this.fitSpriteToFrame(sprite, 32);
                            }
                        }
                    }
                });

                this.load.start();
            }
            // -------------------------------

            let container = this.players.get(player.id);

            if (!container) {
                container = this.add.container(x, y);
                container.setScale(this.courtScaleFactor || 1); // SCALE PLAYERS

                // 1. Shadow
                const shadow = this.add.ellipse(0, 10, 20, 10, 0x000000, 0.3);
                container.add(shadow);

                // 2. Avatar Frame (Pixel Box)
                const frameSize = 32;
                const frame = this.add.graphics();
                frame.fillStyle(0xFFFFFF, 1);
                frame.fillRect(-frameSize / 2 - 2, -frameSize - 2, frameSize + 4, frameSize + 4); // White Border

                // Team Color Border
                frame.fillStyle(teamId === 1 ? 0x3b82f6 : 0xef4444, 1); // Blue/Red
                frame.fillRect(-frameSize / 2 - 1, -frameSize - 1, frameSize + 2, frameSize + 2);
                container.add(frame);

                // 3. Avatar Sprite
                let sprite;
                if (this.textures.exists(textureKey)) {
                    sprite = this.add.image(0, -frameSize / 2 - 2, textureKey);
                    this.fitSpriteToFrame(sprite, frameSize);
                } else {
                    // Placeholder until loaded
                    sprite = this.add.image(0, -frameSize / 2 - 2, 'court_basic'); // Just use default or blank
                    sprite.setVisible(false); // Hide if generic
                }
                sprite.setName('avatar');
                container.add(sprite);

                // Create a mask for the avatar to ensure it stays within frame
                // Note: Masks in Containers are offset relative to the Scene, NOT the Container.
                // This is tricky for moving players.
                // ALTERNATIVE: Use Crop (much cheaper and easier).

                // ...

                // 4. Initial fallback text if no photo
                if (!player.photo) {
                    const initial = this.add.text(0, -frameSize / 2 - 2, player.name.charAt(0), {
                        fontFamily: '"Press Start 2P"', fontSize: '16px', color: '#000000'
                    }).setOrigin(0.5);
                    container.add(initial);
                }

                // 5. Name Tag (Floating above)
                const nameTag = this.add.text(0, -frameSize - 15, player.name, {
                    fontFamily: '"Press Start 2P"',
                    fontSize: '10px',
                    color: '#ffffff',
                    backgroundColor: '#000000aa',
                    padding: { x: 4, y: 2 }
                }).setOrigin(0.5);
                container.add(nameTag);

                // 6. Body (Small pixel body below head)
                const body = this.add.graphics();
                // Shirt
                body.fillStyle(teamId === 1 ? 0x2563eb : 0xdc2626, 1);
                body.fillRect(-6, -12, 12, 14); // Moved up to connect with head
                // Legs
                body.fillStyle(0x1f2937, 1); // Pants
                body.fillRect(-6, 2, 4, 10);
                body.fillRect(2, 2, 4, 10);
                container.addAt(body, 1); // Behind frame slightly? Or frame is head?
                // Actually, frame is head. Body should be below frame.
                // Move frame UP.
                // Adjust: Body at (0,0). Head Frame at (0, -20).

                // RE-ADJUST POSITIONS
                shadow.y = 20;
                body.y = 0; // Center

                // Update Frame/Sprite pos relative to body
                frame.y = -22;
                sprite.y = -22 - frameSize / 2 - 2 + (frameSize / 2 + 2); // ??? relative
                // Simpler: 
                // Body ends at y=20 (legs). Head starts at y=0 going up.
                // Let's just group them.

                this.players.set(player.id, container);
            } else {
                // Move
                this.tweens.add({
                    targets: container,
                    x: x,
                    y: y,
                    duration: 400
                });

                // Update texture if just loaded
                const sprite = container.getByName('avatar');
                if (sprite && this.textures.exists(textureKey) && sprite.texture.key !== textureKey) {
                    sprite.setTexture(textureKey);
                    sprite.setVisible(true);
                    this.fitSpriteToFrame(sprite, 32);
                }
            }
            // Z-index based on Y position for simple depth sorting
            container.setDepth(y);
        };

        team1.forEach((p, i) => syncPlayer(p, 1, i));
        team2.forEach((p, i) => syncPlayer(p, 2, i));

        // Cleanup
        for (const [id, container] of this.players.entries()) {
            if (!currentIds.has(id)) {
                container.destroy();
                this.players.delete(id);
            }
        }

        // Trigger Rally if we have players on both sides and not active
        // Only if match is potentially active (team1 > 0 && team2 > 0)
        // AND match is NOT finished (celebrating)
        if (team1.length > 0 && team2.length > 0 && !courtData.isFinished) {

            // Stop Victory if it was active
            if (this.victoryActive) {
                this.stopVictoryAnimation();
            }

            // If rally stopped or we just loaded, start/restart?
            // Prevent multiple queued starts
            if (!this.rallyActive && !this.rallyStartPending) {
                this.rallyStartPending = true;
                this.rallyStartTimer = this.time.addEvent({
                    delay: 1000,
                    callback: () => {
                        this.rallyStartPending = false;
                        this.startRally();
                    }
                });
            }
        } else {
            this.stopRally();

            // Check for Victory
            if (courtData.isFinished && courtData.winningTeam) {
                this.playVictoryAnimation(courtData.winningTeam, team1, team2);
            } else {
                // Just idle or reset?
                if (this.victoryActive) this.stopVictoryAnimation();
            }
        }
    }

    // Stop rally helper
    stopRally() {
        this.rallyActive = false;
        this.rallyStartPending = false;
        if (this.rallyStartTimer) this.rallyStartTimer.remove();
        if (this.rallyTimer) this.rallyTimer.remove();
        if (this.shuttleTween) this.shuttleTween.stop();
        if (this.shuttleContainer) this.shuttleContainer.setVisible(false);
    }

    // --- Victory Logic ---
    playVictoryAnimation(winningTeamId, team1, team2) {
        if (this.victoryActive) return; // Already playing
        this.victoryActive = true;

        // Winners
        const winners = winningTeamId === 1 ? team1 : team2;
        winners.forEach(p => {
            const container = this.players.get(p.id);
            if (container) {
                // Jump Animation
                this.tweens.add({
                    targets: container,
                    y: container.y - 20,
                    duration: 300,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });

                // Emote (Optional simple shape)
                const emote = this.add.text(0, -60, 'Of', {
                    fontFamily: '"Press Start 2P"', fontSize: '10px', color: '#FFFF00'
                }).setOrigin(0.5);
                // "Of"?? No, generic heart or smile? 
                // Let's use specific text or just the jump is enough for now.
                // Or maybe a star?
                // Let's stick to Jump for now to be safe.
                // container.add(emote); 
            }
        });

        // Losers
        const losers = winningTeamId === 1 ? team2 : team1;
        losers.forEach(p => {
            const container = this.players.get(p.id);
            if (container) {
                // Sad / Squash
                this.tweens.add({
                    targets: container,
                    scaleY: 0.9,
                    y: container.y + 2,
                    duration: 1000,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
        });
    }

    stopVictoryAnimation() {
        this.victoryActive = false;
        // Kill all tweens on players?
        // We can iterate and stop tweens.
        this.players.forEach(container => {
            this.tweens.killTweensOf(container);
            container.scaleY = 1; // Reset scale
            // Reset Y? We need to know original Y.
            // updatePlayers will reset Y next frame anyway via syncPlayer -> layout.
        });
    }

    // Helper to scale image to cover 'size' x 'size' without stretching
    fitSpriteToFrame(sprite, size) {
        if (!sprite || !sprite.texture) return;

        const width = sprite.texture.source[0].width;
        const height = sprite.texture.source[0].height;

        // Scale to COVER
        const scale = Math.max(size / width, size / height);
        sprite.setScale(scale);

        // Center Crop
        const cropW = size / scale;
        const cropH = size / scale;
        const cropX = (width - cropW) / 2;
        const cropY = (height - cropH) / 2;

        sprite.setCrop(cropX, cropY, cropW, cropH);
    }

    // --- Shuttlecock Logic ---

    createShuttle() {
        if (this.shuttleContainer) this.shuttleContainer.destroy();

        this.shuttleContainer = this.add.container(-100, -100);
        this.shuttleContainer.setDepth(100); // High depth
        this.shuttleContainer.setScale(this.courtScaleFactor || 1); // SCALE SHUTTLE

        // Shadow for depth perception
        const shadow = this.add.ellipse(0, 20, 10, 5, 0x000000, 0.3);
        this.shuttleContainer.add(shadow);
        this.shuttleShadow = shadow;

        // Shuttle Object
        const shuttle = this.add.graphics();
        // Cork
        shuttle.fillStyle(0xFFFFFF, 1);
        shuttle.fillCircle(0, 0, 4);
        // Feathers (Cone)
        shuttle.fillStyle(0xEEEEEE, 1);
        shuttle.beginPath();
        shuttle.moveTo(-4, 0);
        shuttle.lineTo(4, 0);
        shuttle.lineTo(6, -8);
        shuttle.lineTo(-6, -8);
        shuttle.closePath();
        shuttle.fillPath();

        this.shuttleContainer.add(shuttle);
        this.shuttleGraphic = shuttle;
    }

    startRally() {
        // Stop existing rally just in case
        this.stopRally();

        this.createShuttle();
        this.rallyActive = true;
        this.rallyStartPending = false;

        // Pick random team to serve
        const servingTeam = Math.random() > 0.5 ? 1 : 2;

        // Find a server
        const servers = Array.from(this.players.values()).filter(c => {
            // We need to know which team this container belongs to.
            // We can store data in container or check x/y?
            // Easier: We stored them in updatePlayers but didn't save team data in container explicitly.
            // Let's re-find based on position.
            // Team 1 y ~ 0.75 * height (Higher Y)
            // Team 2 y ~ 0.25 * height (Lower Y)
            return (servingTeam === 1 && c.y > this.scale.height * 0.5) ||
                (servingTeam === 2 && c.y < this.scale.height * 0.5);
        });

        if (servers.length === 0) {
            this.stopRally();
            return;
        }
        const server = servers[Math.floor(Math.random() * servers.length)];

        // Teleport shuttle to server
        this.shuttleContainer.x = server.x;
        this.shuttleContainer.y = server.y - 40; // Above head
        this.shuttleContainer.setVisible(true);

        // Serve!
        this.hitShuttle(servingTeam === 1 ? 2 : 1);
    }

    hitShuttle(targetTeam) {
        if (!this.rallyActive) return;

        // Find targets
        const targets = Array.from(this.players.values()).filter(c => {
            return (targetTeam === 1 && c.y > this.scale.height * 0.5) ||
                (targetTeam === 2 && c.y < this.scale.height * 0.5);
        });

        if (targets.length === 0) {
            this.stopRally();
            return;
        }

        const target = targets[Math.floor(Math.random() * targets.length)];

        // Animation Param
        const startX = this.shuttleContainer.x;
        const startY = this.shuttleContainer.y;
        const endX = target.x;
        const endY = target.y - 40; // Aim for head

        // Distance determines duration
        const dist = Phaser.Math.Distance.Between(startX, startY, endX, endY);
        const duration = Phaser.Math.Clamp(dist * 1.5, 600, 1200);

        // Audio/Visual Feedback at START of hit (The previous receiver is hitting it back)
        // We can animate the "previous" player here if we knew who it was.
        // Instead, we'll animate the TARGET when it arrives?
        // Or animate the current shuttle position's player?
        // Let's assume the shuttle is currently AT the player who is hitting it.

        // Find player closest to shuttle
        const hitter = Array.from(this.players.values()).find(c =>
            Phaser.Math.Distance.Between(c.x, c.y - 40, startX, startY) < 20
        );
        if (hitter) {
            // Jump / Swing Animation
            this.tweens.add({
                targets: hitter,
                y: hitter.y - 10,
                duration: 100,
                yoyo: true,
                ease: 'Quad.easeOut'
            });
        }

        // Arc Movement
        // We simulate height by tweening 'y' with a custom function OR moving shadow linearly and shuttle with offset.
        // Let's move CONTAINER linearly, and move GRAPHIC inside container up/down.

        this.shuttleTween = this.tweens.add({
            targets: this.shuttleContainer,
            x: endX,
            y: endY,
            duration: duration,
            ease: 'Linear', // Movement across court is linear speed
            onComplete: () => {
                if (!this.rallyActive) return;
                // Recursive
                this.rallyTimer = this.time.addEvent({
                    delay: 100 + Math.random() * 200, // Short pause before hit
                    callback: () => {
                        this.hitShuttle(targetTeam === 1 ? 2 : 1);
                    }
                });
            }
        });

        // Parabolic Height Arc (Visual Only)
        // Move the internal graphic up and down
        this.tweens.add({
            targets: this.shuttleGraphic,
            y: -50, // Peak height relative to container
            duration: duration / 2,
            yoyo: true,
            ease: 'Quad.easeOut'
        });

        // Shadow Scale (Small when high)
        this.tweens.add({
            targets: this.shuttleShadow,
            scaleX: 0.5,
            scaleY: 0.5,
            alpha: 0.1,
            duration: duration / 2,
            yoyo: true,
            ease: 'Quad.easeOut'
        });

        // Rotate Shuttle to face direction?
        // Simplification: Flip if moving up/down court
        // If moving to Team 2 (Up), rotation -90?
        // If moving to Team 1 (Down), rotation 90?
        // Actually, just follow Arc tangent is best but hard.
        // Simple Flip:
        const angle = Math.atan2(endY - startY, endX - startX);
        this.shuttleGraphic.rotation = angle + Math.PI / 2;
    }
}

