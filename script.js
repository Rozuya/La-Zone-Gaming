// Fonction pour copier un pseudo dans le presse-papier
function copyText(textToCopy, platform) {
    navigator.clipboard.writeText(textToCopy).then(() => {
        showToast(`${platform} : "${textToCopy}" copié !`);
    }).catch(err => {
        console.error('Erreur lors de la copie :', err);
    });
}

// Fonction d'affichage du message "Toast"
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}
