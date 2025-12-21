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
