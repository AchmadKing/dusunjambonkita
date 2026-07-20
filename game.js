/**
 * Game Bima Jump! - Retro Offline Game (Large Screen Version)
 * Designed for Web Dusun Landing Page
 */

class BimaJumpGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Game Settings (Larger Canvas dimension)
        this.baseWidth = 800;
        this.baseHeight = 300;
        this.groundY = 250; // Ground position lowered to match 300px height
        
        // Game State
        this.isPlaying = false;
        this.isGameOver = false;
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('bima_highscore') || '0', 10);
        
        // Speed parameters
        this.speed = 8.5;          // Initial speed (slightly faster for larger canvas width)
        this.minSpeed = 8.5;       // Starting speed baseline
        this.maxSpeed = 17.0;      // Speed ceiling
        this.gravity = 0.7;        // Slightly stronger gravity for punchy jumps (was 0.6)
        this.scoreMilestone = 100;
        
        // Load Assets
        this.idleImg = new Image();
        this.idleImg.src = 'assets/Idle.png';
        this.matiImg = new Image();
        this.matiImg.src = 'assets/Mati.png';
        
        // Game Entities (Scaled larger to look great on the big screen)
        this.cat = {
            x: 70, // Placed slightly further from screen edge
            y: this.groundY - 54,
            width: 54, // Scaled up from 48
            height: 54, // Scaled up from 48
            vy: 0,
            isJumping: false,
            jumpStrength: -13.5 // Higher jump path to clear larger cacti (was -11)
        };
        
        this.obstacles = [];
        this.stars = [];     // Decorative background elements
        this.particles = []; // Particle explosion on crash
        
        // Timers
        this.obstacleTimer = 0;
        this.minObstacleInterval = 42;  // Frames interval
        this.nextObstacleFrame = 30;    // Spawn first obstacle even faster
        
        // Initialize Background Stars
        this.initStars();
        
        // Audio Context (created lazily on user interaction)
        this.audioCtx = null;
    }

    initStars() {
        this.stars = [];
        // Increased number of stars to 22 for the larger background space
        for (let i = 0; i < 22; i++) {
            this.stars.push({
                x: Math.random() * this.baseWidth,
                y: Math.random() * (this.groundY - 50),
                size: Math.random() * 2 + 0.5,
                speed: Math.random() * 0.6 + 0.1
            });
        }
    }

    initAudio() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    playTone(freqStart, freqEnd, type, duration, volume = 0.1) {
        this.initAudio();
        if (!this.audioCtx) return;
        
        try {
            // Resume context if suspended (browser security)
            if (this.audioCtx.state === 'suspended') {
                this.audioCtx.resume();
            }
            
            const osc = this.audioCtx.createOscillator();
            const gainNode = this.audioCtx.createGain();
            
            osc.type = type;
            osc.frequency.setValueAtTime(freqStart, this.audioCtx.currentTime);
            if (freqEnd !== freqStart) {
                osc.frequency.exponentialRampToValueAtTime(freqEnd, this.audioCtx.currentTime + duration);
            }
            
            gainNode.gain.setValueAtTime(volume, this.audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);
            
            osc.connect(gainNode);
            gainNode.connect(this.audioCtx.destination);
            
            osc.start();
            osc.stop(this.audioCtx.currentTime + duration);
        } catch (e) {
            console.warn("Audio play failed:", e);
        }
    }

    playJumpSound() {
        this.playTone(150, 600, 'triangle', 0.15, 0.15);
    }

    playHitSound() {
        this.playTone(300, 30, 'sawtooth', 0.3, 0.25);
    }

    playMilestoneSound() {
        this.playTone(523.25, 523.25, 'square', 0.08, 0.1);
        setTimeout(() => {
            if (this.isPlaying && !this.isGameOver) {
                this.playTone(659.25, 659.25, 'square', 0.12, 0.1);
            }
        }, 80);
    }

    start() {
        this.isPlaying = true;
        this.isGameOver = false;
        this.score = 0;
        this.speed = this.minSpeed;
        this.obstacles = [];
        this.particles = [];
        this.cat.y = this.groundY - this.cat.height;
        this.cat.vy = 0;
        this.cat.isJumping = false;
        this.obstacleTimer = 0;
        this.nextObstacleFrame = 30; // Spawns first cactus quickly
        this.initStars();
        
        // Hide overlay UI
        document.getElementById('gameStartOverlay').classList.add('hidden');
        document.getElementById('gameOverOverlay').classList.add('hidden');
        
        // Play start tone
        this.playTone(440, 880, 'sine', 0.15, 0.1);
    }

    jump() {
        if (!this.isPlaying) {
            this.start();
            return;
        }
        if (this.isGameOver) {
            this.start();
            return;
        }
        if (!this.cat.isJumping) {
            this.cat.vy = this.cat.jumpStrength;
            this.cat.isJumping = true;
            this.playJumpSound();
        }
    }

    spawnObstacle() {
        // Neon cacti dimensions scaled up for the larger screen height
        const isDouble = Math.random() > 0.65;
        const width = isDouble ? 42 : 25; // Scaled up (was 34 : 20)
        const height = Math.floor(Math.random() * 25) + 45; // 45px to 70px height (was 30 to 45px)
        
        this.obstacles.push({
            x: this.baseWidth + 50,
            y: this.groundY - height,
            width: width,
            height: height,
            isDouble: isDouble
        });
    }

    createExplosion(x, y) {
        this.particles = [];
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6 - 2,
                size: Math.random() * 3 + 1,
                color: Math.random() > 0.5 ? '#a855f7' : '#06b6d4', // Purple or Cyan
                alpha: 1,
                decay: Math.random() * 0.03 + 0.01
            });
        }
    }

    triggerGameOver() {
        this.isPlaying = false;
        this.isGameOver = true;
        this.playHitSound();
        
        // Explode character center point
        this.createExplosion(this.cat.x + this.cat.width / 2, this.cat.y + this.cat.height / 2);
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('bima_highscore', this.highScore);
            document.getElementById('highScoreVal').textContent = this.formatScore(this.highScore);
        }
        
        // Show game over overlay
        document.getElementById('finalScoreVal').textContent = this.score;
        document.getElementById('gameOverOverlay').classList.remove('hidden');
    }

    formatScore(num) {
        return num.toString().padStart(5, '0');
    }

    checkCollision(rect1, rect2) {
        // Slightly shrink hitboxes for better feel/fairness
        const padding1 = 4;
        const padding2 = 2;
        
        return (
            rect1.x + padding1 < rect2.x + rect2.width - padding2 &&
            rect1.x + rect1.width - padding1 > rect2.x + padding2 &&
            rect1.y + padding1 < rect2.y + rect2.height - padding2 &&
            rect1.y + rect1.height - padding1 > rect2.y + padding2
        );
    }

    update() {
        // 1. Background stars parallax
        this.stars.forEach(star => {
            star.x -= star.speed;
            if (star.x < -10) {
                star.x = this.baseWidth + 10;
                star.y = Math.random() * (this.groundY - 50);
            }
        });

        // If game over, just update crash particles
        if (this.isGameOver) {
            this.particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.1; // gravity on particles
                p.alpha -= p.decay;
            });
            this.particles = this.particles.filter(p => p.alpha > 0);
            return;
        }

        if (!this.isPlaying) return;

        // 2. Score counter
        this.score++;
        document.getElementById('scoreVal').textContent = this.formatScore(this.score);
        
        // Highscore dynamic update during play
        if (this.score > this.highScore) {
            document.getElementById('highScoreVal').textContent = this.formatScore(this.score);
        }

        // Play sound on milestone
        if (this.score % this.scoreMilestone === 0) {
            this.playMilestoneSound();
            // Increase speed slightly
            if (this.speed < this.maxSpeed) {
                this.speed += 0.5;
            }
        }

        // 3. Bima movement and physics
        this.cat.vy += this.gravity;
        this.cat.y += this.cat.vy;

        // Ground collision
        if (this.cat.y > this.groundY - this.cat.height) {
            this.cat.y = this.groundY - this.cat.height;
            this.cat.vy = 0;
            this.cat.isJumping = false;
        }

        // 4. Obstacles management
        this.obstacleTimer++;
        if (this.obstacleTimer >= this.nextObstacleFrame) {
            this.spawnObstacle();
            this.obstacleTimer = 0;
            // Shortened spawn intervals for closer obstacles spacing
            this.nextObstacleFrame = Math.floor(Math.random() * 25) + this.minObstacleInterval;
        }

        // Move and filter obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];
            obs.x -= this.speed;

            // Collision check
            if (this.checkCollision(this.cat, obs)) {
                this.triggerGameOver();
                break;
            }

            // Remove out-of-screen obstacles
            if (obs.x + obs.width < -50) {
                this.obstacles.splice(i, 1);
            }
        }
    }

    drawCactus(x, y, width, height, isDouble) {
        this.ctx.save();
        
        // Define Neon Styling (Cyan Glow)
        this.ctx.fillStyle = '#06b6d4';
        this.ctx.strokeStyle = '#00f3ff';
        this.ctx.lineWidth = 1.5;
        this.ctx.shadowColor = '#00f3ff';
        this.ctx.shadowBlur = 6;

        const drawSingle = (cx, cy, cw, ch) => {
            const stemW = cw * 0.4;
            const stemX = cx + (cw - stemW) / 2;
            
            // Stem
            this.ctx.beginPath();
            if (this.ctx.roundRect) {
                this.ctx.roundRect(stemX, cy, stemW, ch, [4, 4, 0, 0]);
            } else {
                this.ctx.rect(stemX, cy, stemW, ch);
            }
            this.ctx.fill();
            this.ctx.stroke();

            // Left branch
            const armW = cw * 0.2;
            const armH = ch * 0.35;
            const armY = cy + ch * 0.25;
            this.ctx.beginPath();
            if (this.ctx.roundRect) {
                this.ctx.roundRect(stemX - armW, armY + armH/2, armW + 1, armW, 2);
                this.ctx.roundRect(stemX - armW, armY, armW, armH, [2, 2, 0, 0]);
            } else {
                this.ctx.rect(stemX - armW, armY + armH/2, armW, armW);
                this.ctx.rect(stemX - armW, armY, armW, armH);
            }
            this.ctx.fill();
            this.ctx.stroke();

            // Right branch
            const rightArmH = ch * 0.45;
            const rightArmY = cy + ch * 0.15;
            this.ctx.beginPath();
            if (this.ctx.roundRect) {
                this.ctx.roundRect(stemX + stemW - 1, rightArmY + rightArmH/2, armW + 1, armW, 2);
                this.ctx.roundRect(stemX + stemW + armW - armW, rightArmY, armW, rightArmH, [2, 2, 0, 0]);
            } else {
                this.ctx.rect(stemX + stemW, rightArmY + rightArmH/2, armW, armW);
                this.ctx.rect(stemX + stemW, rightArmY, armW, rightArmH);
            }
            this.ctx.fill();
            this.ctx.stroke();
        };

        if (isDouble) {
            // Draw a smaller cactus next to it
            drawSingle(x, y + height * 0.2, width * 0.5, height * 0.8);
            drawSingle(x + width * 0.4, y, width * 0.6, height);
        } else {
            drawSingle(x, y, width, height);
        }

        this.ctx.restore();
    }

    render() {
        // Clear Canvas
        this.ctx.clearRect(0, 0, this.baseWidth, this.baseHeight);
        
        // Draw Dark Canvas Background
        this.ctx.fillStyle = '#0a0b1c';
        this.ctx.fillRect(0, 0, this.baseWidth, this.baseHeight);

        // Draw Background Stars
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        this.stars.forEach(star => {
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Draw Ground Line with Neon Glow
        this.ctx.save();
        this.ctx.strokeStyle = '#a855f7'; // Purple ground line
        this.ctx.lineWidth = 3;
        this.ctx.shadowColor = '#a855f7';
        this.ctx.shadowBlur = 10;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.groundY);
        this.ctx.lineTo(this.baseWidth, this.groundY);
        this.ctx.stroke();
        this.ctx.restore();

        // Draw Ground details (neon grid dust line)
        this.ctx.fillStyle = 'rgba(168, 85, 247, 0.15)';
        this.ctx.fillRect(0, this.groundY, this.baseWidth, this.baseHeight - this.groundY);

        // Draw Obstacles
        this.obstacles.forEach(obs => {
            this.drawCactus(obs.x, obs.y, obs.width, obs.height, obs.isDouble);
        });

        // Draw Bima character (represented by the image)
        const currentCatImg = this.isGameOver ? this.matiImg : this.idleImg;
        
        this.ctx.save();
        // Add subtle run bobbing
        let drawY = this.cat.y;
        if (this.isPlaying && !this.isGameOver && !this.cat.isJumping) {
            // Jogs with tiny bounce
            const bob = Math.sin(Date.now() / 60) * 2;
            drawY += bob;
        }

        // Draw neon glow under Bima
        this.ctx.shadowColor = this.isGameOver ? '#ff7e5f' : '#a855f7';
        this.ctx.shadowBlur = this.isGameOver ? 15 : 10;
        
        // Render sprite image
        if (currentCatImg.complete) {
            this.ctx.drawImage(currentCatImg, this.cat.x, drawY, this.cat.width, this.cat.height);
        } else {
            // Fallback colorful box in case images fail to load
            this.ctx.fillStyle = this.isGameOver ? '#ff7e5f' : '#a855f7';
            this.ctx.fillRect(this.cat.x, drawY, this.cat.width, this.cat.height);
        }
        this.ctx.restore();

        // Draw Crash Particles (when Game Over)
        if (this.isGameOver && this.particles.length > 0) {
            this.particles.forEach(p => {
                this.ctx.save();
                this.ctx.fillStyle = p.color;
                this.ctx.globalAlpha = p.alpha;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
            });
        }
    }

    loop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.loop());
    }
}

// Global script initialization when game page is ready
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Game Instance
    const game = new BimaJumpGame('gameCanvas');
    game.loop(); // Start frame loops immediately to render idle screen

    // Set highscore text initially
    document.getElementById('highScoreVal').textContent = game.formatScore(game.highScore);

    // 2. Select Elements
    const startGameBtn = document.getElementById('startGameBtn');
    const restartGameBtn = document.getElementById('restartGameBtn');

    // 3. Add Event Listeners
    if (startGameBtn) {
        startGameBtn.addEventListener('click', () => {
            game.initAudio();
            game.start();
        });
    }

    if (restartGameBtn) {
        restartGameBtn.addEventListener('click', () => {
            game.initAudio();
            game.start();
        });
    }

    // 4. Controls (Keyboard)
    window.addEventListener('keydown', (e) => {
        // Prevent default browser scrolling when playing game with Space or Arrow Keys
        if (e.code === 'Space' || e.code === 'ArrowUp') {
            e.preventDefault();
            game.initAudio();
            game.jump();
        }
    });

    // 5. Controls (Touch/Click on Canvas Wrapper for Mobile)
    const canvasWrapper = document.querySelector('.canvas-wrapper');
    if (canvasWrapper) {
        const handleInteraction = (e) => {
            if (e.target.closest('button')) return; // Ignore if clicking start/restart buttons
            e.preventDefault();
            game.initAudio();
            game.jump();
        };

        canvasWrapper.addEventListener('touchstart', handleInteraction, { passive: false });
        canvasWrapper.addEventListener('mousedown', handleInteraction);
    }
});
