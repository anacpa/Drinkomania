 
// array de cores para ingredientes liquidos
const ingredientColors = {
 
    "Gin": "#E8F3F7",
    "Vodka": "#E3F1F7",
    "Cranberry vodka": "#DDEEF6",
    "Raspberry vodka": "#D7EBF6",
    "Peach Vodka": "#D1E8F5",
    "Lime vodka": "#CAE5F5",
    "Absolut Citron": "#C4E2F4",
    "Absolut Kurant": "#BEDFF4",
    "Absolut Peppar": "#B8DCF3",
    "Light rum": "#B2D9F3",
    "White Rum": "#ACD6F2",
    "Bacardi Limon": "#A6D3F2",
    "Añejo rum": "#A0D0F1",
    "Everclear": "#9ACDF1",
    "Grain alcohol": "#94CAF0",
    "Carbonated water": "#8EC7F0",
    "Soda Water": "#88C4EF",
    "Tonic Water": "#82C1EF",
    "Club soda": "#7CBEEE",
    "Lemon-lime soda": "#76BCEE",
    "Sprite": "#70B9ED",
    "7-Up": "#6AB6ED",
    "Schweppes Russchian": "#64B3EC",
    "Mountain Dew": "#5EB0EC",
    "Surge": "#58ADEC",
    "Zima": "#52AAEB",
    "Water": "#4CA7EB",
    "Sambuca": "#46A4EA",
    "Ouzo": "#40A1EA",
    "Ricard": "#3A9EE9",
    "Pernod": "#349BE9",
    "Absinthe": "#2E98E8",
    "Anis": "#2895E8",
    "Anisette": "#2292E7",
    "Sugar Syrup": "#1C8FE7",
    "Agave Syrup": "#168CE6",
    "Honey syrup": "#1089E6",
    "Mint syrup": "#0A86E5",
    "Ginger Syrup": "#0483E5",
    "Rosemary Syrup": "#007FE4",
    "Vanilla syrup": "#0A79D8",
    "Cachaça": "#1473CC",
    "Pisco": "#1E6DC0",
    "Mezcal": "#2867B4",
    "Tequila": "#3261A8",
    "Passoa": "#3C5B9C", 

    "Scotch": "#F4D03F",
    "Blended whiskey": "#EEC73D",
    "Bourbon": "#E8BF3B",
    "Rye whiskey": "#E2B639",
    "Irish whiskey": "#DDAD37",
    "Jack Daniels": "#D7A435",
    "Tennessee whiskey": "#D19B33",
    "Crown Royal": "#CB9231",
    "Wild Turkey": "#C5892F",
    "Whiskey": "#BF802D",
    "Whisky": "#B9772B",
    "Blended Scotch": "#B36E29",
    "Islay single malt Scotch": "#AD6527",
    "Jim Beam": "#A75C25",
    "Gold rum": "#A15323",
    "Dark rum": "#9B4A21",
    "Blackstrap rum": "#95411F",
    "Spiced rum": "#8F381D",
    "Rum": "#892F1B",
    "151 proof rum": "#832619",
    "White Wine": "#F6D95C",
    "Sherry": "#F5D152",
    "Cider": "#F3C948",
    "Advocaat": "#F2C23E",
    "Apfelkorn": "#F0BB34",
    "Peach schnapps": "#F0B228",
    "Peachtree schnapps": "#EDA91C",
    "Peach brandy": "#E4A015",
    "Apricot brandy": "#D99711",
    "Apricot Nectar": "#CF8E0D",
    "Creme de Banane": "#C58509",
    "Butterscotch schnapps": "#BA7C06",
    "Falernum": "#B07305",
    "Galliano": "#A66A03",
    "Drambuie": "#9C6102",
    "Hot Damn": "#925700",
    "Yellow Chartreuse": "#884E00", 

    "Triple sec": "#F39C12",
    "Cointreau": "#F39510",
    "Grand Marnier": "#F38E0E",
    "Orange Curacao": "#F3870C",
    "Blue Curacao": "#F3800A",
    "Orange juice": "#F37909",
    "Sweet and sour": "#F37207",
    "Aperol": "#F36B05",
    "Bitter Lemon": "#F36404",
    "Orange bitters": "#F35D02", 


};

let allCocktails = [];
let filteredCocktails = [];
let selectedCocktail = null; // armazena o cocktail atualmente selecionado

// elementos HTML
const gridElement = document.querySelector('.grid');
const rightSection = document.getElementById('right');
const ingredientSelect = document.getElementById('ingredient');
const alcoholSelect = document.getElementById('alcohol');
const cupSelect = document.getElementById('cup');

/**
 * pré-carrega os dados do arquivo JSON antes da configuração do p5.
 * usamos loadJSON do p5.js.
 * p5 garante que o setup só arranca depois do json estar carregado
 */
function preload() {
    // use p5.js loadJSON with callback to ensure array
    allCocktails = loadJSON('drinks.json', (data) => {
        allCocktails = Array.isArray(data) ? data : Object.values(data);
    });
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

    // Sempre repopula ingredientes ao clicar
    ingredientSelect.addEventListener('click', () => {
        populateFilterOptions();
    });

    // Inicializa a secção de detalhes
    updateRightSection(null);
}


// O loop draw() do p5.js pode ser deixado vazio, pois o trabalho é baseado em eventos DOM
function draw() {
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
            if (cocktail[ingredientKey] && cocktail[ingredientKey].trim() !== "") {
                allIngredients.add(cocktail[ingredientKey].trim());
            }
        }
        // Copos
        if (cocktail['Glass type'] && cocktail['Glass type'].trim() !== "") {
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
        

        // Obter ingredientes e medidas
        let ingredients = [];
        let measures = [];
        for (let i = 1; i <= 15; i++) {
            const ingredientKey = `Ingredient${i}`;
            const measureKey = `Measure${i}`;
            if (cocktail[ingredientKey] && cocktail[ingredientKey].trim() !== "") {
                ingredients.push(cocktail[ingredientKey].trim());
                measures.push(cocktail[measureKey] ? cocktail[measureKey].trim() : "");
            }
        }

        // Calcular proporções (simples: cada ingrediente igual se não houver medida)
        let total = 0;
        let parsedMeasures = measures.map(m => {
            // Extrai número da medida, se possível
            let num = parseFloat(m);
            if (isNaN(num)) return 1;
            return num;
        });
        total = parsedMeasures.reduce((a, b) => a + b, 0);
        if (total === 0) total = parsedMeasures.length;

        // Criar divisões coloridas usando CSS linear-gradient
        let colorStops = [];
        let currentPercent = 0;
        for (let i = 0; i < ingredients.length; i++) {
            let color = ingredientColors[ingredients[i]] || '#cccccc';
            let percent = (parsedMeasures[i] / total) * 100;
            let nextPercent = currentPercent + percent;
            colorStops.push(`${color} ${currentPercent}% ${nextPercent}%`);
            currentPercent = nextPercent;
        }
        if (colorStops.length > 0) {
            item.style.background = `conic-gradient(${colorStops.join(', ')})`;
        } else {
            item.style.background = '#ffe066';
        }

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
