/* Implémentation plus avancée utilisant AJAX - à ajouter dans un nouveau fichier ajax-navigation.js */

document.addEventListener("DOMContentLoaded", function() {
    initAjaxNavigation();
});

function initAjaxNavigation() {
    // Créer un conteneur pour le contenu principal s'il n'existe pas
    if (!document.getElementById('main-content')) {
        // Envelopper le contenu principal (tout ce qui est entre header et footer)
        const header = document.getElementById('header-container');
        const footer = document.getElementById('footer-container');

        // Regrouper tous les éléments entre le header et le footer
        const mainContentWrapper = document.createElement('div');
        mainContentWrapper.id = 'main-content';

        // Trouver tous les éléments entre header et footer
        let currentNode = header.nextSibling;
        const nodesToMove = [];

        while (currentNode && currentNode !== footer) {
            if (currentNode.nodeType === 1) { // Uniquement les éléments
                nodesToMove.push(currentNode);
            }
            currentNode = currentNode.nextSibling;
        }

        // Insérer le wrapper après le header
        header.parentNode.insertBefore(mainContentWrapper, header.nextSibling);

        // Déplacer les éléments dans le wrapper
        nodesToMove.forEach(node => {
            mainContentWrapper.appendChild(node);
        });
    }

    // Intercepter les clics sur les liens de navigation
    document.body.addEventListener('click', function(e) {
        // Trouver le lien cliqué
        let target = e.target;
        while (target && target.tagName !== 'A') {
            target = target.parentNode;
            if (!target || target === document.body) return;
        }

        // Ne pas traiter les liens externes, les ancres ou les mailto
        const url = target.getAttribute('href');
        if (!url || url.startsWith('#') || url.startsWith('http') || url.startsWith('mailto:')) {
            return;
        }

        e.preventDefault();

        // Ajouter un état de chargement
        const mainContent = document.getElementById('main-content');
        mainContent.style.opacity = '0.5';

        // Charger le nouveau contenu via AJAX
        fetch(url)
            .then(response => response.text())
            .then(html => {
                // Créer un DOM temporaire pour extraire le contenu
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');

                // Extraire le contenu principal
                let newContent = '';

                // Trouver le contenu entre le header et le footer dans la nouvelle page
                const headerContainer = doc.getElementById('header-container');
                const footerContainer = doc.getElementById('footer-container');

                if (headerContainer && footerContainer) {
                    let currentNode = headerContainer.nextSibling;
                    while (currentNode && currentNode !== footerContainer) {
                        if (currentNode.nodeType === 1) { // Uniquement les éléments
                            newContent += currentNode.outerHTML;
                        }
                        currentNode = currentNode.nextSibling;
                    }
                }

                // Mettre à jour l'URL dans l'historique
                window.history.pushState({path: url}, '', url);

                // Mettre à jour le titre de la page
                document.title = doc.title;

                // Insérer le nouveau contenu avec une transition
                setTimeout(() => {
                    mainContent.innerHTML = newContent;
                    mainContent.style.opacity = '1';

                    // Réinitialiser les scripts pour la nouvelle page
                    reinitializeScripts();
                }, 300);
            })
            .catch(error => {
                console.error('Erreur lors du chargement de la page:', error);
                // En cas d'erreur, naviguer traditionnellement
                window.location.href = url;
            });
    });

    // Gérer les boutons retour/avant du navigateur
    window.addEventListener('popstate', function() {
        // Charger la page correspondante à l'état actuel de l'historique
        const mainContent = document.getElementById('main-content');
        mainContent.style.opacity = '0.5';

        fetch(location.href)
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');

                // Extraire le contenu principal comme précédemment
                let newContent = '';
                const headerContainer = doc.getElementById('header-container');
                const footerContainer = doc.getElementById('footer-container');

                if (headerContainer && footerContainer) {
                    let currentNode = headerContainer.nextSibling;
                    while (currentNode && currentNode !== footerContainer) {
                        if (currentNode.nodeType === 1) {
                            newContent += currentNode.outerHTML;
                        }
                        currentNode = currentNode.nextSibling;
                    }
                }

                // Mettre à jour le titre
                document.title = doc.title;

                // Insérer le nouveau contenu
                setTimeout(() => {
                    mainContent.innerHTML = newContent;
                    mainContent.style.opacity = '1';

                    // Réinitialiser les scripts
                    reinitializeScripts();
                }, 300);
            })
            .catch(error => {
                console.error('Erreur lors du chargement de la page:', error);
                window.location.reload();
            });
    });
}

// Fonction pour réinitialiser les scripts nécessaires après le chargement du contenu
function reinitializeScripts() {
    // Rechercher sur quelle page nous sommes et exécuter les scripts appropriés
    const path = window.location.pathname;
    const pageName = path.split('/').pop() || 'index.html';

    console.log(`Réinitialisation des scripts pour : ${pageName}`);

    // Réinitialiser les écouteurs d'événements communs
    const callMeButtons = document.getElementsByName("button-appelez-moi");
    for (let i = 0; i < callMeButtons.length; i++) {
        CallMeButtonHightlight(callMeButtons[i]);
    }

    // Mettre à jour le thème
    let themeMode = localStorage.getItem("themeMode") || "dark-mode";
    setSVGColor(themeMode);

    // Scripts spécifiques aux pages
    switch(pageName) {
        case '':
        case 'index.html':
            console.log('Initialisation des scripts pour la page d\'accueil');
            hideFullScreenImage();

            if (typeof getMapImages === 'function') {
                getMapImages().then(imageMap => {
                    if (typeof createByType === 'function') createByType(imageMap);
                    if (typeof initZoomImage === 'function') initZoomImage();
                    if (typeof initLeftRightButtonForFullScreenImage === 'function')
                        initLeftRightButtonForFullScreenImage(imageMap);
                }).catch(err => console.error('Erreur lors du chargement des images:', err));
            }

            if (typeof initScrollButtonVoirTravaux === 'function')
                initScrollButtonVoirTravaux();
            break;

        case 'contact.html':
            console.log('Initialisation des scripts pour la page de contact');
            // Ajouter ici des initialisations spécifiques à la page contact
            break;

        case 'about.html':
            console.log('Initialisation des scripts pour la page à propos');
            // Ajouter ici des initialisations spécifiques à la page about
            break;

        default:
            console.log(`Aucune initialisation spécifique pour ${pageName}`);
    }

    // Vérifier si les fonctions globales existent avant de les appeler
    const functions = [
        'initLightDarkMode',
        'toggleMode',
        'setSVGColor',
        'CallMeButtonHightlight'
    ];

    functions.forEach(funcName => {
        if (typeof window[funcName] !== 'function') {
            console.warn(`La fonction ${funcName} n'est pas définie`);
        }
    });
}

// Fonction pour extraire et appliquer les feuilles de style spécifiques à la page
// Ajouter cette fonction à votre fichier ajax-navigation.js

// Fonction pour extraire et appliquer les feuilles de style spécifiques à la page
function updatePageSpecificStyles(htmlDoc, targetUrl) {
    // Trouver toutes les feuilles de style dans le document chargé
    const newStylesheets = Array.from(htmlDoc.querySelectorAll('link[rel="stylesheet"]'))
        .map(link => link.getAttribute('href'));

    // Trouver les feuilles de style actuelles
    const currentStylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
        .map(link => link.getAttribute('href'));

    // Ajouter les feuilles de style manquantes
    newStylesheets.forEach(stylesheet => {
        if (!currentStylesheets.includes(stylesheet)) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = stylesheet;
            document.head.appendChild(link);
            console.log(`Feuille de style ajoutée: ${stylesheet}`);
        }
    });

    // Identifier la page actuelle
    const pageName = targetUrl.split('/').pop() || 'index.html';

    // Activer/désactiver les CSS spécifiques en fonction de la page
    const cssMap = {
        'index.html': 'style/travaux.css',
        'contact.html': 'style/contact.css',
        'about.html': 'style/about.css'
        // Ajoutez d'autres pages si nécessaire
    };

    // Désactiver tous les CSS spécifiques
    Object.values(cssMap).forEach(cssPath => {
        document.querySelectorAll(`link[href="${cssPath}"]`).forEach(link => {
            link.disabled = true;
        });
    });

    // Activer uniquement le CSS correspondant à la page actuelle
    const currentPageCss = cssMap[pageName];
    if (currentPageCss) {
        document.querySelectorAll(`link[href="${currentPageCss}"]`).forEach(link => {
            link.disabled = false;
        });
        console.log(`CSS activé pour ${pageName}: ${currentPageCss}`);
    }
}

// Modifiez la partie fetch de votre code pour inclure l'appel à cette fonction:

// Dans la fonction de traitement du clic:
fetch(url)
    .then(response => response.text())
    .then(html => {
        // Créer un DOM temporaire pour extraire le contenu
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Mettre à jour les styles spécifiques à la page
        updatePageSpecificStyles(doc, url);

        // Le reste du code de traitement...
    })
// ...

// Et dans le gestionnaire popstate également:
fetch(location.href)
    .then(response => response.text())
    .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Mettre à jour les styles spécifiques à la page
        updatePageSpecificStyles(doc, location.href);

        // Le reste du code de traitement...
    })
