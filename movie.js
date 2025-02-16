// movie.js
// Lembre-se de substituir pela sua chave da API do TMDb
const API_KEY = "043db862605252277290e1f41ed68138";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w300";

// Extrai parâmetros da URL (id e type)
const params = new URLSearchParams(window.location.search);
const mediaId = params.get("id");
const mediaType = params.get("type"); // "movie" ou "tv"

const titleDetail = document.getElementById("titleDetail");
const mediaDetail = document.getElementById("mediaDetail");

// ==========================================
// INICIALIZAÇÃO DO EasyMDE
// ==========================================
const easyMDE = new EasyMDE({
  element: document.getElementById("alternativeText"),
  autoDownloadFontAwesome: true,  // Para garantir que os ícones sejam carregados
  toolbar: [
    "bold", "italic", "heading", "|",
    "quote", "unordered-list", "ordered-list", "|",
    "preview", "side-by-side", "fullscreen"
  ],
  spellChecker: false
});

// ==========================================
// FUNÇÃO: Buscar detalhes do filme/série
// ==========================================
async function fetchMediaDetail() {
  if (!mediaId || !mediaType) {
    mediaDetail.innerHTML = "<p>ID ou tipo inválido.</p>";
    return;
  }

  const url = `${BASE_URL}/${mediaType === "movie" ? "movie" : "tv"}/${mediaId}?api_key=${API_KEY}&language=pt-BR`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    const displayTitle = data.title || data.name || "Sem Título";
    titleDetail.textContent = displayTitle;

    const poster = data.poster_path
      ? `${IMG_URL}${data.poster_path}`
      : "https://via.placeholder.com/300x450?text=Sem+Imagem";

    mediaDetail.innerHTML = `
      <img src="${poster}" alt="${displayTitle}" />
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

// ==========================================
// LOCALSTORAGE: Salvar e carregar finais
// ==========================================
const storageKey = `alternatives_${mediaType}_${mediaId}`;

function getAlternatives() {
  const stored = localStorage.getItem(storageKey);
  return stored ? JSON.parse(stored) : [];
}

function saveAlternatives(alternatives) {
  localStorage.setItem(storageKey, JSON.stringify(alternatives));
}

// ==========================================
// FUNÇÃO: Renderizar os finais alternativos
// ==========================================
function renderAlternatives() {
  const alternativesList = document.getElementById("alternativesList");
  const alternatives = getAlternatives();

  // Ordena por votos (desc)
  alternatives.sort((a, b) => b.votes - a.votes);

  // Limpa a lista
  alternativesList.innerHTML = "";

  if (alternatives.length === 0) {
    alternativesList.innerHTML = "<p>Nenhum final alternativo criado ainda.</p>";
    return;
  }

  // Para cada final, converte Markdown -> HTML com marked
  alternatives.forEach((alt) => {
    const htmlContent = marked.parse(alt.text);
    const altDiv = document.createElement("div");
    altDiv.classList.add("alternative");

    altDiv.innerHTML = `
      <div class="alternative-content">${htmlContent}</div>
      <div class="vote-buttons">
        <button data-id="${alt.id}" class="upvote">▲</button>
        <span>${alt.votes}</span>
        <button data-id="${alt.id}" class="downvote">▼</button>
      </div>
    `;
    alternativesList.appendChild(altDiv);
  });
}

// ==========================================
// EVENTO: Submeter novo final alternativo
// ==========================================
document.getElementById("alternativeForm").addEventListener("submit", function(e) {
  e.preventDefault();
  console.log("Submit disparado!"); // Para debug

  const text = easyMDE.value().trim();
  if (!text) {
    alert("Por favor, insira algum texto em Markdown.");
    return;
  }

  const alternatives = getAlternatives();
  const newAlt = {
    id: Date.now(), // ID único
    text: text,     // Conteúdo em Markdown
    votes: 0
  };

  alternatives.push(newAlt);
  saveAlternatives(alternatives);

  // Limpa o editor
  easyMDE.value("");
  renderAlternatives();
});

// ==========================================
// EVENTO: Votação (delegação de eventos)
// ==========================================
document.getElementById("alternativesList").addEventListener("click", function(e) {
  if (e.target.classList.contains("upvote") || e.target.classList.contains("downvote")) {
    const altId = Number(e.target.dataset.id);
    const alternatives = getAlternatives();
    const alt = alternatives.find((a) => a.id === altId);

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

// ==========================================
// INICIALIZAÇÃO
// ==========================================
fetchMediaDetail();
renderAlternatives();
