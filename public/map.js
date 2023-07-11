// Fetch earthquake data from the API endpoint
fetch('/api/earthquakes')
  .then(response => response.json())
  .then(data => {
    // Process the earthquake data and visualize it on the map
    visualizeEarthquakes(data);
  })
  .catch(error => console.error("Error fetching earthquake data:", error));

// Function to visualize the earthquake data on the map
function visualizeEarthquakes(data) {
  // Create a Leaflet map instance
  const map = L.map('map').setView([0, 0], 2);

  // Add a tile layer to the map
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    maxZoom: 18
  }).addTo(map);

  // Iterate over the earthquake data and add markers to the map
  data.features.forEach(earthquake => {
    const { coordinates } = earthquake.geometry;
    const { region, magnitude } = earthquake.properties;
    const [lng, lat] = coordinates;
    const marker = L.marker([lng, lat]).addTo(map);
    marker.bindPopup(`Region: ${region}<br/>Magnitude: ${magnitude}`).openPopup();
  });
}
