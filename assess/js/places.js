/* =========================================
   INLOVE - PLACES
   Static data only: works on GitHub Pages.
========================================= */

const places = [
  {
    id: 1,
    name: "Seoul Garden",
    city: "Hà Nội",
    date: "2024-07-18",
    displayDate: "18.07.2024",
    image: "./assess/img/our1.jpg",
    description: "Our first hotpot together. So much food, so many laughs.",
    favorite: "Cheese Tteokbokki",
    tags: ["food", "hotpot", "first date"],
  },
  {
    id: 2,
    name: "Đà Lạt",
    city: "Đà Lạt",
    date: "2024-08-24",
    displayDate: "24.08.2024",
    image: "./assess/img/our2.jpg",
    description: "Our first trip together. Cold weather, warm hearts.",
    favorite: "Dâu lắc",
    tags: ["travel", "trip", "dalat"],
  },
  {
    id: 3,
    name: "Cộng Cà Phê",
    city: "Hà Nội",
    date: "2024-09-02",
    displayDate: "02.09.2024",
    image: "./assess/img/our4.jpg",
    description: "A chill afternoon with you. Love the vibe here.",
    favorite: "Kem dừa",
    tags: ["coffee", "cafe", "date"],
  },
];

const ITEMS_PER_PAGE = 4;
let currentPage = 1;
let filteredPlaces = [...places];

const grid = document.getElementById("placesGrid");
const pagination = document.getElementById("placesPagination");
const emptyState = document.getElementById("placesEmpty");
const searchInput = document.getElementById("placesSearch");
const clearButton = document.getElementById("clearSearch");
const sortSelect = document.getElementById("placesSort");
const resultCount = document.getElementById("placesResultCount");
const searchBox = document.querySelector(".places-search");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function sortPlaces(items, sortType) {
  return [...items].sort((a, b) => {
    if (sortType === "oldest") {
      return new Date(a.date) - new Date(b.date);
    }

    if (sortType === "name") {
      return a.name.localeCompare(b.name, "vi");
    }

    return new Date(b.date) - new Date(a.date);
  });
}

function filterPlaces(keyword) {
  const query = keyword.trim().toLocaleLowerCase("vi-VN");

  if (!query) {
    return [...places];
  }

  return places.filter((place) => {
    const searchableText = [
      place.name,
      place.city,
      place.description,
      place.favorite,
      ...place.tags,
    ]
      .join(" ")
      .toLocaleLowerCase("vi-VN");

    return searchableText.includes(query);
  });
}

function renderPlaces() {
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = filteredPlaces.slice(start, start + ITEMS_PER_PAGE);

  grid.innerHTML = pageItems
    .map(
      (place) => `
        <article class="place-card">
          <img
            class="place-card__image"
            src="${escapeHtml(place.image)}"
            alt="${escapeHtml(place.name)}"
            loading="lazy"
          />

          <div class="place-card__body">
            <div class="place-card__top">
              <h2 class="place-card__name">${escapeHtml(place.name)}</h2>
              <time class="place-card__date" datetime="${escapeHtml(place.date)}">
                ${escapeHtml(place.displayDate)}
              </time>
            </div>

            <p class="place-card__city">
              <i class="fa-solid fa-location-dot"></i>
              ${escapeHtml(place.city)}
            </p>

            <p class="place-card__description">
              ${escapeHtml(place.description)}
            </p>

            <p class="place-card__favorite">
              <i class="fa-solid fa-heart"></i>
              Favorite: ${escapeHtml(place.favorite)}
            </p>

            <div class="place-card__tags">
              ${place.tags
                .map(
                  (tag) =>
                    `<span class="place-card__tag">#${escapeHtml(tag)}</span>`
                )
                .join("")}
            </div>
          </div>
        </article>
      `
    )
    .join("");

  const hasResults = pageItems.length > 0;
  emptyState.hidden = hasResults;
  grid.hidden = !hasResults;

  const total = filteredPlaces.length;
  resultCount.textContent = `${total} ${total === 1 ? "memory" : "memories"}`;
}

function renderPagination() {
  const totalPages = Math.ceil(filteredPlaces.length / ITEMS_PER_PAGE);
  pagination.innerHTML = "";

  if (totalPages <= 1) {
    return;
  }

  const previous = document.createElement("button");
  previous.type = "button";
  previous.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
  previous.disabled = currentPage === 1;
  previous.addEventListener("click", () => goToPage(currentPage - 1));
  pagination.appendChild(previous);

  for (let page = 1; page <= totalPages; page += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = page;
    button.classList.toggle("active", page === currentPage);
    button.setAttribute("aria-label", `Go to page ${page}`);
    button.setAttribute("aria-current", page === currentPage ? "page" : "false");
    button.addEventListener("click", () => goToPage(page));
    pagination.appendChild(button);
  }

  const next = document.createElement("button");
  next.type = "button";
  next.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
  next.disabled = currentPage === totalPages;
  next.addEventListener("click", () => goToPage(currentPage + 1));
  pagination.appendChild(next);
}

function goToPage(page) {
  const totalPages = Math.max(
    1,
    Math.ceil(filteredPlaces.length / ITEMS_PER_PAGE)
  );

  currentPage = Math.min(Math.max(page, 1), totalPages);
  renderPlaces();
  renderPagination();

  document.querySelector(".places-hero")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function refreshPlaces() {
  filteredPlaces = sortPlaces(
    filterPlaces(searchInput.value),
    sortSelect.value
  );

  currentPage = 1;
  searchBox.classList.toggle("has-value", Boolean(searchInput.value.trim()));

  renderPlaces();
  renderPagination();
}

searchInput.addEventListener("input", refreshPlaces);

clearButton.addEventListener("click", () => {
  searchInput.value = "";
  refreshPlaces();
  searchInput.focus();
});

sortSelect.addEventListener("change", refreshPlaces);

refreshPlaces();
