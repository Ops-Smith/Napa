const express = require('express');
require("dotenv").config();
const multer = require('multer');
const { MongoClient } = require("mongodb");

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Client
let client;
async function connectDB() {
    try {
        client = new MongoClient(process.env.DB_URL);
        await client.connect();
        console.log("✅ Connected to MongoDB");
    } catch (err) {
        console.error("❌ MongoDB connection error:", err);
        process.exit(1);
    }
}

// Multer for uploads
const upload = multer({ dest: __dirname + '/uploads/images' });

// Static frontend
app.use(express.static('public'));

// Upload route
app.post('/upload', upload.single('photo'), async (req, res) => {
    if (req.file) {
        try {
            await client.db(process.env.DB_NAME).collection("uploads").insertOne({
                filename: req.file.filename,
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size,
                path: req.file.path,
                uploadedAt: new Date()
            });

            res.json({
                message: "✅ File uploaded successfully",
                file: req.file
            });
        } catch (err) {
            console.error("❌ Mongo insert error:", err);
            res.status(500).json({ error: "Database insert failed" });
        }
    } else {
        res.status(400).json({ error: "No file uploaded" });
    }
});

// Start server
app.listen(PORT, async () => {
    await connectDB();
    console.log(`🚀 Napa app listening at http://localhost:${PORT}`);
});
