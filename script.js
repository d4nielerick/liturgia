document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const santoDoDiaDiv = document.getElementById('santo-do-dia');
    const santoImagem = document.getElementById('santo-imagem');
    const santoNome = document.getElementById('santo-nome');
    const liturgiaTitulo = document.getElementById('liturgia-titulo');
    const liturgiaData = document.getElementById('liturgia-data');
    const liturgiaCor = document.getElementById('liturgia-cor');
    const leiturasGrid = document.getElementById('leituras-grid');
    const timelineContainer = document.getElementById('timeline-container');

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

            liturgiaCache = data;
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
        liturgiaTitulo.textContent = data.liturgia;
        liturgiaData.textContent = data.data;
        liturgiaCor.textContent = data.cor;
        liturgiaCor.className = `cor-liturgica ${data.cor}`;
        liturgiaCor.style.display = 'block';

        handleSaintOfTheDay(data.data); // Pass the date string
        displayLeiturasGrid(data.leituras);
    }

    function handleSaintOfTheDay(dateString) {
        // Format dateString "DD/MM/YYYY" to "MM-DD"
        const [day, month] = dateString.split('/');
        const key = `${month}-${day}`;

        const saintName = santosDoAno[key];

        if (saintName) {
            santoNome.textContent = saintName;
            santoDoDiaDiv.style.display = 'block';
        } else {
            santoDoDiaDiv.style.display = 'none';
        }
    }

    function displayLeiturasGrid(leituras) {
        leiturasGrid.innerHTML = '';
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
        const leituraData = leituras[key][0];
        let content = `<h3>${leituraData.titulo || getTitleForKey(key)}</h3>`;
        content += `<p><em>${leituraData.referencia}</em></p>`;
        if (key === 'salmo' && leituraData.refrao) {
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

    function generateTimeline() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = -7; i <= 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);

            const item = document.createElement('div');
            item.className = 'timeline-item';
            if (i === 0) {
                item.classList.add('active');
            }

            const day = date.toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase().substring(0, 3);
            const dateNum = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

            item.innerHTML = `<span class="timeline-day">${day}</span><span class="timeline-date">${dateNum}</span>`;

            const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            item.dataset.date = dateString;

            item.addEventListener('click', () => {
                document.querySelector('.timeline-item.active')?.classList.remove('active');
                item.classList.add('active');
                fetchLiturgy(item.dataset.date);
            });

            timelineContainer.appendChild(item);
        }

        // Scroll to the active item
        const activeItem = document.querySelector('.timeline-item.active');
        if (activeItem) {
            activeItem.scrollIntoView({ behavior: 'smooth', inline: 'center' });
        }
    }

    // --- Event Listeners ---
    offcanvasCloseBtn.addEventListener('click', closeOffCanvas);
    offcanvasContainer.addEventListener('click', (e) => {
        if (e.target === offcanvasContainer) {
            closeOffCanvas();
        }
    });

    // --- Initial Load ---
    generateTimeline();
    fetchLiturgy(); // Fetch today's liturgy on initial load
});