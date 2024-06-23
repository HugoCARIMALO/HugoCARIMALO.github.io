/* Exécuter au chargement de la page */
document.addEventListener("DOMContentLoaded", function () {
    initLightDarkMode();

    // Ajouter le header et le footer
    loadHeaderFooter().then(() => {console.log("Header et footer chargés")});

    // si la page est index.html
    if (window.location.pathname.endsWith("index.html")) {
        getMapImages().then(imageMap => {
            console.log(imageMap);
            createByType(imageMap);
            zoomImage();
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
    const btn = document.getElementById("button-light-mode");
    let themeMode = localStorage.getItem("themeMode") || "dark-mode";

    themeMode = themeMode === "dark-mode" ? "light-mode" : "dark-mode";

    btn.src = `img/${themeMode}.svg`;

    localStorage.setItem("themeMode", themeMode);

    body.classList.toggle("dark-mode");
    body.classList.toggle("light-mode",);
}


/* Fonction pour créer les cards dynamiquement
    * @param {Map} imageMap - Map contenant les images par type
*/
function createByType(imageMap) {
    for (const [type, imageList] of imageMap) {
        const cardContainer = document.getElementById("cardContainer-" + type);

        // Parcourir la liste d'images et créer les card dynamiquement
        imageList.forEach(imageName => {

            // Créer la card
            const card = document.createElement("div");
            card.className = "card";

            // Image
            const image = document.createElement("img");
            image.src = fileNameToURL(type + '/' + imageName + '.jpg');
            image.className = "zoom-trigger"
            card.appendChild(image);

            // Title
            const title = document.createElement("h5");
            title.textContent = imageName;
            title.className = "title";
            card.appendChild(title);

            // Ajouter la carte au conteneur
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
    const imageMap = new Map();

    if (response.status !== 200) {
        throw new Error("Erreur lors de la récupération des données: " + jsonData.message);
    }

    try {
        jsonData.tree.forEach(element => {
            if (element.type === "blob") {
                const fileName = element.path.split('/').pop();
                const directory = element.path.split('/')[0];

                if (!imageMap.has(directory)) {
                    imageMap.set(directory, []);
                }

                imageMap.get(directory).push(fileName.replace(/\.[^/.]+$/, ""));
            }
        });

        return imageMap;
    } catch (error) {
        throw new Error("Erreur lors de la conversion des données JSON: " + error.message);
    }
}


function fileNameToURL(fileName) {
    // Remplace les espaces par %20 et retourne l'URL complète
    return `https://raw.githubusercontent.com/HugoCARIMALO/embellir37.fr/main/${encodeURIComponent(fileName)}`;
}


/* Fonction pour creer les events listeners pour le zoomer les images */
function zoomImage() {
    // CSS to apply on the zoomed images
    const overlay = document.getElementById('overlay');
    const zoomedImageBlock = document.getElementById('zoomed-image-block');
    const zoomedImage = document.getElementById('zoomed-image');
    const zoomedTitle = document.getElementById('zoomed-title');

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
            const imageTitle = event.target.nextElementSibling.textContent;

            showZoomedImage(imageUrl, imageTitle, overlay, zoomedImage, zoomedImageBlock, zoomedTitle);
        });
    });

    // Add an event listener to hide the zoomed image when clicking on the overlay
    overlay.addEventListener('click', function() {
        hideZoomedImage(overlay, zoomedImageBlock);
    });
}



function showZoomedImage(imageUrl, imageTitle, overlay, zoomedImage, zoomedImageBlock, zoomedTitle) {
    // Update the zoomed image and title
    zoomedImage.src = imageUrl;
    zoomedTitle.textContent = imageTitle;

    // Display the overlay and zoomed image
    overlay.style.display = 'block';
    zoomedImageBlock.style.display = 'block';
}

function hideZoomedImage(overlay, zoomedImageBlock) {
    // Hide the overlay and zoomed image
    overlay.style.display = 'none';
    zoomedImageBlock.style.display = 'none';
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