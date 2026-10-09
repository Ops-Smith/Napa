const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const uploadsDir = path.join(__dirname, 'uploads', 'images');

async function restoreDatabase() {
    const client = new MongoClient(process.env.DB_URL);
    try {
        await client.connect();
        console.log("✅ Connected to MongoDB for restoration");

        const db = client.db(process.env.DB_NAME);
        const collection = db.collection("uploads");

        // Read all files in the uploads/images directory
        const files = fs.readdirSync(uploadsDir);

        for (const file of files) {
            const filePath = path.join(uploadsDir, file);
            const stats = fs.statSync(filePath);

            // Skip if it's a directory
            if (stats.isDirectory()) continue;

            // Check if this file already exists in the database to avoid duplicates
            const existing = await collection.findOne({ filename: file });
            if (existing) {
                console.log(`Skipping ${file}, already in DB.`);
                continue;
            }

            // Insert document metadata for the existing file
            await collection.insertOne({
                filename: file,
                originalname: file, // Defaulting to the hash name since original name isn't stored on disk
                mimetype: "image/jpeg", // Adjust if you uploaded png/etc, or leave as generic binary type
                size: stats.size,
                path: `app/uploads/images/${file}`,
                uploadedAt: stats.birthtime || new Date()
            });

            console.log(`Restored record for: ${file}`);
        }

        console.log("🎉 Database restoration complete!");
    } catch (err) {
        console.error("❌ Restoration error:", err);
    } finally {
        await client.close();
    }
}

restoreDatabase();