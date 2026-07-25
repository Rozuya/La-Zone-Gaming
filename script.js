/**
 * BASE DE DONNÉES DE LA ZONE GAMING
 */
const gamesData = {
    fortnite: {
        id: "fortnite",
        name: "Fortnite",
        color: "var(--color-fortnite)",
        desc: "Domine le Battle Royale avec nos guides de build, rotations et défis.",
        image: "https://images.unsplash.com/photo-1589241062272-c0a000072dfa?q=80&w=800",
        subcategories: ["Actualités", "Guides & Astuces", "Défis", "Nouveautés", "Compétitif", "Objectifs à débloquer"]
    },
    rocketleague: {
        id: "rocketleague",
        name: "Rocket League",
        color: "var(--color-rl)",
        desc: "Améliore tes mécaniques et envole-toi vers le rang Supersonic Legend.",
        image: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?q=80&w=800",
        subcategories: ["Actualités", "Guides & Astuces", "Défis", "Compétitif", "Tournois", "Objectifs à débloquer"]
    },
    valorant: {
        id: "valorant",
        name: "Valorant",
        color: "var(--color-valorant)",
        desc: "Maîtrise chaque agent et perfectionne ton aim pour grimper Radiant.",
        image: "https://images.unsplash.com/photo-1631557007672-00366835a6db?q=80&w=800",
        subcategories: ["Actualités", "Agents", "Guides & Astuces", "Compétitif", "Stratégies", "Objectifs à débloquer"]
    },
    dbz: {
        id: "dbz",
        name: "DB Sparking Zero",
        color: "var(--color-dbz)",
        desc: "Deviens le guerrier ultime avec nos combos et analyses de personnages.",
        image: "https://images.unsplash.com/photo-1605371924599-2d0365da1ae0?q=80&w=800",
        subcategories: ["Actualités", "Personnages", "Guides & Astuces", "Combats", "Défis", "Objectifs à débloquer"]
    }
};

const objectivesData = [
    { game: "Valorant", title: "Atteindre le rang Diamant", desc: "Gagne 5 parties consécutives en mode classé.", progress: 80, done: false },
    { game: "Fortnite", title: "Débloquer le planeur secret", desc: "Trouve les 5 artefacts cachés sur la carte.", progress: 100, done: true },
    { game: "Rocket League", title: "Maîtriser le Flip Reset", desc: "Réalise 3 Flip Resets valides en match compétitif.", progress: 33, done: false },
    { game: "DB Sparking Zero", title: "Débloquer Gogeta SSJ4", desc: "Termine le mode histoire en difficulté extrême.", progress: 65, done: false }
];

/**
 * MOTEUR DE RENDU (SPA ROUTER)
 */
const appRoot = document.getElementById('app-root');

// Fonction principale de navigation
function navigateTo(view, param = null) {
    appRoot.innerHTML = ''; // Nettoyer la vue actuelle
    window.scrollTo({ top: 0, behavior: 'smooth' });

    switch(view) {
        case 'home': renderHome(); break;
        case 'game': renderGame(param); break;
        case 'content': renderContent(param.gameId, param.subcat); break;
        case 'objectives': renderGlobalObjectives(); break;
        default: renderHome();
    }
}

// 1. Rendu de la page d'accueil
function renderHome() {
    let gamesHtml = Object.values(gamesData).map(game => `
        <div class="game-card" style="--accent-color: ${game.color}" onclick="navigateTo('game', '${game.id}')">
            <div class="game-visual" style="background-image: url('${game.image}')"></div>
            <div class="game-info">
                <h3>${game.name}</h3>
                <p>${game.desc}</p>
                <button class="btn-secondary">Découvrir</button>
            </div>
        </div>
    `).join('');

    appRoot.innerHTML = `
        <div class="fade-in">
            <section class="hero">
                <h1>Entrez dans <span>La Zone</span></h1>
                <p>La plateforme ultime pour t'améliorer, suivre tes statistiques et débloquer des défis exclusifs sur tes jeux préférés.</p>
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

// 2. Rendu de la page d'un jeu spécifique
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
                <button class="btn-back" onclick="navigateTo('home')">← Retour à l'accueil</button>
                <h1 style="color: ${game.color}">${game.name}</h1>
                <p style="color: var(--text-muted); margin-top: 1rem;">Sélectionne une catégorie pour accéder au contenu.</p>
            </div>
            <div class="subcat-grid">
                ${subcatsHtml}
            </div>
        </div>
    `;
}

// 3. Rendu du contenu d'une sous-catégorie
function renderContent(gameId, subcat) {
    const game = gamesData[gameId];
    
    // Si l'utilisateur clique sur "Objectifs à débloquer", on affiche le système d'objectifs
    if(subcat === "Objectifs à débloquer") {
        renderGameObjectives(game);
        return;
    }

    appRoot.innerHTML = `
        <div class="fade-in">
            <div class="view-header" style="--accent-color: ${game.color}">
                <button class="btn-back" onclick="navigateTo('game', '${game.id}')">← Retour à ${game.name}</button>
                <h1>${subcat}</h1>
                <h3 style="color: ${game.color}; margin-top: 0.5rem;">${game.name}</h3>
            </div>
            <div class="section-container">
                <div style="background: var(--bg-card); padding: 4rem; text-align: center; border-radius: 8px; border: 1px dashed ${game.color}50;">
                    <h2 style="color: var(--text-muted)">Contenu en cours de rédaction...</h2>
                    <p>Revenez bientôt pour découvrir nos astuces et guides sur cette section.</p>
                </div>
            </div>
        </div>
    `;
}

// 4. Système d'objectifs (Générateur de cartes)
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

// 4a. Objectifs spécifiques à un jeu
function renderGameObjectives(game) {
    const gameObjs = objectivesData.filter(o => o.game === game.name);
    
    appRoot.innerHTML = `
        <div class="fade-in">
            <div class="view-header" style="--accent-color: ${game.color}">
                <button class="btn-back" onclick="navigateTo('game', '${game.id}')">← Retour à ${game.name}</button>
                <h1>Objectifs & Défis</h1>
                <p style="color: var(--text-muted); margin-top: 1rem;">Complète ces objectifs pour gagner des récompenses exclusives.</p>
            </div>
            <div class="objectives-grid">
                ${gameObjs.length > 0 ? generateObjectivesHtml(gameObjs) : '<p>Aucun objectif actif pour le moment.</p>'}
            </div>
        </div>
    `;
}

// 4b. Vue globale de tous les objectifs (accessible via la Navbar)
function renderGlobalObjectives() {
    appRoot.innerHTML = `
        <div class="fade-in">
            <div class="view-header" style="--accent-color: var(--neon-purple)">
                <h1>Centre des <span>Objectifs</span></h1>
                <p style="color: var(--text-muted); margin-top: 1rem;">Suivez votre progression sur l'ensemble de vos jeux.</p>
            </div>
            <div class="objectives-grid">
                ${generateObjectivesHtml(objectivesData)}
            </div>
        </div>
    `;
}

// Initialisation de l'application au chargement
window.onload = () => {
    renderHome();
};
