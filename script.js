// Fonction pour récupérer les actus depuis les sites officiels
async function fetchAutoNews(searchQuery, containerId) {
    const container = document.getElementById(containerId);
    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(searchQuery)}&hl=fr&gl=FR&ceid=FR:fr`;
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.status === 'ok' && data.items.length > 0) {
            container.innerHTML = '';
            data.items.slice(0, 4).forEach(item => {
                const date = new Date(item.pubDate).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                });

                // Nettoyage du contenu HTML pour affichage dans la modale
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = item.description || item.content || "Aucun détail disponible pour cet article.";
                const cleanText = tempDiv.textContent || tempDiv.innerText || "";

                const itemElement = document.createElement('div');
                itemElement.className = 'feed-item';
                itemElement.innerHTML = `
                    <div class="item-title">${item.title}</div>
                    <div class="feed-date">📅 ${date}</div>
                `;

                // Clic = Ouverture de la modale sur place (pas de redirection)
                itemElement.addEventListener('click', () => {
                    openModal(item.title, date, cleanText);
                });

                container.appendChild(itemElement);
            });
        } else {
            container.innerHTML = '<span class="loader">Aucune actualité récente disponible.</span>';
        }
    } catch (error) {
        console.error("Erreur de chargement pour " + searchQuery, error);
        container.innerHTML = '<span class="loader">Erreur lors du chargement des actus.</span>';
    }
}

// Gestion de la fenêtre modale
function openModal(title, date, content) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-date').textContent = "Publié le " + date;
    document.getElementById('modal-body').textContent = content;
    document.getElementById('news-modal').classList.add('active');
}

function closeModal() {
    document.getElementById('news-modal').classList.remove('active');
}

// Événements de fermeture
document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('news-modal').addEventListener('click', (e) => {
    if (e.target.id === 'news-modal') {
        closeModal();
    }
});

// Lancement avec les sources officielles exactes
document.addEventListener("DOMContentLoaded", () => {
    fetchAutoNews("site:fortnite.com Fortnite", "feed-fortnite");
    fetchAutoNews("site:playvalorant.com Valorant", "feed-valorant");
    fetchAutoNews("site:bandainamcoent.eu DRAGON BALL Sparking ZERO", "feed-dbz");
    fetchAutoNews("site:rocketleague.com Rocket League", "feed-rl");
});
