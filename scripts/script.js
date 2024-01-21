document.addEventListener("DOMContentLoaded", function () {

    // si la page actuelle finit par index.html
    if (window.location.pathname.endsWith("index.html")) {
        getMapImages().then(imageMap => {
            console.log(imageMap);
            createByType(imageMap);
            zoomImage();
        });
    }

    // dark mode - light mode
    toggleMode();
});

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


function toggleMode() {

    let themeMode = localStorage.getItem("themeMode");
    const body = document.body;
    const btn = document.getElementById("toggle-dark-mode-btn");

    if (themeMode === null) {
        console.log("themeMode is null => set to dark-mode");
        themeMode = "dark-mode";
    }

    if (!body.classList.contains("dark-mode") && !body.classList.contains("light-mode")) {
        console.log("body has no class => set to " + themeMode);
        body.classList.toggle(themeMode);
    } else {
        // On inverse le mode du themeMode
        body.classList.toggle("light-mode");
        body.classList.toggle("dark-mode");
        if (themeMode === "dark-mode") {
            themeMode = "light-mode";
        } else if (themeMode === "light-mode") {
            themeMode = "dark-mode";
        }
    }
    localStorage.setItem("themeMode", themeMode);
    btn.src = "img/" + themeMode + ".svg";
    console.log("mode set to " + themeMode);

}

function getMapImages() {
    const xhr = new XMLHttpRequest();
    const url = "https://api.github.com/repos/HugoCARIMALO/embellir37.fr/git/trees/main?recursive=true";

    xhr.open("GET", url, true);
    xhr.setRequestHeader("Accept", "application/vnd.github+json");
    xhr.setRequestHeader("X-GitHub-Api-Version", "2022-11-28");

    return new Promise((resolve, reject) => {
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    try {
                        const jsonData = JSON.parse(xhr.responseText);
                        const imageMap = new Map();
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
                        resolve(imageMap);
                    } catch (error) {
                        reject("Erreur lors de la conversion des données JSON");
                    }
                } else {
                    reject("Erreur lors de la récupération des données: " + xhr.status);
                }
            }
        };
        xhr.send();
    });
}

function fileNameToURL(fileName) {
    // Remplace les espaces par %20 et retourne l'URL complète
    return `https://raw.githubusercontent.com/HugoCARIMALO/embellir37.fr/main/${encodeURIComponent(fileName)}`;
}


function zoomImage(){

    // Récupérer les éléments nécessaires
    const overlay = document.getElementById('overlay');
    const zoomedImageBlock = document.getElementById('zoomed-image-block');
    const zoomedImage = document.getElementById('zoomed-image')
    const zoomedTitle = document.getElementById('zoomed-title');
    const zoomTriggers = document.querySelectorAll('.zoom-trigger');

    // Ajouter un gestionnaire d'événement pour chaque image
    zoomTriggers.forEach(trigger => {
        trigger.addEventListener('click', function() {
            // Afficher le fond flouté
            overlay.style.display = 'block';

            // Récupérer les attributs de l'image cliquée
            const imageUrl = this.src;
            const imageTitle = this.nextElementSibling.textContent;

            // Mettre à jour l'image et le titre agrandi
            zoomedImage.src = imageUrl;
            zoomedTitle.textContent = imageTitle;

            // Afficher l'image agrandie
            zoomedImageBlock.style.display = 'block';
        });
    });

    // Ajouter un gestionnaire d'événement pour masquer l'image agrandie lors du clic sur le fond flouté
    overlay.addEventListener('click', function() {
        // Masquer le fond flouté et l'image agrandie
        overlay.style.display = 'none';
        zoomedImageBlock.style.display = 'none';
    });
}
