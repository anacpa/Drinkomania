// DRINKOMANIA.JS 
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
    { "item": "Cocktail glass", "glassType": "A", "style": "width: 50%; max-height: 90%;" }, // Exemplo: Copo A é mais estreito
    { "item": "Highball glass", "glassType": "B", "style": "width: 40%; max-height: 90%;" }, // 
    { "item": "Collins glass", "glassType": "B", "style": "width: 40%; max-height: 90%;" },
    { "item": "Old-fashioned glass", "glassType": "D", "style": "width: 60%; max-height: 90%;" }, // Exemplo: Copo D é mais largo
    { "item": "Shot glass", "glassType": "F", "style": "width: 25%; max-height: 60%;" },
    { "item": "Coffee mug", "glassType": "C", "style": "width: 50%; max-height: 80%;" },
    { "item": "Champagne flute", "glassType": "I", "style": "width: 20%; max-height: 70%;" },
    { "item": "Balloon glass", "glassType": "E", "style": "width: 50%; max-height: 90%;" },
    { "item": "Hurricane glass", "glassType": "H", "style": "width: 30%; max-height: 70%;" },
    { "item": "Irish coffee cup", "glassType": "C", "style": "width: 50%; max-height: 80%;" },
    { "item": "Margarita glass", "glassType": "G", "style": "width: 50%; max-height: 80%;" },
    { "item": "Wine glass", "glassType": "E", "style": "width: 50%; max-height: 90%;" },
    { "item": "Pilsner glass", "glassType": "H", "style": "width: 30%; max-height: 70%;" },
    { "item": "Beer mug", "glassType": "C", "style": "width: 50%; max-height: 80%;" },
    { "item": "Nick and Nora glass", "glassType": "G", "style": "width: 50%; max-height: 80%;" },
    { "item": "Pint glass", "glassType": "B", "style": "width: 40%; max-height: 90%;" },
    { "item": "Pitcher", "glassType": "C", "style": "width: 50%; max-height: 80%;" },
    { "item": "Cordial glass", "glassType": "H", "style": "width: 30%; max-height: 70%;" },
    { "item": "Copper Mug", "glassType": "C", "style": "width: 50%; max-height: 80%;" },
    { "item": "Jar", "glassType": "C", "style": "width: 50%; max-height: 80%;" },
    { "item": "Mason jar", "glassType": "C", "style": "width: 50%; max-height: 80%;" },
    { "item": "Pousse cafe glass", "glassType": "I", "style": "width: 30%; max-height: 70%;" }
];



// =========================================================================
// FUNÇÕES AUXILIARES DE COPOS E PROPORÇÕES
// =========================================================================


/**
 * Retorna o código (letra) do copo com base no seu nome.
 */
function getGlassCode(glassTypeName) {
    const defaultMapping = { "glassType": "B", "style": "width: 40%; max-height: 100%;" };
    const mapping = glassTypeMap.find(item => item.item.toLowerCase() === glassTypeName.toLowerCase());
    return mapping ? mapping : defaultMapping; // Retorna o objeto completo
}

/**
 * Calcula as proporções, cores e medidas de cada ingrediente líquido do cocktail.
 * Retorna um array de objetos com dados de percentagem (APENAS LÍQUIDOS) para o gradiente.
 */
function getCocktailProportions(cocktail) {
    let ingredientsData = [];
    let measures = [];

    // Lista de chaves do seu objeto solidIngredient, convertidas para minúsculas
    const solidKeys = Object.keys(solidIngredient).map(key => key.toLowerCase());

    // 1. Coleta ingredientes e medidas (até 15)
    for (let i = 1; i <= 15; i++) {
        const ingredientKey = `Ingredient${i}`;
        const measureKey = `Measure${i}`;

        const ingredient = cocktail[ingredientKey];
        const measure = cocktail[measureKey];

        if (ingredient && ingredient.trim() !== "") {
            const trimmedIngredient = ingredient.trim();

            // *** EXCLUSÃO PARA PROPORÇÃO DO COPO ***
            // Se o ingrediente for sólido, salta-o.
            if (solidKeys.includes(trimmedIngredient.toLowerCase())) {
                continue;
            }
            // **************************************

            ingredientsData.push({
                ingredient: trimmedIngredient,
                // 'ingredientColors' deve estar definido no seu 'Cores.js'
                color: typeof ingredientColors !== 'undefined' ? ingredientColors[trimmedIngredient] || '#cccccc' : '#cccccc',
                measure: measure ? measure.trim() : "",
                // 1 como default para proporção, se a medida não for um número
                parsedMeasure: parseFloat(measure) || 1
            });
            measures.push(ingredientsData[ingredientsData.length - 1].parsedMeasure);
        }
    }

    // 2. Calcula as proporções percentuais
    let totalMeasure = measures.reduce((a, b) => a + b, 0);
    // Caso raro onde só existem sólidos ou ingredientes sem medida, assume partes iguais
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


function setup() {
    noCanvas();

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




// =========================================================================
// FUNÇÕES DE VISUALIZAÇÃO (LADO DIREITO - COPO)
// =========================================================================

/**
 * Desenha o preenchimento da bebida usando linear-gradient.
 *
 * @param {Array} ingredientsData - Os dados das proporções do cocktail.
 * @param {number} fillHeight - Altura de preenchimento (em % da altura total do recipiente).
 * @param {number} topOffset - Ajuste vertical adicional (em %) para a posição 'top'.
 */
function drawDrinkFill(ingredientsData, fillHeight, topOffset = 0) {
    const drinkFillElement = document.getElementById('drinkFill');
    if (!drinkFillElement || ingredientsData.length === 0) return;

    // 1. Aplica a altura de preenchimento
    drinkFillElement.style.height = `${fillHeight}%`;

    // 2. Cálculo da posição 'top':
    const basePositionTop = 100 - fillHeight;
    const finalTopPosition = basePositionTop - topOffset;
    drinkFillElement.style.top = `${finalTopPosition}%`;

    // 3. Ordena ingredientes do MAIOR para o MENOR (para que o menor fique no topo)
    const sortedIngredients = [...ingredientsData].sort((a, b) => b.parsedMeasure - a.parsedMeasure);

    // 4. Cria o gradiente
    let colorStops = [];
    let currentPercent = 0;
    sortedIngredients.forEach(item => {
        const startFill = currentPercent;
        const endFill = currentPercent + item.percent;
        colorStops.push(`${item.color} ${startFill}% ${endFill}%`);
        currentPercent = endFill;
    });

    // 5. Aplica o gradiente
    drinkFillElement.style.background = `linear-gradient(to top, ${colorStops.join(', ')})`;
}




/* GLASS MASK  */
function applyMask(glassCode) {
    const maskContainer = document.querySelector(".mask");
    const drinkFill = document.getElementById("drinkFill");
    if (!drinkFill) return;

    // Nome exato dos teus ficheiros: "mask A.svg", "mask B.svg"...
    const maskFileName = `mask ${glassCode}.svg`;
    const path = `images/masks/${maskFileName}`;
    const encodedPath = encodeURI(path); // necessário por causa do espaço

    if (maskContainer) maskContainer.innerHTML = "";

    // Carrega o SVG e injeta na .mask
    fetch(path)
        .then(res => res.text())
        .then(svg => {
            if (maskContainer) maskContainer.innerHTML = svg;
            if (glassCode === 'C') {
                const glassImage = glassContainer.querySelector('.glass-image');
                glassImage.style.transform = 'right(' - 22 % ')';


            }

            // Aplica a máscara ao líquido
            drinkFill.style.maskImage = `url('${encodedPath}')`;
            drinkFill.style.webkitMaskImage = `url('${encodedPath}')`;

            drinkFill.style.maskSize = "contain";
            drinkFill.style.webkitMaskSize = "contain";

            drinkFill.style.maskRepeat = "no-repeat";
            drinkFill.style.webkitMaskRepeat = "no-repeat";

            drinkFill.style.maskPosition = "center bottom";
            drinkFill.style.webkitMaskPosition = "center bottom";


        })
        .catch(e => {
            console.error("Erro carregando máscara:", maskFileName, e);
        });
}



/* * Atualiza o conteúdo da secção #right com os detalhes do cocktail,
* incluindo a visualização gráfica no copo (sem máscaras SVG).
*/
function updateRightSection(cocktail) {
    rightSection.innerHTML = ''; // Limpa o conteúdo

    if (!cocktail) {

        // Exibe o texto inicial
        rightSection.innerHTML = `
            <h2>Cocktails</h2>
            <p>
                Bem-vindo/a ao <span>DRINKOMANIA!</span> 
                <br>
                <br>
               Desde que o termo <span>"cocktail"</span> apareceu em 1806, a sua história tem passado por diversos 
               períodos e estilos diferentes, evoluindo das fórmulas simples do século XIX 
               até chegar às criações complexas e artísticas dos dias de hoje. </p>
            <p>
               Explora mais de 350 cocktails a partir dos filtros acima. Podes clicar também nos círculos à esquerda 
               para ver os detalhes de cada cocktail, incluindo ingredientes, proporções e instruções.
            </p>
            <p> <br><br>
            Este projeto foi desenvolvido por Ana Almeida e Inês Costa no âmbito da unidade curricular de Visualização de Informação na Faculdade de Ciências e Tecnologias da Universidade de Coimbra.
            </p>
        `;
        return;
    }

    const glassType = cocktail['Glass type'] || 'Unknown Glass';

    // 1. Obter a letra do copo (A, B, C, etc.)
    const glassMapping = getGlassCode(glassType); // Agora retorna o objeto
    const glassCode = glassMapping.glassType;
    const imageStyle = glassMapping.style;
        const alcoholicType = cocktail['Alcoholic type'] || '';

    // 2. Determinar a altura de preenchimento e o ajuste vertical 
    let fillHeight;
    let topOffset;

    if (glassCode === 'A') { //cocktail glass
        fillHeight = 30;
        topOffset = 57;
    } else if (glassCode === 'G') {  //margarita 
        fillHeight = 25;
        topOffset = 44;

    } else if (glassCode === 'E') {  //wine glass
        fillHeight = 50;
        topOffset = 47;
    } else if (glassCode === 'H') {  //hurricane glass
        fillHeight = 68;
        topOffset = 32;

    } else if (glassCode === 'I') {  //flute glass
        fillHeight = 54;
        topOffset = 46;

    } else if (glassCode === 'F') {  //shot glass
        fillHeight = 85;
        topOffset = 12;
    } else if (glassCode === 'C') {  // mug 
        fillHeight = 88;
        topOffset = 12;
    } else {
        fillHeight = 95; // Restantes: B, D, 
        topOffset = 4;
    }
    // 3. Construir o URL do copo
    const cupImageURL = `images/copos/copo ${glassCode}.png`;

    // 4. Obter dados de proporção (ISTO CONTÉM APENAS OS LÍQUIDOS FILTRADOS)
    const ingredientsData = getCocktailProportions(cocktail);

    // 5. CRIA A LISTA DE INGREDIENTES E MEDIDAS (TODOS: líquidos E sólidos)
    // ITERA SOBRE O OBJECTO ORIGINAL DO COCKTAIL (SEM FILTRO)
    let ingredientsList = '<ul>';
    for (let i = 1; i <= 15; i++) {
        const ingredient = cocktail[`Ingredient${i}`];
        const measure = cocktail[`Measure${i}`];

        if (ingredient && ingredient.trim() !== "") {
            const trimmedIngredient = ingredient.trim();
            // Assume que 'ingredientColors' está acessível e mapeia a cor
            const color = typeof ingredientColors !== 'undefined' ? ingredientColors[trimmedIngredient] || '#cccccc' : '#cccccc';

            ingredientsList += `<li><span style="color:${color}; font-size: 1.2em;">■</span> ${trimmedIngredient}: ${measure ? measure.trim() : 'To taste'}</li>`;
        }
    }
    ingredientsList += '</ul>';

    // 6. Conteúdo detalhado (HTML)
    rightSection.innerHTML = `
        <div class="cocktail-details">
            <h2>${cocktail.Drink}</h2>
            
            <div class="glass-container">
             <div class="mask"></div>
                <div class="drink-fill" id="drinkFill"></div>
                <img src="${cupImageURL}" alt="${glassType}" class="glass-image" style="${imageStyle}">
            </div>

           <!--  <p><strong>Type:</strong> ${cocktail['Alcoholic type'] || 'N/A'}</p> --> 
            <p><strong>Category:</strong> ${cocktail.Category || 'N/A'}</p>
            <p><strong>Glass:</strong> ${glassType}</p>
            
            <h3>Ingredients & Measures</h3>
            ${ingredientsList}
            
            <div class ="instructions"> 
            <h3>Instructions</h3>
            <p>${cocktail.Inuctions || 'No instructions provided.'}</p>
            </div> 
        </div>
    `;

    // 7. Desenha o preenchimento (APENAS COM INGREDIENTES LÍQUIDOS)
    applyMask(glassCode);
    drawDrinkFill(ingredientsData, fillHeight, topOffset);

    // 8. AJUSTE ESPECÍFICO PARA O COPO TIPO C
    if (glassCode === 'C') {
        const drinkFill = document.getElementById('drinkFill');
        if (drinkFill) {
            // Sobrescreve os estilos apenas para o copo tipo C
            drinkFill.style.width = '33%';
            drinkFill.style.left = '28.5%';
            drinkFill.style.height = '92%';
            drinkFill.style.top = '1%';


        }
    }

    // 9. Adicionar os sólidos
    placeSolidGarnishes(cocktail, glassCode);
    
    // 10. ADICIONAR A IMAGEM PLUS18 APENAS SE O COCKTAIL FOR ALCOÓLICO
    // Verificar se o cocktail é alcoólico
     const isNonAlcoholic = alcoholicType.toLowerCase() === 'non alcoholic' || 
                          alcoholicType.toLowerCase() === 'non-alcoholic' ||
                          alcoholicType.toLowerCase().includes('non alcoholic');

    if (isNonAlcoholic) {
        const ageRestrictionImg = document.createElement('img');
        ageRestrictionImg.src = 'images/noAlcohol.png';
        ageRestrictionImg.alt = 'Non-alcoholic drink';
        ageRestrictionImg.className = 'age-restriction-img';
        ageRestrictionImg.style.position = 'absolute';
        ageRestrictionImg.style.top = '120px';  // Alterado para canto superior
        ageRestrictionImg.style.right = '20px';
        ageRestrictionImg.style.width = '50px';
        ageRestrictionImg.style.height = 'auto';
        ageRestrictionImg.style.zIndex = '100';
        ageRestrictionImg.style.opacity = '0.7';
        
        // Adiciona um pequeno texto ou tooltip se quiser
        ageRestrictionImg.title = 'Non-alcoholic cocktail';
        
        rightSection.appendChild(ageRestrictionImg);
    }
     const isAlcoholic = alcoholicType.toLowerCase() !== 'non alcoholic' && 
                       alcoholicType.toLowerCase() !== 'non-alcoholic' &&
                       alcoholicType.toLowerCase() !== 'non alcoholic' &&
                       alcoholicType !== '' &&
                       alcoholicType.toLowerCase() !== 'n/a';

    if (isAlcoholic) {
        const ageRestrictionImg = document.createElement('img');
        ageRestrictionImg.src = 'images/plus18.png';
        ageRestrictionImg.alt = 'Plus 18 age restriction';
        ageRestrictionImg.className = 'age-restriction-img';
        ageRestrictionImg.style.position = 'absolute';
        ageRestrictionImg.style.top = '120px';
        ageRestrictionImg.style.right = '20px';
        ageRestrictionImg.style.width = '50px';
        ageRestrictionImg.style.height = 'auto';
        ageRestrictionImg.style.zIndex = '100';
        ageRestrictionImg.style.opacity = '0.7';
        rightSection.appendChild(ageRestrictionImg);
    }
}


// =========================================================================
// INGREDIENTES SOLIDOS 
// =========================================================================


/**
 * coloca os ingredientes sólidos (guarnições) aleatoriamente dentro do .glass-container,
 * respeitando os limites aproximados da máscara do copo.
 * @param {object} cocktail - O objeto cocktail com os ingredientes
 * @param {string} glassCode - O código do copo (A, B, C, etc.)
 */
function placeSolidGarnishes(cocktail, glassCode) {
    if (typeof solidIngredient === 'undefined') return;

    const glassContainer = document.querySelector('.glass-container');
    if (!glassContainer) return;

    const solidKeys = Object.keys(solidIngredient).map(key => key.toLowerCase());


    // ajustes consoante o copo
    if (glassCode === 'A') { // Cocktail glass () V-shape)
        xMin = 45; xMax = 52; // Mais estreito
        yMin = 10; yMax = 20; // Mais alto
        size = 10;
    } else if (glassCode === 'G') { // Margarita glass (copo em camadas, líquido no topo)
        xMin = 28; xMax = 65;
        yMin = 25; yMax = 50;
        size = 18;
    } else if (glassCode === 'E') { // Taças de vinho/Champagne (pés longos)
        xMin = 30; xMax = 60;
        yMin = 5; yMax = 40;
        size = 15;
    } else if (glassCode === 'H') { // Hurricane glass
        xMin = 40; xMax = 50;
        yMin = 5; yMax = 40;
        size = 12;
    } else if (glassCode === 'I') { // Flute glass
        xMin = 42; xMax = 50;
        yMin = 5; yMax = 40;
        size = 10;
    } else if (glassCode === 'F') { // Shot glass (cheio quase até ao topo)
        xMin = 35; xMax = 60;
        yMin = 5; yMax = 70;
        size = 12;
    } else if (glassCode === 'B') { // highball, collins, pint (cilíndricos)
        xMin = 32; xMax = 60;
        yMin = 10; yMax = 70;
        size = 15;
    } else if (glassCode === 'D') { // old-fashioned
        xMin = 25; xMax = 65;
        yMin = 5; yMax = 60;
        size = 15;
    } else if (glassCode === 'C') { // mug, jar, beer mug (largos)
        xMin = 27; xMax = 55;
        yMin = 5; yMax = 75;
        size = 15;
    }

    for (let i = 1; i <= 15; i++) {
        const ingredient = cocktail[`Ingredient${i}`];

        if (ingredient && ingredient.trim() !== "") {
            const trimmedIngredient = ingredient.trim();
            const lowerCaseIngredient = trimmedIngredient.toLowerCase();

            if (solidKeys.includes(lowerCaseIngredient)) {

                const originalKey = Object.keys(solidIngredient).find(key => key.toLowerCase() === lowerCaseIngredient);
                if (!originalKey) continue;

                const imagePath = solidIngredient[originalKey];

                const garnishImg = document.createElement('img');
                garnishImg.src = imagePath;
                garnishImg.className = 'solid-garnish';

                // 2. Cálculo aleatório dentro dos novos limites:
                // Usamos (Máx - Mín - (Tamanho / 2)) para garantir que a imagem não saia do limite direito/inferior

                // Posição horizontal (Left)
                const rangeX = xMax - xMin - (size / 2);
                const randomLeft = Math.random() * rangeX + xMin;

                // Posição vertical (Top)
                const rangeY = yMax - yMin - (size / 2);
                const randomTop = Math.random() * rangeY + yMin;

                garnishImg.style.position = 'absolute';
                garnishImg.style.left = `${randomLeft}%`;
                garnishImg.style.top = `${randomTop}%`;

                garnishImg.style.width = `${size}%`;
                garnishImg.style.height = 'auto';
                garnishImg.style.zIndex = 10;
                garnishImg.style.pointerEvents = 'none';

                glassContainer.appendChild(garnishImg);
            }
        }
    }
}