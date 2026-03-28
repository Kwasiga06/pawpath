const express = require('express');
const router = express.Router();

// Get all dogs
router.get('/', (req, res) => {
    res.json({ message: 'Get all dogs' });
});

// Create a new dog
router.post('/', (req, res) => {
    const newDog = req.body;
    res.json({ message: 'Create a new dog', dog: newDog });
});

// Get a specific dog by ID
router.get('/:id', (req, res) => {
    const dogId = req.params.id;
    res.json({ message: `Get dog with ID ${dogId}` });
});

// Update a dog by ID
router.put('/:id', (req, res) => {
    const dogId = req.params.id;
    const updatedDog = req.body;
    res.json({ message: `Update dog with ID ${dogId}`, dog: updatedDog });
});

// Delete a dog by ID
router.delete('/:id', (req, res) => {
    const dogId = req.params.id;
    res.json({ message: `Delete dog with ID ${dogId}` });
});



module.exports = router;

