/* Implémentation optimisée utilisant AJAX - ajax-navigation.js */

document.addEventListener("DOMContentLoaded", function() {
    initAjaxNavigation();
});

function initAjaxNavigation() {
    // Créer un conteneur pour le contenu principal s'il n'existe pas
    if (!document.getElementById('main-content')) {
        // Envelopper le contenu principal (tout ce qui est entre header et footer)
        const header = document.getElementById('header-container');
        const footer = document.getElementById('footer-container');

        if (!header || !footer) {
            console.error("Header ou footer non trouvé, impossible d'initialiser la navigation AJAX");
            return;
        }

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

    // Fonction améliorée pour afficher l'indicateur de chargement
    function showLoadingIndicator() {
        // Vérifier si un indicateur existe déjà
        if (document.querySelector('.loading-indicator')) {
            return;
        }

        // Masquer immédiatement le contenu principal pour éviter le clignotement
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            // Appliquer un fondu instantané
            mainContent.style.transition = 'none';
            mainContent.style.opacity = '0';
            // Forcer un reflow pour appliquer immédiatement le style
            void mainContent.offsetWidth;
        }

        // Déterminer le thème actuel
        const themeMode = document.body.classList.contains('light-mode') ? 'light-mode' : 'dark-mode';

        // Créer l'indicateur de chargement
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = `loading-indicator ${themeMode}`; // Ajouter la classe du thème
        loadingIndicator.innerHTML = '<div class="spinner"></div>';

        // Ajouter au body
        document.body.appendChild(loadingIndicator);

        // Empêcher le défilement pendant le chargement
        document.body.style.overflow = 'hidden';
    }

    // Fonction modifiée pour masquer l'indicateur de chargement
    function hideLoadingIndicator(newContent = null) {
        console.log("hideLoadingIndicator appelé", newContent ? "avec contenu" : "sans contenu");

        const indicator = document.querySelector('.loading-indicator');
        const mainContent = document.getElementById('main-content');

        console.log("mainContent trouvé:", !!mainContent);
        console.log("indicator trouvé:", !!indicator);

        // Si un nouveau contenu est fourni, le préparer en arrière-plan
        if (newContent && mainContent) {
            console.log("Insertion du nouveau contenu");
            mainContent.innerHTML = newContent;

            // S'assurer que le contenu est visible immédiatement si l'indicateur n'existe pas
            if (!indicator) {
                mainContent.style.opacity = '1';
            }
        }

        if (indicator) {
            // Ajouter une classe pour l'animation de sortie
            indicator.classList.add('fade-out');

            // Supprimer après la fin de l'animation
            setTimeout(() => {
                if (indicator.parentNode) {
                    indicator.parentNode.removeChild(indicator);
                }

                // Maintenant, afficher le contenu avec une transition douce
                if (mainContent) {
                    // Restaurer la transition normale
                    mainContent.style.transition = 'opacity 0.4s ease';
                    // S'assurer que l'opacité est définie à 1
                    mainContent.style.opacity = '1';
                }

                // Rétablir le défilement
                document.body.style.overflow = '';
            }, 300);
        } else {
            // Si pas d'indicateur, afficher quand même le contenu
            if (mainContent) {
                // Restaurer la transition normale
                mainContent.style.transition = 'opacity 0.4s ease';
                // S'assurer que l'opacité est définie à 1
                mainContent.style.opacity = '1';
            }
            document.body.style.overflow = '';
        }
    }

// Ajouter également une fonction de sécurité à exécuter après le chargement complet
// Ajouter cette fonction à la fin de scripts/ajax-navigation.js

    function ensureContentVisibility() {
        // Fonction de sécurité pour s'assurer que le contenu est toujours visible
        const mainContent = document.getElementById('main-content');
        if (mainContent && window.getComputedStyle(mainContent).opacity < '1') {
            console.log("Correction d'opacité appliquée");
            mainContent.style.transition = 'opacity 0.4s ease';
            mainContent.style.opacity = '1';
        }
    }

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

        // Afficher l'indicateur de chargement immédiatement (masque le contenu)
        showLoadingIndicator();

        // Faire défiler vers le haut de la page immédiatement
        window.scrollTo(0, 0);

        // Charger le nouveau contenu via AJAX
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erreur HTTP: ${response.status}`);
                }
                return response.text();
            })
            .then(html => {
                // Créer un DOM temporaire pour extraire le contenu
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');

                // Mettre à jour les styles spécifiques à la page
                updatePageSpecificStyles(doc, url);

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
                } else {
                    throw new Error("Impossible de trouver header-container ou footer-container dans la page cible");
                }

                // Mettre à jour l'URL dans l'historique
                window.history.pushState({path: url}, '', url);

                // Mettre à jour le titre de la page
                document.title = doc.title;

                // Masquer l'indicateur et afficher le nouveau contenu
                hideLoadingIndicator(newContent);

                // Réinitialiser les scripts pour la nouvelle page
                // Léger délai pour s'assurer que le DOM est prêt
                setTimeout(() => {
                    reinitializeScripts();
                }, 100);
            })
            .catch(error => {
                console.error('Erreur lors du chargement de la page:', error);

                const mainContent = document.getElementById('main-content');
                if (mainContent) {
                    // Préparer le message d'erreur
                    const errorContent = `
                        <div class="ajax-error">
                            <h3>Erreur de chargement</h3>
                            <p>Une erreur est survenue lors du chargement de la page.</p>
                            <button onclick="window.location.href='${url}'">Réessayer</button>
                        </div>
                    `;

                    // Afficher l'erreur avec la fonction hideLoadingIndicator
                    hideLoadingIndicator(errorContent);
                } else {
                    // Si mainContent n'existe pas, juste masquer l'indicateur
                    hideLoadingIndicator();

                    // En cas d'erreur grave, naviguer traditionnellement après un court délai
                    setTimeout(() => {
                        window.location.href = url;
                    }, 500);
                }
            });
    });

    // Gérer les boutons retour/avant du navigateur
    window.addEventListener('popstate', function() {
        // Afficher l'indicateur de chargement
        showLoadingIndicator();

        // Faire défiler vers le haut de la page immédiatement
        window.scrollTo(0, 0);

        // Utiliser l'URL actuelle du navigateur
        const targetUrl = location.href;

        // Charger la page correspondante à l'état actuel de l'historique
        fetch(targetUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erreur HTTP: ${response.status}`);
                }
                return response.text();
            })
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');

                // Mettre à jour les styles spécifiques à la page
                updatePageSpecificStyles(doc, targetUrl);

                // Extraire le contenu principal
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
                } else {
                    throw new Error("Impossible de trouver header-container ou footer-container dans la page cible");
                }

                // Mettre à jour le titre
                document.title = doc.title;

                // Masquer l'indicateur et afficher le nouveau contenu
                hideLoadingIndicator(newContent);

                // Réinitialiser les scripts
                setTimeout(() => {
                    reinitializeScripts();
                }, 100);
            })
            .catch(error => {
                console.error('Erreur lors du chargement de la page:', error);

                // En cas d'erreur, recharger la page complètement
                hideLoadingIndicator();
                window.location.reload();
            });
    });

    // Initialiser le préchargement des liens pour améliorer la réactivité
    initLinkPreloading();
}

// Fonction pour précharger les pages au survol des liens
function initLinkPreloading() {
    document.querySelectorAll('a[href]:not([href^="#"]):not([href^="http"]):not([href^="mailto:"])').forEach(link => {
        link.addEventListener('mouseenter', function() {
            const url = this.getAttribute('href');
            if (url) {
                // Précharger la page sans l'afficher
                fetch(url).catch(() => {}); // Ignorer les erreurs silencieusement
            }
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
        if (typeof CallMeButtonHightlight === 'function') {
            CallMeButtonHightlight(callMeButtons[i]);
        }
    }

    // Mettre à jour le thème
    let themeMode = localStorage.getItem("themeMode") || "dark-mode";
    if (typeof setSVGColor === 'function') {
        setSVGColor(themeMode);
    }

    // Initialiser le menu mobile s'il existe
    if (typeof initMobileMenu === 'function') {
        initMobileMenu();
    }

    // Scripts spécifiques aux pages
    switch(pageName) {
        case '':
        case 'index.html':
            console.log('Initialisation des scripts pour la page d\'accueil');
            if (typeof hideFullScreenImage === 'function') {
                hideFullScreenImage();
            }

            if (typeof getMapImages === 'function') {
                getMapImages().then(imageMap => {
                    if (typeof createByType === 'function') createByType(imageMap);
                    if (typeof initZoomImage === 'function') initZoomImage();
                    if (typeof initLeftRightButtonForFullScreenImage === 'function')
                        initLeftRightButtonForFullScreenImage(imageMap);
                }).catch(err => console.error('Erreur lors du chargement des images:', err));
            }

            if (typeof initModernButtonVoirTravaux === 'function') {
                initModernButtonVoirTravaux();
            }
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

    // Réinitialiser le préchargement des liens après chaque changement de page
    setTimeout(initLinkPreloading, 500);

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

    // Ajout de la vérification de visibilité après toutes les initialisations
    setTimeout(ensureContentVisibility, 1000);
    setTimeout(ensureContentVisibility, 2000); // Double vérification après 2 secondes
}

function ensureContentVisibility() {
    // Fonction de sécurité pour s'assurer que le contenu est toujours visible
    const mainContent = document.getElementById('main-content');
    if (mainContent && window.getComputedStyle(mainContent).opacity < '1') {
        console.log("Correction d'opacité appliquée");
        mainContent.style.transition = 'opacity 0.4s ease';
        mainContent.style.opacity = '1';
    }
}