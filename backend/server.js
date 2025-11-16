const express = require("express");
const cors = require("cors");
const pool = require("./db");


const app = express();


app.use(cors()); // ALLOW ALL ORIGINS
app.use(express.json());
// LOGIN API (plain text password)
app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    console.log("enter")
    try {
        // Check if user exists
        const result = await pool.query(
            'SELECT id,email, password, type, status FROM public.userdetails WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const user = result.rows[0];

        // Compare password (plain text)
        if (password !== user.password) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Success
        res.json({
            message: "Login successful",
            id: user.id,
            email: user.email,
            type: user.type,
            status: user.status
        });

    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// REGISTER API
app.post("/api/register", async (req, res) => {
    const { email, password, type } = req.body;

    try {
        const status = "active";
        // 1. Check if user already exists
        const existingUser = await pool.query(
            'SELECT email FROM public.userdetails WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }



        // 3. Insert user
        await pool.query(
            `INSERT INTO public.userdetails (email, password, type, status)
             VALUES ($1, $2, $3, $4)`,
            [email, password, type, status]
        );

        res.json({ message: "User registered successfully" });

    } catch (err) {
        console.error("Register Error:", err);
        res.status(500).json({ message: "Server error" });
    }
});
// Test API – fetch all rows from a table
app.get("/api/users", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM userdetails");
        res.json(result.rows);
    } catch (error) {
        console.error("DB Error:", error);
        res.status(500).send("Database error");
    }
});

// Fetch chat messages
app.get('/api/messages', async (req, res) => {
    try {
        const result = await pool.query(`
        SELECT m.id, m.message, m.createddate, u.email, u.type
        FROM messages m
        JOIN userdetails u ON m.userid = u.id
        ORDER BY m.createddate ASC
      `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Post new message
app.post('/api/messages', async (req, res) => {
    const { user_id, message } = req.body;

    if (!user_id || !message) {
        return res.status(400).json({ error: 'user_id and message are required' });
    }

    try {
        const result = await pool.query(
            "INSERT INTO messages (userid, message,createddate) VALUES ($1, $2, NOW()) RETURNING *",
            [user_id, message]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.listen(3000, () => console.log("Server running on port 3000"));
