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
      new Date(gempa.DateTime).toISOString().slice(0, 19).replace('T', ' '),
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
        const totalDataQuery = `SELECT DateTime FROM earthquakes`;
        connection.query(totalDataQuery, (err2, existingData) => {
          if (err2) {
            console.log(`Error fetching existing earthquake data: ${err2}`);
            res.status(500).json({ error: 'Failed to fetch existing earthquake data' });
          } else {
            let finaldata = earthquakeData;

            existingData.forEach((element) => {
              finaldata = finaldata.filter((earthquake) => {
                return new Date(earthquake[2]).toString() !== new Date(element.DateTime).toString();
              });
            });
            //inserting data to the table earthquakes
            const insert = `
              INSERT INTO earthquakes (Date, Time, DateTime, Coordinates, Latitude, Longitude, Magnitude, Depth, Region, Felt)
              VALUES ?
            `;
            //checking whether there is any new data which needs to be inserted to database
            if (finaldata.length > 0) {
              connection.query(insert, [finaldata], (err1, result) => {
                if (err1) {
                  console.log(`Error inserting data: ${err1}`);
                  res.status(500).json({ error: 'Failed to insert earthquake data' });
                } else {
                  res.json({ message: 'Data inserted successfully' });
                }
              });
            } else {
              res.json({ message: 'There is no new data to be added' });
            }
          }
        });
      }
    });
  } catch (error) {
    console.log(`Error fetching earthquake data: ${error}`);
    res.status(500).json({ error: 'Failed to fetch earthquake data' });
  }
});

// function compareData(earthQuakeData={}, dbData={}) {
//   return earthQuakeData.DateTime === dbData.DateTime;
// }

// api to show earthquakes data in json format
app.get('/api/earthquakes', (req, res) => {
  const selectQuery = 'SELECT * FROM earthquakes';
  connection.query(selectQuery, (err, rows) => {
    if (err) {
      res.json({ error: `Error fetching earthquake data:${err}` });
      res.status(500).json({ error: 'Failed to fetch earthquake data' });
    } else {
      const geojsonData = {
        type: 'FeatureCollection',
        features: rows.map(earthquake => {
          // console.log("rowwwww",row);
          console.log("earthquake", earthquake);

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

