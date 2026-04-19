const express = require('express');
const path = require('path');
const app = express();
let PORT = process.env.PORT || 3000;

// Serve static files from the frontend directory
// Using absolute path resolution for robustness regardless of where the script is run from
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// Fallback to index.html for SPAs
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

function startServer(port) {
    const server = app.listen(port, () => {
        console.log(`\n🚀 Graph War Server is running!`);
        console.log(`🔗 Local: http://localhost:${port}`);
        console.log(`📂 Serving: ${frontendPath}`);
        console.log(`\nPress Ctrl+C to stop.\n`);
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`⚠️  Port ${port} is in use, trying ${port + 1}...`);
            startServer(port + 1);
        } else {
            console.error('❌ Server error:', err);
        }
    });
}

startServer(PORT);
