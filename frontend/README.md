# Frontend Documentation - Graph War Clone

The frontend is built using Vanilla JavaScript and HTML5 Canvas. It utilizes `math.js` for safe mathematical expression evaluation and `localStorage` for state persistence.

## Class Architecture

### `CoordinateSystem`
Responsible for the visual representation of the Cartesian plane.
- **Properties**: `canvas`, `ctx`, boundaries (`minX`, `maxX`, `minY`, `maxY`).
- **Methods**:
    - `resize()`: Syncs canvas pixels with CSS dimensions.
    - `toPixel(x, y)`: Maps a coordinate point to a pixel on the canvas.
    - `toCoord(px, py)`: Maps a pixel back to a coordinate.
    - `draw()`: Renders the grid lines, axes, and labels.

### `Target`
Represents the dots that the player must hit.
- **Properties**: `x`, `y` (coordinates), `color` (blue/red), `radius`, `hit` (state).
- **Methods**:
    - `draw(coordSystem)`: Renders the dot with a glowing pulse effect.
    - `checkCollision(graphPoints)`: Checks if any graph point is within the hit threshold (0.5 units).

### `GameController`
The central engine managing game state, UI, and logic flows.
- **State Properties**:
    - `mode`: Currently 'training' or 'war'.
    - `score` / `highScore`: Training mode streak tracking.
    - `p1Score` / `p2Score`: Competitive 2-player scores for War Mode.
    - `currentPlayer`: Tracking active turn (P1/P2) in War Mode.
    - `history`: Array of previous equations entered in the current session.
- **Key Methods**:
    - `setupUI()`: Initializes DOM references and event listeners.
    - `resetGame()`: Clears state and starts a fresh session for the active mode.
    - `startLevel()`: 
        - **Training**: Spawns 1 Blue target and multiple Red obstacles based on score.
        - **War**: Spawns 4 Blue and 4 Red targets with respawning logic.
    - `handlePlot()`: Compiles equations via `math.js` and validates output points.
    - `checkHits(points)`: 
        - **Training (One-Shot)**: Implements "Hit Blue but avoid Red" logic. Missing or hitting Red ends the game.
        - **War (PvP)**: Implements cross-color scoring and "Bonus Turn" mechanics.
    - `updateHistoryUI()` / `updateScoreUI()` / `updateTurnUI()`: Maintains UI sync with game state.

## Tech Stack
- **HTML5 Canvas**: For performant plotting.
- **math.js**: Safe and robust mathematical expression compilation.
- **LocalStorage**: Client-side data persistence for high scores.
- **Glassmorphism (CSS)**: Premium visual design with backdrop filters and glowing neon accents.
