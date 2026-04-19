# Backend Documentation - Graph War Clone

This backend is a lightweight Node.js server powered by Express. Its primary responsibility is to serve the frontend assets and provide a foundation for any future server-side features (like leaderboards).

## Specifications

### Environment
- **Runtime**: Node.js
- **Framework**: Express.js
- **Port**: Default 3000 (Uses a fallback strategy to find the next available port if 3000 is occupied)

### Server Structure
The server logic is contained within `server.js`.

#### Static Asset Serving
- Uses `express.static` to serve files from the `../frontend` directory.
- This includes `index.html`, `style.css`, and `app.js`.

#### Routing
- **Wildcard Route (`*`)**: Implements a fallback to `index.html` to support client-side navigation if added in the future.

## How to Run
1. Ensure you have Node.js installed.
2. Run `npm install` in the root directory.
3. Run `npm start`.
4. Navigate to `http://localhost:3000`.
