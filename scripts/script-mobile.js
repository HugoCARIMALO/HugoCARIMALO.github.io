/* Script principal modifié pour intégrer les fonctionnalités mobiles */

/* Exécuter au chargement de la page */
document.addEventListener("DOMContentLoaded", function () {
    // Détecter si l'appareil est mobile
    const isMobile = window.innerWidth <= 768;

    // Initialiser le mode sombre/clair
    initLightDarkMode();

    // Ajouter le header et le footer
    loadHeaderFooter().then(() => {
        setSVGColor(localStorage.getItem("themeMode") || "dark-mode");
        console.log("Header et footer chargés");

        // Initialiser les fonctionnalités mobiles après chargement du header/footer
        if (isMobile) {
            initMobileMenu();
            setTimeout(optimizeImageZoomForMobile, 500);
        }
    });

    // Si la page est index.html avec la section travaux
    if (window.location.pathname.endsWith("index.html") || window.location.pathname === "/") {
        hideFullScreenImage();

        getMapImages().then(imageMap => {
            createByType(imageMap);
            initZoomImage();
            initLeftRightButtonForFullScreenImage(imageMap);

            // Ajouts spécifiques pour mobile
            if (isMobile) {
                adjustCardContainerForMobile();
                addSwipeNavigation(imageMap);
            }
        });

        // Utilisation du bouton modern avec amélioration tactile pour mobile
        initModernButtonVoirTravaux();
    }
});

/* Fonction pour charger le header et le footer avec adaptations mobiles */
async function loadHeaderFooter() {
    try {
        // Récupérer le contenu du header et du footer et les ajouter dans les div correspondantes
        headerData = await fetch('header.html').then(response => response.text());
        footerData = await fetch('footer.html').then(response => response.text());
        document.getElementById('header-container').innerHTML = headerData;
        document.getElementById('footer-container').innerHTML = footerData;

        // Initialiser l'état du toggle switch
        const checkbox = document.getElementById('checkbox');
        if (checkbox) {
            let themeMode = localStorage.getItem("themeMode") || "dark-mode";
            checkbox.checked = themeMode === "light-mode";

            // Ajouter un écouteur d'événement pour le toggle
            checkbox.addEventListener('change', toggleMode);
        }

        // Appliquer les couleurs au logo SVG après que le header est chargé
        let themeMode = localStorage.getItem("themeMode") || "dark-mode";
        setSVGColor(themeMode);

        // Gestion des butons appelez-moi (there is multiple)
        const callMeButton = document.getElementsByName("button-appelez-moi")
        for (let i = 0; i < callMeButton.length; i++) {
            CallMeButtonHightlight(callMeButton[i]);
        }

        // Ajouter des attributs pour améliorer l'accessibilité mobile
        enhanceMobileAccessibility();

    } catch (error) {
        console.error("Erreur lors du chargement du header ou du footer", error);
    }
}

/* Amélioration de l'accessibilité pour les appareils mobiles */
function enhanceMobileAccessibility() {
    // Ajouter des attributs aria pour l'accessibilité
    const menuLinks = document.querySelectorAll('.menu a');
    menuLinks.forEach(link => {
        link.setAttribute('role', 'menuitem');
    });

    // Améliorer la zone de clic pour les petits écrans
    if (window.innerWidth <= 768) {
        const clickableElements = document.querySelectorAll('a, button, .btn, .zoom-trigger');
        clickableElements.forEach(element => {
            // Augmenter la zone de clic si l'élément est petit
            if (element.offsetWidth < 44 || element.offsetHeight < 44) {
                element.style.minWidth = '44px';
                element.style.minHeight = '44px';
            }
        });
    }

    // Ajouter les attributs pour le zoom des images
    const fullScreenImage = document.getElementById('fullScreen-image');
    if (fullScreenImage) {
        fullScreenImage.setAttribute('role', 'img');
        fullScreenImage.setAttribute('aria-expanded', 'true');
    }
}

/* Fonction pour initialiser le mode tactile avec swipe pour la navigation des images */
function addSwipeNavigation(imageMap) {
    const overlay = document.getElementById('overlay');
    const fullScreenImageBlock = document.getElementById('fullScreen-image-block');

    if (!overlay || !fullScreenImageBlock) return;

    let touchStartX = 0;
    let touchEndX = 0;

    fullScreenImageBlock.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, {passive: true});

    fullScreenImageBlock.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, {passive: true});

    function handleSwipe() {
        const threshold = 50; // Minimum pixel distance for a swipe

        if (touchEndX < touchStartX - threshold) {
            // Swipe left - aller à l'image suivante
            document.querySelector('.fullScreen-header img[src="img/caretCircleRight.svg"]').click();
        }

        if (touchEndX > touchStartX + threshold) {
            // Swipe right - aller à l'image précédente
            document.querySelector('.fullScreen-header img[src="img/caretCircleLeft.svg"]').click();
        }
    }

    // Ajouter un message d'aide pour le mobile
    const tipElement = document.querySelector('.mobile-zoom-tip');
    if (tipElement) {
        // Afficher le message pendant 3 secondes puis disparaître
        tipElement.classList.add('show');
        setTimeout(() => {
            tipElement.classList.remove('show');
        }, 3000);
    }
}

/* Version améliorée de initModernButtonVoirTravaux pour mobiles */
function initModernButtonVoirTravaux() {
    const button = document.getElementById('button-voir-travaux');
    if (!button) return;

    // Ajouter la classe d'animation au chargement
    button.classList.add('pulse-animation');

    // Version mobile ou desktop du comportement
    const isMobile = window.innerWidth <= 768;

    // Configuration spécifique pour mobile
    if (isMobile) {
        // Plus grosse zone de clic pour mobile
        button.style.padding = '15px 30px';

        // Animation simplifiée pour de meilleures performances sur mobile
        button.addEventListener('touchstart', function() {
            button.classList.add('button-touch-active');
        });

        button.addEventListener('touchend', function() {
            button.classList.remove('button-touch-active');
            scrollToTravaux();
        });
    } else {
        // Version desktop avec animations plus riches
        // Arrêter l'animation de pulse après le premier clic
        button.addEventListener('click', function(event) {
            button.classList.remove('pulse-animation');

            // Effet de vague au clic
            const rect = button.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            button.style.setProperty('--ripple-x', x + 'px');
            button.style.setProperty('--ripple-y', y + 'px');

            scrollToTravaux();
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

    // Fonction commune pour faire défiler vers la section des travaux
    function scrollToTravaux() {
        const target = document.getElementById('travaux');
        if (target) {
            // Comportement de défilement plus fluide pour mobile
            const scrollOptions = {
                behavior: 'smooth',
                block: 'start'
            };

            target.scrollIntoView(scrollOptions);

            // Effet de surbrillance brève pour indiquer où on est arrivé (surtout utile sur mobile)
            target.classList.add('highlight-section');
            setTimeout(() => {
                target.classList.remove('highlight-section');
            }, 1000);
        }
    }
}