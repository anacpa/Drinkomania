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
        ing: norm(ingredientSelect.value),
        alc: norm(alcoholSelect.value),
        cup: norm(cupSelect.value)
    };

    filteredCocktails = allCocktails.filter(c => {

        const matchIng = !f.ing || [...Array(15)].some((_, i) =>
            norm(c[`Ingredient${i + 1}`]) === f.ing
        );

        const matchAlc = !f.alc || f.alc === "all" ||
            norm(c["Alcoholic type"] || "") === f.alc;

        const matchCup = !f.cup ||
            norm(c["Glass type"] || "") === f.cup;

        return matchIng && matchAlc && matchCup;
    });

    renderCocktails(filteredCocktails);
    selectedCocktail = null;
    updateRightSection(null);
}

// ---------- Eventos ----------
ingredientSelect.onchange = applyFilters;
alcoholSelect.onchange = applyFilters;
cupSelect.onchange = applyFilters;

// ---------- Init ----------
function initFiltersModule() {
    populateFilterOptions();
    filteredCocktails = [...allCocktails];
    renderCocktails(filteredCocktails);
}

if (Array.isArray(allCocktails) && allCocktails.length) {
    initFiltersModule();
}
