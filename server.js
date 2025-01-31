require('dotenv').config();  // Ensure this is at the top
console.log("MongoDB URI:", process.env.MONGO_URI);

process.on('uncaughtException', (err) => {
  console.error(`Uncaught Exception: ${err.message}`);
  process.exit(1); // Exit the process after logging the error
});

const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors");
const path = require("path");
const bcrypt = require('bcryptjs');  // Import bcrypt for password hashing

const app = express();
const User = require('./models/User'); // Ensure correct path
app.use(cors());
const port = process.env.PORT || 5000;
const mongourl = process.env.MONGO_URI || "mongodb://localhost:27017/Practise";

// Middleware
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000' }));

// Create default admin user if not exists
const createDefaultAdmin = async () => {
  try {
    const defaultAdmin = await User.findOne({ email: 'admin@example.com' });

    if (!defaultAdmin) {
      const hashedPassword = await bcrypt.hash('adminpassword', 10); // Hash password

      const admin = new User({
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,  // Store hashed password
        isAdmin: true,
      });

      await admin.save();
      console.log('Default admin user created');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};

// Connect to MongoDB and Start Server
mongoose
  .connect(mongourl)
  .then(async () => {
    console.log("Connected to database");

    await createDefaultAdmin(); // Ensures admin creation happens after connection

    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  })
  .catch((error) => console.error("Error connecting to MongoDB:", error));

// Import Routes
const usersRoute = require('./routes/usersRoute');
const artistsRoute = require('./routes/artistsRoute');
const imagesRoute = require('./routes/imagesRoute');
const moviesRoute = require('./routes/moviesRoute');
const reviewsRoute = require('./routes/reviewsRoute');
const filtersRoute = require('./routes/filtersRoute');

// Use Routes
app.use('/api/users', usersRoute);
app.use('/api/artists', artistsRoute);
app.use('/api/images', imagesRoute);
app.use('/api/movies', moviesRoute);
app.use('/api/reviews', reviewsRoute);
app.use('/api/filters', filtersRoute);

// Test Route
app.get("/test", (req, res) => {
  res.send("Server is working!");
});

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client", "build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
  });
}

console.log("JWT Key:", process.env.JWT_SECRET); // Print JWT key to verify



