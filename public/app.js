// app.js

// const { deepEqual } = require("./deepCompare");


/**
 * This script manages the client-side functionality of the Pokémon Power Levels application.
 * It handles fetching Pokémon data from the server, rendering the UI, updating power levels,
 * and ensuring synchronization across multiple clients by polling the server every 5 seconds.
 */

/**
 * Selects the container element where Pokémon cards will be displayed.
 * This assumes there's an element with the ID 'pokemon-container' in your HTML.
 */
const pokemonContainer = document.getElementById('pokemon-container');

/**
 * Local state to store the current Pokémon data.
 * This array holds the latest known state of each Pokémon as fetched from the server.
 * It's used to compare against new data to detect changes and update the UI accordingly.
 */
let localPokemons = [];

/**
 * Creates a Pokémon card element.
 * @param {Object} pokemon - The Pokémon object containing id, name, image, and other properties.
 * @returns {HTMLElement} - A div element representing the Pokémon card.
 *
 * The card includes:
 * - An image of the Pokémon.
 * - The Pokémon's name.
 * - The current power level.
 * - Increase and Decrease buttons to modify the power level.
 */
const createPokemonCard = (pokemon) => {
  // Create a div element to serve as the card container
  const card = document.createElement('div');
  card.className = 'pokemon-card'; // Assign CSS class for styling
  card.id = `pokemon-${pokemon.id}`; // Unique ID based on Pokémon's ID

  // Populate the card's inner HTML with Pokémon details and action buttons
  card.innerHTML = `
    <img src="${pokemon.image}" alt="${pokemon.name}">
    <div class="pokemon-name">${pokemon.name}</div>
    <div class="power-level">
      Power Level: <span id="power-${pokemon.id}">${pokemon.powerLevel}</span>
    </div>
    <div class="buttons">
      <button class="increase-btn" data-id="${pokemon.id}">Increase</button>
      <button class="decrease-btn" data-id="${pokemon.id}">Decrease</button>
    </div>
  `;

  return card; // Return the constructed card element
};

/**
 * Renders all Pokémon cards on the page.
 * This function is primarily used during the initial load to display all Pokémon.
 * @param {Array} pokemons - An array of Pokémon objects fetched from the server.
 */
const renderPokemons = (pokemons) => {
  pokemonContainer.innerHTML = ''; // Clear any existing content in the container
  pokemons.forEach(pokemon => {
    const card = createPokemonCard(pokemon); // Create a card for each Pokémon
    pokemonContainer.appendChild(card); // Append the card to the container
  });
};

/**
 * Updates the Pokémon card in the UI based on the updated Pokémon object.
 * @param {Object} updatedPokemon - The Pokémon object containing updated properties.
 */
const updatePokemonUI = (updatedPokemon) => {
  // Select the Pokémon card by its unique ID
  const card = document.getElementById(`pokemon-${updatedPokemon.id}`);
  if (card) {
    // Update the power level
    const powerSpan = card.querySelector(`#power-${updatedPokemon.id}`);
    if (powerSpan) {
      powerSpan.textContent = updatedPokemon.powerLevel;
    }

    // Update other properties if they exist (e.g., name, image)
    const nameDiv = card.querySelector('.pokemon-name');
    if (nameDiv && updatedPokemon.name !== nameDiv.textContent) {
      nameDiv.textContent = updatedPokemon.name;
    }

    const img = card.querySelector('img');
    if (img && updatedPokemon.image !== img.src) {
      img.src = updatedPokemon.image;
      img.alt = updatedPokemon.name;
    }

    // Add more property updates here as your application grows
  }
};



/**
 * Handles the logic for changing a Pokémon's power level.
 * This function is triggered when a user clicks the Increase or Decrease button.
 * @param {number} id - The unique ID of the Pokémon to update.
 * @param {number} change - The amount to change the power level by (+1 or -1).
 *
 * The function sends a POST request to the server to update the power level.
 * Upon a successful update, it updates the UI and the local state.
 */
const changePower = async (id, change) => {
  try {
    // Send a POST request to the server to update the Pokémon's power level
    const response = await fetch(`/api/pokemons/${id}/power`, {
      method: 'POST', // HTTP method for updating data
      headers: { 'Content-Type': 'application/json' }, // Specify JSON content
      body: JSON.stringify({ change }), // Send the change value in the request body
    });

    // Check if the response is OK (status code 200-299)
    if (!response.ok) {
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }

    // Parse the JSON response from the server
    const result = await response.json();

    if (result.success) {
      // If the server confirms a successful update:

      // Update the power level in the UI immediately
      updatePokemonUI(result.pokemon);

      // Find the index of the updated Pokémon in the local state array
      const index = localPokemons.findIndex(p => p.id === result.pokemon.id);
      if (index !== -1) {
        // Compare entire objects using deepEqual
        if (!isEqual(localPokemons[index], result.pokemon)) {
          // Update the localPokemons array with the new Pokémon object
          localPokemons[index] = result.pokemon;
        }
      }

      // Optional: Provide user feedback (e.g., using Toastr)
      // toastr.success(`${result.pokemon.name} power level updated to ${result.pokemon.powerLevel}`);
    } else {
      // If the server returns an error (e.g., Pokémon not found), alert the user
      alert(result.message);
    }
  } catch (error) {
    // Log any network or unexpected errors to the console
    console.error('Error updating power level:', error);
    // Optional: Provide user feedback
    alert('Failed to update power level. Please try again.');
  }
};

/**
 * Fetches the latest Pokémon data from the server.
 * This function is called initially and then periodically every 5 seconds.
 * It compares the fetched data with the local state to detect changes.
 */
const fetchPokemons = async () => {
  try {
    // Show loading indicator if implemented
    // loadingIndicator.style.display = 'block';

    // Send a GET request to fetch all Pokémon data
    const response = await fetch('/api/pokemons');

    // Check if the response is OK (status code 200-299)
    if (!response.ok) {
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json(); // Parse the JSON response

    if (!localPokemons.length) {
      // If localPokemons is empty, this is the initial load
      localPokemons = data; // Populate the local state with fetched data
      renderPokemons(data); // Render all Pokémon cards on the UI
    } else {
      // For subsequent fetches, compare each Pokémon's entire object
      data.forEach((serverPokemon) => {
        // Find the corresponding Pokémon in the local state
        const localPokemon = localPokemons.find(p => p.id === serverPokemon.id);
        if (localPokemon) {
          // If the entire object differs, update the UI and local state
          if (!isEqual(localPokemon, serverPokemon)) {
            // Update the UI to reflect the new Pokémon data
            updatePokemonUI(serverPokemon);

            // Update the localPokemons array with the new Pokémon object
            localPokemons[localPokemons.indexOf(localPokemon)] = serverPokemon;
          }
        } else {
          // If the Pokémon is new, add it to the UI and local state
          localPokemons.push(serverPokemon);
          const card = createPokemonCard(serverPokemon);
          pokemonContainer.appendChild(card);
        }
      });

      // Optionally, handle removed Pokémon
      localPokemons.forEach((localPokemon) => {
        const exists = data.find(p => p.id === localPokemon.id);
        if (!exists) {
          // Remove from local state
          localPokemons = localPokemons.filter(p => p.id !== localPokemon.id);

          // Remove from UI
          const card = document.getElementById(`pokemon-${localPokemon.id}`);
          if (card) {
            pokemonContainer.removeChild(card);
          }
        }
      });
    }
  } catch (error) {
    // Log any errors encountered during the fetch operation
    console.error('Error fetching Pokémon data:', error);
  } finally {
    // Hide loading indicator if implemented
    // loadingIndicator.style.display = 'none';
  }
};

/**
 * Attaches a single event listener to handle all button clicks using event delegation.
 */
pokemonContainer.addEventListener('click', (event) => {
  const target = event.target;

  // Check if the clicked element is an Increase button
  if (target.classList.contains('increase-btn')) {
    const id = parseInt(target.getAttribute('data-id'));
    changePower(id, +1);
  }

  // Check if the clicked element is a Decrease button
  if (target.classList.contains('decrease-btn')) {
    const id = parseInt(target.getAttribute('data-id'));
    changePower(id, -1);
  }
});

/**
 * Initiates the first fetch to load Pokémon data when the page loads.
 * This ensures that the UI is populated with the latest data from the server.
 */
fetchPokemons();

/**
 * Sets up a polling mechanism to fetch Pokémon data every 5 seconds.
 * This ensures that the UI stays updated with any changes made by other clients.
 */
setInterval(fetchPokemons, 5000);
