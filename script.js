/**
 * LA ZONE GAMING - SCRIPT PRINCIPAL (SPA & LIVE API)
 * Plateforme Gaming & E-sport avec contenu dynamique en direct
 */

// Base de données des jeux et sous-catégories
const gamesData = {
    fortnite: {
        id: "fortnite",
        name: "Fortnite",
        color: "var(--color-fortnite)",
        subreddit: "FortNiteBR",
        image: "https://images.unsplash.com/photo-1589241062272-c0a000072dfa?q=80&w=800",
        subcategories: ["Actualités", "Guides & Astuces", "Défis", "Nouveautés", "Compétitif", "Objectifs à débloquer"]
    },
    rocketleague: {
        id: "rocketleague",
        name: "Rocket League",
        color: "var(--color-rl)",
        subreddit: "RocketLeague",
        image: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?q=80&w=800",
        subcategories: ["Actualités", "Guides & Astuces", "Défis", "Compétitif", "Tournois", "Objectifs à débloquer"]
    },
    valorant: {
        id: "valorant",
        name: "Valorant",
        color: "var(--color-valorant)",
        subreddit: "VALORANT",
        image: "https://images.unsplash.com/photo-1631557007672-00366835a6db?q=80&w=800",
        subcategories: ["Actualités", "Agents", "Guides & Astuces", "Compétitif", "Stratégies", "Objectifs à débloquer"]
    },
    dbz: {
        id: "dbz",
        name: "Dragon Ball Sparking Zero",
        color: "var(--color-dbz)",
        subreddit: "SparkingZero",
        image: "https://images.unsplash.com/photo-1605371924599-2d0365da1ae0?q=80&w=800",
        subcategories: ["Actualités", "Personnages", "Guides & Astuces", "Combats", "Défis", "Objectifs à débloquer"]
    }
};

// Cache local pour la lecture d'articles sur le site
let currentArticlesCache = [];

// Base d'objectifs globaux
const globalObjectivesData = [
    { game: "Valorant", title: "Atteindre le rang Diamant 3", desc: "Gagne 5 parties classées avec un K/D supérieur à 1.2.", progress: 80, done: false },
    { game: "Fortnite", title: "Victoire Royale de la Saison", desc: "Obtiens une couronne de victoire en Duo ou Section.", progress: 100, done: true },
    { game: "Rocket League", title: "Double Tap Mastery", desc: "Inscris 3 buts en Double Tap en match classé 2v2.", progress: 66, done: false },
    { game: "Dragon Ball Sparking Zero", title: "Forme Parfaite", desc: "Réalise un combo de plus de 40 coups en ligne.", progress: 40, done: false }
];

/**
 * RECUPERATION EN DIRECT SANS SITES EXTERNES
 */
async function fetchRealGameNews(gameId, category) {
    const game = gamesData[gameId];
    if (!game) return getFallbackArticles(gameId, category);

    const apiUrl = `https://www.reddit.com/r/${game.subreddit}/hot.json?limit=15`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Erreur de connexion");

        const data = await response.json();
        const posts = data.data.children;

        currentArticlesCache = posts
            .filter(post => !post.data.stickied)
            .map((post, index) => {
                const p = post.data;
                const postDate = new Date(p.created_utc * 1000);
                const formattedDate = postDate.toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                let fullBody = p.selftext;
                if (!fullBody || fullBody.trim() === "") {
                    fullBody = `Cette information concernant **${p.title}** fait l'actualité aujourd'hui sur ${game.name}.\n\nRevenez régulièrement sur La Zone Gaming pour découvrir nos prochains guides et analyses approfondies sur cette nouveauté.`;
                }

                return {
                    id: index,
                    title: p.title,
                    date: formattedDate,
                    tag: p.link_flair_text || category || "Exclusif",
                    excerpt: fullBody.substring(0, 160).replace(/[#*]/g, '') + "...",
                    content: fullBody,
                    author: p.author || "Rédaction La Zone Gaming",
                    score: p.score || 0
                };
            });

        return currentArticlesCache.length > 0 ? currentArticlesCache : getFallbackArticles(gameId, category);

    } catch (error) {
        console.warn("Moteur live en pause, affichage du contenu alternatif :", error);
        currentArticlesCache = getFallbackArticles(gameId, category);
        return currentArticlesCache;
    }
}

function getFallbackArticles(gameId, category) {
    const game = gamesData[gameId];
    const gameName = game ? game.name : "Jeu";
    const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    
    return [
        {
            id: 0,
            title: `Guide et actualité récents : ${category} - ${gameName}`,
            date: today,
            tag: "Info",
            excerpt: "Mise à jour en cours par l'équipe rédactionnelle. Consultez nos recommandations.",
            content: `Retrouvez très prochainement l'intégralité des détails concernant la section **${category}** pour **${gameName}**.\n\nTous nos articles sont directement rédigés et mis en page sur La Zone Gaming pour vous garantir une expérience de lecture fluide et sans interruption.`,
            author: "Staff La Zone Gaming",
            score: 95
        }
    ];
}

/**
 * ROUTEUR ET NAVIGATION (SPA)
 */
const appRoot = document.getElementById('app-root');

function navigateTo(view, param = null) {
    appRoot.innerHTML = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });

    switch(view) {
        case 'home': renderHome(); break;
        case 'game': renderGame(param); break;
        case 'content': renderContent(param.gameId, param.subcat); break;
        case 'article': renderArticleDetail(param.gameId, param.subcat, param.articleId); break;
        case 'objectives': renderGlobalObjectives(); break;
        default: renderHome();
    }
}

// 1. Accueil
function renderHome() {
    let gamesHtml = Object.values(gamesData).map(game => `
        <div class="game-card" style="--accent-color: ${game.color}" onclick="navigateTo('game', '${game.id}')">
            <div class="game-visual" style="background-image: url('${game.image}')"></div>
            <div class="game-info">
                <h3>${game.name}</h3>
                <button class="btn-secondary">Découvrir</button>
            </div>
        </div>
    `).join('');

    appRoot.innerHTML = `
        <div class="fade-in">
            <section class="hero">
                <h1>Entrez dans <span>La Zone</span></h1>
                <p>Toutes les actualités, patch notes et guides de vos jeux préférés, consultables directement ici.</p>
                <button class="btn-primary" onclick="document.getElementById('games-section').scrollIntoView({behavior: 'smooth'})">Choisis ton jeu</button>
            </section>
            
            <section id="games-section" class="section-container">
                <h2 class="section-title">Choisis <span>ton jeu</span></h2>
                <div class="grid grid-4">
                    ${gamesHtml}
                </div>
            </section>
        </div>
    `;
}

// 2. Sélection des sous-catégories d'un jeu
function renderGame(gameId) {
    const game = gamesData[gameId];
    if(!game) return navigateTo('home');

    let subcatsHtml = game.subcategories.map(sub => `
        <div class="subcat-card" style="--accent-color: ${game.color}" onclick="navigateTo('content', {gameId: '${game.id}', subcat: '${sub}'})">
            ${sub}
        </div>
    `).join('');

    appRoot.innerHTML = `
        <div class="fade-in">
            <div class="view-header" style="--accent-color: ${game.color}">
                <button class="btn-back" onclick="navigateTo('home')">← Retour aux jeux</button>
                <h1 style="color: ${game.color}">${game.name}</h1>
            </div>
            <div class="subcat-grid">
                ${subcatsHtml}
            </div>
        </div>
    `;
}

// 3. Liste des articles d'une rubrique
async function renderContent(gameId, subcat) {
    const game = gamesData[gameId];
    
    if (subcat === "Objectifs à débloquer") {
        renderGameObjectives(game);
        return;
    }

    appRoot.innerHTML = `
        <div class="view-header" style="--accent-color: ${game.color}">
            <button class="btn-back" onclick="navigateTo('game', '${game.id}')">← Retour à ${game.name}</button>
            <h1>${subcat}</h1>
        </div>
        <div class="section-container" style="text-align: center; padding: 4rem 5%;">
            <h3 style="color: var(--neon-blue);">Mise à jour du flux en direct... 📡</h3>
        </div>
    `;

    const articles = await fetchRealGameNews(gameId, subcat);

    const articlesHtml = articles.map(article => `
        <div class="article-card" onclick="navigateTo('article', {gameId: '${gameId}', subcat: '${subcat}', articleId: ${article.id}})" style="background: var(--bg-card); padding: 1.5rem; border-radius: 8px; border-left: 4px solid ${game.color}; margin-bottom: 1.5rem; transition: var(--transition); cursor: pointer;" onmouseover="this.style.transform='translateX(8px)';" onmouseout="this.style.transform='translateX(0)';">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem; flex-wrap: wrap;">
                <span style="color: var(--text-muted); font-size: 0.85rem;">🕒 ${article.date}</span>
                <span class="badge" style="background: rgba(255,255,255,0.1); color: ${game.color}; padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 700;">${article.tag}</span>
            </div>
            <h3 style="font-size: 1.25rem; margin-bottom: 0.5rem; color: #fff;">${article.title}</h3>
            <p style="color: var(--text-muted); font-size: 0.95rem; line-height: 1.5;">${article.excerpt}</p>
            <div style="margin-top: 1rem; color: var(--neon-blue); font-weight: 600; font-size: 0.9rem;">Lire l'article complet →</div>
        </div>
    `).join('');

    appRoot.innerHTML = `
        <div class="fade-in">
            <div class="view-header" style="--accent-color: ${game.color}">
                <button class="btn-back" onclick="navigateTo('game', '${game.id}')">← Retour à ${game.name}</button>
                <h1>${subcat}</h1>
            </div>
            <div class="section-container" style="max-width: 900px; margin: 0 auto;">
                ${articlesHtml}
            </div>
        </div>
    `;
}

// 4. LECTEUR D'ARTICLE DÉDIÉ (Lecture 100% sur La Zone Gaming)
function renderArticleDetail(gameId, subcat, articleId) {
    const game = gamesData[gameId];
    const article = currentArticlesCache.find(a => a.id === articleId) || currentArticlesCache[0];

    const formattedParagraphs = article.content
        .split('\n')
        .filter(p => p.trim() !== '')
        .map(p => `<p style="margin-bottom: 1.2rem; color: #d1d1d6; font-size: 1.05rem; line-height: 1.8;">${p}</p>`)
        .join('');

    appRoot.innerHTML = `
        <div class="fade-in">
            <div class="view-header" style="--accent-color: ${game.color}">
                <button class="btn-back" onclick="navigateTo('content', {gameId: '${gameId}', subcat: '${subcat}'})">← Retour aux articles</button>
                <div style="margin-top: 1rem;">
                    <span class="badge" style="background: ${game.color}; color: #000; padding: 4px 12px; border-radius: 4px; font-weight: 800;">${game.name}</span>
                    <span style="color: var(--text-muted); font-size: 0.9rem; margin-left: 10px;">Publié le ${article.date}</span>
                </div>
            </div>
            
            <article class="section-container" style="max-width: 800px; margin: 2rem auto; background: var(--bg-card); padding: 2.5rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
                <h1 style="font-size: 2rem; margin-bottom: 1.5rem; color: #fff; line-height: 1.3;">${article.title}</h1>
                
                <div style="display: flex; gap: 1rem; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 1rem; margin-bottom: 2rem; color: var(--text-muted); font-size: 0.9rem;">
                    <span>✍️ Source : <strong>${article.author}</strong></span>
                    <span>•</span>
                    <span>🔥 Popularité : <strong>${article.score} pts</strong></span>
                </div>

                <div class="article-body">
                    ${formattedParagraphs}
                </div>

                <div style="margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.1); text-align: center;">
                    <button class="btn-primary" onclick="navigateTo('content', {gameId: '${gameId}', subcat: '${subcat}'})">Retour aux autres contenus</button>
                </div>
            </article>
        </div>
    `;
}

// 5. Système d'objectifs
function generateObjectivesHtml(objectivesList) {
    return objectivesList.map(obj => {
        const isDone = obj.done;
        return `
            <div class="obj-card ${isDone ? 'done' : ''}">
                <div class="obj-header">
                    <h3>${obj.title} <span style="font-size: 0.8rem; color: var(--text-muted)">- ${obj.game}</span></h3>
                    <span class="badge ${isDone ? 'done' : 'progress'}">${isDone ? 'Terminé' : 'En cours'}</span>
                </div>
                <p class="obj-desc">${obj.desc}</p>
                <div class="progress-container">
                    <div class="progress-bar" style="width: ${obj.progress}%"></div>
                </div>
                <div class="progress-text">
                    <span>Progression</span>
                    <span>${obj.progress}%</span>
                </div>
            </div>
        `;
    }).join('');
}

function renderGameObjectives(game) {
    const gameObjs = globalObjectivesData.filter(o => o.game === game.name);
    appRoot.innerHTML = `
        <div class="fade-in">
            <div class="view-header" style="--accent-color: ${game.color}">
                <button class="btn-back" onclick="navigateTo('game', '${game.id}')">← Retour à ${game.name}</button>
                <h1>Objectifs à débloquer</h1>
            </div>
            <div class="objectives-grid">
                ${gameObjs.length > 0 ? generateObjectivesHtml(gameObjs) : '<p style="text-align:center;">Aucun objectif actif actuellement.</p>'}
            </div>
        </div>
    `;
}

function renderGlobalObjectives() {
    appRoot.innerHTML = `
        <div class="fade-in">
            <div class="view-header" style="--accent-color: var(--neon-purple)">
                <h1>Centre des <span>Objectifs</span></h1>
            </div>
            <div class="objectives-grid">
                ${generateObjectivesHtml(globalObjectivesData)}
            </div>
        </div>
    `;
}

// Lancement automatique au chargement
window.onload = () => navigateTo('home');
