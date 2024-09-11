const axios = require("axios");

async function getLocation(ipAddress) {
  try {
    const response = await axios.get(`http://api.ipstack.com/${ipAddress}?access_key=533476f6ad62a997fb723b86c846273f`);
    const { city, region_name, country_name } = response.data;

    // Format the location string based on the available data
    return `${city || "Unknown City"}, ${region_name || "Unknown Region"}, ${country_name || "Unknown Country"}`;
  } catch (error) {
    console.error("Error fetching location:", error.message);
    return "Unknown Location";
  }
}

module.exports = getLocation;
