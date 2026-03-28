const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.array('images', 4), async (req, res) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Create a FormData object to send the file to the Flask server
        const formData = new FormData();
        req.files.forEach(file => {
            formData.append('files', file.buffer, file.originalname);
        });

        // Send the file to the Flask server
        const response = await axios.post('http://localhost:8000/upload', formData, {
            headers: formData.getHeaders(),
        });

        // Return the response from the Flask server to the client
        res.json(response.data);
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
});

module.exports = router;