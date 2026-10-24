const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const resetButton = document.getElementById('resetButton');
const resultsGrid = document.getElementById('resultsGrid');
const resultsTitle = document.getElementById('resultsTitle');
const resultsMessage = document.getElementById('resultsMessage');

let recommendationData = null;

async function loadRecommendations() {
  try {
    const response = await fetch('travel_recommendation_api.json');
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    recommendationData = await response.json();
    console.log('Travel recommendation data loaded:', recommendationData);
    // Show a small welcome selection on first load; keyword results still require Search.
    renderCards(recommendationData.beaches.slice(0, 3), 'A few places to begin');
  } catch (error) {
    console.error('Could not load recommendations:', error);
    resultsGrid.innerHTML = '<p class="empty-state">Unable to load travel data. Please run this project with a local web server.</p>';
  }
}

function normalizeKeyword(value) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function findCategory(keyword) {
  const beachWords = ['beach', 'beaches', 'coast', 'island', 'islands'];
  const templeWords = ['temple', 'temples', 'shrine', 'shrines', 'heritage'];
  const countryWords = ['country', 'countries', 'nation', 'nations'];
  if (beachWords.includes(keyword)) return 'beaches';
  if (templeWords.includes(keyword)) return 'temples';
  if (countryWords.includes(keyword)) return 'countries';
  return null;
}

function renderCards(items, title) {
  resultsTitle.textContent = title;
  if (!items || items.length === 0) {
    resultsGrid.innerHTML = '<p class="empty-state">No recommendations found. Try “beach”, “temple” or “country”.</p>';
    return;
  }
  resultsGrid.innerHTML = items.map((place) => {
    const safeName = escapeHTML(place.name);
    const safeDescription = escapeHTML(place.description);
    const safeImage = escapeHTML(place.imageUrl);
    const safeCategory = escapeHTML(place.category);
    const time = getLocalTime(place.timeZone);
    return `<article class="result-card">
      <img src="${safeImage}" alt="${safeName}" loading="lazy">
      <div class="card-body">
        <span class="card-category">${safeCategory}</span>
        <h3>${safeName}</h3>
        <p>${safeDescription}</p>
        <div class="local-time">Local time <strong>${time}</strong></div>
      </div>
    </article>`;
  }).join('');
}

function getLocalTime(timeZone) {
  try {
    return new Intl.DateTimeFormat('en', { timeZone, hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date());
  } catch {
    return 'Not available';
  }
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}

searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const keyword = normalizeKeyword(searchInput.value);
  if (!keyword) {
    resultsMessage.textContent = 'Enter a keyword to explore recommendations.';
    searchInput.focus();
    return;
  }
  if (!recommendationData) {
    resultsMessage.textContent = 'Travel recommendations are still loading. Please try again.';
    return;
  }
  const category = findCategory(keyword);
  if (!category) {
    resultsTitle.textContent = 'No matching category';
    resultsMessage.textContent = 'Try beach, beaches, temple, temples, country or countries.';
    resultsGrid.innerHTML = '<p class="empty-state">We are exploring more destinations. For now, search for beach, temple or country.</p>';
    return;
  }
  const titles = { beaches: 'Beach escapes', temples: 'Temples & cultural places', countries: 'Explore countries' };
  resultsMessage.textContent = `${recommendationData[category].length} recommendations selected for “${keyword}”.`;
  renderCards(recommendationData[category], titles[category]);
});

resetButton.addEventListener('click', () => {
  searchInput.value = '';
  resultsTitle.textContent = 'A few places to begin';
  resultsMessage.textContent = 'Search for beach, temple or country.';
  if (recommendationData) renderCards(recommendationData.beaches.slice(0, 3), 'A few places to begin');
  searchInput.focus();
});

loadRecommendations();
