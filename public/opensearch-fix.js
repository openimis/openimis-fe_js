// Script intelligent pour gérer les URLs OpenSearch
(function() {
    const checkAndOverride = () => {
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            if (iframe.src && iframe.src.includes('opensearch')) {
                console.log('Original iframe src:', iframe.src);
                
                // Cas 1: URL avec undefined/null - remplacer par page de loading
                if (iframe.src.includes('undefined') || iframe.src.includes('null') || iframe.src.endsWith('/opensearch/')) {
                    // Créer un contenu de loading à la place
                    iframe.style.display = 'none';
                    
                    // Chercher ou créer un div de loading
                    let loadingDiv = iframe.nextSibling;
                    if (!loadingDiv || !loadingDiv.classList || !loadingDiv.classList.contains('opensearch-loading')) {
                        loadingDiv = document.createElement('div');
                        loadingDiv.className = 'opensearch-loading';
                        loadingDiv.style.cssText = `
                            padding: 20px;
                            text-align: center;
                            min-height: 400px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            background-color: #f9f9f9;
                            border: 1px solid #e0e0e0;
                            border-radius: 4px;
                        `;
                        loadingDiv.innerHTML = '<div>Loading dashboard...</div>';
                        iframe.parentNode.insertBefore(loadingDiv, iframe.nextSibling);
                    }
                    return;
                }
                
                // Cas 2: URL valide avec https - changer en http
                if (iframe.src.startsWith('https://')) {
                    const newSrc = iframe.src.replace('https://', 'http://');
                    if (iframe.src !== newSrc) {
                        // Masquer le loading et montrer l'iframe
                        let loadingDiv = iframe.nextSibling;
                        if (loadingDiv && loadingDiv.classList && loadingDiv.classList.contains('opensearch-loading')) {
                            loadingDiv.remove();
                        }
                        iframe.style.display = 'block';
                        iframe.src = newSrc;
                        console.log('Fixed iframe src (https->http):', newSrc);
                    }
                }
            }
        });
    };

    // Vérifier plus fréquemment au début, puis moins souvent
    let checkCount = 0;
    const checkInterval = setInterval(() => {
        checkAndOverride();
        checkCount++;
        if (checkCount > 20) { // Arrêter après 10 secondes
            clearInterval(checkInterval);
            // Continuer avec des vérifications moins fréquentes
            setInterval(checkAndOverride, 2000);
        }
    }, 500);
    
    // Vérifier aussi au chargement
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAndOverride);
    } else {
        checkAndOverride();
    }
})();