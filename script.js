document.addEventListener('DOMContentLoaded', () => {
    const liturgiaContentDiv = document.getElementById('liturgia-content');
    const santoDoDiaDiv = document.getElementById('santo-do-dia');
    const santoImagem = document.getElementById('santo-imagem');
    const santoNome = document.getElementById('santo-nome');

    async function fetchLiturgy() {
        try {
            const response = await fetch('https://liturgia.up.railway.app/v2/');
            if (!response.ok) {
                throw new Error('Não foi possível buscar a liturgia.');
            }
            const data = await response.json();

            if (data.erro) {
                throw new Error(data.erro);
            }

            displayLiturgy(data);
            handleSaintOfTheDay(data.liturgia);

        } catch (error) {
            liturgiaContentDiv.innerHTML = `<p>Erro ao carregar a liturgia: ${error.message}</p>`;
            santoDoDiaDiv.style.display = 'none';
        }
    }

    function handleSaintOfTheDay(liturgiaTitle) {
        // Tenta extrair o nome do santo do título da liturgia.
        // A heurística é pegar o texto antes da primeira vírgula ou hífen.
        const match = liturgiaTitle.match(/^[^,–—-]+/);

        if (match && match[0].toLowerCase().includes('feira')) {
            // Se for um dia de semana comum (ex: "Quarta-feira da 2ª semana..."), não exibe santo.
            santoDoDiaDiv.style.display = 'none';
            return;
        }

        if (match) {
            const saintName = match[0].trim();
            santoNome.textContent = saintName;

            // Prepara o nome para a busca de imagem
            const searchQuery = saintName.replace(/\s+/g, ',') + ',saint,catholic';
            santoImagem.src = `https://source.unsplash.com/800x400/?${searchQuery}`;
            santoImagem.alt = saintName;

            // Mostra a seção, mas adiciona um manipulador de erro para a imagem
            santoDoDiaDiv.style.display = 'block';
            santoImagem.onerror = () => {
                // Se a imagem não carregar, oculta a seção inteira.
                santoDoDiaDiv.style.display = 'none';
            };
        } else {
            santoDoDiaDiv.style.display = 'none';
        }
    }

    function displayLiturgy(data) {
        liturgiaContentDiv.innerHTML = `
            <h2>${data.liturgia} - ${data.data}</h2>
            <div class="cor-liturgica ${data.cor}">${data.cor}</div>
        `;

        if (data.leituras.primeiraLeitura) {
            data.leituras.primeiraLeitura.forEach(leitura => {
                liturgiaContentDiv.innerHTML += `
                    <h3>${leitura.titulo} (${leitura.referencia})</h3>
                    <p>${leitura.texto.replace(/\n/g, '<br>')}</p>
                `;
            });
        }

        if (data.leituras.salmo) {
            data.leituras.salmo.forEach(salmo => {
                liturgiaContentDiv.innerHTML += `
                    <h3>Salmo (${salmo.referencia})</h3>
                    <p><strong>Refrão: ${salmo.refrao}</strong></p>
                    <p>${salmo.texto.replace(/\n/g, '<br>')}</p>
                `;
            });
        }

        if (data.leituras.segundaLeitura && data.leituras.segundaLeitura.length > 0) {
            data.leituras.segundaLeitura.forEach(leitura => {
                liturgiaContentDiv.innerHTML += `
                    <h3>${leitura.titulo} (${leitura.referencia})</h3>
                    <p>${leitura.texto.replace(/\n/g, '<br>')}</p>
                `;
            });
        }

        if (data.leituras.evangelho) {
            data.leituras.evangelho.forEach(evangelho => {
                 liturgiaContentDiv.innerHTML += `
                    <h3>${evangelho.titulo} (${evangelho.referencia})</h3>
                    <p>${evangelho.texto.replace(/\n/g, '<br>')}</p>
                `;
            });
        }
    }

    fetchLiturgy();
});