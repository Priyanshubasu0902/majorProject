//server/utils/geocode.js
import axios from "axios";

export const geocodeAddress = async (address) => {
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${process.env.GEOCODE_KEY}`;

  const res = await axios.get(url);

  const loc = res.data.results[0].geometry;

  return {
    lat: loc.lat,
    lng: loc.lng
  };
};