// =========================================================================
// FUNÇÕES DE FILTRO E RENDERIZAÇÃO 
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

