# Graph War Clone: Competitive Math Mastery

A mathematical graphing game where you use the power of equations to eliminate targets on a coordinate plane. Transformed from a practice tool into a high-stakes competitive and skill-based challenge.

## 🚀 Quick Start
1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Start the Game**:
   ```bash
   npm start
   ```
3. **Open Browser**:
   Navigate to `http://localhost:3000`.

---

## 🎮 Game Modes

### ⚔️ War Mode (2-Player Competitive)
A turn-based battle of wits and geometry for two players.
- **Competitive Scoring**: 
  - **Player 1 (Blue)** scores by hitting **Red dots**.
  - **Player 2 (Red)** scores by hitting **Blue dots**.
  - **Penalty**: Hitting your own color awards points to your opponent!
- **Turns & Bonuses**: Players take turns. Hitting an opponent dot (without hitting your own) grants an **extra turn**.
- **Victory Condition**: The first player to reach **1000 points** wins.
- **Dynamic Arena**: Targets respawn immediately at random locations to keep the battlefield full.
- **Equation History**: Track your and your opponent's past moves in the real-time sidebar.

### 🎯 Training Room (One-Shot Challenge)
An endless high-score mode testing your precision and planning.
- **The Rule**: You only get **one draw** per target. 
- **The Goal**: Hit the **Blue target** to increase your score and streak.
- **Obstacles**: As your score grows, **Red obstacle dots** appear. Hitting a Red dot results in an immediate **GAME OVER**.
- **Persistence**: High scores are saved to your browser (`localStorage`) so you can always come back and beat your record.

---

## 🛠️ Features
- **Advanced Math Engine**: Powered by `math.js`, supporting functions like `sin(x)`, `cos(x)`, `sqrt(x)`, `abs(x)`, and more.
- **Interactive XY-Plane**: A responsive Coordinate System mapping mathematical points to high-fidelity Canvas graphics.
- **Cyberpunk Aesthetics**: Glassmorphism UI, glowing animations, and neon color palettes (Cyan vs Magenta).
- **History Sidebar**: Scrollable list of entered equations to analyze performance.

## 📁 Project Structure
- `/frontend`: HTML5 Canvas, Vanilla Javascript logic, and CSS3 animations.
- `/backend`: Node.js/Express server with dynamic port allocation.
- `package.json`: Project metadata and run scripts.

---

## 🏗️ Technical Specifications
- **Math Parsing**: `math.compile()` and `evaluate()` for safe execution of user-submitted strings.
- **Rendering**: Custom `CoordinateSystem` class handles coordinate-to-pixel mapping.
- **State Management**: Browser LocalStorage for persistent high scores without the need for a database.

---
&copy; 2026 Graph War. Built with ❤️ for Math lovers.