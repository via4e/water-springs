// app.js

const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;

// Secret key for signing and verifying JWTs
const secretKey = 'your-secret-key';

// Middleware to verify JWT for protected routes
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: Token missing' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }

        req.user = decoded;
        next();
    });
};

// Sequelize Initialization
const sequelize = new Sequelize('fh7927za_springs', 'fh7927za_springs', '*DpffJ3A', {
    host: 'fh7927za.beget.tech',
    dialect: 'mariadb',
});

// Define a model for your data
const Location = sequelize.define('Location', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    longitude: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    latitude: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    tooltip: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    date: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    author: {
        type: DataTypes.STRING,
        allowNull: true,
    },
});

// Synchronize the model with the database
sequelize.sync()
    .then(() => {
        console.log('Database synchronized');
    })
    .catch((err) => {
        console.error('Error synchronizing database: ', err);
    });

// Define a route to process GET requests for all locations
app.get('/locations', verifyToken, async (req, res) => {
    try {
        // Query all locations from the database
        const locations = await Location.findAll();

        // Send the query result as JSON response
        res.json(locations);
    } catch (err) {
        console.error('Error: ', err);
        res.status(500).send('Internal Server Error');
    }
});

// Define a route to process POST requests for adding a location
app.post('/locations', verifyToken, async (req, res) => {
    try {
        // Extract location data from the request body (adjust as needed)
        const { name, longitude, latitude, tooltip, author } = req.body;

        // Create a new location in the database
        const newLocation = await Location.create({
            name,
            longitude,
            latitude,
            tooltip,
            author,
        });

        // Send the newly created location as JSON response
        res.json(newLocation);
    } catch (err) {
        console.error('Error: ', err);
        res.status(500).send('Internal Server Error');
    }
});

// Define a route to process DELETE requests for deleting a location by ID
app.delete('/locations/:id', verifyToken, async (req, res) => {
    try {
        const locationId = req.params.id;

        // Delete the location from the database
        const deletedLocation = await Location.destroy({
            where: {
                id: locationId,
            },
        });

        if (deletedLocation) {
            res.json({ message: 'Location deleted successfully' });
        } else {
            res.status(404).json({ message: 'Location not found' });
        }
    } catch (err) {
        console.error('Error: ', err);
        res.status(500).send('Internal Server Error');
    }
});

// Define a route for user authentication
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Validate user credentials (adjust as needed)
    if (username === 'user' && password === 'password') {
        // Generate a JWT token
        const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });

        // Send the token as JSON response
        res.json({ token });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});