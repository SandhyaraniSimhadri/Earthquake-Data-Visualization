# Earthquake Data Visualization

This project is a web application that fetches earthquake data from an API, stores it in a MySQL database, and visualizes the data on a Leaflet map. The application is built using Express.js for the backend, MySQL for database storage, and Leaflet for map visualization.

## Installation

To run this project locally, follow the steps below:

1. Clone the repository:
```bash
git clone https://github.com/SandhyaraniSimhadri/Earthquake-Data-Visualization.git
```

2. Navigate to the project directory:
```bash
cd earthquake-data-visualization
```

3. Install the dependencies using npm or yarn:
```bash
npm install or yarn install
```


4. Set up the MySQL database:
- Make sure you have MySQL installed and running on your local machine.
- Create a new database called `civic_datalab` (or choose a different name) in MySQL.
- Update the MySQL connection configuration in `index.js` to match your MySQL settings. Modify the `host`, `user`, `password`, and `database` fields in the `mysql.createConnection` function call.

5. Run the application:
```bash
node index.js
```


6. Open your web browser and access the application at `http://localhost:3000`.

## Usage

- Click on the "Create Table & Insert API Data" link on the home page to fetch earthquake data from the API, create a table in the MySQL database (if it doesn't already exist), and insert the data into the table.
- Click on the "Show the map" link on the home page to view the earthquake data visualized on a Leaflet map.

## Directory Structure

- `index.js`: The main server file that handles API routes, MySQL database connection, and server setup.
- `public/index.html`: The HTML file for the home page with links to create the table and show the map.
- `public/map.html`: The HTML file for the map page that displays the Leaflet map.
- `public/map.js`: The JavaScript file that fetches earthquake data from the API and visualizes it on the Leaflet map.

## Dependencies

- Express.js: Fast, unopinionated, minimalist web framework for Node.js.
- axios: Promise-based HTTP client for the browser and Node.js.
- mysql: MySQL client for Node.js.
- leaflet: JavaScript library for interactive maps.
- leaflet.css: CSS file for styling the Leaflet map.

**Note:** Make sure you have an active internet connection to fetch earthquake data from the API.
