// =========================================================================
// FUNÇÕES DE FILTRO E RENDERIZAÇÃO 
// =========================================================================
// filtros.js — versão combinada real dos filtros

/* ---------- Normalização ---------- */
function _norm(v) {
    return (v === undefined || v === null) ? '' : String(v).trim().toLowerCase();
}

/* ---------- Popular selects (apenas no arranque) ---------- */
function populateFilterOptions() {
    if (!Array.isArray(allCocktails)) return;

    const ingredientsSet = new Set();
    const cupsSet = new Set();

    allCocktails.forEach(c => {
        for (let i = 1; i <= 15; i++) {
            const val = c[`Ingredient${i}`];
            if (val && String(val).trim() !== '') ingredientsSet.add(String(val).trim());
        }
        const glass = c['Glass type'] || c['Glass'];
        if (glass && String(glass).trim() !== '') cupsSet.add(String(glass).trim());
    });

    // Preenche select mantendo placeholder (assume que existe 1ª option como placeholder com value "")
    function fill(selectEl, valuesSet) {
        if (!selectEl) return;
        const current = selectEl.value; // guarda o valor selecionado
        // remove todas as opções excepto a 1ª (placeholder)
        while (selectEl.options.length > 1) selectEl.remove(1);

        const sorted = Array.from(valuesSet).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
        sorted.forEach(v => {
            const opt = document.createElement('option');
            opt.value = v;
            opt.textContent = v;
            selectEl.appendChild(opt);
        });

        // reaplica o valor atual (se existir)
        // se o valor não estiver nas novas options, mantém o value (mas select mostrará placeholder)
        selectEl.value = current;
    }

    fill(ingredientSelect, ingredientsSet);
    fill(cupSelect, cupsSet);
}

/* ---------- Renderizar grelha ---------- */
function renderCocktails(list) {
    if (!gridElement) return;
    gridElement.innerHTML = '';

    if (!Array.isArray(list) || list.length === 0) {
        const p = document.createElement('p');
        p.textContent = 'No cocktails found matching the selected filters.';
        gridElement.appendChild(p);
        return;
    }

    list.forEach(cocktail => {
        const item = document.createElement('div');
        item.classList.add('item');
        item.dataset.drinkName = cocktail.Drink || '';

        item.addEventListener('click', () => {
            selectedCocktail = cocktail;
            updateRightSection(cocktail);
            document.querySelectorAll('.grid .item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });

        // Usa a função existente para proporções (apenas líquidos)
        let parts = [];
        try { parts = getCocktailProportions(cocktail) || []; } catch (e) { parts = []; }

        if (parts.length > 0) {
            const colorStops = parts.map(p => {
                const s = (typeof p.startPercent === 'number') ? p.startPercent : 0;
                const e = (typeof p.endPercent === 'number') ? p.endPercent : s + (p.percent || 0);
                return `${p.color || '#cccccc'} ${s}% ${e}%`;
            });
            item.style.background = `conic-gradient(${colorStops.join(',')})`;
        } else {
            item.style.background = '#ffe066';
        }

        gridElement.appendChild(item);
    });
}

/* ---------- Função de filtro combinada (AND) ---------- */
function applyFilters() {
    if (!Array.isArray(allCocktails)) {
        filteredCocktails = [];
        renderCocktails(filteredCocktails);
        updateRightSection(null);
        return;
    }

    const selIng = _norm(ingredientSelect ? ingredientSelect.value : '');
    const selAlc = _norm(alcoholSelect ? alcoholSelect.value : '');
    const selCup = _norm(cupSelect ? cupSelect.value : '');

    // Considera 'all' ou vazio como sem filtro para alcool
    const alcoholFilterActive = selAlc && selAlc !== 'all';

    filteredCocktails = allCocktails.filter(c => {
        // Ingrediente: se selIng vazio => passa; senão verifica igualdade normalizada com qualquer Ingredient1..15
        let matchesIng = true;
        if (selIng) {
            matchesIng = false;
            for (let i = 1; i <= 15; i++) {
                const ing = _norm(c[`Ingredient${i}`]);
                if (ing && ing === selIng) {
                    matchesIng = true;
                    break;
                }
            }
        }

        // Alcohol: se não activo => passa; senão compara valores normalizados (tolerante a variantes)
        let matchesAlc = true;
        if (alcoholFilterActive) {
            const cocktailAlc = _norm(c['Alcoholic type'] || c['Alcoholic'] || '');
            // Alguns JSONs usam "Non alcoholic" ou "Non-Alcoholic" — comparações diretas após normalizar devem funcionar
            matchesAlc = cocktailAlc === selAlc;
        }

        // Copo: se selCup vazio => passa; senão compara normalizado
        let matchesCup = true;
        if (selCup) {
            const cocktailCup = _norm(c['Glass type'] || c['Glass'] || '');
            matchesCup = cocktailCup === selCup;
        }

        return matchesIng && matchesAlc && matchesCup;
    });

    renderCocktails(filteredCocktails);
    // limpa detalhe direito ao aplicar filtros (mantém behaviour anterior)
    selectedCocktail = null;
    updateRightSection(null);
}

/* ---------- Click/Change listeners ---------- */
// NÃO repopular selects ao mudar (isso fazia desaparecer a escolha)
if (ingredientSelect) {
    ingredientSelect.removeEventListener('change', applyFilters);
    ingredientSelect.addEventListener('change', applyFilters);
}
if (alcoholSelect) {
    alcoholSelect.removeEventListener('change', applyFilters);
    alcoholSelect.addEventListener('change', applyFilters);
}
if (cupSelect) {
    cupSelect.removeEventListener('change', applyFilters);
    cupSelect.addEventListener('change', applyFilters);
}

/* ---------- Inicialização ---------- */
function initFiltersModule() {
    populateFilterOptions();
    // Aplica filtros iniciais (mostra tudo se nenhum filtro seleccionado)
    filteredCocktails = Array.isArray(allCocktails) ? allCocktails.slice() : [];
    renderCocktails(filteredCocktails);
    // NÃO ligar populateFilterOptions em click/change — evita perda de estado
}

// if allCocktails já carregado, inicializa; senão, espera que o teu setup() o faça
if (Array.isArray(allCocktails) && allCocktails.length > 0) {
    initFiltersModule();
}

// Exporta applyFilters caso outro ficheiro queira chamar
// (não sobrescreve nada globalmente; apenas garante função disponível)
window.applyFilters = applyFilters;
window.populateFilterOptions = populateFilterOptions;
