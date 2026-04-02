const express = require('express');
const mysql = require('mysql2');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));
app.use(express.json());

// MySQL Connection (Update with your credentials)
const db = mysql.createPool('mysql://root:XmqXlcOFLoFoQHpWvLEtyvNHzSowRNww@interchange.proxy.rlwy.net:10687/railway');

// Function to get latest stats
const getStats = () => {
    return new Promise((resolve, reject) => {
        db.query("SELECT singer_name, COUNT(*) as votes FROM votes GROUP BY singer_name", (err, results) => {
            if (err) reject(err);
            resolve(results);
        });
    });
};

// Handle Voting
app.post('/api/vote', async (req, res) => {
    const { name, erp, year, singer } = req.body;
    const sql = "INSERT INTO votes (student_name, erp_id, batch_year, singer_name) VALUES (?, ?, ?, ?)";
    
    db.query(sql, [name, erp, year, singer], async (err, result) => {
        if (err) return res.status(400).json({ error: "Already voted or Invalid ID" });
        
        // Broadcast new results to everyone instantly
        const stats = await getStats();
        io.emit('refresh_results', stats);
        res.json({ message: "Vote Casted!" });
    });
});

server.listen(3000, () => console.log('Server live on http://localhost:3000'));
