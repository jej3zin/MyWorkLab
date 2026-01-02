// layout/main.js
const { GITHUB_USER } = window.APP_CONFIG;

const timeline = document.getElementById('timeline');
const modal = document.getElementById('repoModal');
const modalBody = document.getElementById('repomodalBody');
const closeModal = document.getElementById('repocloseModal');

/* ========= API ========= */
async function getRepos() {
  try {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USER}/repos`
    );
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return [];
  }
}

/* ============= PROFILE ============= */
async function getProfile() {
  try {
    const res = await fetch(`https://api.github.com/users/${GITHUB_USER}`);
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return null;
  }
}
async function renderProfileResume() {
  const profile = await getProfile();
  if (!profile) return;

  const profileResume = document.getElementById('profile-resume');
  profileResume.innerHTML = `
    <header class="profile-resume-header">
    <img src="${profile.avatar_url}" alt="${
    profile.login
  }" class="profile-avatar">
    <div class="profile-resume-info">
      <h1>${profile.name || profile.login}</h1>
      <p>${profile.bio || ''}</p>
      <div class="profile-resume-stats">
        <span><ion-icon name="people"></ion-icon> <strong>${
          profile.followers
        }</strong> Followers</span>
        <span><ion-icon name="book"></ion-icon> <strong>${
          profile.public_repos
        }</strong> Repositories</span>
      </div>
    </div>
    </header>

    <section class="profile-resume-activity">
      <h2>Activity</h2>
      <div class="profile-resume-activity-grid">
        <!-- CALENDAR -->
        <section class="wrapper-calendar">
          <header class="card-head">
            <h3>Contribution Calendar</h3>
            <span>Last 12 months</span>
          </header>

          <div class="calendar-grid">
            ${Array.from({ length: 7 })
              .map(
                () => `
                <div class="week">
                  ${Array.from({ length: 52 })
                    .map(() => `<span class="day"></span>`)
                    .join('')}
                </div>
              `
              )
              .join('')}
          </div>

          <footer class="calendar-legend">
            <span>Less</span>
            <div class="legend-boxes">
              <div class="level-1"></div><div class="level-2"></div><div class="level-3"></div><div class="level-4"></div><div class="level-5"></div>
            </div>
            <span>More</span>
          </footer>
        </section>

        <!-- REPORT -->
        <section class="wrapper-report">
          <h3>Activity Report</h3>

          <ul>
            <li><span>This Year</span><strong>273</strong></li>
            <li><span>Avg / Day</span><strong class="green">0.7</strong></li>
            <li><span>Best Day</span><strong class="yellow">43</strong></li>
            <li><span>Active Days</span><strong class="blue">55</strong></li>
          </ul>
        </section>

        <!-- STREAK -->
        <section class="card streak">
          <div class="streak-icon fire"><ion-icon name="flame"></ion-icon></div>
          <div>
            <span>Current Streak</span>
            <strong>4 days</strong>
          </div>
        </section>

        <!-- LONGEST -->
        <section class="card streak">
          <div class="streak-icon star"><ion-icon name="star"></ion-icon></div>
          <div>
            <span>Longest Streak</span>
            <strong>8 days</strong>
          </div>
        </section>
      </div>
    </section>

    <div class="profile-separator"></div>

    <section class="profile-repos-favorites"></section>
  `;
  renderFavoriteTimeline();
}
renderProfileResume();

/* ========= Timeline FAV ========= */
/* ========= FAVORITOS (STARS) ========= */
async function getStarredRepos() {
  try {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USER}/starred?per_page=100`
    );
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return [];
  }
}

/* ========= FILTRAR: SÓ REPOS DO USUÁRIO ========= */
function filterOwnStarredRepos(repos) {
  return repos.filter(
    (repo) => repo.owner.login.toLowerCase() === GITHUB_USER.toLowerCase()
  );
}

/* ========= CARD (REAPROVEITA O MESMO) ========= */
function createFavRepoCard(repo) {
  return `
    <article class="repoCard fav" data-repo="${repo.name}">
      <header class="rc-head">
        <h3><ion-icon name="star"></ion-icon> ${repo.name}</h3>
      </header>

      <main class="rc-main">
        <p>${repo.description ?? 'Sem descrição'}</p>
      </main>

      <footer class="rc-footer">
        <span><ion-icon name="star"></ion-icon> ${repo.stargazers_count}</span>
        <span><ion-icon name="eye"></ion-icon> ${repo.watchers_count}</span>
        <span><ion-icon name="git-network"></ion-icon> ${
          repo.forks_count
        }</span>
      </footer>
    </article>
  `;
}

/* ========= RENDER FAVORITOS ========= */
async function renderFavoriteTimeline() {
  const starred = await getStarredRepos();
  const ownFavorites = filterOwnStarredRepos(starred);

  if (!ownFavorites.length) return;

  const section = document.querySelector('.profile-repos-favorites');
  if (!section) return;

  section.innerHTML = `
    <h2 class="timeline-title">
      <ion-icon name="star"></ion-icon>
      Repositórios Favoritos
    </h2>

    <div class="timeline-grid-fav">
      ${ownFavorites.map(createFavRepoCard).join('')}
    </div>
  `;
}

/* ========= CARD ========= */
function createRepoCard(repo) {
  return `
    <article class="repoCard" data-repo="${repo.name}">

      <header class="rc-head">
        <h3>${repo.name}</h3>
        <div class="author">
          <img src="${repo.owner.avatar_url}">
          <span>${repo.owner.login}</span>
        </div>
      </header>

      <main class="rc-main">
        <p>${repo.description ?? 'Sem descrição'}</p>
      </main>

      <footer class="rc-footer">
        <span><ion-icon name="heart"></ion-icon> ${repo.stargazers_count}</span>
        <span><ion-icon name="eye"></ion-icon> ${repo.watchers_count}</span>
        <span><ion-icon name="git-network"></ion-icon> ${
          repo.forks_count
        }</span>
      </footer>
    </article>
  `;
}

/* ========= TIMELINE ========= */
(async function renderTimeline() {
  const repos = await getRepos();
  timeline.innerHTML = repos.map(createRepoCard).join('');
})();

/* ========= RELEASE ========= */
async function getLastRelease(repo) {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_USER}/${repo}/releases/latest`
    );

    if (res.status === 404) {
      // Repo sem release → comportamento esperado
      return null;
    }

    if (!res.ok) {
      throw new Error('Erro ao buscar release');
    }

    return await res.json();
  } catch {
    return null;
  }
}

/* ========= MODAL (GLOBAL) ========= */
window.openRepoModal = async function (repoName) {
  modalBody.innerHTML = `<p class="loading">Carregando…</p>`;
  modal.classList.add('open');

  const release = await getLastRelease(repoName);

  const releaseHTML = release
    ? marked.parse(release.body || '_Sem descrição do release._')
    : `<p class="no-release">🚫 Este repositório ainda não possui releases.</p>`;

  const releaseLink = release
    ? `
      <a
        class="release-link"
        href="${release.html_url}"
        target="_blank"
        rel="noopener noreferrer"
      >
        Ver release no GitHub →
      </a>
    `
    : '';

  modalBody.innerHTML = `
    <img class="cover" src="https://opengraph.githubassets.com/1/${GITHUB_USER}/${repoName}">
    <h2 class="repotitle">${release?.name ?? repoName}</h2>

    <div class="release-body">
      ${releaseHTML}
    </div>
    ${releaseLink}
  `;
};
marked.setOptions({
  mangle: false,
  headerIds: false,
});

/* ========= FECHAR ========= */
closeModal.addEventListener('click', () => modal.classList.remove('open'));

modal.addEventListener('click', (e) => {
  if (e.target === modal) modal.classList.remove('open');
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') modal.classList.remove('open');
});

timeline.addEventListener('click', (e) => {
  const card = e.target.closest('.repoCard');
  if (card) openRepoModal(card.dataset.repo);
});
