const express = require('express');
const axios = require('axios');

const mysql = require('mysql');

const app = express();
const port = 3000;
const path = require('path');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'civic_datalab',
});

app.get('/api/create', async (req, res) => {
  try {
    const response = await axios.get('https://data.bmkg.go.id/DataMKG/TEWS/gempadirasakan.json');
    const { gempa } = response.data.Infogempa;

    const earthquakeData = gempa.map((gempa) => [
      gempa.Tanggal,
      gempa.Jam,
      gempa.DateTime,
      gempa.Coordinates,
      gempa.Lintang,
      gempa.Bujur,
      parseFloat(gempa.Magnitude),
      gempa.Kedalaman,
      gempa.Wilayah,
      gempa.Dirasakan
    ]);

    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS earthquakes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      Date VARCHAR(15),
      Time VARCHAR(15),
      DateTime DATETIME,
      Coordinates VARCHAR(255),
      Latitude VARCHAR(255),
      Longitude VARCHAR(255),
      Magnitude FLOAT,
      Depth VARCHAR(255),
      Region TEXT,
      Felt TEXT
    )
  `;

     connection.query(createTableQuery, (err, result) => {
      if (err) {
        console.log(`Error creating table: ${err}`);
        res.status(500).json({ error: 'Failed to create table' });
      } else {
        // Insert the earthquake data into the 'earthquakes' table
       const insert = `
          INSERT INTO earthquakes (Date, Time, DateTime, Coordinates, Latitude, Longitude, Magnitude, Depth, Region, Felt)
          VALUES ?
        `;
        // Query to insert the data
        connection.query(insert, [earthquakeData], (err1, result) => {
          if (err) {
            console.log(`Error inserting data: ${err1}`);
            res.status(500).json({ error: 'Failed to insert earthquake data' });
          } else {
            res.json({message: `Data inserted successfully`});
            // Do not send the response here, remove the res.json() call
          }
        });
      }
    });
    res.json({ message: 'Table created or already exists', data_insertion: isDataInserted ? 'Data inserted successfully' : 'Error inserting data' });


  } catch (error) {
    console.log(`Error fetching earthquake data: ${error}`);
    res.status(500).json({ error: 'Failed to fetch earthquake data' });
  }
});

// api to show earthquakes data in json format
app.get('/api/earthquakes', (req, res) => {
  const selectQuery = 'SELECT * FROM earthquakes';
  connection.query(selectQuery, (err, rows) => {
    if (err) {
      res.json({error: `Error fetching earthquake data:${err}`});
      res.status(500).json({ error: 'Failed to fetch earthquake data' });
    } else {
      const geojsonData = {
        type: 'FeatureCollection',
        features: rows.map(earthquake => {
          const { Coordinates, Region, Magnitude } = earthquake;
          const [lng, lat] = Coordinates.split(',').map(coord => parseFloat(coord));
          return {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [lng, lat],
            },
            properties: {
              region: Region,
              magnitude: Magnitude,
            },
          };
        }),
      };
      res.json(geojsonData); // Send the GeoJSON earthquake data as a JSON response
    }
  });
});

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// adding the port
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

