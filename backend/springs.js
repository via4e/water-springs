const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
const port = 3000;


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

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
