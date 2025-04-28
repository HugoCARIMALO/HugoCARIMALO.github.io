/* Exécuter au chargement de la page */
document.addEventListener("DOMContentLoaded", function () {
    initLightDarkMode();

    // Ajouter le header et le footer
    loadHeaderFooter().then(() => {
        setSVGColor(localStorage.getItem("themeMode") || "dark-mode");
        console.log("Header et footer chargés")});

    // si la page est index.html
    if (window.location.pathname.endsWith("index.html") || window.location.pathname === "/" || window.location.pathname === "") {
        // Masquer immédiatement les éléments de l'overlay au chargement
        const overlay = document.getElementById('overlay');
        const zoomedImageBlock = document.getElementById('fullScreen-image-block');

        if (overlay) overlay.style.display = 'none';
        if (zoomedImageBlock) zoomedImageBlock.style.display = 'none';

        getMapImages().then(imageMap => {
            createByType(imageMap);
            initZoomImage();
            initLeftRightButtonForFullScreenImage(imageMap);
        });

        initScrollButtonVoirTravaux();
    }
});

/* Fonction pour charger le header et le footer */
async function loadHeaderFooter() {
    try {
        // Recuperer le contenu du header et du footer et les ajouter dans les div correspondantes
        headerData = await fetch('header.html').then(response => response.text());
        footerData = await fetch('footer.html').then(response => response.text());
        document.getElementById('header-container').innerHTML = headerData;
        document.getElementById('footer-container').innerHTML = footerData;

        // Gestion du bouton dans le header pour activer le mode sombre ou clair
        let themeMode = localStorage.getItem("themeMode") || "dark-mode";
        if (themeMode === "light-mode") {
            const btn = document.getElementById("button-light-mode");
            btn.src = `img/${themeMode}.svg`;
        }

        // Gestion des butons appelez-moi (there is multiple)
        const callMeButton = document.getElementsByName("button-appelez-moi")
        for (let i = 0; i < callMeButton.length; i++) {
            CallMeButtonHightlight(callMeButton[i]);
        }

    } catch (error) {
        console.error("Erreur lors du chargement du header ou du footer", error);
    }
}

/* Fonction pour initialiser le mode sombre ou clair */
function initLightDarkMode() {
    const body = document.body;
    let themeMode = localStorage.getItem("themeMode") || "dark-mode";

    body.classList.toggle("dark-mode", themeMode === "dark-mode");
    body.classList.toggle("light-mode", themeMode === "light-mode");

    localStorage.setItem("themeMode", themeMode);
}



/* Fonction pour activer le mode sombre ou clair */
function toggleMode() {
    const body = document.body;
    let themeMode = localStorage.getItem("themeMode") || "dark-mode";

    themeMode = themeMode === "dark-mode" ? "light-mode" : "dark-mode";

    setSVGColor(themeMode);

    localStorage.setItem("themeMode", themeMode);

    body.classList.toggle("dark-mode");
    body.classList.toggle("light-mode",);
}

function setSVGColor(themeMode) {
    let rootStyle = getComputedStyle(document.documentElement);
    const style = rootStyle.getPropertyValue(themeMode === "dark-mode" ? '--sand' : '--navy').trim();

    const btn = document.querySelector("#button-light-mode path");
    const logoPaths = document.querySelectorAll("#logo path"); // Sélectionne tous les éléments 'path' dans le SVG

    btn.style.fill = style;
    logoPaths.forEach(path => path.style.fill = style); // Change la couleur de remplissage de chaque élément 'path'
}


/* Fonction pour créer les cards dynamiquement
    * @param {Object} imageMap - Objet contenant les images par type
*/
function createByType(imageMap) {
    for (const [type, imageList] of Object.entries(imageMap)) {
        const cardContainer = document.getElementById("cardContainer-" + type);
        if (!cardContainer) continue;

        // Parcourir la liste d'images et créer les card dynamiquement
        imageList.forEach(imageObj => {

            const card = document.createElement("div");
            card.className = "card";

            const image = document.createElement("img");
            image.src = imageObj.url;
            image.className = "zoom-trigger"
            card.appendChild(image);

            const agrandir = document.createElement("div");
            agrandir.textContent = "Agrandir";
            agrandir.className = "agrandir";
            card.appendChild(agrandir);

            const title = document.createElement("h5");
            title.textContent = imageObj.name;
            title.className = "title";
            card.appendChild(title);

            cardContainer.appendChild(card);
        });
    }
}

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

    try {
        jsonData.tree.forEach(element => {
            if (element.type === "blob") {
                const fileName = element.path.split('/').pop();
                const directory = element.path.split('/')[0];

                if (!imageMap[directory]) {
                    imageMap[directory] = [];
                }

                const imageUrl = fileNameToURL(directory + '/' + fileName);
                const imageName = fileName.replace(/\.[^/.]+$/, "");

                // Ajouter l'URL de l'image à la liste globale
                imageMap[directory].push({ name: imageName, url: imageUrl });
            }
        });

        return imageMap;
    } catch (error) {
        throw new Error("Erreur lors de la conversion des données JSON: " + error.message);
    }
}


function fileNameToURL(fileName) {
    return `https://raw.githubusercontent.com/HugoCARIMALO/embellir37.fr/main/${encodeURIComponent(fileName)}`;
}

function URLToFileName(url) {
    return decodeURIComponent(url).split('/').pop().replace(/\.[^/.]+$/, "");
}











/* Fonction pour initialiser les boutons gauche/droite pour la navigation entre images */
function initLeftRightButtonForFullScreenImage(imageMap) {
    const leftButton = document.querySelector('.fullScreen-header img[src="img/caretCircleLeft.svg"]');
    const rightButton = document.querySelector('.fullScreen-header img[src="img/caretCircleRight.svg"]');
    const currentImage = document.getElementById('fullScreen-image');
    const currentTitle = document.getElementById('image-title');

    if (!leftButton || !rightButton || !currentImage || !currentTitle) {
        console.error('Navigation buttons or image elements not found');
        return;
    }

    // Ordonner les images par catégorie puis par ordre alphabétique
    const orderedCategories = ["Pavage", "Dallage", "Portail", "Cloture", "Assainissement"];
    const images = orderedCategories.flatMap(category => {
        if (imageMap[category]) {
            return imageMap[category].sort((a, b) => a.name.localeCompare(b.name)).map(imageObj => imageObj);
        }
        return [];
    });

    // Variable pour suivre l'index de l'image actuellement affichée
    let currentIndex = 0;

    // Fonction pour mettre à jour l'image et le titre
    function updateImage(index) {
        currentImage.src = images[index].url;
        currentTitle.textContent = images[index].name;
        currentIndex = index;
    }

    // Événement pour le bouton gauche
    leftButton.addEventListener('click', function(event) {
        event.stopPropagation(); // Empêcher la propagation du clic à l'overlay

        // Trouver l'index actuel basé sur l'URL de l'image
        const currentUrl = currentImage.src;
        currentIndex = images.findIndex(img => img.url === currentUrl);

        // Naviguer vers l'image précédente
        currentIndex--;
        if (currentIndex < 0) {
            currentIndex = images.length - 1;
        }

        updateImage(currentIndex);
    });

    // Événement pour le bouton droit
    rightButton.addEventListener('click', function(event) {
        event.stopPropagation(); // Empêcher la propagation du clic à l'overlay

        // Trouver l'index actuel basé sur l'URL de l'image
        const currentUrl = currentImage.src;
        currentIndex = images.findIndex(img => img.url === currentUrl);

        // Naviguer vers l'image suivante
        currentIndex++;
        if (currentIndex >= images.length) {
            currentIndex = 0;
        }

        updateImage(currentIndex);
    });

    // Ajouter également la navigation par flèches du clavier
    document.addEventListener('keydown', function(event) {
        // Ne réagir que si l'overlay est visible
        const overlay = document.getElementById('overlay');
        if (overlay.style.display !== 'block') return;

        if (event.key === 'ArrowLeft') {
            leftButton.click(); // Simuler un clic sur le bouton gauche
        } else if (event.key === 'ArrowRight') {
            rightButton.click(); // Simuler un clic sur le bouton droit
        }
    });
}

/* Fonction pour afficher l'image en plein écran avec transitions améliorées */
function showFullScreenImage(imageUrl, imageTitle, overlay, zoomedImage, zoomedImageBlock, zoomedTitle) {
    // Mettre à jour l'image et le titre
    zoomedImage.src = imageUrl;
    zoomedTitle.textContent = imageTitle;

    // Afficher l'overlay et le bloc d'image d'abord
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

/* Fonction pour masquer l'image en plein écran avec transitions améliorées */
function hideFullScreenImage() {
    const overlay = document.getElementById('overlay');
    const zoomedImageBlock = document.getElementById('fullScreen-image-block');
    const zoomedImage = document.getElementById('fullScreen-image');
    const header = document.querySelector('.fullScreen-header');

    if (!overlay || !zoomedImageBlock || !zoomedImage) {
        return; // Protection contre les erreurs
    }

    // Supprimer d'abord les classes visible pour déclencher les transitions
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
        }, 400); // Correspond à la durée des transitions CSS
    }, 100);
}

/* Mise à jour de l'initialisation pour utiliser les transitions améliorées */
function initZoomImage() {
    const overlay = document.getElementById('overlay');
    const zoomedImageBlock = document.getElementById('fullScreen-image-block');
    const zoomedImage = document.getElementById('fullScreen-image');
    const zoomedTitle = document.getElementById('image-title');

    // Get all card containers
    const cardContainers = document.querySelectorAll('.cardContainer');

    // Error handling
    if (!overlay || !zoomedImageBlock || !zoomedImage || !zoomedTitle || !cardContainers) {
        console.error('One or more elements could not be found in the DOM.');
        return;
    }

    // Add an event listener to each card container
    cardContainers.forEach(container => {
        container.addEventListener('click', function(event) {
            // Check if the clicked element is a zoom trigger
            if (!event.target.classList.contains('zoom-trigger')) {
                return;
            }

            // Retrieve the attributes of the clicked image
            const imageUrl = event.target.src;

            // get the title of the image
            const imageTitle = URLToFileName(event.target.src);

            showFullScreenImage(imageUrl, imageTitle, overlay, zoomedImage, zoomedImageBlock, zoomedTitle);
        });
    });

    // Event listener specifique pour l'overlay
    overlay.addEventListener('click', function(event) {
        // S'assurer que le clic est bien sur l'overlay et pas sur l'image ou les boutons
        if (event.target === overlay) {
            hideFullScreenImage();
        }
    });

    // Ajout d'un écouteur d'événement pour la touche Échap
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && overlay.style.display === 'block') {
            hideFullScreenImage();
        }
    });
}
















function initScrollButtonVoirTravaux() {
    const button = document.getElementById('button-voir-travaux');
    if (!button) return;

    button.addEventListener('click', function() {
        const target = document.getElementById('travaux');
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
}


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