const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');

const https = require('node:https');
const http = require('http');
const fs = require('fs');

var options = {
    key: fs.readFileSync('/etc/nginx/conf.d/key.pem'),
    cert: fs.readFileSync('/etc/nginx/conf.d/cert.pem')
};

const app = express(options);
const port = 8000;


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

// Define a route to process GET requests for all elements in the database
app.get('/locations', async (req, res) => {
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
app.post('/locations', async (req, res) => {
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
app.delete('/locations/:id', async (req, res) => {
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

// Start the server
app.listen(port, () => {
    console.log(`Server is running on https://localhost:${port}`);
});
