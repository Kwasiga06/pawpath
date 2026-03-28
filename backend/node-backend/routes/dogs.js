const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');    

// Get all dogs
router.get('/', async(req, res) => {
    const {data, error} = await supabase.from('dogs').select('*');
    if (error) {
        console.error('Error fetching dogs:', error);
        return res.status(500).json({ error: 'Failed to fetch dogs' });
    }
    res.json(data);
});

// Create a new dog
router.post('/', async (req, res) => {
    const {data, error} = await supabase.from('dogs').insert(req.body).select();
    if (error) {
        console.error('Error creating dog:', error);
        return res.status(500).json({ error: 'Failed to create dog' });
    }
    res.json(data);
});

// Get a specific dog by ID
router.get('/:id', async (req, res) => {
    const {data, error} = await supabase.from('dogs').select('*').eq('id', req.params.id).single();
    if (error) {
        console.error('Error fetching dog:', error);
        return res.status(500).json({ error: 'Failed to fetch dog' });
    }
    res.json(data);
});

// Update a dog by ID
router.put('/:id', async (req, res) => {
    const {data, error} = await supabase.from('dogs').update(req.body).eq('id', req.params.id).select();
    if (error) {
        console.error('Error updating dog:', error);
        return res.status(500).json({ error: 'Failed to update dog' });
    }
    res.json(data);
});

// Delete a dog by ID
router.delete('/:id', async (req, res) => {
    const { error } = await supabase.from('dogs').delete().eq('id', req.params.id);
    if (error) {
        console.error('Error deleting dog:', error);
        return res.status(500).json({ error: 'Failed to delete dog' });
    }
    res.json({ message: `Dog with ID ${req.params.id} deleted successfully` });
});



module.exports = router;

