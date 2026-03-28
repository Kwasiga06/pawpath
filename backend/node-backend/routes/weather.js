const express = require('express');
const router = express.Router();    
const axios = require('axios');

router.get('/', async (req, res) => {
    const city = req.query.city || 'New York'; 

    if(!city) {
        return res.status(400).json({ error: 'City parameter is required' });
    }
    try {
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`);
        const temperature = response.data.main.temp;
        const weatherDescription = response.data.weather[0].description;

        let advice;
        if (temperature < 10) {
            advice = 'It\'s quite cold outside. Consider dressing warmly and limiting outdoor activities.';
        } else if (temperature >= 10 && temperature < 20) {
            advice = 'The weather is cool. A light jacket should be sufficient for outdoor activities.';
        } else if (temperature >= 20 && temperature < 30) {
            advice = 'The weather is pleasant. It\'s a great day for outdoor activities!';
        } else {
            advice = 'It\'s quite hot outside. Make sure to stay hydrated and avoid strenuous outdoor activities during peak heat hours.';
        }
        res.json({city, temp: temperature, weather: weatherDescription, advice});
    } catch (error) {
        console.error('Error fetching weather data:', error);
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});

module.exports = router;
