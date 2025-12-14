// =========================================================================
// FUNÇÕES DE FILTRO E RENDERIZAÇÃO 
// =========================================================================
//versão combinada dos filtros

const norm = v => (v ?? "").toString().trim().toLowerCase();

// ---------- Popular selects ----------
function populateFilterOptions() {
    if (!Array.isArray(allCocktails)) return;

    const ingredients = new Set();
    const cups = new Set();

    allCocktails.forEach(c => {
        for (let i = 1; i <= 15; i++) {
            const v = c[`Ingredient${i}`];
            if (v?.trim()) ingredients.add(v.trim());
        }
        if (c["Glass type"]?.trim()) cups.add(c["Glass type"].trim());
    });

    const fill = (select, set) => {
        const current = select.value;
        while (select.options.length > 1) select.remove(1);
        [...set].sort().forEach(v => select.add(new Option(v, v)));
        select.value = current;
    };

    fill(ingredientSelect, ingredients);
    fill(cupSelect, cups);
}

// ---------- Render ----------
function renderCocktails(list) {
    gridElement.innerHTML = "";

    if (!list.length) {
        gridElement.innerHTML = "<p>No cocktails found.</p>";
        return;
    }

    list.forEach(c => {
        const el = document.createElement("div");
        el.className = "item";
        el.dataset.drinkName = c.Drink || "";
        el.title = c.Drink || "Cocktail"; // Adiciona tooltip com o nome

        el.onclick = () => {
            selectedCocktail = c;
            updateRightSection(c);
            document.querySelectorAll(".grid .item").forEach(i => i.classList.remove("active"));
            el.classList.add("active");
        };

        const parts = getCocktailProportions(c) || [];
        el.style.background = parts.length
            ? `conic-gradient(${parts.map(p =>
                `${p.color || "#ccc"} ${p.startPercent}% ${p.endPercent}%`
              ).join(",")})`
            : "#ffe066";

        gridElement.appendChild(el);
    });
}

// ---------- Filtro combinando tudo ----------
function applyFilters() {
    const f = {
        search: norm(document.getElementById("search").value),
        ing: norm(ingredientSelect.value),
        alc: norm(alcoholSelect.value),
        cup: norm(cupSelect.value)
    };

    filteredCocktails = allCocktails.filter(c => {
        // Filtro por nome (busca parcial)
        const matchName = !f.search || 
                         norm(c.Drink || "").includes(f.search);

        // Filtro por ingrediente
        const matchIng = !f.ing || [...Array(15)].some((_, i) =>
            norm(c[`Ingredient${i + 1}`]) === f.ing
        );

        // Filtro por tipo de álcool
        const matchAlc = !f.alc || f.alc === "all" ||
            norm(c["Alcoholic type"] || "") === f.alc;

        // Filtro por tipo de copo
        const matchCup = !f.cup ||
            norm(c["Glass type"] || "") === f.cup;

        return matchName && matchIng && matchAlc && matchCup;
    });

    renderCocktails(filteredCocktails);
    selectedCocktail = null;
    updateRightSection(null);
}

// ---------- Eventos ----------
ingredientSelect.onchange = applyFilters;
alcoholSelect.onchange = applyFilters;
cupSelect.onchange = applyFilters;

// Adicionar evento para o campo de busca
document.getElementById("search").oninput = applyFilters;

// Adicionar tecla Enter para pesquisa também
document.getElementById("search").onkeyup = (e) => {
    if (e.key === "Enter") {
        applyFilters();
    }
};

// ---------- Clear search function ----------
function clearSearch() {
    document.getElementById("search").value = "";
    applyFilters();
}

// ---------- Init ----------
function initFiltersModule() {
    // Adicionar botão de limpar busca (opcional)
    const searchContainer = document.querySelector('label[for="search"]')?.parentElement;
    if (searchContainer) {
        const clearBtn = document.createElement("button");
        clearBtn.textContent = "×";
        clearBtn.className = "clear-search";
        clearBtn.title = "Clear search";
        clearBtn.onclick = clearSearch;
        searchContainer.appendChild(clearBtn);
    }
    
    populateFilterOptions();
    filteredCocktails = [...allCocktails];
    renderCocktails(filteredCocktails);
}

if (Array.isArray(allCocktails) && allCocktails.length) {
    initFiltersModule();
}