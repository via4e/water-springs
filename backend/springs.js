const path = require('node:path');
const config = require('./config/config.json');
console.log(config.server_version)

const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');

const https = require('node:https');

const fs = require('fs');
const cors = require('cors')



//const fileUpload = require('express-fileupload');

const multer = require('multer');
const upload = multer({ limits: { fileSize: 24 * 1024 * 1024 } });



const jwt = require('jsonwebtoken');

var options = {
    key: fs.readFileSync('/etc/letsencrypt/live/patrioty-rodiny.ru/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/patrioty-rodiny.ru/fullchain.pem')
};

const maxRequestBodySize = '24mb';
const app = express(options);
app.use(cors())
app.use(express.json({limit: maxRequestBodySize}));

const port = config.server_port;

const server = https.createServer(options, app);

// Secret key for signing and verifying JWTs
const secretKey = 'Q43t0KFE2W4757bngjyfqeFFHH';

// Middleware to verify JWT for protected routes
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    console.log('authorization header', req.headers['authorization'])

    console.log('jwt verify', token )

    console.log('jwt decode', jwt.decode(token) )

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
const sequelize = new Sequelize(config.dbname, config.dbuser, config.dbpassword, {
    host: config.dbhost,
    dialect: config.dbdialect,
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
    main_image: {
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

// Define a route to image upload
app.post('/upload', upload.single('image'), (req, res) => {

    console.warn('UPLOAD>>>>img:::', req.body.payload );

    if (!req.body.image) {
        return res.status(400).send('No file uploaded');
    }

    // Access the uploaded image data
    const imageFilename = req.body.payload.main_image
    const imageData = req.body.image.image;
    const imageBuffer = Buffer.from(imageData.replace(/^data:image\/\w+;base64,/, ''), 'base64');

    fs.writeFile(path.resolve( '../patrioty/images/' + imageFilename ), imageBuffer, (err) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
        } else {
            res.status(200).send('Image uploaded successfully');
        }
    });
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

// Define a route for user authentication
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Validate user credentials (adjust as needed)
    if (username === 'bulat' && password === 'bulat') {
        // Generate a JWT token
        const token = jwt.sign({ username }, secretKey, { expiresIn: '48h' });

        // Send the token as JSON response
        res.json({ token });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

// Define a route to process POST requests for adding a location
app.post('/locations', async (req, res) => {

    //console.log('new spring req.body:>', req.body)

    try {
        // Extract location data from the request body (adjust as needed)
        const { name, longitude, latitude, tooltip, author, main_image } = req.body;

        // Create a new location in the database
        const newLocation = await Location.create({
            name,
            longitude,
            latitude,
            tooltip,
            author,
            main_image
        });

        // Send the newly created location as JSON response
        res.json(newLocation);
    } catch (err) {
        console.error('Error: ', err);
        res.status(500).send('Internal Server Error');
    }
});

// Define a route to process DELETE requests for deleting a location by ID
// TODO : app.delete('/locations/:id', verifyToken, async (req, res) => {
app.delete('/locations/:id', async (req, res) => {
    try {
        const locationId = (req.params.id).slice(1);
        console.log ('delete id:', locationId)
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

app.patch('/locations/:id', async (req, res) => {
    try {
        const locationId = (req.params.id).slice(1);
        const updatedLocationData = req.body; // Assuming the updated data is sent in the request body
        console.log('************');
        console.log('************');
        console.log('a', updatedLocationData)
        // Update the location in the database

        Location.update(
            {   name: req.body.name,
                longitude: req.body.longitude,
                latitude: req.body.latitude,
                tooltip: req.body.tooltip,
                main_image: req.body.main_image
            },
            { where: { id: locationId } })
            .then(function(rowsUpdated) {
                res.json(rowsUpdated)
            })
    } catch (err) {
        console.error('Error: ', err);
        res.status(500).send('Internal Server Error');
    }
});

// Start the server
server.listen(port, () => {
    console.log(`Server is running on https://localhost:${port}`);
});
