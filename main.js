class SpaceTetrisShooter extends Phaser.Scene {
    constructor() {
        super();
        this.playerMode = null; // 1 or 2 players
        this.powerUpActive = false;
        this.isDevelopmentMode = true; // Set to true for testing, false for production
        this.powerUpType = null; // 'spread', 'big', 'rapid', 'shield', 'double', 'speed', or 'life'
        this.powerUpTimer = null;
        this.shootingDelay = 500; // Default shooting delay in milliseconds
        this.lastShootTime = 0; // Track last shoot time for player 1
        this.lastShootTime2 = 0; // Track last shoot time for player 2
        this.isShielded = false; // Track shield status
        this.doubleDamage = false; // Track double damage status
        this.baseSpeed = 300; // Base movement speed
        this.currentSpeed = 300; // Current movement speed
        this.player1Lives = 5; // Player 1 lives
        this.player2Lives = 5; // Player 2 lives
        this.score = 0;
        this.coins = 0; // Add coins property
        this.gameOver = false;
        this.bombCount = 2; // Start with 2 nukes
        this.scoreReachedFlag = false; // Flag to track if 500 score bonus was awarded
        this.currentStage = 1; // Track current stage
        this.bossSpawned = false;
        this.bossHealth = 1000;
        this.enemyShootDelay = 2000; // Time between enemy shots in milliseconds
        this.isPaused = false; // Flag to check if game is paused (e.g., during reward selection)
        this.normalEnemyKills = 0; // Counter for normal enemy kills
        this.purchasesMadeThisStage = 0; // Track purchases made after defeating a boss
    }
    progressBarBg = null;
    progressBarFill = null;

    preload() {
        // Load all generated assets
        this.load.image('background', 'https://play.rosebud.ai/assets/background.png?8eJH');
        this.load.image('playerShip', 'https://play.rosebud.ai/assets/playerShip.png?yi6t');
        this.load.image('player2Ship', 'https://play.rosebud.ai/assets/playerShip.png?yi6t');
        this.load.image('tetrisProjectile', 'https://play.rosebud.ai/assets/tetrisProjectile.png?3XWN');
        this.load.image('enemyShip', 'https://play.rosebud.ai/assets/enemyShip.png?iB2v');
        this.load.image('enemyAsteroid', 'https://play.rosebud.ai/assets/enemyAsteroid.png?lqW6');
        this.load.image('explosion', 'https://play.rosebud.ai/assets/explosion.png?AVbh');
        this.load.image('uiFrame', 'https://play.rosebud.ai/assets/uiFrame.png?WT7T');
        this.load.image('enemyShip2', 'https://play.rosebud.ai/assets/2d pixelart enemy spaceship.png?MLqT');
        this.load.image('bossStageTwoShip', 'https://play.rosebud.ai/assets/Huge allien space ship boss pixelart.png?4dBW');
        this.load.image('enemyShip3', 'https://play.rosebud.ai/assets/2d enemy spaceship.png?JoIi');
        this.load.image('bossStageThreeShip', 'https://play.rosebud.ai/assets/generate pixel art boss looking like beedrill pokemon.png?iOEb');
        this.load.image('enemyShip4', 'https://play.rosebud.ai/assets/warrior1.png?774i');
        this.load.image('bossStageFourShip', 'https://play.rosebud.ai/assets/blueships1.png?kV4B');
        this.load.image('enemyShip5', 'https://play.rosebud.ai/assets/nightraiderfixed-removebg-preview.png?R9kn');
        this.load.image('bossStageFiveShip', 'https://play.rosebud.ai/assets/blueships1normal.png?6vNg');
    }

    create() {
        // Show player selection screen
        this.showPlayerSelection();
    }
    showPlayerSelection() {
        // Create background
        this.background = this.add.tileSprite(0, 0, 800, 600, 'background');
        this.background.setOrigin(0, 0);
        const bgScale = Math.max(800 / this.background.width, 600 / this.background.height);
        this.background.setScale(bgScale);
        // Add title
        this.add.text(400, 200, 'SPACE SHOOTER', {
            fontSize: '64px',
            fill: '#fff',
            backgroundColor: '#000',
            padding: {
                x: 20,
                y: 10
            }
        }).setOrigin(0.5);
        // Add instructions
        this.add.text(400, 520, '1P: Arrow Keys to Move, SPACE to Shoot, H for Nuke', {
            fontSize: '20px',
            fill: '#fff',
            backgroundColor: '#000',
            padding: {
                x: 10,
                y: 5
            }
        }).setOrigin(0.5);
        this.add.text(400, 550, '2P: P1=WASD+Space+H | P2=Arrows+FwdSlash+Del', {
            fontSize: '20px',
            fill: '#fff',
            backgroundColor: '#000',
            padding: {
                x: 10,
                y: 5
            }
        }).setOrigin(0.5);
        // Create buttons
        const button1P = this.add.rectangle(400, 350, 300, 60, 0x000000, 0.8);
        const button2P = this.add.rectangle(400, 450, 300, 60, 0x000000, 0.8);
        // Add text to buttons
        this.add.text(400, 350, '1 PLAYER', {
            fontSize: '32px',
            fill: '#fff'
        }).setOrigin(0.5);
        this.add.text(400, 450, '2 PLAYERS', {
            fontSize: '32px',
            fill: '#fff'
        }).setOrigin(0.5);
        // Make buttons interactive
        button1P.setInteractive();
        button2P.setInteractive();
        // Add hover effects
        button1P.on('pointerover', () => button1P.setFillStyle(0x444444, 0.8));
        button1P.on('pointerout', () => button1P.setFillStyle(0x000000, 0.8));
        button2P.on('pointerover', () => button2P.setFillStyle(0x444444, 0.8));
        button2P.on('pointerout', () => button2P.setFillStyle(0x000000, 0.8));
        // Add click handlers
        button1P.on('pointerdown', () => {
            this.playerMode = 1;
            this.startGame();
        });
        button2P.on('pointerdown', () => {
            this.playerMode = 2;
            this.startGame();
        });
    }
    startGame() {
        // Clear selection screen
        this.children.removeAll();
        // Check if running on mobile
        this.isMobile = !this.sys.game.device.os.desktop;
        // Mobile input properties
        this.isPointerDown = false;
        this.pointerStartX = 0;
        this.pointerStartY = 0;
        this.pointerCurrentX = 0;
        this.pointerCurrentY = 0;
        // Create scrolling background
        this.background = this.add.tileSprite(0, 0, 800, 600, 'background');
        this.background.setOrigin(0, 0);
        const bgScale = Math.max(800 / this.background.width, 600 / this.background.height);
        this.background.setScale(bgScale);
        // Create player ship
        const playerScale = 0.1; // Adjust scale since original asset is large

        // Player 1 setup
        this.player = this.physics.add.sprite(200, 550, 'playerShip');
        this.player.setScale(playerScale);
        this.player.setCollideWorldBounds(true);
        this.player.isInvincible = false;
        this.player.active = true;
        this.baseSpeed = 300;
        this.currentSpeed = 300;
        this.player.body.setBoundsRectangle(new Phaser.Geom.Rectangle(0, 50, 800, 500));

        // Player 2 setup (only in 2 player mode)
        if (this.playerMode === 2) {
            this.player2 = this.physics.add.sprite(600, 550, 'player2Ship');
            this.player2.setScale(playerScale);
            this.player2.setCollideWorldBounds(true);
            this.player2.body.setBoundsRectangle(new Phaser.Geom.Rectangle(0, 50, 800, 500));
            this.player2.setTint(0x00ff00); // Green tint to distinguish from player 1
            this.player2.alpha = 0.7; // Make player 2 slightly transparent to indicate ghost mode
            this.player2Lives = 5;
        } else {
            // In single player mode, we don't need player 2 at all
            this.player2 = null;
            this.player2Lives = 0;
        }

        // Create groups
        this.bullets = this.physics.add.group();
        this.enemies = this.physics.add.group();
        this.explosions = this.physics.add.group();
        this.enemyBullets = this.physics.add.group();
        this.powerUps = this.physics.add.group();
        // Progress Bar Setup
        const barWidth = 200;
        const barHeight = 15;
        const barX = 400 - barWidth / 2; // Center X position
        const barY = 20; // Top Y position
        this.progressBarBg = this.add.rectangle(barX, barY, barWidth, barHeight, 0x444444).setOrigin(0, 0.5);
        this.progressBarFill = this.add.rectangle(barX, barY, 0, barHeight, 0x00ff00).setOrigin(0, 0.5);
        // UI Setup
        const frameScale = 0.3;
        this.uiFrame = this.add.image(16, 16, 'uiFrame');
        this.uiFrame.setScale(frameScale);
        this.uiFrame.setOrigin(0, 0);
        this.scoreText = this.add.text(30, 30, 'Score: 0', {
            fontSize: '32px',
            fill: '#fff'
        });
        this.coinsText = this.add.text(30, 110, 'Coins: 0', {
            fontSize: '32px',
            fill: '#fff'
        });
        this.bombText = this.add.text(30, 70, 'Nukes: 2', {
            fontSize: '32px',
            fill: '#fff'
        });
        // Add lives counter for both players
        this.livesText = this.add.text(750, 30, 'P1 Lives: 5', {
            fontSize: '32px',
            fill: '#fff'
        }).setOrigin(1, 0);

        // Always create P2 lives text, but only show lives if in 2 player mode
        this.lives2Text = this.add.text(750, 70, 'P2 Lives: ' + this.player2Lives, {
            fontSize: '32px',
            fill: '#fff'
        }).setOrigin(1, 0);
        if (this.playerMode !== 2) {
            this.lives2Text.setVisible(false);
        }

        // Input handling for Player 1
        // Set up controls based on game mode
        if (this.playerMode === 1) {
            // Single player mode - Arrow keys
            this.player1Keys = {
                up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
                down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
                left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
                right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
                shoot: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
                nuke: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H)
            };
        } else {
            // Two player mode - WASD for P1, Arrows for P2
            this.player1Keys = {
                up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
                down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
                left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
                right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
                shoot: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
                nuke: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H)
            };

            this.player2Keys = {
                up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
                down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
                left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
                right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
                shoot: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FORWARD_SLASH),
                nuke: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DELETE)
            };
        }

        // Development mode controls
        if (this.isDevelopmentMode) {
            // Add stage skip key (2)
            this.input.keyboard.addKey('TWO').on('down', () => {
                if (this.currentStage === 1) {
                    this.enemies.clear(true, true);
                    this.enemyBullets.clear(true, true);
                    this.bullets.clear(true, true);
                    if (this.boss) {
                        this.boss.destroy();
                        if (this.bossHealthBar) this.bossHealthBar.destroy();
                        if (this.bossHealthBackground) this.bossHealthBackground.destroy();
                        if (this.bossHealthText) this.bossHealthText.destroy();
                    }

                    this.player.x = 400;
                    this.player.y = 550;
                    this.currentStage = 2;
                    this.bossSpawned = false;
                    this.bossHealth = 1000;

                    const stage2Message = this.add.text(400, 300, 'STAGE 2', {
                        fontSize: '64px',
                        fill: '#fff',
                        backgroundColor: '#000',
                        padding: {
                            x: 20,
                            y: 10
                        }
                    }).setOrigin(0.5);

                    this.tweens.add({
                        targets: stage2Message,
                        alpha: 0,
                        duration: 2000,
                        onComplete: () => stage2Message.destroy()
                    });
                }
            });
            // Add boss test key (backtick)
            this.input.keyboard.addKey('BACKTICK').on('down', () => {
                if (!this.bossSpawned) {
                    this.enemies.clear(true, true);
                    this.enemyBullets.clear(true, true);
                    this.bullets.clear(true, true);
                    this.spawnBoss();
                }
            });
            // Add stage jump keys (1, 2, 3, 4)
            this.input.keyboard.addKey('ONE').on('down', () => this.jumpToStage(1));
            this.input.keyboard.addKey('TWO').on('down', () => this.jumpToStage(2));
            this.input.keyboard.addKey('THREE').on('down', () => this.jumpToStage(3));
            this.input.keyboard.addKey('FOUR').on('down', () => this.jumpToStage(4));
            this.input.keyboard.addKey('FIVE').on('down', () => this.jumpToStage(5)); // Add key for stage 5
        }
        // Enemy spawn timer
        this.time.addEvent({
            delay: 1000,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });

        // Collision detection
        this.physics.add.overlap(
            this.bullets,
            this.enemies,
            (bullet, enemy) => {
                if (bullet?.active && enemy?.active) {
                    this.hitEnemy(bullet, enemy);
                }
            },
            null,
            this
        );
        // Add collision between enemy bullets and both players
        // Add collision between enemy bullets and player 1
        this.physics.add.overlap(
            this.player,
            this.enemyBullets,
            (player, bullet) => this.gameOverHandler(player, bullet),
            null,
            this
        );
        // Only add player 2 collision if in 2 player mode
        if (this.playerMode === 2 && this.player2) {
            this.physics.add.overlap(
                this.player2,
                this.enemyBullets,
                (player, bullet) => this.gameOverHandler(player, bullet),
                null,
                this
            );
        }

        // Add collision between enemies and both players
        // Add collision between enemies and player 1
        this.physics.add.overlap(
            this.player,
            this.enemies,
            (player, enemy) => this.gameOverHandler(player, enemy),
            null,
            this
        );
        // Only add player 2 collision if in 2 player mode
        if (this.playerMode === 2 && this.player2) {
            this.physics.add.overlap(
                this.player2,
                this.enemies,
                (player, enemy) => this.gameOverHandler(player, enemy),
                null,
                this
            );
        }
        // Add power-up collision for both players
        // Add power-up collision for player 1
        this.physics.add.overlap(
            this.player,
            this.powerUps,
            this.collectPowerUp,
            null,
            this
        );
        // Only add player 2 power-up collision if in 2 player mode
        if (this.playerMode === 2 && this.player2) {
            this.physics.add.overlap(
                this.player2,
                this.powerUps,
                this.collectPowerUp,
                null,
                this
            );
        }
        // Setup mobile input listeners if on mobile
        if (this.isMobile && this.playerMode === 1) {
            this.setupMobileInput();
        }
        // Initialize Progress Bar display
        this.updateProgressBar();
    }

    update() {
        if (this.gameOver) {
            return;
        }

        // Scroll background
        this.background.tilePositionY += 2;
        // Player movement
        // Player 1 movement
        if (this.player && this.player.active) { // Ensure player exists and is active
            if (this.isMobile && this.playerMode === 1) {
                // Mobile touch/swipe controls
                if (this.isPointerDown) {
                    const targetX = this.pointerCurrentX;
                    const targetY = this.pointerCurrentY;
                    // Define game boundaries, considering player sprite size and origin (assuming 0.5, 0.5)
                    const halfWidth = this.player.displayWidth / 2;
                    const halfHeight = this.player.displayHeight / 2;
                    const xMin = halfWidth;
                    const xMax = 800 - halfWidth;
                    const yMin = 50 + halfHeight; // Assuming top boundary is 50
                    const yMax = 600 - halfHeight; // Bottom boundary is 600
                    // Clamp the target position
                    const newX = Phaser.Math.Clamp(targetX, xMin, xMax);
                    const newY = Phaser.Math.Clamp(targetY, yMin, yMax);
                    // Directly set the player's position
                    this.player.x = newX;
                    this.player.y = newY;
                }
                // No specific 'else' needed here unless you want the ship to stop moving when touch is released
            } else {
                // Keyboard controls for player 1
                let velocityX = 0;
                let velocityY = 0;
                if (this.player1Keys && this.player1Keys.left.isDown) {
                    velocityX = -this.currentSpeed;
                } else if (this.player1Keys && this.player1Keys.right.isDown) {
                    velocityX = this.currentSpeed;
                }
                if (this.player1Keys && this.player1Keys.up.isDown) {
                    velocityY = -this.currentSpeed;
                } else if (this.player1Keys && this.player1Keys.down.isDown) {
                    velocityY = this.currentSpeed;
                }
                // Check player body exists before setting velocity
                if (this.player.body) {
                    this.player.setVelocity(velocityX, velocityY);
                }
            }
        }

        // Player 2 movement (only in 2 player mode)
        if (this.playerMode === 2 && this.player2 && this.player2.active) {
            if (this.player2 && this.player2.body) {
                if (this.player2Keys.left.isDown) {
                    this.player2.setVelocityX(-this.currentSpeed);
                } else if (this.player2Keys.right.isDown) {
                    this.player2.setVelocityX(this.currentSpeed);
                } else {
                    this.player2.setVelocityX(0);
                }
                if (this.player2Keys.up.isDown) {
                    this.player2.setVelocityY(-this.currentSpeed);
                } else if (this.player2Keys.down.isDown) {
                    this.player2.setVelocityY(this.currentSpeed);
                } else {
                    this.player2.setVelocityY(0);
                }
            }
        }

        // Shooting
        const currentTime = this.time.now;
        // Player 1 shooting (Keyboard or Mobile Auto-shoot)
        const isShootingKeyboard = !this.isMobile && this.player1Keys && this.player1Keys.shoot && this.player1Keys.shoot.isDown;
        // Mobile shooting is now handled by isPointerDown for continuous fire, initial tap shot in setupMobileInput
        const isShootingMobileContinuous = this.isMobile && this.isPointerDown && this.playerMode === 1;
        if (this.player && this.player.active && (isShootingKeyboard || isShootingMobileContinuous)) {
            const currentDelay = this.player1PowerUpType === 'rapid' ? 100 : this.shootingDelay;
            if (currentTime >= this.lastShootTime + currentDelay) {
                this.shoot(this.player);
                this.lastShootTime = currentTime;
            }
        }
        // Player 1 nuke (Keyboard or Mobile)
        if (this.player && this.player.active && this.player1Keys && this.player1Keys.nuke &&
            !this.isMobile && Phaser.Input.Keyboard.JustDown(this.player1Keys.nuke)) {
            this.dropNuke(this.player);
        }
        // Player 2 shooting
        if (this.playerMode === 2 && this.player2 && this.player2.active &&
            this.player2Keys && this.player2Keys.shoot && this.player2Keys.shoot.isDown) {
            const currentDelay = this.player2PowerUpType === 'rapid' ? 100 : this.shootingDelay;
            if (currentTime >= this.lastShootTime2 + currentDelay) {
                this.shoot(this.player2);
                this.lastShootTime2 = currentTime;
            }
        }
        // Player 2 nuke (only in 2 player mode)
        if (this.playerMode === 2 && this.player2 && this.player2.active &&
            this.player2Keys && this.player2Keys.nuke &&
            Phaser.Input.Keyboard.JustDown(this.player2Keys.nuke)) {
            this.dropNuke(this.player2);
        }
        // Clean up off-screen objects
        // Clean up off-screen bullets with safety checks
        if (this.bullets && this.bullets.children) {
            this.bullets.children.each(bullet => {
                if (bullet && bullet.y < 0) {
                    bullet.destroy();
                }
            });
        }
        // Clean up off-screen enemy bullets with safety checks
        if (this.enemyBullets && this.enemyBullets.children) {
            this.enemyBullets.children.each(bullet => {
                if (bullet && bullet.y > 600) {
                    bullet.destroy();
                }
            });
        }
        // Clean up off-screen enemies with safety checks
        if (this.enemies && this.enemies.children) {
            this.enemies.children.each(enemy => {
                if (enemy && enemy.y > 600) {
                    enemy.destroy();
                }
            });
        }
        // Update the progress bar
        this.updateProgressBar();
    }

    shoot(player) {
        const isPlayer1 = player === this.player;
        const powerUpActive = isPlayer1 ? this.player1PowerUpActive : this.player2PowerUpActive;
        const powerUpType = isPlayer1 ? this.player1PowerUpType : this.player2PowerUpType;

        // Check for power-ups that modify shooting
        if (powerUpActive && ['spread', 'big'].includes(powerUpType)) {
            if (powerUpType === 'spread') {
                // Spread shot: 3 bullets at different angles
                const angles = [-15, 0, 15];
                angles.forEach(angle => {
                    const bullet = this.physics.add.sprite(
                        player.x,
                        player.y - 30,
                        'tetrisProjectile'
                    );
                    bullet.setScale(0.1);
                    this.bullets.add(bullet);
                    // Calculate velocity components
                    const rad = Phaser.Math.DegToRad(angle - 90);
                    bullet.body.setVelocity(
                        Math.cos(rad) * 800,
                        Math.sin(rad) * 800
                    );
                });
            } else if (this.powerUpType === 'big') {
                // Big shot: larger bullet
                const bullet = this.physics.add.sprite(
                    player.x,
                    player.y - 30,
                    'tetrisProjectile'
                );
                bullet.setScale(0.2);
                this.bullets.add(bullet);
                bullet.body.setVelocityY(-800);
            }
        } else {
            // Normal shot
            const bullet = this.physics.add.sprite(
                player.x,
                player.y - 30,
                'tetrisProjectile'
            );
            bullet.setScale(0.1);
            this.bullets.add(bullet);
            bullet.body.setVelocityY(-800);
        }
    }

    spawnEnemy() {
        // Don't spawn if the game is paused
        if (this.isPaused) return;
        // Check if we should spawn the boss
        if ((this.currentStage === 1 && this.score >= 500 && !this.bossSpawned) ||
            (this.currentStage === 2 && this.score >= 1000 && !this.bossSpawned) ||
            (this.currentStage === 3 && this.score >= 1500 && !this.bossSpawned) ||
            (this.currentStage === 4 && this.score >= 2000 && !this.bossSpawned) || // Stage 4 boss trigger
            (this.currentStage === 5 && this.score >= 2500 && !this.bossSpawned)) { // Stage 5 boss trigger
            if (this.currentStage === 5) {
                this.physics.pause(); // Pause physics for final boss warning
                // Special Stage 5 Warning
                const redBg = this.add.rectangle(400, 300, 800, 600, 0xff0000, 0.7).setDepth(100);
                const finalWarningText = this.add.text(400, 300, 'WARNING!\nImpossible Final Boss!', {
                    fontSize: '64px',
                    fill: '#ffffff',
                    backgroundColor: '#000000',
                    padding: {
                        x: 20,
                        y: 10
                    },
                    align: 'center'
                }).setOrigin(0.5).setDepth(101);
                const flashTween = this.tweens.add({
                    targets: redBg,
                    alpha: {
                        from: 0.5,
                        to: 0.9
                    },
                    duration: 250,
                    yoyo: true,
                    repeat: -1 // Loop indefinitely until stopped
                });
                this.time.delayedCall(5000, () => {
                    flashTween.stop(); // Stop the flashing
                    redBg.destroy();
                    finalWarningText.destroy();
                    this.physics.resume(); // Resume physics before spawning boss
                    this.spawnBoss(); // Proceed to spawn the boss
                });
            } else {
                this.physics.pause(); // Pause physics for regular boss warning
                // Regular Boss Warning for other stages
                const warningMessage = this.add.text(400, 300, 'WARNING!\nBOSS APPROACHING!', {
                    fontSize: '48px',
                    fill: '#ff0000',
                    backgroundColor: '#000',
                    padding: {
                        x: 20,
                        y: 10
                    },
                    align: 'center'
                }).setOrigin(0.5);
                // Flash the warning message
                this.tweens.add({
                    targets: warningMessage,
                    alpha: 0,
                    duration: 500,
                    yoyo: true,
                    repeat: 3,
                    onComplete: () => {
                        warningMessage.destroy();
                        this.physics.resume(); // Resume physics before spawning boss
                        this.spawnBoss();
                    }
                });
            }
            return;
        }
        // Don't spawn regular enemies if boss is active
        if (this.bossSpawned) {
            return;
        }
        // Don't spawn if time is frozen
        if (this.isTimeFrozen) return;
        // Regular enemy spawn logic
        let enemyScale = 0.1;
        const x = Phaser.Math.Between(40, 760);
        let enemyType;

        // Different enemy types based on stage
        if (this.currentStage === 1) {
            enemyType = Math.random() > 0.5 ? 'enemyShip' : 'enemyAsteroid';
        } else if (this.currentStage === 2) {
            enemyType = Math.random() > 0.5 ? 'enemyShip2' : 'enemyAsteroid';
            if (enemyType === 'enemyShip2') {
                enemyScale = 0.2; // Adjust scale for the new enemy ship
            }
        } else if (this.currentStage === 3) {
            enemyType = Math.random() > 0.5 ? 'enemyShip3' : 'enemyAsteroid';
            if (enemyType === 'enemyShip3') {
                enemyScale = 0.15; // Adjust scale for the third stage enemy ship
            }
        } else if (this.currentStage === 4) {
            enemyType = Math.random() > 0.5 ? 'enemyShip4' : 'enemyAsteroid'; // Stage 4 enemy or Asteroid
            if (enemyType === 'enemyShip4') {
                enemyScale = 0.25; // Adjust scale for the fourth stage enemy ship
            } else {
                enemyScale = 0.1; // Asteroid scale
            }
        } else if (this.currentStage === 5) {
            enemyType = Math.random() > 0.5 ? 'enemyShip5' : 'enemyAsteroid'; // Stage 5 enemy or Asteroid
            if (enemyType === 'enemyShip5') {
                enemyScale = 0.45; // Increased scale for the fifth stage enemy ship (0.3 * 1.5)
            } else {
                enemyScale = 0.1; // Asteroid scale
            }
        }
        const enemy = this.physics.add.sprite(x, -20, enemyType);
        enemy.setScale(enemyScale);
        // Rotate Stage 4 and 5 enemies
        if (enemyType === 'enemyShip4' || enemyType === 'enemyShip5') {
            enemy.setAngle(90); // Rotate 90 degrees clockwise
        }
        this.enemies.add(enemy);
        enemy.body.setVelocityY(200);
        // Immediately shoot if it's an enemy ship
        if (enemyType !== 'enemyAsteroid') { // Shoot if not an asteroid
            this.enemyShoot(enemy);
        }
    }

    hitEnemy(bullet, enemy) {
        // Comprehensive null and active checks
        if (!bullet || !enemy ||
            !bullet?.active || !enemy?.active ||
            !bullet?.scene || !enemy?.scene ||
            !bullet?.body?.enable || !enemy?.body?.enable) {
            return;
        }
        // Store positions before any potential destruction
        const enemyX = enemy.x;
        const enemyY = enemy.y;
        // Check if the enemy is the boss
        if (enemy === this.boss && this.boss && this.boss.active) {
            const previousHealth = this.bossHealth;
            this.bossHealth -= this.doubleDamage ? 20 : 10;
            this.updateBossHealthBar();
            bullet.destroy();
            // Check if we crossed a 200-health threshold
            const previousThreshold = Math.ceil(previousHealth / 200) * 200;
            const currentThreshold = Math.ceil(this.bossHealth / 200) * 200;

            if (previousThreshold !== currentThreshold && this.bossHealth > 0) {
                // Spawn a power-up at the boss's position
                const powerUp = this.physics.add.sprite(enemy.x, enemy.y, 'tetrisProjectile');
                powerUp.setScale(0.15);
                powerUp.setTint(0x00ff00); // Green tint to distinguish from regular projectiles
                this.powerUps.add(powerUp);
                powerUp.body.setVelocityY(150);

                // Show power-up drop message
                const dropMessage = this.add.text(400, 150, 'BOSS DROPPED POWER-UP!', {
                    fontSize: '32px',
                    fill: '#fff',
                    backgroundColor: '#000',
                    padding: {
                        x: 20,
                        y: 10
                    }
                }).setOrigin(0.5);

                // Fade out the message
                this.tweens.add({
                    targets: dropMessage,
                    alpha: 0,
                    duration: 2000,
                    onComplete: () => dropMessage.destroy()
                });
            }

            // Check if boss is defeated
            if (this.bossHealth <= 0) {
                // Hide boss health UI immediately
                if (this.bossHealthBar) this.bossHealthBar.setVisible(false);
                if (this.bossHealthBackground) this.bossHealthBackground.setVisible(false);
                if (this.bossHealthText) this.bossHealthText.setVisible(false);

                const explosionScale = 0.3; // Bigger explosion for boss
                const explosion = this.add.sprite(enemy.x, enemy.y, 'explosion');
                explosion.setScale(explosionScale);
                explosion.on('animationcomplete', () => {
                    explosion.destroy();
                    // Destroy boss health UI after explosion
                    if (this.bossHealthBar) this.bossHealthBar.destroy();
                    if (this.bossHealthBackground) this.bossHealthBackground.destroy();
                    if (this.bossHealthText) this.bossHealthText.destroy();
                });
                enemy.destroy();
                this.score += 100; // More points for defeating boss
                this.coins += 100; // Add coins for defeating boss
                this.coinsText.setText('Coins: ' + this.coins);
                this.purchasesMadeThisStage = 0; // Reset purchase counter for this stage
                // Show power-up selection interface
                this.showBossRewardSelection();

                // Show coins earned message
                const coinsMessage = this.add.text(400, 250, '+100 COINS!', {
                    fontSize: '32px',
                    fill: '#FFD700',
                    backgroundColor: '#000',
                    padding: {
                        x: 20,
                        y: 10
                    }
                }).setOrigin(0.5);

                // Fade out the coins message
                this.tweens.add({
                    targets: coinsMessage,
                    alpha: 0,
                    duration: 2000,
                    onComplete: () => coinsMessage.destroy()
                });
                if (this.currentStage === 1) {
                    // Clear existing enemies and bullets
                    this.enemies.clear(true, true);
                    this.enemyBullets.clear(true, true);
                    this.bullets.clear(true, true);
                    // Reset player positions and restore inactive player
                    this.player.x = 400;
                    this.player.y = 550;
                    // Respawn player 2 if they were destroyed and in 2-player mode
                    if (this.playerMode === 2 && this.player2 && !this.player2.active) {
                        this.player2 = this.physics.add.sprite(600, 550, 'player2Ship');
                        this.player2.setScale(0.1);
                        this.player2.setCollideWorldBounds(true);
                        this.player2.body.setBoundsRectangle(new Phaser.Geom.Rectangle(0, 50, 800, 500));
                        this.player2.setTint(0x00ff00);
                        this.player2.alpha = 0.7;
                        this.player2Lives = 1;
                        this.lives2Text.setText('P2 Lives: 1');
                    }
                    // Start stage 2 and add lives
                    this.currentStage = 2;
                    this.bossSpawned = false;
                    // bossHealth is set in spawnBoss based on stage
                    // Add 3 lives to both players
                    this.player1Lives += 3;
                    this.livesText.setText('P1 Lives: ' + this.player1Lives);
                    if (this.playerMode === 2) {
                        this.player2Lives += 3;
                        this.lives2Text.setText('P2 Lives: ' + this.player2Lives);
                    }
                    // Show bonus lives message
                    const bonusMessage = this.add.text(400, 150, '+3 LIVES BONUS!', {
                        fontSize: '32px',
                        fill: '#fff',
                        backgroundColor: '#000',
                        padding: {
                            x: 20,
                            y: 10
                        }
                    }).setOrigin(0.5);
                    // Fade out the bonus message
                    this.tweens.add({
                        targets: bonusMessage,
                        alpha: 0,
                        duration: 2000,
                        onComplete: () => bonusMessage.destroy()
                    });
                    // Show stage 2 message
                    const stage2Message = this.add.text(400, 300, 'STAGE 2', {
                        fontSize: '64px',
                        fill: '#fff',
                        backgroundColor: '#000',
                        padding: {
                            x: 20,
                            y: 10
                        }
                    }).setOrigin(0.5);
                    // Fade out the message
                    this.tweens.add({
                        targets: stage2Message,
                        alpha: 0,
                        duration: 2000,
                        onComplete: () => stage2Message.destroy()
                    });
                } else if (this.currentStage === 2) {
                    // Clear existing enemies and bullets
                    this.enemies.clear(true, true);
                    this.enemyBullets.clear(true, true);
                    this.bullets.clear(true, true);

                    // Reset player positions and restore inactive player
                    this.player.x = 400;
                    this.player.y = 550;
                    // Respawn player 2 if they were destroyed and in 2-player mode
                    if (this.playerMode === 2 && this.player2 && !this.player2.active) {
                        this.player2 = this.physics.add.sprite(600, 550, 'player2Ship');
                        this.player2.setScale(0.1);
                        this.player2.setCollideWorldBounds(true);
                        this.player2.body.setBoundsRectangle(new Phaser.Geom.Rectangle(0, 50, 800, 500));
                        this.player2.setTint(0x00ff00);
                        this.player2.alpha = 0.7;
                        this.player2Lives = 1;
                        this.lives2Text.setText('P2 Lives: 1');
                    }
                    // Start stage 3
                    this.currentStage = 3;
                    this.bossSpawned = false;
                    // bossHealth is set in spawnBoss based on stage
                    // Add 3 lives to both players and apply stage 3 bonuses
                    this.player1Lives += 3;
                    this.livesText.setText('P1 Lives: ' + this.player1Lives);
                    if (this.playerMode === 2) {
                        this.player2Lives += 3;
                        this.lives2Text.setText('P2 Lives: ' + this.player2Lives);
                    }
                    // Stage 3 bonuses
                    this.baseSpeed = 450; // Increased base speed (was 300)
                    this.currentSpeed = 450;
                    this.shootingDelay = 300; // Faster shooting (was 500)
                    this.bombCount += 3; // Extra nukes
                    this.bombText.setText('Nukes: ' + this.bombCount);
                    // Show bonus message for stage 3 upgrades
                    const upgradeMessage = this.add.text(400, 250, 'STAGE 3 POWER UP!\nMOVE SPEED ↑\nATTACK SPEED ↑\n+3 NUKES', {
                        fontSize: '32px',
                        fill: '#fff',
                        backgroundColor: '#000',
                        padding: {
                            x: 20,
                            y: 10
                        },
                        align: 'center'
                    }).setOrigin(0.5);
                    // Fade out the upgrade message
                    this.tweens.add({
                        targets: upgradeMessage,
                        alpha: 0,
                        duration: 3000,
                        onComplete: () => upgradeMessage.destroy()
                    });

                    // Show bonus lives message
                    const bonusMessage = this.add.text(400, 150, '+3 LIVES BONUS!', {
                        fontSize: '32px',
                        fill: '#fff',
                        backgroundColor: '#000',
                        padding: {
                            x: 20,
                            y: 10
                        }
                    }).setOrigin(0.5);

                    // Fade out the bonus message
                    this.tweens.add({
                        targets: bonusMessage,
                        alpha: 0,
                        duration: 2000,
                        onComplete: () => bonusMessage.destroy()
                    });

                    // Show stage 3 message
                    const stage3Message = this.add.text(400, 300, 'STAGE 3', {
                        fontSize: '64px',
                        fill: '#fff',
                        backgroundColor: '#000',
                        padding: {
                            x: 20,
                            y: 10
                        }
                    }).setOrigin(0.5);

                    // Fade out the message
                    this.tweens.add({
                        targets: stage3Message,
                        alpha: 0,
                        duration: 2000,
                        onComplete: () => stage3Message.destroy()
                    });
                } else if (this.currentStage === 3) {
                    // Clear existing enemies and bullets
                    this.enemies.clear(true, true);
                    this.enemyBullets.clear(true, true);
                    this.bullets.clear(true, true);
                    // Reset player positions and restore inactive player
                    this.player.x = 400;
                    this.player.y = 550;
                    // Respawn player 2 if they were destroyed and in 2-player mode
                    if (this.playerMode === 2 && this.player2 && !this.player2.active) {
                        this.player2 = this.physics.add.sprite(600, 550, 'player2Ship');
                        this.player2.setScale(0.1);
                        this.player2.setCollideWorldBounds(true);
                        this.player2.body.setBoundsRectangle(new Phaser.Geom.Rectangle(0, 50, 800, 500));
                        this.player2.setTint(0x00ff00);
                        this.player2.alpha = 0.7;
                        this.player2Lives = 1;
                        this.lives2Text.setText('P2 Lives: 1');
                    }
                    // Start stage 4
                    this.currentStage = 4;
                    this.bossSpawned = false;
                    // Add 3 lives to both players
                    this.player1Lives += 3;
                    this.livesText.setText('P1 Lives: ' + this.player1Lives);
                    if (this.playerMode === 2) {
                        this.player2Lives += 3;
                        this.lives2Text.setText('P2 Lives: ' + this.player2Lives);
                    }
                    // Show bonus lives message
                    const bonusMessage = this.add.text(400, 150, '+3 LIVES BONUS!', {
                        fontSize: '32px',
                        fill: '#fff',
                        backgroundColor: '#000',
                        padding: {
                            x: 20,
                            y: 10
                        }
                    }).setOrigin(0.5);
                    this.tweens.add({
                        targets: bonusMessage,
                        alpha: 0,
                        duration: 2000,
                        onComplete: () => bonusMessage.destroy()
                    });
                    // Show stage 4 message
                    const stage4Message = this.add.text(400, 300, 'STAGE 4', {
                        fontSize: '64px',
                        fill: '#fff',
                        backgroundColor: '#000',
                        padding: {
                            x: 20,
                            y: 10
                        }
                    }).setOrigin(0.5);
                    this.tweens.add({
                        targets: stage4Message,
                        alpha: 0,
                        duration: 2000,
                        onComplete: () => stage4Message.destroy()
                    });
                } else if (this.currentStage === 4) {
                    // Clear existing enemies and bullets
                    this.enemies.clear(true, true);
                    this.enemyBullets.clear(true, true);
                    this.bullets.clear(true, true);
                    // Reset player positions and restore inactive player
                    this.player.x = 400;
                    this.player.y = 550;
                    // Respawn player 2 if they were destroyed and in 2-player mode
                    if (this.playerMode === 2 && this.player2 && !this.player2.active) {
                        this.player2 = this.physics.add.sprite(600, 550, 'player2Ship');
                        this.player2.setScale(0.1);
                        this.player2.setCollideWorldBounds(true);
                        this.player2.body.setBoundsRectangle(new Phaser.Geom.Rectangle(0, 50, 800, 500));
                        this.player2.setTint(0x00ff00);
                        this.player2.alpha = 0.7;
                        this.player2Lives = 1;
                        this.lives2Text.setText('P2 Lives: 1');
                    }
                    // Start stage 5
                    this.currentStage = 5;
                    this.bossSpawned = false;
                    // Add 3 lives to both players
                    this.player1Lives += 3;
                    this.livesText.setText('P1 Lives: ' + this.player1Lives);
                    if (this.playerMode === 2) {
                        this.player2Lives += 3;
                        this.lives2Text.setText('P2 Lives: ' + this.player2Lives);
                    }
                    // Show bonus lives message
                    const bonusMessage = this.add.text(400, 150, '+3 LIVES BONUS!', {
                        fontSize: '32px',
                        fill: '#fff',
                        backgroundColor: '#000',
                        padding: {
                            x: 20,
                            y: 10
                        }
                    }).setOrigin(0.5);
                    this.tweens.add({
                        targets: bonusMessage,
                        alpha: 0,
                        duration: 2000,
                        onComplete: () => bonusMessage.destroy()
                    });
                    // Show stage 5 message
                    const stage5Message = this.add.text(400, 300, 'STAGE 5', {
                        fontSize: '64px',
                        fill: '#fff',
                        backgroundColor: '#000',
                        padding: {
                            x: 20,
                            y: 10
                        }
                    }).setOrigin(0.5);
                    this.tweens.add({
                        targets: stage5Message,
                        alpha: 0,
                        duration: 2000,
                        onComplete: () => stage5Message.destroy()
                    });
                } else { // Boss defeated in Stage 5 (or any later stage)
                    // Show final victory message
                    this.physics.pause();
                    this.add.text(400, 300, 'GAME COMPLETE!', {
                        fontSize: '64px',
                        fill: '#fff',
                        backgroundColor: '#000',
                        padding: {
                            x: 20,
                            y: 10
                        }
                    }).setOrigin(0.5);
                    this.add.text(400, 370, 'Final Score: ' + this.score, {
                        fontSize: '32px',
                        fill: '#fff',
                        backgroundColor: '#000',
                        padding: {
                            x: 20,
                            y: 10
                        }
                    }).setOrigin(0.5);
                }
            }
        } else {
            // Regular enemy hit logic
            const explosionScale = 0.1;

            // Create explosion at the stored position
            const explosion = this.add.sprite(enemyX, enemyY, 'explosion');
            explosion.setScale(explosionScale);
            explosion.on('animationcomplete', () => {
                explosion.destroy();
            });

            // Destroy the bullet and enemy only once
            if (bullet.active) bullet.destroy();
            if (enemy.active) enemy.destroy();
            this.score += 10;
            // Increment normal enemy kill count and award coins
            this.normalEnemyKills++;
            if (this.normalEnemyKills >= 5) {
                this.coins += 2;
                this.coinsText.setText('Coins: ' + this.coins);
                this.normalEnemyKills = 0; // Reset counter
            }
            // 20% chance to spawn a power-up
            if (Math.random() < 0.2) {
                const powerUp = this.physics.add.sprite(enemyX, enemyY, 'tetrisProjectile'); // Use stored position
                powerUp.setScale(0.15);
                powerUp.setTint(0x00ff00); // Green tint to distinguish from regular projectiles
                this.powerUps.add(powerUp);
                powerUp.body.setVelocityY(150);
            }
            // Check if player reached 500 points to award a bomb
            if (this.score >= 500 && !this.scoreReachedFlag) {
                this.scoreReachedFlag = true;
                this.bombCount++;
                this.bombText.setText('Nukes: ' + this.bombCount);

                // Show bomb awarded message
                const bombMessage = this.add.text(400, 200, 'NUKE BOMB AWARDED!', {
                    fontSize: '32px',
                    fill: '#fff',
                    backgroundColor: '#000',
                    padding: {
                        x: 20,
                        y: 10
                    }
                }).setOrigin(0.5);

                // Fade out the message
                this.tweens.add({
                    targets: bombMessage,
                    alpha: 0,
                    duration: 2000,
                    onComplete: () => bombMessage.destroy()
                });
            }
        }
        this.scoreText.setText('Score: ' + this.score);
        this.updateProgressBar(); // Update progress bar after score change
    }

    gameOverHandler(player, enemyOrBullet) {
        const isPlayer1 = player === this.player;
        const isPlayer2 = player === this.player2;

        // Check which player's shield is active
        if (isPlayer1 && this.isShielded) return;
        if (isPlayer1 && this.player.isInvincible) return;
        if (isPlayer2 && this.player2.isInvincible) return;
        // Destroy the enemy/bullet that caused the hit
        if (enemyOrBullet) {
            enemyOrBullet.destroy();
        }
        if (isPlayer1 && this.player1Lives > 1) {
            this.player1Lives--;
            this.livesText.setText('P1 Lives: ' + this.player1Lives);
            this.handlePlayerHit(this.player, this.player1Lives, 1);
            return;
        } else if (isPlayer2 && this.player2Lives > 1) {
            this.player2Lives--;
            this.lives2Text.setText('P2 Lives: ' + this.player2Lives);
            this.handlePlayerHit(this.player2, this.player2Lives, 2);
            return;
        }
        // If a player runs out of lives, make their ship disappear
        if (isPlayer1 && this.player1Lives === 1) {
            this.player1Lives = 0;
            this.livesText.setText('P1 Lives: 0');
            this.player.destroy();
        } else if (isPlayer2 && this.player2Lives === 1) {
            this.player2Lives = 0;
            this.lives2Text.setText('P2 Lives: 0');
            this.player2.destroy();
        }
        // Check if game over condition is met (either P1 is out of lives in 1P mode, or both are out in 2P mode)
        const isGameOverConditionMet = (this.playerMode === 1 && this.player1Lives === 0) ||
            (this.playerMode === 2 && this.player1Lives === 0 && this.player2Lives === 0);
        if (isGameOverConditionMet) {
            this.gameOver = true;
            this.physics.pause();
            this.add.text(400, 300, 'GAME OVER', {
                fontSize: '64px',
                fill: '#fff'
            }).setOrigin(0.5);
            this.add.text(400, 370, 'Press R to Restart', {
                fontSize: '32px',
                fill: '#fff'
            }).setOrigin(0.5);
            // Clear any existing key listener to prevent duplicates
            this.input.keyboard.removeKey('R');
            // Add a new listener for restarting
            this.input.keyboard.once('keydown-R', () => {
                // Reset game state variables before restarting
                this.playerMode = null;
                this.powerUpActive = false;
                this.powerUpType = null;
                this.shootingDelay = 500;
                this.lastShootTime = 0;
                this.lastShootTime2 = 0;
                this.isShielded = false;
                this.doubleDamage = false;
                this.baseSpeed = 300;
                this.currentSpeed = 300;
                this.player1Lives = 5;
                this.player2Lives = 5;
                this.score = 0;
                this.coins = 0;
                this.gameOver = false;
                this.bombCount = 2;
                this.scoreReachedFlag = false;
                this.currentStage = 1;
                this.bossSpawned = false;
                this.bossHealth = 1000;
                this.isPaused = false;
                this.normalEnemyKills = 0; // Reset normal enemy kill counter
                this.purchasesMadeThisStage = 0; // Reset purchase counter on restart
                this.scene.restart();
            });
        }
    }
    handlePlayerHit(player, lives, playerNum) {
        // Make player briefly invincible
        player.isInvincible = true;
        player.alpha = 0.5; // Visual feedback for invincibility
        // Show remaining lives message
        const livesMessage = this.add.text(400, 200, `P${playerNum} LIFE LOST! ${lives} REMAINING!`, {
            fontSize: '32px',
            fill: '#fff',
            backgroundColor: '#000',
            padding: {
                x: 20,
                y: 10
            }
        }).setOrigin(0.5);
        // Fade out the message
        this.tweens.add({
            targets: livesMessage,
            alpha: 0,
            duration: 2000,
            onComplete: () => livesMessage.destroy()
        });
        // Remove invincibility after 2 seconds
        this.time.delayedCall(2000, () => {
            player.isInvincible = false;
            player.alpha = 1;
        });
    }
    enemyShoot(enemy) {
        // Only shoot if the enemy is still alive and in the game and time is not frozen
        if (enemy && enemy.active && !this.isTimeFrozen) {
            const speed = 300;
            const shootPositions = [];
            const enemyType = enemy.texture.key;
            // Determine shooting positions based on enemy type
            if (enemyType === 'enemyShip5') {
                // Shoot two bullets, offset horizontally
                shootPositions.push({
                    x: enemy.x - 15,
                    y: enemy.y + 30
                });
                shootPositions.push({
                    x: enemy.x + 15,
                    y: enemy.y + 30
                });
            } else {
                // Default single shot from center
                shootPositions.push({
                    x: enemy.x,
                    y: enemy.y + 30
                });
            }
            shootPositions.forEach(pos => {
                // Create a small yellow circle for the bullet
                const bullet = this.add.circle(pos.x, pos.y, 4, 0xffff00);
                this.physics.add.existing(bullet);
                this.enemyBullets.add(bullet);
                // Calculate direction towards player (use the same target for both bullets if multiple)
                const angle = Phaser.Math.Angle.Between(
                    pos.x, pos.y, // Shoot from the bullet's starting position
                    this.player.x, this.player.y
                );
                // Set velocity based on angle
                bullet.body.setVelocity(
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed
                );
            });
        }
    }
    spawnBoss() {
        this.bossSpawned = true;
        // Hide progress bar when boss spawns
        if (this.progressBarBg) this.progressBarBg.setVisible(false);
        if (this.progressBarFill) this.progressBarFill.setVisible(false);
        // Ensure a boss doesn't already exist
        if (this.boss && this.boss.active) {
            // If a boss already exists and is active, do nothing further.
            // This prevents creating duplicate bosses.
            return;
        }
        // Create boss
        // Adjust boss properties based on stage
        let bossType;
        let bossScale = 0.3; // Default scale - THIS IS THE CORRECT DECLARATION
        let moveSpeed = 2000; // Default movement duration
        // const bossScale = this.currentStage === 1 ? 0.3 : 0.25; // REMOVED DUPLICATE DECLARATION
        switch (this.currentStage) {
            case 1:
                bossType = 'enemyShip';
                bossScale = 0.3;
                moveSpeed = 2000;
                break;
            case 2:
                bossType = 'bossStageTwoShip';
                bossScale = 0.25;
                moveSpeed = 1500;
                break;
            case 3:
                bossType = 'bossStageThreeShip';
                bossScale = 0.25;
                moveSpeed = 1200; // Faster for stage 3
                break;
            case 4:
                bossType = 'bossStageFourShip';
                bossScale = 0.15; // Smaller scale for stage 4 boss
                moveSpeed = 1000; // Even faster for stage 4
                break;
            case 5:
                bossType = 'bossStageFiveShip';
                bossScale = 0.1; // Scale for stage 5 boss
                moveSpeed = 800; // Even faster for stage 5
                break;
            default:
                bossType = 'enemyShip'; // Fallback
        }
        this.boss = this.physics.add.sprite(400, 100, bossType);
        this.boss.setScale(bossScale);
        this.enemies.add(this.boss);
        // Boss movement pattern (horizontal only)
        this.boss.body.setVelocityY(0);
        // Add horizontal movement
        this.boss.moveTween = this.tweens.add({
            targets: this.boss,
            x: 600,
            duration: moveSpeed,
            ease: 'Linear',
            yoyo: true,
            repeat: -1
        });
        // Create boss health bar with dynamic health based on stage
        this.maxBossHealth = 500 + (this.currentStage * 500); // Stage 1: 1000, Stage 2: 1500, Stage 3: 2000, Stage 4: 2500, Stage 5: 3000
        this.bossHealth = this.maxBossHealth; // Set current boss health
        this.bossHealthBackground = this.add.rectangle(400, 50, 300, 30, 0x000000);
        this.bossHealthBar = this.add.rectangle(400, 50, 300, 30, 0xff0000);
        // Add boss health text
        this.bossHealthText = this.add.text(400, 50, `${this.bossHealth}/${this.maxBossHealth}`, {
            fontSize: '20px',
            fill: '#fff'
        }).setOrigin(0.5);
        // Boss shooting logic based on stage and health
        // Ensure only one shooting timer is active for the boss
        if (this.bossShootingTimer) {
            this.bossShootingTimer.remove(false); // Remove existing timer
        }
        this.bossShootingTimer = this.time.addEvent({
            delay: (() => {
                let baseDelay = Math.max(500, 3000 - (this.currentStage * 500));
                if (this.currentStage >= 1 && this.currentStage <= 3) {
                    baseDelay *= 0.65; // 35% faster shooting for stages 1-3
                }
                return baseDelay;
            })(), // Minimum delay 500ms, adjusted for stages 1-3
            callback: () => {
                if (this.boss && this.boss.active && !this.isTimeFrozen) {
                    let numBullets = 1; // Default bullets
                    let spreadAngle = 0; // Default spread
                    if (this.currentStage === 5) {
                        if (this.bossHealth <= 500) {
                            numBullets = 10;
                            spreadAngle = 90; // Total angle for 10 bullets
                        } else if (this.bossHealth <= 1000) {
                            numBullets = 5;
                            spreadAngle = 60; // Total angle for 5 bullets
                        }
                    }
                    const angleStep = numBullets > 1 ? spreadAngle / (numBullets - 1) : 0;
                    const startAngle = -spreadAngle / 2;
                    for (let i = 0; i < numBullets; i++) {
                        const bullet = this.physics.add.sprite(
                            this.boss.x,
                            this.boss.y + 30, // Adjust Y position based on boss sprite
                            'tetrisProjectile'
                        );
                        bullet.setScale(0.08);
                        this.enemyBullets.add(bullet);
                        // Calculate direction towards player, adjusted by spread angle
                        const playerAngle = Phaser.Math.Angle.Between(
                            this.boss.x, this.boss.y,
                            this.player.x, this.player.y
                        );
                        const currentBulletAngle = playerAngle + Phaser.Math.DegToRad(startAngle + i * angleStep);
                        // Set velocity based on angle
                        const speed = 300;
                        bullet.body.setVelocity(
                            Math.cos(currentBulletAngle) * speed,
                            Math.sin(currentBulletAngle) * speed
                        );
                    }
                }
            },
            callbackScope: this,
            loop: true
        });
    }

    updateBossHealthBar() {
        if (!this.bossHealthBar || !this.bossHealthBackground || !this.bossHealthText) return; // Safety check
        const healthPercentage = Math.max(0, this.bossHealth / this.maxBossHealth); // Ensure percentage is not negative
        this.bossHealthBar.width = 300 * healthPercentage;
        this.bossHealthText.setText(`${Math.max(0, this.bossHealth)}/${this.maxBossHealth}`); // Ensure displayed health is not negative
    }
    dropNuke(player) {
        if (this.bombCount <= 0) return; // Prevent nukes from going negative
        this.bombCount--;
        this.bombText.setText('Nukes: ' + this.bombCount);
        const nuke = this.add.circle(player.x, player.y - 30, 8, 0xff0000);
        this.physics.add.existing(nuke);
        // Calculate the target Y position (350px up from current position)
        const targetY = nuke.y - 350;
        // Move the nuke upward
        this.tweens.add({
            targets: nuke,
            y: targetY,
            duration: 1000,
            ease: 'Linear',
            onComplete: () => {
                // Create explosion effect
                const explosion = this.add.circle(nuke.x, nuke.y, 300, 0xff0000, 0.5);

                // Damage all enemies within radius
                this.enemies.children.each(enemy => {
                    const distance = Phaser.Math.Distance.Between(
                        explosion.x, explosion.y,
                        enemy.x, enemy.y
                    );

                    if (distance <= 300) {
                        if (enemy === this.boss) {
                            this.bossHealth -= 150;
                            this.updateBossHealthBar();

                            if (this.bossHealth <= 0) {
                                enemy.destroy();
                                this.bossHealthBar.destroy();
                                this.bossHealthBackground.destroy();
                                this.bossHealthText.destroy();
                                this.score += 100;
                                this.bombCount++;
                                this.bombText.setText('Nukes: ' + this.bombCount);

                                // Show bomb awarded message
                                const bombMessage = this.add.text(400, 200, 'NUKE BOMB AWARDED!', {
                                    fontSize: '32px',
                                    fill: '#fff',
                                    backgroundColor: '#000',
                                    padding: {
                                        x: 20,
                                        y: 10
                                    }
                                }).setOrigin(0.5);

                                // Fade out the message
                                this.tweens.add({
                                    targets: bombMessage,
                                    alpha: 0,
                                    duration: 2000,
                                    onComplete: () => bombMessage.destroy()
                                });

                                if (this.currentStage === 1) {
                                    // Transition to stage 2
                                    this.time.delayedCall(2000, () => {
                                        // Clear existing enemies and bullets
                                        this.enemies.clear(true, true);
                                        this.enemyBullets.clear(true, true);
                                        this.bullets.clear(true, true);
                                        // Reset both players' positions and restore inactive player
                                        this.player.x = 400;
                                        this.player.y = 550;
                                        // Respawn player 2 if they were destroyed and in 2-player mode
                                        if (this.playerMode === 2 && this.player2 && !this.player2.active) {
                                            this.player2 = this.physics.add.sprite(600, 550, 'player2Ship');
                                            this.player2.setScale(0.1);
                                            this.player2.setCollideWorldBounds(true);
                                            this.player2.body.setBoundsRectangle(new Phaser.Geom.Rectangle(0, 50, 800, 500));
                                            this.player2.setTint(0x00ff00);
                                            this.player2.alpha = 0.7;
                                            this.player2Lives = 1;
                                            this.lives2Text.setText('P2 Lives: 1');
                                        }
                                        // Start stage 2
                                        this.currentStage = 2;
                                        this.bossSpawned = false;
                                        // bossHealth is set in spawnBoss based on stage
                                        // Add 3 lives to both players
                                        this.player1Lives += 3;
                                        this.livesText.setText('P1 Lives: ' + this.player1Lives);
                                        if (this.playerMode === 2) {
                                            this.player2Lives += 3;
                                            this.lives2Text.setText('P2 Lives: ' + this.player2Lives);
                                        }
                                        // Show bonus lives message
                                        const bonusMessage = this.add.text(400, 150, '+3 LIVES BONUS!', {
                                            fontSize: '32px',
                                            fill: '#fff',
                                            backgroundColor: '#000',
                                            padding: {
                                                x: 20,
                                                y: 10
                                            }
                                        }).setOrigin(0.5);
                                        // Fade out the bonus message
                                        this.tweens.add({
                                            targets: bonusMessage,
                                            alpha: 0,
                                            duration: 2000,
                                            onComplete: () => bonusMessage.destroy()
                                        });

                                        // Show stage 2 message
                                        const stage2Message = this.add.text(400, 300, 'STAGE 2', {
                                            fontSize: '64px',
                                            fill: '#fff',
                                            backgroundColor: '#000',
                                            padding: {
                                                x: 20,
                                                y: 10
                                            }
                                        }).setOrigin(0.5);

                                        // Resume physics
                                        this.physics.resume();

                                        // Fade out message
                                        this.tweens.add({
                                            targets: stage2Message,
                                            alpha: 0,
                                            duration: 2000,
                                            onComplete: () => stage2Message.destroy()
                                        });
                                    });
                                } else if (this.currentStage === 2) {
                                    // Transition to stage 3
                                    this.time.delayedCall(2000, () => {
                                        this.enemies.clear(true, true);
                                        this.enemyBullets.clear(true, true);
                                        this.bullets.clear(true, true);
                                        this.player.x = 400;
                                        this.player.y = 550;
                                        if (this.playerMode === 2 && this.player2 && !this.player2.active) {
                                            // Respawn player 2 logic (same as before)
                                            this.player2 = this.physics.add.sprite(600, 550, 'player2Ship');
                                            this.player2.setScale(0.1);
                                            this.player2.setCollideWorldBounds(true);
                                            this.player2.body.setBoundsRectangle(new Phaser.Geom.Rectangle(0, 50, 800, 500));
                                            this.player2.setTint(0x00ff00);
                                            this.player2.alpha = 0.7;
                                            this.player2Lives = 1;
                                            this.lives2Text.setText('P2 Lives: 1');
                                        }
                                        this.currentStage = 3;
                                        this.bossSpawned = false;
                                        this.player1Lives += 3;
                                        this.livesText.setText('P1 Lives: ' + this.player1Lives);
                                        if (this.playerMode === 2) {
                                            this.player2Lives += 3;
                                            this.lives2Text.setText('P2 Lives: ' + this.player2Lives);
                                        }
                                        // Apply Stage 3 bonuses
                                        this.baseSpeed = 450;
                                        this.currentSpeed = 450;
                                        this.shootingDelay = 300;
                                        this.bombCount += 3;
                                        this.bombText.setText('Nukes: ' + this.bombCount);
                                        // Show relevant messages (bonuses, stage 3)
                                        const bonusMessage = this.add.text(400, 150, '+3 LIVES BONUS!', {
                                            fontSize: '32px',
                                            fill: '#fff',
                                            backgroundColor: '#000',
                                            padding: {
                                                x: 20,
                                                y: 10
                                            }
                                        }).setOrigin(0.5);
                                        this.tweens.add({
                                            targets: bonusMessage,
                                            alpha: 0,
                                            duration: 2000,
                                            onComplete: () => bonusMessage.destroy()
                                        });
                                        const stage3Message = this.add.text(400, 300, 'STAGE 3', {
                                            fontSize: '64px',
                                            fill: '#fff',
                                            backgroundColor: '#000',
                                            padding: {
                                                x: 20,
                                                y: 10
                                            }
                                        }).setOrigin(0.5);
                                        this.tweens.add({
                                            targets: stage3Message,
                                            alpha: 0,
                                            duration: 2000,
                                            onComplete: () => stage3Message.destroy()
                                        });
                                        const upgradeMessage = this.add.text(400, 250, 'STAGE 3 POWER UP!\nMOVE SPEED ↑\nATTACK SPEED ↑\n+3 NUKES', {
                                            fontSize: '32px',
                                            fill: '#fff',
                                            backgroundColor: '#000',
                                            padding: {
                                                x: 20,
                                                y: 10
                                            },
                                            align: 'center'
                                        }).setOrigin(0.5);
                                        this.tweens.add({
                                            targets: upgradeMessage,
                                            alpha: 0,
                                            duration: 3000,
                                            onComplete: () => upgradeMessage.destroy()
                                        });
                                        this.physics.resume();
                                    });
                                } else if (this.currentStage === 3) {
                                    // Transition to stage 4
                                    this.time.delayedCall(2000, () => {
                                        this.enemies.clear(true, true);
                                        this.enemyBullets.clear(true, true);
                                        this.bullets.clear(true, true);
                                        this.player.x = 400;
                                        this.player.y = 550;
                                        if (this.playerMode === 2 && this.player2 && !this.player2.active) {
                                            // Respawn player 2 logic
                                            this.player2 = this.physics.add.sprite(600, 550, 'player2Ship');
                                            this.player2.setScale(0.1);
                                            this.player2.setCollideWorldBounds(true);
                                            this.player2.body.setBoundsRectangle(new Phaser.Geom.Rectangle(0, 50, 800, 500));
                                            this.player2.setTint(0x00ff00);
                                            this.player2.alpha = 0.7;
                                            this.player2Lives = 1;
                                            this.lives2Text.setText('P2 Lives: 1');
                                        }
                                        this.currentStage = 4;
                                        this.bossSpawned = false;
                                        this.player1Lives += 3;
                                        this.livesText.setText('P1 Lives: ' + this.player1Lives);
                                        if (this.playerMode === 2) {
                                            this.player2Lives += 3;
                                            this.lives2Text.setText('P2 Lives: ' + this.player2Lives);
                                        }
                                        // Show relevant messages (bonuses, stage 4)
                                        const bonusMessage = this.add.text(400, 150, '+3 LIVES BONUS!', {
                                            fontSize: '32px',
                                            fill: '#fff',
                                            backgroundColor: '#000',
                                            padding: {
                                                x: 20,
                                                y: 10
                                            }
                                        }).setOrigin(0.5);
                                        this.tweens.add({
                                            targets: bonusMessage,
                                            alpha: 0,
                                            duration: 2000,
                                            onComplete: () => bonusMessage.destroy()
                                        });
                                        const stage4Message = this.add.text(400, 300, 'STAGE 4', {
                                            fontSize: '64px',
                                            fill: '#fff',
                                            backgroundColor: '#000',
                                            padding: {
                                                x: 20,
                                                y: 10
                                            }
                                        }).setOrigin(0.5);
                                        this.tweens.add({
                                            targets: stage4Message,
                                            alpha: 0,
                                            duration: 2000,
                                            onComplete: () => stage4Message.destroy()
                                        });
                                        this.physics.resume();
                                    });
                                } else if (this.currentStage === 4) {
                                    // Transition to stage 5
                                    this.time.delayedCall(2000, () => {
                                        this.enemies.clear(true, true);
                                        this.enemyBullets.clear(true, true);
                                        this.bullets.clear(true, true);
                                        this.player.x = 400;
                                        this.player.y = 550;
                                        if (this.playerMode === 2 && this.player2 && !this.player2.active) {
                                            // Respawn player 2 logic
                                            this.player2 = this.physics.add.sprite(600, 550, 'player2Ship');
                                            this.player2.setScale(0.1);
                                            this.player2.setCollideWorldBounds(true);
                                            this.player2.body.setBoundsRectangle(new Phaser.Geom.Rectangle(0, 50, 800, 500));
                                            this.player2.setTint(0x00ff00);
                                            this.player2.alpha = 0.7;
                                            this.player2Lives = 1;
                                            this.lives2Text.setText('P2 Lives: 1');
                                        }
                                        this.currentStage = 5;
                                        this.bossSpawned = false;
                                        this.player1Lives += 3;
                                        this.livesText.setText('P1 Lives: ' + this.player1Lives);
                                        if (this.playerMode === 2) {
                                            this.player2Lives += 3;
                                            this.lives2Text.setText('P2 Lives: ' + this.player2Lives);
                                        }
                                        // Show relevant messages (bonuses, stage 5)
                                        const bonusMessage = this.add.text(400, 150, '+3 LIVES BONUS!', {
                                            fontSize: '32px',
                                            fill: '#fff',
                                            backgroundColor: '#000',
                                            padding: {
                                                x: 20,
                                                y: 10
                                            }
                                        }).setOrigin(0.5);
                                        this.tweens.add({
                                            targets: bonusMessage,
                                            alpha: 0,
                                            duration: 2000,
                                            onComplete: () => bonusMessage.destroy()
                                        });
                                        const stage5Message = this.add.text(400, 300, 'STAGE 5', {
                                            fontSize: '64px',
                                            fill: '#fff',
                                            backgroundColor: '#000',
                                            padding: {
                                                x: 20,
                                                y: 10
                                            }
                                        }).setOrigin(0.5);
                                        this.tweens.add({
                                            targets: stage5Message,
                                            alpha: 0,
                                            duration: 2000,
                                            onComplete: () => stage5Message.destroy()
                                        });
                                        this.physics.resume();
                                    });
                                } else { // Defeated Stage 5 boss or later
                                    // Show final victory message after stage 5
                                    this.physics.pause();
                                    this.add.text(400, 300, 'GAME COMPLETE!', {
                                        fontSize: '64px',
                                        fill: '#fff',
                                        backgroundColor: '#000',
                                        padding: {
                                            x: 20,
                                            y: 10
                                        }
                                    }).setOrigin(0.5);
                                    this.add.text(400, 370, 'Final Score: ' + this.score, {
                                        fontSize: '32px',
                                        fill: '#fff',
                                        backgroundColor: '#000',
                                        padding: {
                                            x: 20,
                                            y: 10
                                        }
                                    }).setOrigin(0.5);
                                }
                            }
                        } else {
                            enemy.destroy();
                            this.score += 10;
                        }
                    }
                });

                // Fade out and remove explosion effect
                this.tweens.add({
                    targets: explosion,
                    alpha: 0,
                    duration: 500,
                    onComplete: () => {
                        explosion.destroy();
                    }
                });

                // Remove the nuke
                nuke.destroy();

                this.scoreText.setText('Score: ' + this.score);
            }
        });
    }
    updateProgressBar() {
        if (!this.progressBarBg || !this.progressBarFill) return; // Safety check
        if (this.bossSpawned) {
            this.progressBarBg.setVisible(false);
            this.progressBarFill.setVisible(false);
            return;
        }
        this.progressBarBg.setVisible(true);
        this.progressBarFill.setVisible(true);
        const scoreForNextBoss = this.currentStage * 500;
        const scoreAtStageStart = (this.currentStage - 1) * 500;
        const scoreProgressInStage = Math.max(0, this.score - scoreAtStageStart);
        const targetScoreForStage = scoreForNextBoss - scoreAtStageStart; // Should be 500
        let progress = 0;
        if (targetScoreForStage > 0) {
            progress = Phaser.Math.Clamp(scoreProgressInStage / targetScoreForStage, 0, 1);
        }
        const barWidth = 200; // Must match the width used in create
        this.progressBarFill.width = barWidth * progress;
    }
    collectPowerUp(player, powerUp) {
        powerUp.destroy();
        // Determine which player collected the power-up
        const isPlayer1 = player === this.player;

        // Clear existing power-up timer for the specific player
        if (isPlayer1) {
            if (this.player1PowerUpTimer) {
                this.player1PowerUpTimer.remove();
            }
        } else {
            if (this.player2PowerUpTimer) {
                this.player2PowerUpTimer.remove();
            }
        }

        // Randomly choose between all power-up types
        const powerUpTypes = ['spread', 'rapid', 'double', 'speed', 'life'];
        const powerUpType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];

        // Set power-up type for the specific player
        if (isPlayer1) {
            this.player1PowerUpType = powerUpType;
            this.player1PowerUpActive = true;
        } else {
            this.player2PowerUpType = powerUpType;
            this.player2PowerUpActive = true;
        }

        // Apply power-up effects to the specific player
        switch (powerUpType) {
            case 'double':
                player.doubleDamage = true;
                break;
            case 'speed':
                player.currentSpeed = this.baseSpeed * 1.5; // 50% speed increase
                break;
            case 'life':
                if (isPlayer1) {
                    this.player1Lives++;
                    this.livesText.setText('P1 Lives: ' + this.player1Lives);
                } else {
                    this.player2Lives++;
                    this.lives2Text.setText('P2 Lives: ' + this.player2Lives);
                }
                break;
        }
        // Show power-up message
        const powerUpMessage = this.add.text(400, 200,
            `${isPlayer1 ? 'P1' : 'P2'} GOT ${powerUpType.toUpperCase()}!`, {
                fontSize: '32px',
                fill: '#fff',
                backgroundColor: '#000',
                padding: {
                    x: 20,
                    y: 10
                }
            }).setOrigin(0.5);
        // Fade out the message
        this.tweens.add({
            targets: powerUpMessage,
            alpha: 0,
            duration: 2000,
            onComplete: () => powerUpMessage.destroy()
        });
        // Power-up lasts for 10 seconds
        const powerUpTimer = this.time.delayedCall(10000, () => {
            if (isPlayer1) {
                this.player1PowerUpActive = false;
                switch (this.player1PowerUpType) {
                    case 'double':
                        player.doubleDamage = false;
                        break;
                    case 'speed':
                        player.currentSpeed = this.baseSpeed;
                        break;
                }
                this.player1PowerUpType = null;
            } else {
                this.player2PowerUpActive = false;
                switch (this.player2PowerUpType) {
                    case 'double':
                        player.doubleDamage = false;
                        break;
                    case 'speed':
                        player.currentSpeed = this.baseSpeed;
                        break;
                }
                this.player2PowerUpType = null;
            }
        }, [], this);
        // Store the timer reference for the specific player
        if (isPlayer1) {
            this.player1PowerUpTimer = powerUpTimer;
        } else {
            this.player2PowerUpTimer = powerUpTimer;
        }
    }
    // Removed the old createMobileControls function
    setupMobileInput() {
        // Only set up mobile input if in 1P mode
        if (this.playerMode !== 1) {
            return;
        }
        // Listen for touch events on the entire game area
        this.input.on('pointerdown', (pointer) => {
            if (this.isMobile && !this.gameOver && !this.isPaused && this.player && this.player.active) {
                this.isPointerDown = true;
                this.pointerStartX = pointer.x;
                this.pointerStartY = pointer.y;
                this.pointerCurrentX = pointer.x;
                this.pointerCurrentY = pointer.y;
                // If player exists, is active, and game is not paused/over, attempt to shoot
                // Temporarily commenting out initial tap-to-shoot for diagnosis
                /*
                if (this.player && this.player.active && !this.isPaused && !this.gameOver) {
                    const currentTime = this.time.now;
                    const currentDelay = (this.player1PowerUpType === 'rapid' ? 100 : this.shootingDelay);
                    if (currentTime >= this.lastShootTime + currentDelay) {
                        this.shoot(this.player);
                        this.lastShootTime = currentTime;
                    }
                }
                */
            }
        });
        this.input.on('pointermove', (pointer) => {
            if (this.isMobile && this.isPointerDown && !this.gameOver && !this.isPaused && this.player && this.player.active) {
                this.pointerCurrentX = pointer.x;
                this.pointerCurrentY = pointer.y;
            }
        });
        this.input.on('pointerup', (pointer) => {
            if (this.isMobile && !this.gameOver && this.player && this.player.active) {
                this.isPointerDown = false;
                // Optional: Stop player velocity if using physics movement for touch controls
                if (this.player && this.player.body && !this.isPaused) { // Check if not paused before stopping
                    // this.player.setVelocity(0, 0); // Uncomment if you want player to stop on pointer up
                }
            }
        });
        // Create a dedicated Nuke button for mobile (only if isMobile is true, already checked by playerMode === 1 at function start)
        const nukeButton = this.add.circle(750, 550, 40, 0xff6600, 0.6)
            .setInteractive()
            .setScrollFactor(0) // Keep button fixed on screen
            .setDepth(100); // Ensure it's above other elements
        this.add.text(nukeButton.x, nukeButton.y, 'NUKE', {
                fontSize: '16px',
                fill: '#fff'
            }).setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(101);
        nukeButton.on('pointerdown', () => {
            if (this.player && this.player.active && this.bombCount > 0) {
                this.dropNuke(this.player);
            }
        });
    }
    showBossRewardSelection() {
        // Pause the game while selecting
        this.physics.pause();
        this.isPaused = true; // Set pause flag
        const rewardUIElements = []; // Array to hold UI elements for cleanup
        // Create semi-transparent background
        const bg = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
        rewardUIElements.push(bg);
        // Add title
        const titleText = this.add.text(400, 150, 'PURCHASE UPGRADES', {
            fontSize: '48px',
            fill: '#fff',
            backgroundColor: '#000',
            padding: {
                x: 20,
                y: 10
            }
        }).setOrigin(0.5);
        rewardUIElements.push(titleText);
        // Add text displaying current coins
        const currentCoinsText = this.add.text(400, 200, `Coins: ${this.coins}`, {
            fontSize: '32px',
            fill: '#FFD700' // Gold color for coins
        }).setOrigin(0.5);
        rewardUIElements.push(currentCoinsText);
        // Create selection boxes (adjust width and position for 4 options)
        const boxWidth = 180;
        const boxHeight = 120;
        const option1 = this.add.rectangle(106, 350, boxWidth, boxHeight, 0x444444); // Adjusted Y position
        const option2 = this.add.rectangle(302, 350, boxWidth, boxHeight, 0x444444); // Adjusted Y position
        const option3 = this.add.rectangle(508, 350, boxWidth, boxHeight, 0x444444); // Adjusted Y position
        const option4 = this.add.rectangle(704, 350, boxWidth, boxHeight, 0x444444); // Adjusted Y position
        rewardUIElements.push(option1, option2, option3, option4);
        // Add text for each option with prices
        const textOpt1 = this.add.text(106, 340, 'MOVE SPEED\n+50%\n50 COINS', { // Adjusted Y position
            fontSize: '24px',
            fill: '#fff',
            align: 'center'
        }).setOrigin(0.5);
        const textOpt2 = this.add.text(302, 340, 'ATTACK SPEED\n+50%\n75 COINS', { // Adjusted Y position
            fontSize: '24px',
            fill: '#fff',
            align: 'center'
        }).setOrigin(0.5);
        const textOpt3 = this.add.text(508, 340, 'EXTRA\n3 NUKES\n100 COINS', { // Adjusted Y position
            fontSize: '24px',
            fill: '#fff',
            align: 'center'
        }).setOrigin(0.5);
        const textOpt4 = this.add.text(704, 340, '+2 LIVES\n25 COINS', { // Adjusted Y position
            fontSize: '24px',
            fill: '#fff',
            align: 'center'
        }).setOrigin(0.5);
        rewardUIElements.push(textOpt1, textOpt2, textOpt3, textOpt4);
        // Make options interactive
        [option1, option2, option3, option4].forEach((option, index) => {
            option.setInteractive();

            option.on('pointerover', () => {
                option.setFillStyle(0x666666);
            });

            option.on('pointerout', () => {
                option.setFillStyle(0x444444);
            });

            option.on('pointerdown', () => {
                // Define prices for each upgrade
                const prices = [50, 75, 100, 25]; // Added price for lives
                const price = prices[index];
                let feedbackText; // Variable to hold the feedback message text object
                // Check if player has enough coins
                if (this.coins >= price) {
                    // Deduct coins
                    this.coins -= price;
                    this.coinsText.setText('Coins: ' + this.coins); // Update coins display
                    currentCoinsText.setText(`Coins: ${this.coins}`); // Update current coins text in the UI
                    this.purchasesMadeThisStage++; // Increment purchase counter (optional, can be removed if not used elsewhere)
                    // Apply the purchased upgrade
                    switch (index) {
                        case 0: // Move Speed (50 coins)
                            this.baseSpeed *= 1.5;
                            this.currentSpeed = this.baseSpeed;
                            feedbackText = this.add.text(400, 450, 'MOVEMENT SPEED INCREASED!', { // Adjusted Y position
                                fontSize: '32px',
                                fill: '#00ff00'
                            }).setOrigin(0.5);
                            break;
                        case 1: // Attack Speed (75 coins)
                            this.shootingDelay *= 0.5;
                            feedbackText = this.add.text(400, 450, 'ATTACK SPEED INCREASED!', { // Adjusted Y position
                                fontSize: '32px',
                                fill: '#00ff00'
                            }).setOrigin(0.5);
                            break;
                        case 2: // Extra Nukes (100 coins)
                            this.bombCount += 3;
                            this.bombText.setText('Nukes: ' + this.bombCount);
                            feedbackText = this.add.text(400, 450, '+3 NUKES ACQUIRED!', { // Adjusted Y position
                                fontSize: '32px',
                                fill: '#00ff00'
                            }).setOrigin(0.5);
                            break;
                        case 3: // +2 Lives (25 coins)
                            this.player1Lives += 2;
                            this.livesText.setText('P1 Lives: ' + this.player1Lives);
                            if (this.playerMode === 2) {
                                this.player2Lives += 2;
                                this.lives2Text.setText('P2 Lives: ' + this.player2Lives);
                            }
                            feedbackText = this.add.text(400, 450, '+2 LIVES ACQUIRED!', { // Adjusted Y position
                                fontSize: '32px',
                                fill: '#00ff00'
                            }).setOrigin(0.5);
                            break;
                    }
                    // No purchase limit check needed here anymore
                } else {
                    // Show "not enough coins" message if player can't afford it
                    feedbackText = this.add.text(400, 450, 'NOT ENOUGH COINS!', { // Adjusted Y position
                        fontSize: '32px',
                        fill: '#ff0000'
                    }).setOrigin(0.5);
                }
                // Add the feedback text to the list for cleanup
                if (feedbackText) {
                    rewardUIElements.push(feedbackText);
                    // Make feedback text disappear after a short time
                    this.time.delayedCall(1000, () => {
                        if (feedbackText && feedbackText.scene) {
                            feedbackText.destroy();
                        }
                    });
                }
                // UI remains open for further purchases or to click "Continue"
            });
        });
        // Add a "Continue" button to leave the upgrade screen
        const continueButton = this.add.rectangle(400, 550, 250, 50, 0x00ff00); // Adjusted Y position
        const continueText = this.add.text(400, 550, 'CONTINUE', { // Adjusted Y position
            fontSize: '32px',
            fill: '#000'
        }).setOrigin(0.5);
        continueButton.setInteractive();
        rewardUIElements.push(continueButton, continueText);
        continueButton.on('pointerover', () => continueButton.setFillStyle(0x00cc00));
        continueButton.on('pointerout', () => continueButton.setFillStyle(0x00ff00));
        continueButton.on('pointerdown', () => {
            // Destroy all UI elements
            rewardUIElements.forEach(element => {
                if (element && element.scene) {
                    element.destroy();
                }
            });
            // Resume game
            this.physics.resume();
            this.isPaused = false; // Unset pause flag
        });
    }
    jumpToStage(stageNumber) {
        if (!this.isDevelopmentMode) return; // Only allow in development mode
        // Clear existing game objects
        this.enemies.clear(true, true);
        this.enemyBullets.clear(true, true);
        this.bullets.clear(true, true);
        if (this.boss) {
            this.boss.destroy();
            if (this.bossHealthBar) this.bossHealthBar.destroy();
            if (this.bossHealthBackground) this.bossHealthBackground.destroy();
            if (this.bossHealthText) this.bossHealthText.destroy();
            this.boss = null;
        }
        this.powerUps.clear(true, true);
        // Reset player position
        if (this.player) {
            this.player.x = 400;
            this.player.y = 550;
            this.player.setVelocity(0, 0);
        }
        if (this.player2) {
            this.player2.x = 600;
            this.player2.y = 550;
            this.player2.setVelocity(0, 0);
            // Ensure player 2 is active if in 2P mode
            if (this.playerMode === 2 && !this.player2.active) {
                this.player2 = this.physics.add.sprite(600, 550, 'player2Ship');
                this.player2.setScale(0.1);
                this.player2.setCollideWorldBounds(true);
                this.player2.body.setBoundsRectangle(new Phaser.Geom.Rectangle(0, 50, 800, 500));
                this.player2.setTint(0x00ff00);
                this.player2.alpha = 0.7;
                this.player2Lives = 1; // Give 1 life back
                this.lives2Text.setText('P2 Lives: 1');
                this.lives2Text.setVisible(true);
            }
        }
        // Update stage and related variables
        this.currentStage = stageNumber;
        this.bossSpawned = false;
        this.bossHealth = 500 + (this.currentStage * 500); // Reset boss health for the target stage
        this.score = (stageNumber - 1) * 500; // Approximate score for the stage start
        this.scoreText.setText('Score: ' + this.score);
        this.scoreReachedFlag = this.score >= 500; // Update bomb flag based on score
        // Apply stage-specific bonuses if jumping past stage 2
        // Apply stage-specific bonuses
        if (stageNumber >= 5) { // Stage 5+ bonuses (if any, currently same as 3/4)
            this.baseSpeed = 450;
            this.currentSpeed = 450;
            this.shootingDelay = 300;
        } else if (stageNumber >= 3) { // Stage 3/4 bonuses
            this.baseSpeed = 450;
            this.currentSpeed = 450;
            this.shootingDelay = 300;
        } else { // Stage 1/2 defaults
            // Reset to default if jumping back to stage 1 or 2
            this.baseSpeed = 300;
            this.currentSpeed = 300;
            this.shootingDelay = 500;
        }
        // Show stage message
        const stageMessage = this.add.text(400, 300, `STAGE ${stageNumber}`, {
            fontSize: '64px',
            fill: '#fff',
            backgroundColor: '#000',
            padding: {
                x: 20,
                y: 10
            }
        }).setOrigin(0.5);
        this.tweens.add({
            targets: stageMessage,
            alpha: 0,
            duration: 2000,
            onComplete: () => stageMessage.destroy()
        });
        // Resume physics if paused (e.g., from reward screen)
        if (this.isPaused) {
            this.physics.resume();
            this.isPaused = false;
        }
        // Update progress bar after jumping stage
        this.updateProgressBar();
    }
}

const container = document.getElementById('renderDiv');
const config = {
    type: Phaser.AUTO,
    parent: container,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 600,
        min: {
            width: 320,
            height: 480
        },
        max: {
            width: 1600,
            height: 1200
        }
    },
    width: 800,
    height: 600,
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: {
                y: 0
            }
        }
    },
    scene: SpaceTetrisShooter
};

window.phaserGame = new Phaser.Game(config);