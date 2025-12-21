// layout/header.js
document.addEventListener('DOMContentLoaded', () => {
  const { GITHUB_USER } = window.APP_CONFIG || {};

  /* ========= SEARCH ========= */
  const searchInput = document.getElementById('searchInput');
  const clearIcon = document.querySelector('.clear-icon');
  const resultsBox = document.getElementById('searchResults');

  // 🚨 Se não existe search nessa página, sai fora
  if (!searchInput || !clearIcon || !resultsBox || !GITHUB_USER) return;

  let allRepos = [];
  let debounceTimer;

  async function fetchRepos() {
    if (allRepos.length) return allRepos;

    try {
      const res = await fetch(
        `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100`
      );
      if (!res.ok) return [];
      allRepos = await res.json();
      return allRepos;
    } catch {
      return [];
    }
  }

  function filterRepos(query) {
    return allRepos
      .filter(
        (repo) =>
          repo.name.toLowerCase().includes(query) ||
          (repo.description ?? '').toLowerCase().includes(query)
      )
      .sort((a, b) => b.stargazers_count - a.stargazers_count);
  }

  function renderResults(list) {
    if (!resultsBox) return;

    resultsBox.innerHTML = list.length
      ? list
          .slice(0, 8)
          .map(
            (repo) => `
        <div class="result-card" data-repo="${repo.name}">
          <img src="${repo.owner.avatar_url}" alt="${repo.owner.login}">
          <div>
            <strong>${repo.name}</strong>
            <small><ion-icon class="star" name="star"></ion-icon> ${repo.stargazers_count}</small>
          </div>
        </div>`
          )
          .join('')
      : `<p class="empty-feedback">Nada relevante 👀</p>`;

    resultsBox.classList.add('show');
  }

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();

    clearIcon.classList.toggle('show', query !== '');
    clearTimeout(debounceTimer);

    if (!query) {
      resultsBox.classList.remove('show');
      resultsBox.innerHTML = '';
      return;
    }

    debounceTimer = setTimeout(async () => {
      await fetchRepos();
      renderResults(filterRepos(query));
    }, 300);
  });

  clearIcon.addEventListener('click', () => {
    searchInput.value = '';
    clearIcon.classList.remove('show');
    resultsBox.classList.remove('show');
    resultsBox.innerHTML = '';
    searchInput.focus();
  });

  resultsBox.addEventListener('click', (e) => {
    const card = e.target.closest('.result-card');
    if (!card || typeof window.openRepoModal !== 'function') return;

    window.openRepoModal(card.dataset.repo);
  });
});

document.addEventListener('DOMContentLoaded', async () => {
  const { GITHUB_USER } = window.APP_CONFIG;

  const avatarImg = document.querySelector('#avatarBtn img');
  if (!avatarImg) return;

  try {
    const res = await fetch(`https://api.github.com/users/${GITHUB_USER}`);
    if (!res.ok) throw new Error('GitHub error');

    const user = await res.json();

    avatarImg.src = user.avatar_url;
    avatarImg.alt = user.login;
  } catch (err) {
    console.warn('Falha ao carregar avatar do GitHub');
  }
  avatarImg.onload = () => avatarImg.classList.add('loaded');
});
