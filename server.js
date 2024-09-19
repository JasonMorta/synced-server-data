// server.js

import express from 'express';
import axios from 'axios';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json()); // To parse JSON bodies

const PORT = process.env.PORT || 3005;

// In-memory storage for Pokémon
let pokemons = [];

/**
 * Function to fetch Pokémon data from PokéAPI
 */
const fetchPokemons = async () => {
  try {
    const pokemonIds = [1, 4, 7, 25, 39]; // Example Pokémon IDs
    const promises = pokemonIds.map(id =>
      axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`)
    );

    const responses = await Promise.all(promises);
    pokemons = responses.map(response => ({
      id: response.data.id,
      name: response.data.name,
      image: response.data.sprites.front_default,
      powerLevel: Math.floor(Math.random() * 100), // Initialize with a random power level
    }));

    console.log('Pokémon data fetched and stored on server.');
  } catch (error) {
    console.error('Error fetching Pokémon data:', error);
  }
};

// Fetch Pokémon data on server start
fetchPokemons();

/**
 * API Route: Get all Pokémon
 */
app.get('/api/pokemons', (req, res) => {
  res.json(pokemons);
});

/**
 * API Route: Update a Pokémon's power level
 */
app.post('/api/pokemons/:id/power', (req, res) => {
  const pokemonId = parseInt(req.params.id);
  const { change } = req.body; // change should be +1 or -1

  const pokemon = pokemons.find(p => p.id === pokemonId);
  if (pokemon) {
    pokemon.powerLevel += change;
    // Ensure powerLevel doesn't go below 0
    if (pokemon.powerLevel < 0) pokemon.powerLevel = 0;

    res.json({ success: true, pokemon });
  } else {
    res.status(404).json({ success: false, message: 'Pokémon not found' });
  }
});

/**
 * Serve static files from the "public" directory
 * This should be defined AFTER all API routes to prevent API requests from being served as static files
 */
app.use(express.static(path.join(__dirname, 'public')));

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
