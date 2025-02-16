// movie.js
// Lembre-se de substituir pela sua chave da API do TMDb
const API_KEY = "043db862605252277290e1f41ed68138";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w300";

// Extrair parâmetros da URL (id e type)
const params = new URLSearchParams(window.location.search);
const mediaId = params.get("id");
const mediaType = params.get("type"); // "movie" ou "tv"

const titleDetail = document.getElementById("titleDetail");
const mediaDetail = document.getElementById("mediaDetail");
const alternativeForm = document.getElementById("alternativeForm");
const alternativeText = document.getElementById("alternativeText");
const alternativesList = document.getElementById("alternativesList");

// Função para buscar detalhes do filme/série
async function fetchMediaDetail() {
  if (!mediaId || !mediaType) {
    mediaDetail.innerHTML = "<p>ID ou tipo inválido.</p>";
    return;
  }

  const url = `${BASE_URL}/${mediaType === "movie" ? "movie" : "tv"}/${mediaId}?api_key=${API_KEY}&language=pt-BR`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    const displayTitle = data.title || data.name;
    titleDetail.textContent = displayTitle;

    const poster = data.poster_path ? `${IMG_URL}${data.poster_path}` : "https://via.placeholder.com/300x450?text=Sem+Imagem";

    mediaDetail.innerHTML = `
      <img src="${poster}" alt="${displayTitle}">
      <div class="media-info">
        <h2>${displayTitle}</h2>
        <p>${data.overview || "Sem descrição disponível."}</p>
      </div>
      <div style="clear: both;"></div>
    `;
  } catch (error) {
    console.error("Erro ao buscar detalhes:", error);
    mediaDetail.innerHTML = "<p>Erro ao carregar detalhes.</p>";
  }
}

// Gerenciar finais alternativos usando localStorage
const storageKey = `alternatives_${mediaType}_${mediaId}`;

function getAlternatives() {
  const stored = localStorage.getItem(storageKey);
  return stored ? JSON.parse(stored) : [];
}

function saveAlternatives(alternatives) {
  localStorage.setItem(storageKey, JSON.stringify(alternatives));
}

function renderAlternatives() {
  const alternatives = getAlternatives();
  // Ordenar por votos (descendente)
  alternatives.sort((a, b) => b.votes - a.votes);
  alternativesList.innerHTML = "";

  if (alternatives.length === 0) {
    alternativesList.innerHTML = "<p>Nenhum final alternativo criado ainda.</p>";
    return;
  }

  alternatives.forEach(alt => {
    const altDiv = document.createElement("div");
    altDiv.classList.add("alternative");
    altDiv.innerHTML = `
      <p>${alt.text}</p>
      <div class="vote-buttons">
        <button data-id="${alt.id}" class="upvote">▲</button>
        <span>${alt.votes}</span>
        <button data-id="${alt.id}" class="downvote">▼</button>
      </div>
    `;
    alternativesList.appendChild(altDiv);
  });
}

// Evento de criação de novo final alternativo
alternativeForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = alternativeText.value.trim();
  if (text === "") return;

  const alternatives = getAlternatives();
  const newAlt = {
    id: Date.now(), // ID único baseado no timestamp
    text,
    votes: 0
  };
  alternatives.push(newAlt);
  saveAlternatives(alternatives);
  alternativeText.value = "";
  renderAlternatives();
});

// Eventos de votação (delegação de eventos)
alternativesList.addEventListener("click", (e) => {
  if (e.target.classList.contains("upvote") || e.target.classList.contains("downvote")) {
    const altId = Number(e.target.dataset.id);
    const alternatives = getAlternatives();
    const alt = alternatives.find(a => a.id === altId);
    if (alt) {
      if (e.target.classList.contains("upvote")) {
        alt.votes++;
      } else {
        alt.votes--;
      }
      saveAlternatives(alternatives);
      renderAlternatives();
    }
  }
});

// Inicialização
fetchMediaDetail();
renderAlternatives();
