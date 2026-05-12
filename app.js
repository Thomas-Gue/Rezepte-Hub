// ============================================================
// MOCK DATA – entspricht einem DB-Eintrag
// ============================================================
const MOCK_REZEPT = {
    id: "carbonara-001",
    titel: "Spaghetti Carbonara",
    kurzbeschreibung: "Der römische Klassiker mit cremigem Eigelb, echtem Guanciale und würzigem Pecorino Romano. Einfach, aber unglaublich befriedigend.",
    schaerfe: 1,
    kalorien: 680,
    kosten: 2.40,
    dauer: 25,
    nutriScore: "C",
    portionen: 2,
    naehrwerte: {
        kalorien: 680,
        eiweiss: 28,
        kohlenhydrate: 72,
        fett: 30,
        ballaststoffe: 3
    },
    zutaten: [
        { menge: 200, einheit: "g",     name: "Spaghetti" },
        { menge: 100, einheit: "g",     name: "Guanciale" },
        { menge: 3,   einheit: "Stk.",  name: "Eigelb" },
        { menge: 60,  einheit: "g",     name: "Pecorino Romano" },
        { menge: 1,   einheit: "TL",    name: "schwarzer Pfeffer" },
        { menge: 1,   einheit: "Prise", name: "Salz" }
    ],
    beschreibung: `## Vorbereitung

- [ ] Einen großen Topf Salzwasser zum Kochen bringen.
- [ ] Guanciale in fingerdicke Streifen schneiden.
- [ ] Pecorino fein reiben.

## Zubereitung

- [ ] Guanciale in einer Pfanne ohne Öl bei mittlerer Hitze goldbraun und knusprig auslassen. Pfanne vom Herd nehmen.
- [ ] Spaghetti al dente kochen (ca. 1 Minute weniger als Packungsangabe). **Ca. 200 ml Kochwasser auffangen.**
- [ ] Eigelb mit Pecorino und frisch gemahlenem Pfeffer in einer Schüssel glatt rühren.
- [ ] Heiße Pasta zur Guanciale-Pfanne geben (Herd aus!). Eimasse hinzugeben und zügig mit etwas Kochwasser cremig rühren.
- [ ] Sofort servieren und nach Geschmack mit mehr Pecorino und Pfeffer garnieren.

> 💡 **Tipp:** Niemals die Pfanne wieder auf die Hitze stellen, nachdem die Eimasse dazu kommt – sonst wird es Rührei.`
};

// ============================================================
// STATE
// ============================================================
let currentRecipe   = null;
let basePortion     = 1;
let currentPortion  = 1;
let isEditMode      = false;
let mdShowingEditor = false;
let sortableIngredients = null;

// ============================================================
// NUTRI-SCORE HELPER
// ============================================================
const NUTRI_COLORS = { A: 'nutri-a', B: 'nutri-b', C: 'nutri-c', D: 'nutri-d', E: 'nutri-e' };
const NUTRI_ORDER  = ['A', 'B', 'C', 'D', 'E'];

function applyNutriScore(score) {
    const el = document.getElementById('rv-nutriscore');
    el.textContent = score.toUpperCase();
    el.className   = 'nutri-score-display ' + (NUTRI_COLORS[score.toUpperCase()] || 'nutri-c');
}

function cycleNutriScore() {
    if (!isEditMode) return;
    const el  = document.getElementById('rv-nutriscore');
    const cur = el.textContent.trim().toUpperCase();
    const idx  = NUTRI_ORDER.indexOf(cur);
    const next = NUTRI_ORDER[(idx + 1) % NUTRI_ORDER.length];
    applyNutriScore(next);
}

// ============================================================
// MARKDOWN RENDERER WITH INTERACTIVE TASK ITEMS
// ============================================================
function renderMarkdown(mdText) {
    const container = document.getElementById('md-rendered');
    container.innerHTML = marked.parse(mdText, { breaks: true });

    // Replace task-list <li> items with interactive custom elements
    container.querySelectorAll('li').forEach(li => {
        const checkbox = li.querySelector('input[type="checkbox"]');
        if (!checkbox) return;

        const isChecked = checkbox.checked;
        const label = li.textContent.replace(/^\s*\[.?\]\s*/, '').trim();

        const taskEl = document.createElement('li');
        taskEl.className = 'md-task-item' + (isChecked ? ' checked' : '');
        taskEl.dataset.checked = isChecked ? 'true' : 'false';
        taskEl.innerHTML = `
            <span class="task-drag-handle" title="Verschieben">⠿</span>
            <input type="checkbox" ${isChecked ? 'checked' : ''}>
            <span>${label}</span>
        `;

        const cb = taskEl.querySelector('input[type="checkbox"]');
        cb.addEventListener('change', () => {
            taskEl.classList.toggle('checked', cb.checked);
            taskEl.dataset.checked = String(cb.checked);
        });

        li.replaceWith(taskEl);
    });

    // Drag & Drop for task lists via SortableJS
    if (typeof Sortable !== 'undefined') {
        container.querySelectorAll('ul').forEach(ul => {
            if (ul.querySelector('.md-task-item')) {
                new Sortable(ul, {
                    handle: '.task-drag-handle',
                    animation: 150,
                    ghostClass: 'sortable-ghost',
                });
            }
        });
    }
}

// ============================================================
// INGREDIENT RENDERER
// ============================================================
function renderIngredients(zutaten, curPort, basePort) {
    const list = document.getElementById('zutaten-list');
    list.innerHTML = '';

    zutaten.forEach((z) => {
        const scaledMenge = Math.round((z.menge * curPort / basePort) * 10) / 10;
        const li = document.createElement('li');
        li.className = 'zutat-item';
        li.innerHTML = `
            <span class="zutat-drag-handle"><i data-feather="menu"></i></span>
            <span class="zutat-menge" contenteditable="false" data-base="${z.menge}">${scaledMenge}</span>
            <span class="zutat-einheit" contenteditable="false">${z.einheit}</span>
            <span class="zutat-name" contenteditable="false">${z.name}</span>
            <button class="zutat-delete-btn" title="Zutat entfernen" style="display:none;"><i data-feather="x"></i></button>
        `;
        list.appendChild(li);
    });

    feather.replace();

    if (sortableIngredients) sortableIngredients.destroy();
    if (typeof Sortable !== 'undefined') {
        sortableIngredients = new Sortable(list, {
            handle: '.zutat-drag-handle',
            animation: 150,
            ghostClass: 'sortable-ghost',
            dragClass:  'sortable-drag',
        });
    }
}

// ============================================================
// LOAD RECIPE INTO VIEW
// ============================================================
function loadRecipe(recipe) {
    currentRecipe  = JSON.parse(JSON.stringify(recipe));
    basePortion    = recipe.portionen;
    currentPortion = recipe.portionen;
    isEditMode     = false;
    mdShowingEditor = false;

    document.getElementById('rv-titel').textContent           = recipe.titel;
    document.getElementById('rv-kurzbeschreibung').textContent = recipe.kurzbeschreibung;
    document.getElementById('rv-schaerfe').textContent        = '🌶'.repeat(recipe.schaerfe);
    document.getElementById('rv-kalorien').textContent        = recipe.kalorien;
    document.getElementById('rv-kosten').textContent          = recipe.kosten.toFixed(2) + ' €';
    document.getElementById('rv-dauer').textContent           = recipe.dauer + ' Min.';
    document.getElementById('rv-portionen').textContent       = currentPortion;
    applyNutriScore(recipe.nutriScore);

    const nw = recipe.naehrwerte;
    document.getElementById('nw-kalorien').textContent      = nw.kalorien;
    document.getElementById('nw-eiweiss').textContent       = nw.eiweiss;
    document.getElementById('nw-kh').textContent            = nw.kohlenhydrate;
    document.getElementById('nw-fett').textContent          = nw.fett;
    document.getElementById('nw-ballaststoffe').textContent = nw.ballaststoffe;

    renderIngredients(recipe.zutaten, currentPortion, basePortion);

    document.getElementById('md-editor').value           = recipe.beschreibung;
    document.getElementById('md-rendered').style.display = '';
    document.getElementById('md-editor').style.display   = 'none';
    renderMarkdown(recipe.beschreibung);

    setEditMode(false);
}

// ============================================================
// PORTION SCALER
// ============================================================
function updatePortions(newPort) {
    currentPortion = Math.max(1, newPort);
    document.getElementById('rv-portionen').textContent = currentPortion;

    document.querySelectorAll('.zutat-menge').forEach(el => {
        const base   = parseFloat(el.dataset.base);
        const scaled = Math.round((base * currentPortion / basePortion) * 10) / 10;
        el.textContent = scaled;
    });
}

// ============================================================
// EDIT MODE
// ============================================================
function setEditMode(on) {
    isEditMode = on;

    const editableIds = ['rv-titel', 'rv-kurzbeschreibung', 'rv-schaerfe', 'rv-kalorien', 'rv-kosten', 'rv-dauer'];
    editableIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.contentEditable = on ? 'true' : 'false';
    });

    document.querySelectorAll('.zutat-menge, .zutat-einheit, .zutat-name').forEach(el => {
        el.contentEditable = on ? 'true' : 'false';
    });

    document.querySelectorAll('.zutat-delete-btn').forEach(btn => {
        btn.style.display = on ? 'flex' : 'none';
    });

    document.getElementById('btn-add-ingredient').style.display = on ? 'inline-flex' : 'none';
    document.getElementById('btn-md-toggle').style.display      = on ? 'flex'        : 'none';

    const nutriEl = document.getElementById('rv-nutriscore');
    nutriEl.style.cursor = on ? 'pointer' : 'default';

    document.getElementById('btn-edit-recipe').style.display = on ? 'none'         : 'inline-flex';
    document.getElementById('btn-save-recipe').style.display = on ? 'inline-flex'  : 'none';

    if (!on && currentRecipe) saveCurrentEdits();
}

function saveCurrentEdits() {
    currentRecipe.titel            = document.getElementById('rv-titel').textContent.trim();
    currentRecipe.kurzbeschreibung = document.getElementById('rv-kurzbeschreibung').textContent.trim();
    currentRecipe.kalorien         = parseFloat(document.getElementById('rv-kalorien').textContent) || currentRecipe.kalorien;
    currentRecipe.dauer            = parseInt(document.getElementById('rv-dauer').textContent) || currentRecipe.dauer;
    currentRecipe.nutriScore       = document.getElementById('rv-nutriscore').textContent.trim();

    const items = document.querySelectorAll('.zutat-item');
    currentRecipe.zutaten = Array.from(items).map(li => ({
        menge:   parseFloat(li.querySelector('.zutat-menge')?.dataset.base) || 0,
        einheit: li.querySelector('.zutat-einheit')?.textContent.trim() || '',
        name:    li.querySelector('.zutat-name')?.textContent.trim() || ''
    }));

    if (mdShowingEditor) {
        currentRecipe.beschreibung = document.getElementById('md-editor').value;
        switchToRendered();
    }

    console.log('💾 Rezept gespeichert (lokal):', currentRecipe);
}

// ============================================================
// MARKDOWN TOGGLE
// ============================================================
function switchToEditor() {
    document.getElementById('md-rendered').style.display = 'none';
    document.getElementById('md-editor').style.display   = '';
    document.getElementById('md-editor').value           = currentRecipe.beschreibung;
    mdShowingEditor = true;
    const btn = document.getElementById('btn-md-toggle');
    btn.innerHTML = '<i data-feather="eye"></i> Vorschau';
    feather.replace();
}

function switchToRendered() {
    const mdText = document.getElementById('md-editor').value;
    currentRecipe.beschreibung = mdText;
    document.getElementById('md-editor').style.display   = 'none';
    document.getElementById('md-rendered').style.display = '';
    renderMarkdown(mdText);
    mdShowingEditor = false;
    const btn = document.getElementById('btn-md-toggle');
    btn.innerHTML = '<i data-feather="edit-3"></i> Bearbeiten';
    feather.replace();
}

// ============================================================
// ADD INGREDIENT (Edit Mode)
// ============================================================
function addIngredient() {
    const list = document.getElementById('zutaten-list');
    const li   = document.createElement('li');
    li.className = 'zutat-item';
    li.innerHTML = `
        <span class="zutat-drag-handle"><i data-feather="menu"></i></span>
        <span class="zutat-menge" contenteditable="true" data-base="0">0</span>
        <span class="zutat-einheit" contenteditable="true">g</span>
        <span class="zutat-name" contenteditable="true">Neue Zutat</span>
        <button class="zutat-delete-btn" title="Zutat entfernen" style="display:flex;"><i data-feather="x"></i></button>
    `;
    list.appendChild(li);
    feather.replace();

    const nameEl = li.querySelector('.zutat-name');
    nameEl.focus();
    const range = document.createRange();
    range.selectNodeContents(nameEl);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
}

// ============================================================
// NAVIGATION
// ============================================================
function showView(id) {
    ['main-view', 'recipes-view', 'recipe-view'].forEach(v => {
        document.getElementById(v).style.display = (v === id) ? 'block' : 'none';
    });
    window.scrollTo({ top: 0, behavior: 'instant' });
    feather.replace();
}

function showRecipeView(recipe) {
    showView('recipe-view');
    loadRecipe(recipe);
    feather.replace();
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    feather.replace();

    // Hub buttons
    document.getElementById('btn-scan').addEventListener('click', () => {
        alert('Scanner-Modul wird geöffnet…');
    });

    document.getElementById('btn-new-recipe').addEventListener('click', () => {
        const newRecipe = {
            id: 'new-' + Date.now(),
            titel: 'Neues Rezept',
            kurzbeschreibung: 'Kurze Beschreibung…',
            schaerfe: 1,
            kalorien: 0,
            kosten: 0,
            dauer: 0,
            nutriScore: 'C',
            portionen: 2,
            naehrwerte: { kalorien: 0, eiweiss: 0, kohlenhydrate: 0, fett: 0, ballaststoffe: 0 },
            zutaten: [],
            beschreibung: '## Zubereitung\n\n- [ ] Erster Schritt\n'
        };
        showRecipeView(newRecipe);
        setTimeout(() => setEditMode(true), 50);
    });

    // Search
    const allRecipes    = ["Spaghetti Carbonara", "Linsen-Dal", "Avocado Toast", "Tomatensuppe", "Pilz-Risotto", "Pfannkuchen", "Kaiserschmarrn", "Kartoffelauflauf"];
    const searchInput   = document.getElementById('recipe-search');
    const searchResults = document.getElementById('search-results');

    if (searchInput && searchResults) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            searchResults.innerHTML = '';
            if (query.length > 0) {
                const filtered = allRecipes.filter(r =>
                    r.toLowerCase().split(/[\s\-]+/).some(w => w.startsWith(query))
                );
                if (filtered.length > 0) {
                    filtered.forEach(recipe => {
                        const item = document.createElement('div');
                        item.className = 'dropdown-item';
                        item.innerHTML = `<i data-feather="file-text" style="width:16px;height:16px;color:var(--text-muted)"></i><span>${recipe}</span>`;
                        item.addEventListener('click', () => {
                            searchInput.value = '';
                            searchResults.style.display = 'none';
                            showRecipeView(MOCK_REZEPT);
                        });
                        searchResults.appendChild(item);
                    });
                    feather.replace();
                    searchResults.style.display = 'block';
                } else {
                    searchResults.innerHTML = '<div class="dropdown-item" style="color:var(--text-muted);cursor:default">Keine Rezepte gefunden</div>';
                    searchResults.style.display = 'block';
                }
            } else {
                searchResults.style.display = 'none';
            }
        });
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.style.display = 'none';
            }
        });
    }

    // Hub → Rezept-Liste
    const boxRecipes = document.getElementById('box-recipes');
    if (boxRecipes) {
        boxRecipes.style.cursor = 'pointer';
        boxRecipes.addEventListener('click', (e) => {
            if (!e.target.closest('#recipe-search') && !e.target.closest('#search-results')) {
                showView('recipes-view');
            }
        });
    }

    document.getElementById('btn-back-home')?.addEventListener('click', () => showView('main-view'));

    // Rezeptkarten → Detailansicht
    document.querySelectorAll('.recipe-card').forEach(card => {
        card.addEventListener('click', () => showRecipeView(MOCK_REZEPT));
    });

    // Recent items
    document.querySelectorAll('.recent-item').forEach(item => {
        item.addEventListener('click', () => showRecipeView(MOCK_REZEPT));
    });

    // Recipe View Buttons
    document.getElementById('btn-back-from-recipe').addEventListener('click', () => {
        if (isEditMode) setEditMode(false);
        showView('recipes-view');
    });

    document.getElementById('btn-edit-recipe').addEventListener('click', () => setEditMode(true));
    document.getElementById('btn-save-recipe').addEventListener('click', () => setEditMode(false));

    document.getElementById('btn-md-toggle').addEventListener('click', () => {
        if (mdShowingEditor) switchToRendered();
        else switchToEditor();
    });

    document.getElementById('rv-nutriscore').addEventListener('click', cycleNutriScore);

    document.getElementById('btn-portion-up').addEventListener('click', () => updatePortions(currentPortion + 1));
    document.getElementById('btn-portion-down').addEventListener('click', () => updatePortions(currentPortion - 1));

    document.getElementById('btn-barcode').addEventListener('click', () => alert('📷 Barcode-Scanner wird geöffnet…'));
    document.getElementById('btn-bring').addEventListener('click', () => alert('🛒 Wird zur Bring!-Liste hinzugefügt…'));

    document.getElementById('btn-add-ingredient').addEventListener('click', addIngredient);

    document.getElementById('zutaten-list').addEventListener('click', (e) => {
        const btn = e.target.closest('.zutat-delete-btn');
        if (btn) btn.closest('.zutat-item').remove();
    });
});
