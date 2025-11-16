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
            'SELECT email, password, type, status FROM public.userdetails WHERE email = $1',
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
app.get("/users", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM userdetails");
        res.json(result.rows);
    } catch (error) {
        console.error("DB Error:", error);
        res.status(500).send("Database error");
    }
});

app.listen(3000, () => console.log("Server running on port 3000"));
