// index.js
// Lembre-se de substituir pela sua chave da API do TMDb
const API_KEY = "043db862605252277290e1f41ed68138";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w200";

let currentPage = 1;
let totalPages = 1;
let currentQuery = "";
let currentTypeFilter = "all";

const moviesContainer = document.getElementById("moviesContainer");
const searchInput = document.getElementById("searchInput");
const typeFilter = document.getElementById("typeFilter");
const searchBtn = document.getElementById("searchBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const pageInfo = document.getElementById("pageInfo");

// Função para buscar os dados (usa trending ou search dependendo do termo)
async function fetchData() {
  let url = "";
  if (currentQuery.trim() !== "") {
    url = `${BASE_URL}/search/multi?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(currentQuery)}&page=${currentPage}`;
  } else {
    url = `${BASE_URL}/trending/all/day?api_key=${API_KEY}&language=pt-BR&page=${currentPage}`;
  }

  try {
    const res = await fetch(url);
    const data = await res.json();
    totalPages = data.total_pages;

    let results = data.results.filter(item => item.media_type === "movie" || item.media_type === "tv");

    // Filtrar por tipo, se necessário
    if (currentTypeFilter !== "all") {
      results = results.filter(item => item.media_type === currentTypeFilter);
    }
    
    renderMovies(results);
    pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
  }
}

function renderMovies(movies) {
  moviesContainer.innerHTML = "";
  if (movies.length === 0) {
    moviesContainer.innerHTML = "<p>Nenhum resultado encontrado.</p>";
    return;
  }

  movies.forEach(movie => {
    const { id, title, name, poster_path, media_type } = movie;
    const displayTitle = title || name;
    const poster = poster_path ? `${IMG_URL}${poster_path}` : "https://via.placeholder.com/200x300?text=Sem+Imagem";

    const card = document.createElement("div");
    card.classList.add("movie-card");
    card.innerHTML = `
      <a href="movie.html?id=${id}&type=${media_type}">
        <img src="${poster}" alt="${displayTitle}">
        <h3>${displayTitle}</h3>
        <p>${media_type === "movie" ? "Filme" : "Série"}</p>
      </a>
    `;
    moviesContainer.appendChild(card);
  });
}

// Eventos
searchBtn.addEventListener("click", () => {
  currentQuery = searchInput.value;
  currentPage = 1;
  fetchData();
});

typeFilter.addEventListener("change", (e) => {
  currentTypeFilter = e.target.value;
  currentPage = 1;
  fetchData();
});

prevBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    fetchData();
  }
});

nextBtn.addEventListener("click", () => {
  if (currentPage < totalPages) {
    currentPage++;
    fetchData();
  }
});

// Busca inicial
fetchData();
