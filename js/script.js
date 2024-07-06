// script.js

// Global variables
const baseUrl = 'https://pokeapi.co/api/v2/pokemon';
let currentPage = 1;
const pokemonPerPage = 10;
let totalPokemon = 0;

// DOM elements
const appContainer = document.getElementById('app');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const resetBtn = document.getElementById('resetBtn');

// Event listeners
searchBtn.addEventListener('click', searchPokemon);
prevBtn.addEventListener('click', () => changePage(-1));
nextBtn.addEventListener('click', () => changePage(1));
resetBtn.addEventListener('click', resetPokedex);

// Initialize the Pokedex
initPokedex();

async function initPokedex() {
    try {
        const response = await fetch(`${baseUrl}?limit=1&offset=0`);
        const data = await response.json();
        totalPokemon = data.count;
        loadPokemonPage(currentPage);
    } catch (error) {
        showError('Failed to initialize Pokedex');
    }
}

async function loadPokemonPage(page) {
    try {
        const offset = (page - 1) * pokemonPerPage;
        const response = await fetch(`${baseUrl}?limit=${pokemonPerPage}&offset=${offset}`);
        const data = await response.json();
        displayPokemon(data.results);
        updatePaginationButtons();
    } catch (error) {
        showError('Failed to load Pokemon');
    }
}

function displayPokemon(pokemonList) {
    appContainer.innerHTML = '';
    pokemonList.forEach(async (pokemon) => {
        try {
            const response = await fetch(pokemon.url);
            const data = await response.json();
            const pokemonCard = createPokemonCard(data);
            appContainer.appendChild(pokemonCard);
        } catch (error) {
            showError(`Failed to load details for ${pokemon.name}`);
        }
    });
}

function createPokemonCard(pokemon) {
    const card = document.createElement('div');
    card.classList.add('pokemon-card');
    card.innerHTML = `
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
        <h3>${pokemon.name}</h3>
        <p>ID: ${pokemon.id}</p>
        <p>Type: ${pokemon.types.map(type => type.type.name).join(', ')}</p>
    `;
    card.addEventListener('click', () => toggleFavorite(pokemon));
    updateFavoriteStatus(card, pokemon.id);
    return card;
}

function updatePaginationButtons() {
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage >= Math.ceil(totalPokemon / pokemonPerPage);
}

function changePage(direction) {
    currentPage += direction;
    loadPokemonPage(currentPage);
}

async function searchPokemon() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (searchTerm === '') return;

    try {
        const response = await fetch(`${baseUrl}/${searchTerm}`);
        if (!response.ok) {
            showError('Pokemon not found');
            return;
        }
        const data = await response.json();
        appContainer.innerHTML = '';
        appContainer.appendChild(createPokemonCard(data));
    } catch (error) {
        showError('Failed to search Pokemon');
    }
}

function resetPokedex() {
    searchInput.value = '';
    currentPage = 1;
    loadPokemonPage(currentPage);
}

function showError(message) {
    appContainer.innerHTML = `<p class="error-message">${message}</p>`;
}

function toggleFavorite(pokemon) {
    const favorites = JSON.parse(localStorage.getItem('favoritePokemon')) || [];
    const index = favorites.findIndex(fav => fav.id === pokemon.id);
    if (index === -1) {
        favorites.push({ id: pokemon.id, name: pokemon.name });
    } else {
        favorites.splice(index, 1);
    }
    
    localStorage.setItem('favoritePokemon', JSON.stringify(favorites));
    updateFavoriteStatus(document.querySelector(`[data-id="${pokemon.id}"]`), pokemon.id);
}

function updateFavoriteStatus(card, pokemonId) {
    const favorites = JSON.parse(localStorage.getItem('favoritePokemon')) || [];
    const isFavorite = favorites.some(fav => fav.id === pokemonId);
    
    if (isFavorite) {
        card.classList.add('favorite');
    } else {
        card.classList.remove('favorite');
    }
}