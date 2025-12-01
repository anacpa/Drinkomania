/ =========================================================================
// DRINKOMANIA.JS - CÓDIGO COMPLETO
// =========================================================================

let allCocktails = [];
let filteredCocktails = [];
let selectedCocktail = null; // armazena o cocktail atualmente selecionado

// Elementos HTML
const gridElement = document.querySelector('.grid');
const rightSection = document.getElementById('right');
const ingredientSelect = document.getElementById('ingredient');
const alcoholSelect = document.getElementById('alcohol');
const cupSelect = document.getElementById('cup');

// Mapeamento dos tipos de copos (Glass type) para os arquivos genéricos (A a G)
const glassTypeMap = [
    { "item": "Cocktail glass", "glassType": "A" },
    { "item": "Highball glass", "glassType": "B" },
    { "item": "Collins glass", "glassType": "B" },
    { "item": "Old-fashioned glass", "glassType": "D" },
    { "item": "Shot glass", "glassType": "F" },
    { "item": "Coffee mug", "glassType": "C" },
    { "item": "Champagne flute", "glassType": "E" },
    { "item": "Balloon glass", "glassType": "E" },
    { "item": "Hurricane glass", "glassType": "E" },
    { "item": "Irish coffee cup", "glassType": "C" },
    { "item": "Margarita glass", "glassType": "G" },
    { "item": "Wine glass", "glassType": "E" },
    { "item": "Pilsner glass", "glassType": "B" },
    { "item": "Beer mug", "glassType": "C" },
    { "item": "Nick and Nora glass", "glassType": "E" },
    { "item": "Pint glass", "glassType": "B" },
    { "item": "Pitcher", "glassType": "B" },
    { "item": "Cordial glass", "glassType": "B" },
    { "item": "Copper Mug", "glassType": "C" },
    { "item": "Jar", "glassType": "C" },
    { "item": "Mason jar", "glassType": "C" },
    { "item": "Pousse cafe glass", "glassType": "E" }
];


// =========================================================================
// FUNÇÕES AUXILIARES DE COPOS E PROPORÇÕES
// =========================================================================

/**
 * Retorna o código (letra) do copo com base no seu nome.
 */
function getGlassCode(glassTypeName) {
    const mapping = glassTypeMap.find(item => item.item.toLowerCase() === glassTypeName.toLowerCase());
    return mapping ? mapping.glassType : 'B'; // 'B' como default
}

/**
 * Calcula as proporções, cores e medidas de cada ingrediente do cocktail.
 * Retorna um array de objetos com dados de percentagem para uso em gradients.
 */
function getCocktailProportions(cocktail) {
    let ingredientsData = [];
    let measures = [];
    
    // 1. Coleta ingredientes e medidas (até 15)
    for (let i = 1; i <= 15; i++) {
        const ingredientKey = `Ingredient${i}`;
        const measureKey = `Measure${i}`;
        
        const ingredient = cocktail[ingredientKey];
        const measure = cocktail[measureKey];
        
        if (ingredient && ingredient.trim() !== "") {
            ingredientsData.push({
                ingredient: ingredient.trim(),
                // 'ingredientColors' deve estar definido no seu 'Cores.js'
                color: typeof ingredientColors !== 'undefined' ? ingredientColors[ingredient.trim()] || '#cccccc' : '#cccccc', 
                measure: measure ? measure.trim() : "",
                // 1 como default para proporção, se a medida não for um número
                parsedMeasure: parseFloat(measure) || 1 
            });
            measures.push(ingredientsData[ingredientsData.length - 1].parsedMeasure);
        }
    }

    // 2. Calcula as proporções percentuais
    let totalMeasure = measures.reduce((a, b) => a + b, 0);
    if (totalMeasure === 0 && measures.length > 0) totalMeasure = measures.length; 

    let currentPercent = 0;
    ingredientsData.forEach(item => {
        const percent = totalMeasure > 0 ? (item.parsedMeasure / totalMeasure) * 100 : (100 / ingredientsData.length);
        item.percent = percent;
        item.startPercent = currentPercent;
        item.endPercent = currentPercent + percent;
        currentPercent = item.endPercent;
    });

    return ingredientsData;
}


// =========================================================================
// FUNÇÕES PRINCIPAIS DO P5.JS (PRELOAD, SETUP, DRAW)
// =========================================================================

/**
 * pré-carrega os dados do arquivo JSON antes da configuração do p5.
 */
function preload() {
    // use p5.js loadJSON with callback to ensure array
    
    allCocktails = loadJSON('drinks.json', (data) => {
      allCocktails = Array.isArray(data) ? data : Object.values(data);
    });
}


/**
 * Configuração inicial do p5.
 */
function setup() {
    noCanvas(); // Esconder o canvas do p5

    filteredCocktails = allCocktails;

    // Inicializa os filtros e a grelha
    populateFilterOptions();
    renderCocktails(filteredCocktails);

    // Adiciona event listeners aos filtros
    ingredientSelect.addEventListener('change', applyFilters);
    alcoholSelect.addEventListener('change', applyFilters);
    cupSelect.addEventListener('change', applyFilters);

    // Repopula ingredientes ao clicar
    ingredientSelect.addEventListener('click', () => {
        populateFilterOptions();
    });

    // Inicializa a secção de detalhes
    updateRightSection(null);
}


function draw() {
    // Vazio, pois o trabalho é baseado em eventos DOM
}


// =========================================================================
// FUNÇÕES DE FILTRO E RENDERIZAÇÃO (LADO ESQUERDO)
// =========================================================================

/**
 * Preenche as opções dos select boxes de 'ingredient' e 'cup'.
 */
function populateFilterOptions() {
    const allIngredients = new Set();
    const allCups = new Set();

    allCocktails.forEach(cocktail => {
        for (let i = 1; i <= 15; i++) { 
            const ingredientKey = `Ingredient${i}`;
            if (cocktail[ingredientKey] && cocktail[ingredientKey].trim() !== "") {
                allIngredients.add(cocktail[ingredientKey].trim());
            }
        }
        if (cocktail['Glass type'] && cocktail['Glass type'].trim() !== "") {
            allCups.add(cocktail['Glass type'].trim());
        }
    });

    const fillSelect = (selectElement, optionsSet) => {
        const sortedOptions = Array.from(optionsSet).sort();
        
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
 * Renderiza os elementos da grelha (círculos) com base na lista de cocktails.
 */
function renderCocktails(cocktailsToRender) {
    gridElement.innerHTML = ''; // Limpa a grelha

    cocktailsToRender.forEach((cocktail, index) => {
        const item = document.createElement('div');
        item.classList.add('item');
        item.dataset.drinkName = cocktail.Drink;

        item.addEventListener('click', () => {
            selectedCocktail = cocktail;
            updateRightSection(selectedCocktail);
            
            document.querySelectorAll('.grid .item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
        
        // --- Cálculo de proporções para o conic-gradient (círculo) ---
        const ingredientsData = getCocktailProportions(cocktail);
        
        let colorStops = [];
        
        // Conic gradient: cor do startPercent ao endPercent
        ingredientsData.forEach(item => {
            colorStops.push(`${item.color} ${item.startPercent}% ${item.endPercent}%`);
        });

        if (colorStops.length > 0) {
            item.style.background = `conic-gradient(${colorStops.join(', ')})`;
        } else {
            item.style.background = '#ffe066'; // Cor default
        }

        gridElement.appendChild(item);
    });

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

    renderCocktails(filteredCocktails);
    updateRightSection(null);
    selectedCocktail = null;
}


// =========================================================================
// FUNÇÕES DE VISUALIZAÇÃO (LADO DIREITO - COPO)
// =========================================================================

/**
 * Desenha o preenchimento da bebida usando linear-gradient e aplica a máscara SVG.
 *//**
 * Desenha o preenchimento da bebida usando linear-gradient e aplica a máscara SVG.
 * @param {Array} ingredientsData - Os dados das proporções do cocktail.
 * @param {string} maskImageURL - O URL da imagem de máscara (SVG).
 * @param {number} fillHeight - Altura de preenchimento (em %).
 */
function drawDrinkFill(ingredientsData, maskImageURL, fillHeight) {
    const drinkFillElement = document.getElementById('drinkFill');
    if (!drinkFillElement || ingredientsData.length === 0) return;

    // 1. Aplica a altura de preenchimento ao elemento drinkFill
    // E posiciona-o no fundo do container (.glass-container)
    drinkFillElement.style.height = `${fillHeight-15 }%`;
    drinkFillElement.style.bottom = `${85 - fillHeight }%`; // Posiciona no fundo (e.g., 100 - 50 = 50% de 'top')
    
    // 2. Cria o gradiente (agora apenas dentro da nova altura definida)
    let colorStops = [];
    let currentPercent = 0;
    
    // Inverte o array para desenhar de baixo para cima no elemento drinkFill
    const reversedIngredients = [...ingredientsData].reverse(); 

    reversedIngredients.forEach(item => {
        let startFill = currentPercent;
        let endFill = currentPercent + item.percent;

        // Adiciona a cor do ponto inicial ao ponto final deste ingrediente
        // Estes percentuais referem-se aos 100% da *nova altura* (fillHeight)
        colorStops.push(`${item.color} ${startFill}% ${endFill}%`);

        currentPercent = endFill; 
    });
    
    // 3. Aplica o gradiente e a máscara
    drinkFillElement.style.background = `linear-gradient(to top, ${colorStops.join(', ')})`;
    
    // A máscara é aplicada à nova área e é cortada corretamente, pois o CSS usa 'mask-size: contain'
    drinkFillElement.style.maskImage = `url(${maskImageURL})`;
    drinkFillElement.style.webkitMaskImage = `url(${maskImageURL})`;
}

/**
 * Atualiza o conteúdo da secção #right com os detalhes do cocktail,
 * incluindo a visualização gráfica no copo.
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

    const glassType = cocktail['Glass type'] || 'Unknown Glass';
    
    // 1. Obter a letra do copo (A, B, C, etc.)
    const glassCode = getGlassCode(glassType); 
    
    // 2. Determinar a altura de preenchimento (nova lógica)
    // Se for A, E, ou G, a altura é 50%; caso contrário, 100%.
    const fillHeight = (glassCode === 'A' || glassCode === 'E' || glassCode === 'G') ? 50 : 100;
    
    // 3. Construir os URLs
    const cupImageURL = `images/copos/copo ${glassCode}.png`; 
    const maskImageURL = `images/masks/mask ${glassCode}.svg`; 
    
    // 4. Obter dados de proporção
    const ingredientsData = getCocktailProportions(cocktail);
    
    // 5. Cria a lista de ingredientes e proporções com marcadores coloridos
    let ingredientsList = '<ul>';
    ingredientsData.forEach(item => {
        ingredientsList += `<li><span style="color:${item.color}; font-size: 1.2em;">■</span> **${item.ingredient}**: ${item.measure ? item.measure : 'To taste'}</li>`;
    });
    ingredientsList += '</ul>';
    
    // 6. Conteúdo detalhado (HTML)
    rightSection.innerHTML = `
        <div class="cocktail-details">
            <h2>${cocktail.Drink}</h2>
            
            <div class="glass-container">
                <div class="drink-fill" id="drinkFill"></div>
                <img src="${cupImageURL}" alt="${glassType}" class="glass-image">
            </div>

            <p><strong>Type:</strong> ${cocktail['Alcoholic type'] || 'N/A'}</p>
            <p><strong>Category:</strong> ${cocktail.Category || 'N/A'}</p>
            <p><strong>Glass:</strong> ${glassType}</p>
            
            <h3>Ingredients & Measures</h3>
            ${ingredientsList}
            
            <h3>Instructions</h3>
            <p>${cocktail.Inuctions || 'No instructions provided.'}</p>
        </div>
    `;

    // 7. Desenha o preenchimento, passando a altura
    drawDrinkFill(ingredientsData, maskImageURL, fillHeight);

    }