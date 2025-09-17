# Space Shooter 2

A multi-stage 2D space shooter game built with Phaser.js. Features single/multiplayer modes, progressive difficulty, power-ups, boss battles, mobile support, and **full gamepad controller support**.

## Local Development

Simply open `index.html` in your web browser to play locally.

## Features

- **Multi-stage progression**: 5 stages with unique enemies and bosses
- **Dual player support**: Single player or cooperative 2-player mode
- **Power-up system**: Temporary boosts (spread shot, rapid fire, speed, etc.)
- **Upgrade shop**: Spend coins on permanent improvements
- **Boss battles**: Unique boss fights with escalating difficulty
- **Mobile friendly**: Touch controls for mobile devices
- **Progressive difficulty**: Enemies and bosses get stronger each stage
- **🎮 Full gamepad support**: Xbox/PlayStation controllers with haptic feedback

## Controls

### Keyboard
- **1 Player**: Arrow Keys to Move, SPACE to Shoot, H for Nuke
- **2 Players**: P1: WASD + Space + H | P2: Arrows + Forward Slash + Delete

### Gamepad Controllers 🎮
- **Movement**: Left Stick or D-Pad (8-directional)
- **Shoot**: A Button (continuous fire) or Right Trigger
- **Nuke**: B Button
- **Menu Navigation**: D-Pad/Stick + A to select, B to back
- **Restart**: A Button or Start from Game Over screen
- **Haptic Feedback**: Vibration on hits, power-ups, and damage

### Mobile
- **Touch and drag** to move, automatic shooting

## GitHub Pages Deployment

1. Create a new repository on GitHub
2. Upload all files (`index.html`, `main.js`, `README.md`)
3. Go to repository Settings → Pages
4. Select "Deploy from a branch" → "main branch"
5. Your game will be available at: `https://[username].github.io/[repository-name]/`

## File Structure

```
space-shooter-2/
├── index.html          # Main HTML file
├── main.js            # Game logic and Phaser scene
└── README.md          # This file
```

## Technical Details

- Built with Phaser.js 3.70.0
- Uses external CDN for game assets (rosebud.ai)
- Responsive scaling with mobile touch support
- Single scene architecture with comprehensive game state management
- **Web Gamepad API integration** with multi-controller support

## Recent Updates

### 🎮 Gamepad Controller Support Added
- **Full Web Gamepad API integration** with support for Xbox/PlayStation controllers
- **Unified input system** seamlessly combines keyboard, gamepad, and mobile controls
- **Complete menu navigation** with visual selection indicators in all screens
- **Haptic feedback system** provides vibration for hits, power-ups, and damage
- **Multi-controller support** for 2-player mode (Controller 0 = P1, Controller 1 = P2)
- **Real-time controller status** shows connection state in menus
- **Browser compatibility** tested with Chrome, Firefox, and Edge