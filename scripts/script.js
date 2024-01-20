document.addEventListener("DOMContentLoaded", function () {

    // si la page actuel fini par index.html
    if (window.location.pathname.endsWith("index.html")) {
        getMapImages().then(imageMap => {
            console.log(imageMap);
            createByType(imageMap);
        });
    }

    // dark mode - light mode
    toggleMode();
});


function createByType(imageMap) {
    // Si la map n'a pas le type de travaux, ne rien faire
    for (const [type, imageList] of imageMap) {
        // Récupérer le conteneur des cartes
        var cardContainer = document.getElementById("cardContainer-" + type);

        console.log("type: " + type);
        console.log("imageList: " + imageList);
        // Parcourir la liste d'images et créer les cartes dynamiquement
        imageList.forEach((imageURL, imageName) => {
            // Créer un élément de carte
            var card = document.createElement("div");
            card.className = "card";

            // Créer un élément d'image
            var image = document.createElement("img");
            image.src = imageURL; // Utiliser l'URL directe de l'image

            // Ajouter l'image à la carte
            card.appendChild(image);

            // Créer un élément de titre
            var title = document.createElement("h5");
            // Utiliser le nom de l'image comme titre (vous pouvez ajuster selon vos besoins)
            title.textContent = imageName;
            title.className = "title";

            // Ajouter le titre à la carte
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
                                const imageUrl = fileNameToURL(element.path);
                                const directory = element.path.split('/')[0];
                                if (!imageMap.has(directory)) {
                                    imageMap.set(directory, new Map());
                                }
                                imageMap.get(directory).set(fileName.replace(/\.[^/.]+$/, ""), imageUrl);
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


// Fonction pour convertir le nom de fichier en URL
function fileNameToURL(fileName) {
    // Remplace les espaces par %20 et retourne l'URL complète
    return `https://raw.githubusercontent.com/HugoCARIMALO/embellir37.fr/main/${encodeURIComponent(fileName)}`;
}
