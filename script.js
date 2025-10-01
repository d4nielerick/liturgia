document.addEventListener('DOMContentLoaded', () => {
    const contentDiv = document.getElementById('liturgia-content');

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
        } catch (error) {
            contentDiv.innerHTML = `<p>Erro ao carregar a liturgia: ${error.message}</p>`;
        }
    }

    function displayLiturgy(data) {
        contentDiv.innerHTML = `
            <h2>${data.liturgia} - ${data.data}</h2>
            <div class="cor-liturgica ${data.cor}">${data.cor}</div>
        `;

        if (data.leituras.primeiraLeitura) {
            data.leituras.primeiraLeitura.forEach(leitura => {
                contentDiv.innerHTML += `
                    <h3>${leitura.titulo} (${leitura.referencia})</h3>
                    <p>${leitura.texto.replace(/\n/g, '<br>')}</p>
                `;
            });
        }

        if (data.leituras.salmo) {
            data.leituras.salmo.forEach(salmo => {
                contentDiv.innerHTML += `
                    <h3>Salmo (${salmo.referencia})</h3>
                    <p><strong>Refrão: ${salmo.refrao}</strong></p>
                    <p>${salmo.texto.replace(/\n/g, '<br>')}</p>
                `;
            });
        }

        if (data.leituras.segundaLeitura && data.leituras.segundaLeitura.length > 0) {
            data.leituras.segundaLeitura.forEach(leitura => {
                contentDiv.innerHTML += `
                    <h3>${leitura.titulo} (${leitura.referencia})</h3>
                    <p>${leitura.texto.replace(/\n/g, '<br>')}</p>
                `;
            });
        }

        if (data.leituras.evangelho) {
            data.leituras.evangelho.forEach(evangelho => {
                 contentDiv.innerHTML += `
                    <h3>${evangelho.titulo} (${evangelho.referencia})</h3>
                    <p>${evangelho.texto.replace(/\n/g, '<br>')}</p>
                `;
            });
        }
    }

    fetchLiturgy();
});