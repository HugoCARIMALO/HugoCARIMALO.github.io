/* Exécuter au chargement de la page */
document.addEventListener("DOMContentLoaded", function () {
    initLightDarkMode();

    // Ajouter le header et le footer
    loadHeaderFooter().then(() => {
        setSVGColor(localStorage.getItem("themeMode") || "dark-mode");
        console.log("Header et footer chargés")});

    // si la page est index.html
    if (window.location.pathname.endsWith("index.html")) {

        hideFullScreenImage();

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












/* Fonction pour creer les events listeners pour le zoomer les images */
function initZoomImage() {
    // CSS to apply on the image to zoom
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

    // Add an event listener to hide the zoomed image when clicking on the overlay
    overlay.addEventListener('click', function() {
        hideFullScreenImage();
    });
}


/* Fonction pour afficher l'image en plein écran */
function showFullScreenImage(imageUrl, imageTitle, overlay, zoomedImage, zoomedImageBlock, zoomedTitle) {
    // Update the zoomed image and title
    zoomedImage.src = imageUrl;
    zoomedTitle.textContent = imageTitle;

    // Add the zoom effect class
    zoomedImage.classList.add('zoom-effect');

    // Display the overlay and zoomed image
    overlay.style.display = 'block';
    zoomedImageBlock.style.display = 'flex';

    // After a small delay, add the zoomed class to start the transition
    setTimeout(() => {
        zoomedImage.classList.add('zoomed');
    }, 100);
}

function hideFullScreenImage() {
    const overlay = document.getElementById('overlay');
    const zoomedImageBlock = document.getElementById('fullScreen-image-block');
    const zoomedImage = document.getElementById('fullScreen-image');

    // Hide the overlay and zoomed image
    overlay.style.display = 'none';
    zoomedImageBlock.style.display = 'none';

    // Remove the zoom effect classes
    zoomedImage.classList.remove('zoom-effect', 'zoomed');
}

function initLeftRightButtonForFullScreenImage(imageMap) {
    const leftButton = document.querySelector('img[src="img/caretCircleLeft.svg"]');
    const rightButton = document.querySelector('img[src="img/caretCircleRight.svg"]');

    const currentImage = document.getElementById('fullScreen-image');
    const currentTitle = document.getElementById('image-title');

    // Ordonner les images par catégorie puis par ordre alphabétique
    const orderedCategories = ["Pavage", "Dallage", "Portail", "Cloture", "Assainissement"];
    const images = orderedCategories.flatMap(category => {
        if (imageMap[category]) {
            return imageMap[category].sort((a, b) => a.name.localeCompare(b.name)).map(imageObj => imageObj.url);
        }
        return [];
    });
    console.log(images);

    let currentIndex = images.indexOf(currentImage.src);

    leftButton.addEventListener('click', function() {
        currentIndex--;
        if (currentIndex < 0) {
            currentIndex = images.length - 1;
        }
        currentImage.src = images[currentIndex];
        currentTitle.textContent = URLToFileName(images[currentIndex]);
    });

    rightButton.addEventListener('click', function() {
        currentIndex++;
        if (currentIndex >= images.length) {
            currentIndex = 0;
        }
        currentImage.src = images[currentIndex];
        currentTitle.textContent = URLToFileName(images[currentIndex]);
    });
}
















function initScrollButtonVoirTravaux() {
document.getElementById('button-voir-travaux').addEventListener('click', function() {
    const target = document.getElementById('travaux');
    target.scrollIntoView({ behavior: 'smooth' });
});
}


function CallMeButtonHightlight(callMeButton) {
    callMeButton.addEventListener('click', function() {
        const telephone = document.getElementById('telephone');
        telephone.scrollIntoView({ behavior: 'smooth' });
        telephone.classList.add('highlight');
        setTimeout(() => {
            telephone.classList.remove('highlight');
        }, 5000);
    });
}