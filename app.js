
class CoordinateSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.minX = -10;
        this.maxX = 10;
        this.minY = -10;
        this.maxY = 10;
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        // Set fixed resolution but maintain aspect ratio
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.draw();
    }

    // Convert coordinate to pixel
    toPixel(x, y) {
        const px = (x - this.minX) / (this.maxX - this.minX) * this.canvas.width;
        const py = (1 - (y - this.minY) / (this.maxY - this.minY)) * this.canvas.height;
        return { x: px, y: py };
    }

    // Convert pixel to coordinate
    toCoord(px, py) {
        const x = px / this.canvas.width * (this.maxX - this.minX) + this.minX;
        const y = (1 - py / this.canvas.height) * (this.maxY - this.minY) + this.minY;
        return { x, y };
    }

    draw() {
        const { ctx, canvas } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw Grid
        ctx.strokeStyle = '#2a2d4a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = this.minX; x <= this.maxX; x++) {
            const p = this.toPixel(x, 0);
            ctx.moveTo(p.x, 0);
            ctx.lineTo(p.x, canvas.height);
        }
        for (let y = this.minY; y <= this.maxY; y++) {
            const p = this.toPixel(0, y);
            ctx.moveTo(0, p.y);
            ctx.lineTo(canvas.width, p.y);
        }
        ctx.stroke();

        // Draw Axes
        ctx.strokeStyle = '#4e54c8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        // Y-axis
        const origin = this.toPixel(0, 0);
        ctx.moveTo(origin.x, 0);
        ctx.lineTo(origin.x, canvas.height);
        
        // X-axis
        ctx.moveTo(0, origin.y);
        ctx.lineTo(canvas.width, origin.y);
        ctx.stroke();

        // Labels
        ctx.fillStyle = '#7a7fba';
        ctx.font = '10px Orbitron';
        ctx.textAlign = 'center';
        for (let x = this.minX; x <= this.maxX; x += 2) {
            if (x === 0) continue;
            const p = this.toPixel(x, 0);
            ctx.fillText(x, p.x, origin.y + 15);
        }
        ctx.textAlign = 'right';
        for (let y = this.minY; y <= this.maxY; y += 2) {
            if (y === 0) continue;
            const p = this.toPixel(0, y);
            ctx.fillText(y, origin.x - 10, p.y + 3);
        }
    }
}

class Target {
    constructor(x, y, color = 'blue') {
        this.x = x;
        this.y = y;
        this.color = color;
        this.radius = 8;
        this.hit = false;
        this.pulse = 0;
    }

    draw(coordSystem) {
        if (this.hit) return;
        const { ctx } = coordSystem;
        const p = coordSystem.toPixel(this.x, this.y);

        this.pulse += 0.05;
        const glowSize = Math.sin(this.pulse) * 5 + 10;

        ctx.shadowBlur = glowSize;
        ctx.shadowColor = this.color === 'blue' ? '#00f2ff' : '#ff0055';
        ctx.fillStyle = this.color === 'blue' ? '#00f2ff' : '#ff0055';
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    checkCollision(graphPoints) {
        if (this.hit) return false;
        
        // Check distance to each point on the graph
        // For performance, we can optimize this, but with 2000 points it's fine
        const threshold = 0.5; // distance in coord units
        for (const point of graphPoints) {
            const dist = Math.sqrt(Math.pow(this.x - point.x, 2) + Math.pow(this.y - point.y, 2));
            if (dist < threshold) {
                this.hit = true;
                return true;
            }
        }
        return false;
    }
}

class GameController {
    constructor() {
        this.canvas = document.getElementById('graph-canvas');
        this.coordSystem = new CoordinateSystem(this.canvas);
        this.targets = [];
        this.score = 0;
        this.p1Score = 0;
        this.p2Score = 0;
        this.currentPlayer = 1; // 1 (Blue) or 2 (Red)
        this.currentLevel = 1;
        this.mode = 'training'; // 'training' or 'war'
        this.anotherTurn = false;
        this.history = [];
        this.highScore = parseInt(localStorage.getItem('graphWarHighScore')) || 0;
        
        this.setupUI();
        this.startLevel();
        this.animate();
    }

    setupUI() {
        this.input = document.getElementById('equation-input');
        this.plotBtn = document.getElementById('plot-btn');
        this.errorMsg = document.getElementById('error-msg');
        
        // History elements
        this.historyList = document.getElementById('equation-history');
        
        // Score elements
        this.scoreEl = document.getElementById('score');
        this.highScoreEl = document.getElementById('high-score');
        this.currentStreakEl = document.getElementById('current-streak');
        this.p1ScoreEl = document.getElementById('p1-score');
        this.p2ScoreEl = document.getElementById('p2-score');
        this.levelEl = document.getElementById('level');
        this.turnIndicator = document.getElementById('turn-indicator');
        this.rulesOverlay = document.getElementById('rules-overlay');
        this.closeRulesBtn = document.getElementById('close-rules');

        this.plotBtn.addEventListener('click', () => this.handlePlot());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handlePlot();
        });

        // Tabs
        const tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.dataset.tab;
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById(`${target}-info`).classList.add('active');
                
                this.mode = target;
                if (this.mode === 'war') {
                    this.showRules();
                } else {
                    this.rulesOverlay.classList.add('hidden');
                    this.resetGame();
                }
            });
        });

        document.getElementById('reset-training').addEventListener('click', () => {
            this.currentLevel = 1;
            this.resetGame();
        });

        // The 'start-war' button in the sidebar was removed and replaced by history.
        // Game start for War Mode is now handled by the rules overlay 'START WAR' button.

        if (this.closeRulesBtn) {
            this.closeRulesBtn.addEventListener('click', () => {
                this.rulesOverlay.classList.add('hidden');
                this.resetGame();
            });
        }
    }

    showRules() {
        this.rulesOverlay.classList.remove('hidden');
    }

    resetGame() {
        this.score = 0;
        this.p1Score = 0;
        this.p2Score = 0;
        this.currentPlayer = 1;
        this.history = [];
        this.updateHistoryUI();
        this.updateScoreUI();
        
        this.levelEl.innerText = this.mode === 'training' ? `Training ${this.currentLevel}` : 'War Mode';
        
        // Toggle score boards
        if (this.mode === 'war') {
            document.querySelector('.single-player-score').classList.add('hidden');
            document.querySelector('.multi-player-score').classList.remove('hidden');
            document.querySelector('.level-display').classList.add('hidden');
            this.turnIndicator.classList.remove('hidden');
            this.updateTurnUI();
        } else {
            document.querySelector('.single-player-score').classList.remove('hidden');
            document.querySelector('.multi-player-score').classList.add('hidden');
            document.querySelector('.level-display').classList.remove('hidden');
            this.turnIndicator.classList.add('hidden');
        }

        this.startLevel();
    }

    updateScoreUI() {
        this.scoreEl.innerText = this.score;
        if (this.currentStreakEl) this.currentStreakEl.innerText = this.score / 100;
        if (this.highScoreEl) this.highScoreEl.innerText = this.highScore;
        this.p1ScoreEl.innerText = this.p1Score;
        this.p2ScoreEl.innerText = this.p2Score;
    }

    updateTurnUI() {
        this.turnIndicator.innerText = `PLAYER ${this.currentPlayer}'s TURN`;
        if (this.currentPlayer === 1) {
            this.turnIndicator.classList.remove('p2-turn');
        } else {
            this.turnIndicator.classList.add('p2-turn');
        }
    }

    updateHistoryUI() {
        if (!this.historyList) return;
        
        if (this.history.length === 0) {
            this.historyList.innerHTML = '<li class="history-placeholder">No equations yet...</li>';
            return;
        }

        this.historyList.innerHTML = this.history.map(item => `
            <li class="history-item p${item.player}">
                <span class="player-name">Player ${item.player}</span>
                <code>y = ${item.equation}</code>
            </li>
        `).join('');
    }

    startLevel() {
        this.targets = [];
        this.errorMsg.innerText = '';
        
        if (this.mode === 'training') {
            this.spawnTarget('blue'); // Goal
            // Spawn obstacles based on score (1 per 300 pts)
            const obstacleCount = Math.floor(this.score / 300);
            for (let i = 0; i < obstacleCount; i++) {
                this.spawnTarget('red');
            }
        } else {
            // War Mode: 4 Blue, 4 Red
            for (let i = 0; i < 4; i++) this.spawnTarget('blue');
            for (let i = 0; i < 4; i++) this.spawnTarget('red');
        }
    }

    spawnTarget(color = null) {
        const x = Math.random() * 16 - 8;
        const y = Math.random() * 16 - 8;
        if (!color) {
            color = Math.random() > 0.5 ? 'blue' : 'red';
        }
        this.targets.push(new Target(x, y, color));
    }

    handlePlot() {
        if (this.plotting) return;
        const expression = this.input.value;
        if (!expression) return;

        try {
            const compiled = math.compile(expression);
            const points = [];
            const step = 0.05;
            
            for (let x = this.coordSystem.minX; x <= this.coordSystem.maxX; x += step) {
                try {
                    const y = compiled.evaluate({ x: x });
                    if (typeof y === 'number' && !isNaN(y)) {
                        points.push({ x, y });
                    }
                } catch (e) { }
            }

            if (points.length === 0) throw new Error("No points");

            this.plotting = true;
            this.animateGraph(points);
            
            // Record history
            if (this.mode === 'war') {
                this.history.push({
                    player: this.currentPlayer,
                    equation: expression
                });
                this.updateHistoryUI();
            }

            this.errorMsg.innerText = '';
            this.input.value = '';
        } catch (err) {
            this.errorMsg.innerText = "Error: Invalid equation";
        }
    }

    animateGraph(points) {
        let index = 0;
        const stepPerFrame = 20;
        const drawSegment = () => {
            if (index >= points.length - 1) {
                this.checkHits(points);
                this.plotting = false;
                return;
            }

            const { ctx } = this.coordSystem;
            ctx.strokeStyle = this.mode === 'war' ? (this.currentPlayer === 1 ? '#00f2ff' : '#ff0055') : '#00f2ff';
            ctx.lineWidth = 3;
            ctx.shadowBlur = 10;
            ctx.shadowColor = ctx.strokeStyle;
            
            ctx.beginPath();
            const start = this.coordSystem.toPixel(points[index].x, points[index].y);
            ctx.moveTo(start.x, start.y);

            const nextCount = Math.min(stepPerFrame, points.length - 1 - index);
            for (let i = 0; i < nextCount; i++) {
                index++;
                const p = this.coordSystem.toPixel(points[index].x, points[index].y);
                ctx.lineTo(p.x, p.y);
            }
            ctx.stroke();
            ctx.shadowBlur = 0;

            requestAnimationFrame(drawSegment);
        };
        drawSegment();
    }

    checkHits(points) {
        let hits = [];
        this.targets.forEach((target, i) => {
            if (!target.hit && target.checkCollision(points)) {
                hits.push(target);
            }
        });

        if (this.mode === 'training') {
            const blueHit = hits.find(t => t.color === 'blue');
            const redHit = hits.find(t => t.color === 'red');

            if (blueHit && !redHit) {
                this.score += 100;
                this.startLevel(); // Respawn dot immediately
            } else {
                let failReason = "You missed the target!";
                if (redHit) failReason = "You hit an obstacle!";
                else if (blueHit && redHit) failReason = "You hit a target but also an obstacle!";

                // One Shot Miss / Obstacle Hit = Game Over
                if (this.score > this.highScore) {
                    this.highScore = this.score;
                    localStorage.setItem('graphWarHighScore', this.highScore);
                }
                setTimeout(() => {
                    alert(`GAME OVER: ${failReason}\nFinal Score: ${this.score}\nHigh Score: ${this.highScore}`);
                    this.resetGame();
                }, 100);
            }
        } else {
            // War Mode Scoring Logic
            let p1Gain = 0;
            let p2Gain = 0;
            let opponentHit = false;
            let selfHit = false;

            hits.forEach(target => {
                const isOpponent = (this.currentPlayer === 1 && target.color === 'red') || 
                                   (this.currentPlayer === 2 && target.color === 'blue');
                
                if (isOpponent) {
                    opponentHit = true;
                    if (this.currentPlayer === 1) p1Gain += 100;
                    else p2Gain += 100;
                } else {
                    selfHit = true;
                    if (this.currentPlayer === 1) p2Gain += 100; // Penalty
                    else p1Gain += 100; // Penalty
                }
                
                // Respawn this target
                const color = target.color;
                this.targets = this.targets.filter(t => t !== target);
                this.spawnTarget(color);
            });

            this.p1Score += p1Gain;
            this.p2Score += p2Gain;

            // Turn logic: Another turn ONLY if they hit opponent AND didn't hit themselves
            if (opponentHit && !selfHit) {
                this.anotherTurn = true;
                setTimeout(() => {
                    this.anotherTurn = false;
                    alert(`Great shot, Player ${this.currentPlayer}! Another turn granted.`);
                }, 100);
            } else {
                this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
                if (selfHit) {
                    setTimeout(() => alert(`Ouch! You hit your own color. Turn transferred.`), 100);
                }
            }
            this.updateTurnUI();
            
            // Win Condition Check
            if (this.p1Score >= 1000 || this.p2Score >= 1000) {
                const winner = this.p1Score >= 1000 ? 1 : 2;
                setTimeout(() => {
                    alert(`🎊 PLAYER ${winner} WINS! 🎊\nScore: ${winner === 1 ? this.p1Score : this.p2Score}`);
                    this.resetGame();
                }, 500);
            }
        }
        this.updateScoreUI();
    }

    animate() {
        this.coordSystem.draw();
        this.targets.forEach(t => t.draw(this.coordSystem));
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize game on load
window.addEventListener('load', () => {
    new GameController();
});
