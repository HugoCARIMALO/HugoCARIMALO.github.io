/* Exécuter au chargement de la page */
document.addEventListener("DOMContentLoaded", function () {
    initLightDarkMode();

    // Ajouter le header et le footer
    loadHeaderFooter().then(() => {
        setSVGColor(localStorage.getItem("themeMode") || "dark-mode");
        initMobileMenu();
    });

    // Si la page est index.html
    if (window.location.pathname.endsWith("index.html") || window.location.pathname === "/") {
        hideFullScreenImage();

        getMapImages().then(imageMap => {
            createByType(imageMap);
            initZoomImage();
            initLeftRightButtonForFullScreenImage(imageMap);
        }).catch(error => console.error("Erreur lors du chargement des images:", error));

        initModernButtonVoirTravaux();
    }
});

/* Fonction pour charger le header et le footer avec le toggle */
async function loadHeaderFooter() {
    try {
        // Récupérer le contenu du header et du footer
        const headerData = await fetch('header.html').then(response => response.text());
        const footerData = await fetch('footer.html').then(response => response.text());
        document.getElementById('header-container').innerHTML = headerData;
        document.getElementById('footer-container').innerHTML = footerData;

        // Initialiser l'état du toggle switch
        const checkbox = document.getElementById('checkbox');
        if (checkbox) {
            const themeMode = localStorage.getItem("themeMode") || "dark-mode";
            checkbox.checked = themeMode === "light-mode";
            checkbox.addEventListener('change', toggleMode);
        }

        // Appliquer les couleurs au logo SVG
        setSVGColor(localStorage.getItem("themeMode") || "dark-mode");

        // Gestion des boutons appelez-moi
        const callMeButtons = document.getElementsByName("button-appelez-moi");
        for (let i = 0; i < callMeButtons.length; i++) {
            CallMeButtonHightlight(callMeButtons[i]);
        }
    } catch (error) {
        console.error("Erreur lors du chargement du header ou du footer", error);
    }
}

/* Fonction pour initialiser le mode sombre ou clair */
function initLightDarkMode() {
    const body = document.body;
    const themeMode = localStorage.getItem("themeMode") || "dark-mode";

    body.classList.toggle("dark-mode", themeMode === "dark-mode");
    body.classList.toggle("light-mode", themeMode === "light-mode");

    // Synchroniser l'état du toggle avec le mode actuel
    const checkbox = document.getElementById('checkbox');
    if (checkbox) {
        checkbox.checked = themeMode === "light-mode";
    }

    localStorage.setItem("themeMode", themeMode);
}

/* Fonction pour activer le mode sombre ou clair */
function toggleMode() {
    const body = document.body;
    let themeMode = localStorage.getItem("themeMode") || "dark-mode";

    themeMode = themeMode === "dark-mode" ? "light-mode" : "dark-mode";
    localStorage.setItem("themeMode", themeMode);

    body.classList.toggle("dark-mode");
    body.classList.toggle("light-mode");

    // Synchroniser l'état du toggle avec le mode actuel
    const checkbox = document.getElementById('checkbox');
    if (checkbox) {
        checkbox.checked = themeMode === "light-mode";
    }

    // Mettre à jour les couleurs SVG
    setSVGColor(themeMode);
}

/* Fonction pour définir la couleur du SVG en fonction du thème */
function setSVGColor(themeMode) {
    const rootStyle = getComputedStyle(document.documentElement);
    const style = rootStyle.getPropertyValue(themeMode === "dark-mode" ? '--sand' : '--navy').trim();

    // Sélectionner tous les éléments 'path' dans le logo SVG
    const logoPaths = document.querySelectorAll("#logo path");

    if (logoPaths && logoPaths.length > 0) {
        // Changer la couleur de remplissage de chaque élément 'path'
        logoPaths.forEach(path => {
            path.style.fill = style;
        });
    } else {
        // Réessayer après un court délai si les éléments path ne sont pas encore chargés
        setTimeout(() => setSVGColor(themeMode), 100);
    }
}

/* Fonction pour créer les cards dynamiquement */
function createByType(imageMap) {
    for (const [type, imageList] of Object.entries(imageMap)) {
        const cardContainer = document.getElementById("cardContainer-" + type);
        if (!cardContainer) continue;

        // Parcourir la liste d'images et créer les cards dynamiquement
        imageList.forEach(imageObj => {
            const card = document.createElement("div");
            card.className = "card";

            const image = document.createElement("img");
            image.src = imageObj.url;
            image.className = "zoom-trigger";
            card.appendChild(image);

            const title = document.createElement("h5");
            title.textContent = imageObj.name;
            title.className = "title";
            card.appendChild(title);

            cardContainer.appendChild(card);
        });
    }
}

/* Fonction pour récupérer les images depuis GitHub */
async function getMapImages() {
    const url = "https://api.github.com/repos/HugoCARIMALO/embellir37.fr/git/trees/main?recursive=true";

    const response = await fetch(url, {
        headers: {
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28"
        }
    });

    const jsonData = await response.json();
    const imageMap = {};

    if (response.status !== 200) {
        throw new Error("Erreur lors de la récupération des données: " + jsonData.message);
    }

    jsonData.tree.forEach(element => {
        if (element.type === "blob") {
            const fileName = element.path.split('/').pop();
            const directory = element.path.split('/')[0];

            if (!imageMap[directory]) {
                imageMap[directory] = [];
            }

            const imageUrl = fileNameToURL(directory + '/' + fileName);
            const imageName = fileName.replace(/\.[^/.]+$/, "");

            // Ajouter l'URL de l'image à la liste
            imageMap[directory].push({ name: imageName, url: imageUrl });
        }
    });

    return imageMap;
}

/* Convertir un nom de fichier en URL GitHub */
function fileNameToURL(fileName) {
    return `https://raw.githubusercontent.com/HugoCARIMALO/embellir37.fr/main/${encodeURIComponent(fileName)}`;
}

/* Convertir une URL en nom de fichier */
function URLToFileName(url) {
    return decodeURIComponent(url).split('/').pop().replace(/\.[^/.]+$/, "");
}

/* Fonction pour initialiser les boutons gauche/droite pour la navigation entre images */
function initLeftRightButtonForFullScreenImage(imageMap) {
    const leftButton = document.querySelector('.fullScreen-header img[src="img/caretCircleLeft.svg"]');
    const rightButton = document.querySelector('.fullScreen-header img[src="img/caretCircleRight.svg"]');
    const fullScreenImage = document.getElementById('fullScreen-image');
    const imageTitle = document.getElementById('image-title');

    if (!leftButton || !rightButton || !fullScreenImage || !imageTitle) {
        return;
    }

    // Ordonner les images par catégorie
    const orderedCategories = ["Pavage", "Dallage", "Portail", "Cloture", "Assainissement"];
    const images = orderedCategories.flatMap(category => {
        if (imageMap[category]) {
            return imageMap[category].sort((a, b) => a.name.localeCompare(b.name));
        }
        return [];
    });

    let currentIndex = 0;
    let isTransitioning = false;

    // Fonction pour changer d'image avec une animation
    function changeImage(direction) {
        if (isTransitioning) return;
        isTransitioning = true;

        // Calculer le nouvel index
        let newIndex;
        if (direction === 'left') {
            newIndex = currentIndex - 1;
            if (newIndex < 0) newIndex = images.length - 1;
            fullScreenImage.classList.add('slide-out-right');
        } else {
            newIndex = currentIndex + 1;
            if (newIndex >= images.length) newIndex = 0;
            fullScreenImage.classList.add('slide-out-left');
        }

        // Faire disparaître le titre
        imageTitle.classList.add('changing');

        // Attendre la fin de l'animation de sortie
        setTimeout(() => {
            // Changer l'image source
            fullScreenImage.src = images[newIndex].url;

            // Mettre à jour le titre
            setTimeout(() => {
                imageTitle.textContent = images[newIndex].name;
                imageTitle.classList.remove('changing');
            }, 100);

            // Retirer les classes d'animation précédentes
            fullScreenImage.classList.remove('slide-out-left', 'slide-out-right');

            // Ajouter l'animation d'entrée
            fullScreenImage.classList.add('slide-in');

            // Sauvegarder le nouvel index
            currentIndex = newIndex;

            // Réinitialiser après la transition
            setTimeout(() => {
                fullScreenImage.classList.remove('slide-in');
                isTransitioning = false;
            }, 300);
        }, 300);
    }

    // Événement pour le bouton gauche
    leftButton.addEventListener('click', function(event) {
        event.stopPropagation();

        // Trouver l'index actuel basé sur l'URL de l'image
        if (!isTransitioning) {
            const currentUrl = fullScreenImage.src;
            currentIndex = images.findIndex(img => img.url === currentUrl);
            if (currentIndex === -1) currentIndex = 0;
        }

        changeImage('left');
    });

    // Événement pour le bouton droit
    rightButton.addEventListener('click', function(event) {
        event.stopPropagation();

        // Trouver l'index actuel basé sur l'URL de l'image
        if (!isTransitioning) {
            const currentUrl = fullScreenImage.src;
            currentIndex = images.findIndex(img => img.url === currentUrl);
            if (currentIndex === -1) currentIndex = 0;
        }

        changeImage('right');
    });

    // Navigation par flèches du clavier
    document.addEventListener('keydown', function(event) {
        const overlay = document.getElementById('overlay');
        if (overlay.style.display !== 'block') return;

        if (event.key === 'ArrowLeft') {
            leftButton.click();
        } else if (event.key === 'ArrowRight') {
            rightButton.click();
        }
    });
}

/* Fonction pour afficher l'image en plein écran avec transitions */
function showFullScreenImage(imageUrl, imageTitle, overlay, zoomedImage, zoomedImageBlock, zoomedTitle) {
    // Réinitialiser les classes de l'image principale
    zoomedImage.className = 'fullScreen-image';

    // Mettre à jour l'image et le titre
    zoomedImage.src = imageUrl;
    zoomedTitle.textContent = imageTitle;

    // Afficher l'overlay et le bloc d'image
    overlay.style.display = 'block';
    zoomedImageBlock.style.display = 'flex';

    // Forcer un reflow pour que les transitions fonctionnent correctement
    void overlay.offsetWidth;

    // Ajouter les classes pour déclencher les transitions
    overlay.classList.add('visible');
    zoomedImageBlock.classList.add('visible');

    // Récupérer l'en-tête et ajouter la classe visible
    const header = document.querySelector('.fullScreen-header');
    if (header) {
        header.classList.add('visible');
    }

    // Ajouter la classe visible à l'image après un court délai
    setTimeout(() => {
        zoomedImage.classList.add('visible');
    }, 50);
}

/* Fonction pour masquer l'image en plein écran avec transitions */
function hideFullScreenImage() {
    const overlay = document.getElementById('overlay');
    const zoomedImageBlock = document.getElementById('fullScreen-image-block');
    const zoomedImage = document.getElementById('fullScreen-image');
    const header = document.querySelector('.fullScreen-header');

    if (!overlay || !zoomedImageBlock || !zoomedImage) {
        return; // Protection contre les erreurs
    }

    // Supprimer les classes visible pour déclencher les transitions
    zoomedImage.classList.remove('visible');
    if (header) {
        header.classList.remove('visible');
    }

    // Attendre un peu avant de faire disparaître l'overlay
    setTimeout(() => {
        overlay.classList.remove('visible');
        zoomedImageBlock.classList.remove('visible');

        // Cacher complètement les éléments une fois les transitions terminées
        setTimeout(() => {
            overlay.style.display = 'none';
            zoomedImageBlock.style.display = 'none';

            // Nettoyer les images supplémentaires créées pendant la navigation
            const extraImages = document.querySelectorAll('.fullScreen-image:not(#fullScreen-image)');
            extraImages.forEach(img => img.remove());
        }, 400); // Correspond à la durée des transitions CSS
    }, 150);
}

/* Initialisation du zoom sur les images */
function initZoomImage() {
    const overlay = document.getElementById('overlay');
    const zoomedImageBlock = document.getElementById('fullScreen-image-block');
    const zoomedImage = document.getElementById('fullScreen-image');
    const zoomedTitle = document.getElementById('image-title');
    const cardContainers = document.querySelectorAll('.cardContainer');

    // Vérification des éléments
    if (!overlay || !zoomedImageBlock || !zoomedImage || !zoomedTitle || !cardContainers.length) {
        return;
    }

    // Ajouter un écouteur d'événement à chaque conteneur de carte
    cardContainers.forEach(container => {
        container.addEventListener('click', function(event) {
            // Vérifier si l'élément cliqué est une image
            if (!event.target.classList.contains('zoom-trigger')) {
                return;
            }

            // Récupérer les attributs de l'image cliquée
            const imageUrl = event.target.src;
            const imageTitle = URLToFileName(event.target.src);

            showFullScreenImage(imageUrl, imageTitle, overlay, zoomedImage, zoomedImageBlock, zoomedTitle);
        });
    });

    // Ajouter un écouteur d'événement pour fermer l'image zoomée en cliquant sur l'overlay
    overlay.addEventListener('click', function(event) {
        if (event.target === overlay) {
            hideFullScreenImage();
        }
    });

    // Ajouter un écouteur d'événement pour la touche Échap
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && overlay.style.display === 'block') {
            hideFullScreenImage();
        }
    });
}

/* Initialisation du bouton "Voir mes travaux" avec animations */
function initModernButtonVoirTravaux() {
    const button = document.getElementById('button-voir-travaux');
    if (!button) return;

    // Ajouter la classe d'animation au chargement
    button.classList.add('pulse-animation');

    // Arrêter l'animation de pulse après le premier clic
    button.addEventListener('click', function(event) {
        button.classList.remove('pulse-animation');

        // Effet de vague au clic
        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        button.style.setProperty('--ripple-x', x + 'px');
        button.style.setProperty('--ripple-y', y + 'px');

        // Faire défiler en douceur vers la section des travaux
        const target = document.getElementById('travaux');
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });

    // Effet de flottement continu
    let floatInterval;

    button.addEventListener('mouseenter', function() {
        // Arrêter l'animation de pulse si elle est encore active
        button.classList.remove('pulse-animation');

        // Ajouter un effet de flottement subtil
        let floatUp = true;
        let position = 0;

        clearInterval(floatInterval);

        floatInterval = setInterval(() => {
            if (floatUp) {
                position += 0.3;
                if (position >= 5) floatUp = false;
            } else {
                position -= 0.3;
                if (position <= 0) floatUp = true;
            }

            button.style.transform = `translateY(-${position}px)`;
        }, 30);
    });

    button.addEventListener('mouseleave', function() {
        clearInterval(floatInterval);
        button.style.transform = '';
    });
}

/* Fonction pour mettre en évidence le numéro de téléphone */
function CallMeButtonHightlight(callMeButton) {
    callMeButton.addEventListener('click', function() {
        const telephone = document.getElementById('telephone');
        if (!telephone) return;

        telephone.scrollIntoView({ behavior: 'smooth' });
        telephone.classList.add('highlight');

        setTimeout(() => {
            telephone.classList.remove('highlight');
        }, 5000);
    });
}

/* Initialisation du menu mobile */
function initMobileMenu() {
    const burgerButton = document.getElementById('burger-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const closeButton = document.getElementById('close-menu');
    const body = document.body;

    if (!burgerButton || !mobileMenu) return;

    // Créer un overlay pour l'arrière-plan
    let overlay = document.querySelector('.menu-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'menu-overlay';
        body.appendChild(overlay);
    }

    // Fonction pour ouvrir le menu
    function openMenu() {
        mobileMenu.classList.add('open');
        overlay.classList.add('open');
        body.style.overflow = 'hidden'; // Empêcher le défilement de la page
    }

    // Fonction pour fermer le menu
    function closeMenu() {
        mobileMenu.classList.remove('open');
        overlay.classList.remove('open');
        body.style.overflow = ''; // Rétablir le défilement
    }

    // Écouteurs d'événements
    burgerButton.addEventListener('click', openMenu);

    if (closeButton) {
        closeButton.addEventListener('click', closeMenu);
    }

    // Fermer le menu en cliquant sur l'overlay
    overlay.addEventListener('click', closeMenu);

    // Fermer le menu en cliquant sur un lien
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
    mobileNavItems.forEach(item => {
        item.addEventListener('click', closeMenu);
    });

    // Synchroniser le toggle de thème mobile avec le toggle principal
    const checkboxMobile = document.getElementById('checkbox-mobile');
    if (checkboxMobile) {
        // Initialiser l'état du toggle mobile
        let themeMode = localStorage.getItem("themeMode") || "dark-mode";
        checkboxMobile.checked = themeMode === "light-mode";

        // Synchroniser le toggle mobile avec le toggle principal
        checkboxMobile.addEventListener('change', function() {
            toggleMode();
            // Mettre à jour l'état du checkbox principal
            const checkbox = document.getElementById('checkbox');
            if (checkbox) {
                checkbox.checked = checkboxMobile.checked;
            }
        });
    }
}