const express = require('express');
const router = express.Router();

// Get all appointments
router.get('/', (req, res) => {
    res.json({ message: 'Get all appointments' });
});

// Create a new appointment 
router.post('/', (req, res) => {
    const newAppointment = req.body;
    res.json({ message: 'Create a new appointment', appointment: newAppointment });
});

// Get a specific appointment by ID
router.get('/:id', (req, res) => {
    const appointmentId = req.params.id;
    res.json({ message: `Get appointment with ID ${appointmentId}` });
});

// Update an appointment by ID
router.put('/:id', (req, res) => {
    const appointmentId = req.params.id;
    const updatedAppointment = req.body;
    res.json({ message: `Update appointment with ID ${appointmentId}`, appointment: updatedAppointment });
});

// Delete an appointment by ID
router.delete('/:id', (req, res) => {
    const appointmentId = req.params.id;
    res.json({ message: `Delete appointment with ID ${appointmentId}` });
});

module.exports = router;