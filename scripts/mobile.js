/* Script pour les fonctionnalités spécifiques au mobile */

document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    adjustCardContainerForMobile();

    // Surveiller les redimensionnements de la fenêtre
    window.addEventListener('resize', function() {
        adjustCardContainerForMobile();
    });
});

/**
 * Initialise le menu mobile avec un comportement de menu hamburger
 */
function initMobileMenu() {
    // Créer le bouton hamburger s'il n'existe pas déjà
    if (!document.querySelector('.hamburger-menu')) {
        const menu = document.querySelector('.menu');
        if (!menu) return;

        // Créer le bouton hamburger et l'ajouter avant le menu
        const hamburger = document.createElement('div');
        hamburger.className = 'hamburger-menu';
        hamburger.innerHTML = `
            <div class="hamburger-icon">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;

        menu.parentNode.insertBefore(hamburger, menu);

        // Ajouter la classe pour cacher le menu au chargement en mobile
        if (window.innerWidth <= 768) {
            menu.classList.add('menu-hidden');
        }

        // Ajouter l'écouteur d'événement pour toggle le menu
        hamburger.addEventListener('click', function() {
            menu.classList.toggle('menu-hidden');
            hamburger.classList.toggle('active');
        });

        // Fermer le menu quand on clique sur un lien
        const menuLinks = menu.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    menu.classList.add('menu-hidden');
                    hamburger.classList.remove('active');
                }
            });
        });

        // Ajuster l'affichage du menu lors du redimensionnement
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                menu.classList.remove('menu-hidden');
            } else if (!hamburger.classList.contains('active')) {
                menu.classList.add('menu-hidden');
            }
        });
    }
}

/**
 * Ajuste la navigation des cards pour mobile avec défilement tactile
 */
function adjustCardContainerForMobile() {
    const cardContainers = document.querySelectorAll('.cardContainer');

    cardContainers.forEach(container => {
        // Ajout d'indicateurs de défilement si pas déjà présents
        if (!container.querySelector('.scroll-indicator') && window.innerWidth <= 768) {
            const scrollIndicator = document.createElement('div');
            scrollIndicator.className = 'scroll-indicator';
            scrollIndicator.innerHTML = '<span></span><span></span><span></span>';
            container.parentNode.insertBefore(scrollIndicator, container.nextSibling);
        }

        // Gestion du défilement tactile
        if (!container.getAttribute('touch-enabled')) {
            container.setAttribute('touch-enabled', 'true');

            let startX, scrollLeft;

            container.addEventListener('touchstart', function(e) {
                startX = e.touches[0].pageX - container.offsetLeft;
                scrollLeft = container.scrollLeft;
            }, {passive: true});

            container.addEventListener('touchmove', function(e) {
                if (!startX) return;
                const x = e.touches[0].pageX - container.offsetLeft;
                const walk = (x - startX) * 2; // Vitesse de défilement
                container.scrollLeft = scrollLeft - walk;
            }, {passive: true});

            container.addEventListener('touchend', function() {
                startX = null;
            }, {passive: true});
        }
    });

    // Gérer l'affichage des indicateurs de défilement selon la taille de l'écran
    const indicators = document.querySelectorAll('.scroll-indicator');
    indicators.forEach(indicator => {
        indicator.style.display = window.innerWidth <= 768 ? 'flex' : 'none';
    });
}

/**
 * Optimise le zoom d'image pour mobile
 */
function optimizeImageZoomForMobile() {
    const fullScreenImage = document.getElementById('fullScreen-image');
    if (!fullScreenImage) return;

    // Ajouter support pour pinch zoom
    let initialDistance = 0;
    let currentScale = 1;

    fullScreenImage.addEventListener('touchstart', function(e) {
        if (e.touches.length === 2) {
            initialDistance = getTouchDistance(e.touches);
        }
    }, {passive: false});

    fullScreenImage.addEventListener('touchmove', function(e) {
        if (e.touches.length === 2) {
            e.preventDefault();
            const currentDistance = getTouchDistance(e.touches);
            const scaleChange = currentDistance / initialDistance;

            if (initialDistance > 0) {
                const newScale = currentScale * scaleChange;
                if (newScale >= 1 && newScale <= 3) {
                    fullScreenImage.style.transform = `scale(${newScale})`;
                }
            }
        }
    }, {passive: false});

    fullScreenImage.addEventListener('touchend', function() {
        if (initialDistance > 0) {
            currentScale = parseFloat(fullScreenImage.style.transform.replace('scale(', '').replace(')', '')) || 1;
            initialDistance = 0;
        }
    }, {passive: true});

    // Double tap pour zoom
    let lastTap = 0;
    fullScreenImage.addEventListener('touchend', function(e) {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;

        if (tapLength < 300 && tapLength > 0) {
            e.preventDefault();

            if (currentScale === 1) {
                fullScreenImage.style.transform = 'scale(2)';
                currentScale = 2;
            } else {
                fullScreenImage.style.transform = 'scale(1)';
                currentScale = 1;
            }
        }

        lastTap = currentTime;
    }, {passive: false});
}

/**
 * Obtient la distance entre deux points de toucher
 */
function getTouchDistance(touches) {
    return Math.hypot(
        touches[0].pageX - touches[1].pageX,
        touches[0].pageY - touches[1].pageY
    );
}