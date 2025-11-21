 
// Variáveis globais para armazenar os dados e os cocktails a serem exibidos
let allCocktails = [];
let filteredCocktails = [];
let selectedCocktail = null; // Armazena o cocktail atualmente selecionado

// Referências aos elementos HTML
const gridElement = document.querySelector('.grid');
const rightSection = document.getElementById('right');
const ingredientSelect = document.getElementById('ingredient');
const alcoholSelect = document.getElementById('alcohol');
const cupSelect = document.getElementById('cup');

/**
 * Pré-carrega os dados do arquivo JSON antes da configuração do p5.
 * Usamos loadJSON do p5.js.
 * p5 garante que o setup só arranca depois do json estar carregado
 */
function preload() {
    allCocktails = loadJSON('drinks.json');
}


/**
 * Configuração inicial do p5 (não desenharemos no canvas, mas usaremos sua estrutura).
 */
function setup() {
    // Esconder o canvas do p5, pois estamos a manipular o DOM
    // createCanvas(0, 0); // Para garantir que o p5.js seja inicializado
    noCanvas();

    filteredCocktails = allCocktails;

    // Inicializa os filtros e a grelha
    populateFilterOptions();
    renderCocktails(filteredCocktails);
    
    // Adiciona event listeners aos filtros
    ingredientSelect.addEventListener('change', applyFilters);
    alcoholSelect.addEventListener('change', applyFilters);
    cupSelect.addEventListener('change', applyFilters);

    // Inicializa a secção de detalhes
    updateRightSection(null);
}


// O loop draw() do p5.js pode ser deixado vazio, pois o trabalho é baseado em eventos DOM
function draw() {
    // Opcional: deixamos vazio
}

/**
 * Preenche as opções dos select boxes de 'ingredient' e 'cup'
 * com base nos dados dos cocktails.
 */
function populateFilterOptions() {
    const allIngredients = new Set();
    const allCups = new Set();

    allCocktails.forEach(cocktail => {
        // Ingredientes: procuramos Ingredient1, Ingredient2, etc.
        for (let i = 1; i <= 15; i++) { // Assumindo até 15 ingredientes
            const ingredientKey = `Ingredient${i}`;
            if (cocktail[ingredientKey]) {
                allIngredients.add(cocktail[ingredientKey].trim());
            }
        }
        // Copos
        if (cocktail['Glass type']) {
            allCups.add(cocktail['Glass type'].trim());
        }
    });

    // Função auxiliar para preencher um select
    const fillSelect = (selectElement, optionsSet) => {
        // Converte Set para Array, ordena e preenche
        const sortedOptions = Array.from(optionsSet).sort();
        
        // Remove opções existentes (exceto a primeira/padrão)
        while (selectElement.options.length > 1) {
            selectElement.remove(1);
        }
        
        sortedOptions.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option;
            opt.textContent = option;
            selectElement.appendChild(opt);
        });
    };

    fillSelect(ingredientSelect, allIngredients);
    fillSelect(cupSelect, allCups);
}


/**
 * Renderiza os elementos da grelha com base na lista de cocktails fornecida.
 * @param {Array} cocktailsToRender - A lista de cocktails a exibir.
 */
function renderCocktails(cocktailsToRender) {
    gridElement.innerHTML = ''; // Limpa a grelha

    cocktailsToRender.forEach((cocktail, index) => {
        const item = document.createElement('div');
        item.classList.add('item');
        
        // Armazena a referência ao cocktail no elemento DOM
        item.dataset.drinkName = cocktail.Drink;

        // Adiciona um listener de clique
        item.addEventListener('click', () => {
            selectedCocktail = cocktail;
            updateRightSection(selectedCocktail);
            
            // Adiciona classe 'active' para realçar o item selecionado
            document.querySelectorAll('.grid .item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
        
        // Estilo temporário: Tenta adicionar imagem (ou fallback) e nome
        const thumbUrl = cocktail.DrinkThumb;
        if (thumbUrl) {
            item.style.backgroundImage = `url('${thumbUrl}')`;
            item.style.backgroundSize = 'cover';
            item.style.backgroundPosition = 'center';
            item.style.backgroundColor = 'transparent'; // Remove a cor amarela de fundo
        }
        
        // Adiciona um overlay para o nome da bebida
        const nameOverlay = document.createElement('span');
        nameOverlay.textContent = cocktail.Drink;
        nameOverlay.classList.add('cocktail-name-overlay'); 
        item.appendChild(nameOverlay);

        gridElement.appendChild(item);
    });

    // Se não houver cocktails, exibe uma mensagem
    if (cocktailsToRender.length === 0) {
        const message = document.createElement('p');
        message.textContent = 'No cocktails found matching the selected filters.';
        gridElement.appendChild(message);
    }
}

/**
 * Aplica os filtros selecionados e atualiza a grelha.
 */
function applyFilters() {
    const selectedIngredient = ingredientSelect.value;
    const selectedAlcohol = alcoholSelect.value;
    const selectedCup = cupSelect.value;
    
    filteredCocktails = allCocktails.filter(cocktail => {
        let matchesIngredient = true;
        let matchesAlcohol = true;
        let matchesCup = true;
        
        // Filtro por Ingrediente
        if (selectedIngredient) {
            matchesIngredient = false;
            // Verifica se o ingrediente selecionado está em qualquer IngredientX
            for (let i = 1; i <= 15; i++) {
                const ingredientKey = `Ingredient${i}`;
                if (cocktail[ingredientKey] && cocktail[ingredientKey].trim() === selectedIngredient) {
                    matchesIngredient = true;
                    break;
                }
            }
        }
        
        // Filtro por Álcool
        if (selectedAlcohol && selectedAlcohol !== 'All') {
            matchesAlcohol = cocktail['Alcoholic type'] === selectedAlcohol;
        }
        
        // Filtro por Copo
        if (selectedCup) {
            matchesCup = cocktail['Glass type'] === selectedCup;
        }
        
        return matchesIngredient && matchesAlcohol && matchesCup;
    });

    // Atualiza a grelha
    renderCocktails(filteredCocktails);
    
    // Limpa a secção de detalhes após a filtragem
    updateRightSection(null);
    selectedCocktail = null;
}

/**
 * Atualiza o conteúdo da secção #right com os detalhes do cocktail.
 * @param {Object|null} cocktail - O objeto cocktail a exibir, ou null para o texto inicial.
 */
function updateRightSection(cocktail) {
    rightSection.innerHTML = ''; // Limpa o conteúdo
    
    if (!cocktail) {
        // Exibe o texto inicial
        rightSection.innerHTML = `
            <h2>Cocktails</h2>
            <p>
                Bem-vindo(a) ao **DRINKOMANIA**!
                Use os filtros acima para encontrar a bebida perfeita.
                Clique num círculo (item) à esquerda para ver os detalhes
                de cada cocktail, incluindo ingredientes, proporções e instruções.
            </p>
        `;
        return;
    }
    
    // Cria a lista de ingredientes e proporções
    let ingredientsList = '<ul>';
    for (let i = 1; i <= 15; i++) {
        const ingredientKey = `Ingredient${i}`;
        const measureKey = `Measure${i}`;
        
        const ingredient = cocktail[ingredientKey];
        const measure = cocktail[measureKey];
        
        if (ingredient) {
            ingredientsList += `<li>**${ingredient}**: ${measure ? measure : 'To taste'}</li>`;
        }
    }
    ingredientsList += '</ul>';
    
    // Conteúdo detalhado
    rightSection.innerHTML = `
        <div class="cocktail-details">
            <h2>${cocktail.Drink}</h2>
            <p><strong>Type:</strong> ${cocktail['Alcoholic type'] || 'N/A'}</p>
            <p><strong>Category:</strong> ${cocktail.Category || 'N/A'}</p>
            <p><strong>Glass:</strong> ${cocktail['Glass type'] || 'N/A'}</p>
            
            <h3>Ingredients & Measures</h3>
            ${ingredientsList}
            
            <h3>Instructions</h3>
            <p>${cocktail.Inuctions || 'No instructions provided.'}</p>
        </div>
    `;
}