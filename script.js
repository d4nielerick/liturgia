document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const santoDoDiaDiv = document.getElementById('santo-do-dia');
    const santoImagem = document.getElementById('santo-imagem');
    const santoNome = document.getElementById('santo-nome');
    const liturgiaTitulo = document.getElementById('liturgia-titulo');
    const liturgiaData = document.getElementById('liturgia-data');
    const liturgiaCor = document.getElementById('liturgia-cor');
    const leiturasGrid = document.getElementById('leituras-grid');
    const datePicker = document.getElementById('date-picker');

    // Off-canvas Elements
    const offcanvasContainer = document.getElementById('offcanvas-container');
    const offcanvasCloseBtn = document.getElementById('offcanvas-close');
    const offcanvasBody = document.getElementById('offcanvas-body');

    // State
    let liturgiaCache = {};

    // --- Functions ---

    async function fetchLiturgy(date = null) {
        let url = 'https://liturgia.up.railway.app/v2/';
        if (date) {
            const [year, month, day] = date.split('-');
            url += `?dia=${day}&mes=${month}&ano=${year}`;
        }

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Resposta da rede não foi OK.');
            const data = await response.json();
            if (data.erro) throw new Error(data.erro);

            liturgiaCache = data; // Store current liturgy data
            updateUI(data);

        } catch (error) {
            leiturasGrid.innerHTML = `<p>Erro ao carregar a liturgia: ${error.message}</p>`;
            santoDoDiaDiv.style.display = 'none';
            liturgiaTitulo.textContent = "Liturgia não encontrada";
            liturgiaData.textContent = "";
            liturgiaCor.style.display = 'none';
        }
    }

    function updateUI(data) {
        // Update header
        liturgiaTitulo.textContent = data.liturgia;
        liturgiaData.textContent = data.data;
        liturgiaCor.textContent = data.cor;
        liturgiaCor.className = `cor-liturgica ${data.cor}`;
        liturgiaCor.style.display = 'block';

        handleSaintOfTheDay(data.liturgia);
        displayLeiturasGrid(data.leituras);
    }

    async function handleSaintOfTheDay(liturgiaTitle) {
        const match = liturgiaTitle.match(/^[^,–—-]+/);

        if (match && !match[0].toLowerCase().includes('feira')) {
            const saintName = match[0].trim();
            santoNome.textContent = saintName;

            try {
                const imageUrl = await fetchWikipediaImage(saintName);
                if (imageUrl) {
                    santoImagem.src = imageUrl;
                    santoImagem.alt = saintName;
                    santoDoDiaDiv.style.display = 'block';
                    santoImagem.onerror = () => santoDoDiaDiv.style.display = 'none';
                } else {
                    santoDoDiaDiv.style.display = 'none';
                }
            } catch (error) {
                console.error("Erro ao buscar imagem da Wikipedia:", error);
                santoDoDiaDiv.style.display = 'none';
            }
        } else {
            santoDoDiaDiv.style.display = 'none';
        }
    }

    async function fetchWikipediaImage(query) {
        const url = `https://pt.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(query)}&prop=pageimages&format=json&pithumbsize=400&origin=*&redirects=1`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Não foi possível buscar imagem na Wikipedia.');

        const data = await response.json();
        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];

        if (pageId === "-1" || !pages[pageId].thumbnail) {
            return null; // No image found
        }

        return pages[pageId].thumbnail.source;
    }

    function displayLeiturasGrid(leituras) {
        leiturasGrid.innerHTML = ''; // Clear previous blocks

        const readingOrder = ['primeiraLeitura', 'salmo', 'segundaLeitura', 'evangelho'];

        readingOrder.forEach(key => {
            if (leituras[key] && leituras[key].length > 0) {
                const title = getTitleForKey(key);

                const bloco = document.createElement('div');
                bloco.className = 'leitura-bloco';
                bloco.innerHTML = `<h3>${title}</h3>`;

                bloco.addEventListener('click', () => {
                    const content = formatLeituraForOffCanvas(key, liturgiaCache.leituras);
                    openOffCanvas(content);
                });

                leiturasGrid.appendChild(bloco);
            }
        });
    }

    function getTitleForKey(key) {
        const titles = {
            'primeiraLeitura': '1ª Leitura',
            'salmo': 'Salmo',
            'segundaLeitura': '2ª Leitura',
            'evangelho': 'Evangelho'
        };
        return titles[key] || 'Leitura';
    }

    function formatLeituraForOffCanvas(key, leituras) {
        const leituraData = leituras[key][0]; // Assuming one version for now
        let content = `<h3>${leituraData.titulo || getTitleForKey(key)}</h3>`;
        content += `<p><em>${leituraData.referencia}</em></p>`;

        if(key === 'salmo' && leituraData.refrao) {
            content += `<p><strong>Refrão: ${leituraData.refrao}</strong></p>`;
        }

        content += `<p>${leituraData.texto.replace(/\n/g, '<br>')}</p>`;
        return content;
    }

    function openOffCanvas(content) {
        offcanvasBody.innerHTML = content;
        offcanvasContainer.classList.remove('hidden');
    }

    function closeOffCanvas() {
        offcanvasContainer.classList.add('hidden');
    }

    // --- Event Listeners ---

    offcanvasCloseBtn.addEventListener('click', closeOffCanvas);
    offcanvasContainer.addEventListener('click', (e) => {
        if (e.target === offcanvasContainer) {
            closeOffCanvas();
        }
    });

    datePicker.addEventListener('change', (e) => {
        fetchLiturgy(e.target.value);
    });

    // Set date picker to today and fetch initial liturgy
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    datePicker.value = `${year}-${month}-${day}`;

    fetchLiturgy();
});