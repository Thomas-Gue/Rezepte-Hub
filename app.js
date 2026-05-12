// ============================================================
// FIREBASE CONFIGURATION & CONSTANTS
// ============================================================
const FIREBASE_URL = "https://kochbuch-rezepte-default-rtdb.europe-west1.firebasedatabase.app";

// Default-Rezepte (werden in Firebase hochgeladen, falls die DB leer ist)
const DEFAULT_RECIPES = {
    "carbonara-001": {
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
            'energy-kcal_100g': 340,
            'fat_100g': 15,
            'saturated-fat_100g': 6,
            'carbohydrates_100g': 36,
            'sugars_100g': 1.25,
            'fiber_100g': 1.5,
            'proteins_100g': 14,
            'salt_100g': 0.9
        },
        zutaten: [
            { menge: 200, einheit: "g", name: "Spaghetti" },
            { menge: 100, einheit: "g", name: "Guanciale" },
            { menge: 3, einheit: "Stk.", name: "Eigelb" },
            { menge: 60, einheit: "g", name: "Pecorino Romano" },
            { menge: 1, einheit: "TL", name: "schwarzer Pfeffer" },
            { menge: 1, einheit: "Prise", name: "Salz" }
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
    },
    "linsendal-002": {
        id: "linsendal-002",
        titel: "Linsen-Dal",
        kurzbeschreibung: "Wärmend, cremig und proteinreich mit roten Linsen und Kokosmilch. Perfekt mit Reis oder Naan-Brot.",
        schaerfe: 2,
        kalorien: 420,
        kosten: 1.50,
        dauer: 30,
        nutriScore: "A",
        portionen: 3,
        naehrwerte: {
            'energy-kcal_100g': 140,
            'fat_100g': 4,
            'saturated-fat_100g': 2.5,
            'carbohydrates_100g': 18,
            'sugars_100g': 1.5,
            'fiber_100g': 4.5,
            'proteins_100g': 8,
            'salt_100g': 0.6
        },
        zutaten: [
            { menge: 200, einheit: "g", name: "Rote Linsen" },
            { menge: 400, einheit: "ml", name: "Kokosmilch" },
            { menge: 1, einheit: "Stk.", name: "Zwiebel" },
            { menge: 2, einheit: "Zehen", name: "Knoblauch" },
            { menge: 1, einheit: "EL", name: "Geriebener Ingwer" },
            { menge: 1, einheit: "EL", name: "Currypulver" }
        ],
        beschreibung: `## Vorbereitung

- [ ] Zwiebeln und Knoblauch fein hacken.
- [ ] Ingwer fein reiben.
- [ ] Linsen in einem Sieb gründlich waschen.

## Zubereitung

- [ ] Zwiebeln, Knoblauch und Ingwer in etwas Öl in einem Topf andünsten.
- [ ] Currypulver hinzugeben und kurz mitrösten, bis es aromatisch duftet.
- [ ] Die roten Linsen, Kokosmilch und ca. 200 ml Wasser dazugeben.
- [ ] Bei mittlerer Hitze ca. 20 Minuten köcheln lassen, bis die Linsen weich sind und eine cremige Konsistenz entsteht.
- [ ] Mit Salz, Pfeffer und etwas Zitronensaft abschmecken.`
    },
    "avocadotoast-003": {
        id: "avocadotoast-003",
        titel: "Avocado Toast",
        kurzbeschreibung: "Schnell, gesund und lecker. Knuspriges Sauerteigbrot verfeinert mit Chili-Flocken und pochiertem Ei.",
        schaerfe: 1,
        kalorien: 310,
        kosten: 1.80,
        dauer: 10,
        nutriScore: "B",
        portionen: 1,
        naehrwerte: {
            'energy-kcal_100g': 310,
            'fat_100g': 18,
            'saturated-fat_100g': 3.5,
            'carbohydrates_100g': 24,
            'sugars_100g': 1.8,
            'fiber_100g': 6,
            'proteins_100g': 11,
            'salt_100g': 0.85
        },
        zutaten: [
            { menge: 1, einheit: "Scheibe", name: "Sauerteigbrot" },
            { menge: 0.5, einheit: "Stk.", name: "Avocado" },
            { menge: 1, einheit: "Stk.", name: "Ei" },
            { menge: 1, einheit: "Prise", name: "Chiliflocken" },
            { menge: 1, einheit: "Prise", name: "Meersalz" }
        ],
        beschreibung: `## Zubereitung

- [ ] Das Sauerteigbrot in einer Pfanne oder im Toaster knusprig rösten.
- [ ] Die Avocado halbieren, den Kern entfernen und das Fruchtfleisch in einer Schüssel mit einer Gabel zerdrücken. Mit etwas Salz und Zitronensaft würzen.
- [ ] Das Ei nach Wunsch kochen (pochiert, Spiegelei oder hartgekocht).
- [ ] Die Avocado-Creme großzügig auf dem Brot verteilen, das Ei darauflegen und mit Meersalz und Chiliflocken garnieren.`
    },
    "pilzrisotto-004": {
        id: "pilzrisotto-004",
        titel: "Pilz-Risotto",
        kurzbeschreibung: "Cremiger Carnaroli-Reis mit aromatischen Waldpilzen, frischem Thymian und fein geriebenem Parmesan.",
        schaerfe: 0,
        kalorien: 520,
        kosten: 3.20,
        dauer: 40,
        nutriScore: "B",
        portionen: 2,
        naehrwerte: {
            'energy-kcal_100g': 260,
            'fat_100g': 8,
            'saturated-fat_100g': 3,
            'carbohydrates_100g': 38,
            'sugars_100g': 1.1,
            'fiber_100g': 2,
            'proteins_100g': 7,
            'salt_100g': 0.75
        },
        zutaten: [
            { menge: 150, einheit: "g", name: "Risottoreis (Arborio)" },
            { menge: 200, einheit: "g", name: "Gemischte Pilze (Champignons, etc.)" },
            { menge: 1, einheit: "Stk.", name: "Schalotte" },
            { menge: 50, einheit: "ml", name: "Weißwein" },
            { menge: 500, einheit: "ml", name: "Gemüsebrühe" },
            { menge: 30, einheit: "g", name: "Parmesan" }
        ],
        beschreibung: `## Zubereitung

- [ ] Schalotte fein würfeln. Pilze putzen und in Scheiben schneiden. Gemüsebrühe in einem separaten Topf erhitzen.
- [ ] Die Pilze in einer Pfanne scharf anbraten, dann beiseite stellen.
- [ ] Schalotten in Olivenöl dünsten, den Risottoreis hinzugeben und glasig dünsten.
- [ ] Mit Weißwein ablöschen und vollständig einkochen lassen.
- [ ] Nach und nach die heiße Gemüsebrühe schöpflöffelweise dazugeben, dabei ständig rühren. Erst neue Brühe zugießen, wenn der Reis die vorherige aufgenommen hat.
- [ ] Nach ca. 20 Minuten (der Reis sollte al dente sein) Parmesan und angebratene Pilze unterrühren. Pfanne vom Herd nehmen und abgedeckt 2 Minuten ruhen lassen.`
    }
};

// ============================================================
// STATE
// ============================================================
let recipes = {}; // Geladen von Cache / Firebase / Fallback
let currentRecipe = null;
let basePortion = 1;
let currentPortion = 1;
let isEditMode = false;
let mdShowingEditor = false;
let sortableIngredients = null;
let recentRecipeIds = [];
let html5Qrcode = null;             // Kamera-Scanner Instanz
let productCache = {};              // In-Memory-Cache: Barcode → Produkt-Daten
let ingredientSearchCache = {};     // In-Memory-Cache: Suchbegriff → Ergebnisliste
let scanCooldown = false;           // Verhindert mehrfaches Auslösen des gleichen Frames

// ============================================================
// PERFORMANCE UTILITIES
// ============================================================
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================
function showToast(title, message, isError = false) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'toast-error' : ''}`;
    
    const icon = isError ? '❌' : '✅';
    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
    `;
    
    container.appendChild(toast);
    
    // Automatisch nach 2.5 Sekunden ausfaden
    setTimeout(() => {
        toast.classList.add('fade-out');
        toast.addEventListener('animationend', () => {
            toast.remove();
        });
    }, 2500);
}

// ============================================================
// STALE-WHILE-REVALIDATE CACHING & REST CONNECTIONS
// ============================================================
function loadRecipesFromCache() {
    const cached = localStorage.getItem('recipes_cache');
    if (cached) {
        try {
            recipes = JSON.parse(cached);
            console.log("Rezepte blitzschnell aus Cache geladen (SWR):", recipes);
            renderRecipesList();
            updateRecentList();
            setupSearch();
        } catch (e) {
            console.error("Cache Parsing-Fehler:", e);
        }
    } else {
        // Fallback falls gar nichts gecacht ist (Sofortige Bereitschaft)
        recipes = DEFAULT_RECIPES;
        renderRecipesList();
        updateRecentList();
        setupSearch();
    }
}

async function loadRecipesFromFirebase() {
    // 1. Lade SOFORT aus dem lokalen Cache
    loadRecipesFromCache();
    
    // 2. Aktualisiere im Hintergrund von Firebase
    try {
        const response = await fetch(`${FIREBASE_URL}/recipes.json`);
        if (!response.ok) throw new Error("Netzwerkfehler");
        
        let data = await response.json();
        
        // Seeding falls Firebase komplett leer ist
        if (!data) {
            console.log("Firebase ist leer. Initialisiere Standardrezepte (Seeding)...");
            await seedDefaultRecipes();
            return;
        }
        
        // Vergleiche eingehende Daten mit dem Cache, um Flackern zu verhindern
        const cachedStr = localStorage.getItem('recipes_cache');
        const incomingStr = JSON.stringify(data);
        
        if (cachedStr !== incomingStr) {
            console.log("Änderung auf Firebase erkannt. UI wird flüssig aktualisiert...");
            recipes = data;
            localStorage.setItem('recipes_cache', incomingStr);
            renderRecipesList();
            updateRecentList();
            setupSearch();
        } else {
            console.log("Datenbank ist up-to-date.");
        }
    } catch (error) {
        console.error("Fehler beim Hintergrund-Sync mit Firebase:", error);
        // Da der Cache geladen ist, läuft die App einfach flüssig weiter!
    }
}

async function seedDefaultRecipes() {
    try {
        const response = await fetch(`${FIREBASE_URL}/recipes.json`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(DEFAULT_RECIPES)
        });
        if (!response.ok) throw new Error("Fehler beim Seeding");
        
        recipes = JSON.parse(JSON.stringify(DEFAULT_RECIPES));
        localStorage.setItem('recipes_cache', JSON.stringify(recipes));
        showToast("Datenbank bereit", "Standardrezepte wurden in Firebase geladen.");
        renderRecipesList();
        updateRecentList();
        setupSearch();
    } catch (error) {
        console.error("Fehler beim Seeding:", error);
        recipes = DEFAULT_RECIPES;
        renderRecipesList();
    }
}

async function saveRecipeToFirebase(recipe) {
    try {
        // Aktualisiere lokalen Arbeitsspeicher
        recipes[recipe.id] = recipe;
        localStorage.setItem('recipes_cache', JSON.stringify(recipes));

        // Schreibe asynchron in den Hintergrund
        const response = await fetch(`${FIREBASE_URL}/recipes/${recipe.id}.json`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(recipe)
        });
        if (!response.ok) throw new Error("Fehler beim Senden");
        console.log(`Rezept ${recipe.id} in Firebase gespeichert!`);
        showToast("Gespeichert", `"${recipe.titel}" wurde in Firebase gesichert.`);
    } catch (error) {
        console.error("Fehler beim Speichern in Firebase:", error);
        showToast("Hintergrund-Sync", "Konnte nicht in Cloud sichern. Lokal gespeichert.", true);
    }
}

// ============================================================
// NUTRI-SCORE CALCULATION & HELPER
// ============================================================
const NUTRI_COLORS = { A: 'nutri-seg-a', B: 'nutri-seg-b', C: 'nutri-seg-c', D: 'nutri-seg-d', E: 'nutri-seg-e' };
const NUTRI_ORDER = ['A', 'B', 'C', 'D', 'E'];

function scoreToLetter(score) {
    if (score === null || score === undefined) return 'C';
    if (score <= -1) return 'A';
    if (score <= 2) return 'B';
    if (score <= 10) return 'C';
    if (score <= 18) return 'D';
    return 'E';
}

function applyNutriScore(score) {
    const scaleEl = document.getElementById('rv-nutriscore');
    if (!scaleEl) return;
    const upper = score.toUpperCase();
    scaleEl.dataset.score = upper;
    scaleEl.querySelectorAll('.nutri-seg').forEach(seg => {
        seg.classList.toggle('active', seg.dataset.letter === upper);
    });
}

// ============================================================
// WEIGHTED NUTRITIONAL ENGINE
// ============================================================
function recalculateRecipeNutrition(recipe) {
    if (!recipe.zutaten || recipe.zutaten.length === 0) return;

    let totalWeight = 0;
    let hasBarcodedIngredients = false;
    
    // Initialisiere Nährwert-Schnittsummen (pro 100g des fertigen Rezepts)
    const totalNutrients = {
        'energy-kcal_100g': 0,
        'fat_100g': 0,
        'saturated-fat_100g': 0,
        'carbohydrates_100g': 0,
        'sugars_100g': 0,
        'fiber_100g': 0,
        'proteins_100g': 0,
        'salt_100g': 0
    };
    
    let weightedScoreSum = 0;
    let scoreWeightTotal = 0;

    recipe.zutaten.forEach(z => {
        if (z.naehrwerte) {
            hasBarcodedIngredients = true;
            const factor = z.menge / 100;
            totalWeight += z.menge;
            
            for (const key in totalNutrients) {
                if (z.naehrwerte[key] !== undefined && z.naehrwerte[key] !== null) {
                    totalNutrients[key] += z.naehrwerte[key] * factor;
                }
            }
            
            if (z.nutriScoreValue !== undefined && z.nutriScoreValue !== null) {
                weightedScoreSum += z.nutriScoreValue * z.menge;
                scoreWeightTotal += z.menge;
            }
        }
    });

    if (hasBarcodedIngredients) {
        const port = recipe.portionen || 2;
        
        // Berechne Nährwert pro 100g des fertigen Rezepts
        const scaleFactor = totalWeight > 0 ? (totalWeight / 100) : 1;
        recipe.naehrwerte = {};
        for (const key in totalNutrients) {
            recipe.naehrwerte[key] = Math.round((totalNutrients[key] / scaleFactor) * 10) / 10;
        }
        
        // Gesamt-Kalorien pro Portion berechnen
        recipe.kalorien = Math.round(totalNutrients['energy-kcal_100g'] / port);
        
        // Berechne gewichteten Nutri-Score
        if (scoreWeightTotal > 0) {
            const avgScore = Math.round(weightedScoreSum / scoreWeightTotal);
            recipe.nutriScore = scoreToLetter(avgScore);
        }
    }
}

// ============================================================
// MARKDOWN RENDERER WITH INTERACTIVE TASK ITEMS
// ============================================================
function renderMarkdown(mdText) {
    const container = document.getElementById('md-rendered');
    container.innerHTML = marked.parse(mdText, { breaks: true });

    // Ersetze Standard-Checkboxes durch interaktive Elemente
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

    // Drag & Drop für Kochschritte
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
        
        // Erhalte Metadaten über Data-Schnittstelle
        if (z.barcode) li.dataset.barcode = z.barcode;
        if (z.naehrwerte) li.dataset.naehrwerte = JSON.stringify(z.naehrwerte);
        if (z.nutriScoreValue !== undefined) li.dataset.nutriscore = z.nutriScoreValue;
        
        const barcodeBadge = z.barcode ? `<span class="barcode-badge-mini" style="font-size:0.8rem; margin-left: 6px; cursor:help;" title="Barcode: ${z.barcode}">🏷️</span>` : '';

        li.innerHTML = `
            <span class="zutat-drag-handle"><i data-feather="menu"></i></span>
            <span class="zutat-menge" contenteditable="false" data-base="${z.menge}">${scaledMenge}</span>
            <span class="zutat-einheit" contenteditable="false">${z.einheit}</span>
            <span class="zutat-name" contenteditable="false">${z.name}${barcodeBadge}</span>
            <button class="zutat-delete-btn" title="Zutat entfernen" style="display:none;"><i data-feather="x"></i></button>
        `;
        list.appendChild(li);
    });

    // Nur das Zutaten-Feld mit Feather anpassen (Performance-Optimierung)
    if (typeof feather !== 'undefined') {
        feather.replace();
    }

    if (sortableIngredients) sortableIngredients.destroy();
    if (typeof Sortable !== 'undefined') {
        sortableIngredients = new Sortable(list, {
            handle: '.zutat-drag-handle',
            animation: 150,
            ghostClass: 'sortable-ghost',
            dragClass: 'sortable-drag',
        });
    }
}

// ============================================================
// LOAD RECIPE INTO DETAIL VIEW
// ============================================================
function loadRecipe(recipe) {
    currentRecipe = JSON.parse(JSON.stringify(recipe));
    basePortion = recipe.portionen;
    currentPortion = recipe.portionen;
    isEditMode = false;
    mdShowingEditor = false;

    document.getElementById('rv-titel').textContent = recipe.titel;
    document.getElementById('rv-kurzbeschreibung').textContent = recipe.kurzbeschreibung;
    document.getElementById('rv-kalorien').textContent = recipe.kalorien;
    document.getElementById('rv-kosten').textContent = recipe.kosten.toFixed(2) + ' €';
    document.getElementById('rv-dauer').textContent = recipe.dauer + ' Min.';
    document.getElementById('rv-portionen').textContent = currentPortion;
    applyNutriScore(recipe.nutriScore);

    const nw = recipe.naehrwerte || {};
    document.getElementById('nw-energy-kcal').textContent = nw['energy-kcal_100g'] !== undefined ? nw['energy-kcal_100g'] : '—';
    document.getElementById('nw-fat').textContent         = nw['fat_100g'] !== undefined ? nw['fat_100g'] : '—';
    document.getElementById('nw-saturated-fat').textContent = nw['saturated-fat_100g'] !== undefined ? nw['saturated-fat_100g'] : '—';
    document.getElementById('nw-carbohydrates').textContent = nw['carbohydrates_100g'] !== undefined ? nw['carbohydrates_100g'] : '—';
    document.getElementById('nw-sugars').textContent       = nw['sugars_100g'] !== undefined ? nw['sugars_100g'] : '—';
    document.getElementById('nw-fiber').textContent        = nw['fiber_100g'] !== undefined ? nw['fiber_100g'] : '—';
    document.getElementById('nw-proteins').textContent     = nw['proteins_100g'] !== undefined ? nw['proteins_100g'] : '—';
    document.getElementById('nw-salt').textContent         = nw['salt_100g'] !== undefined ? nw['salt_100g'] : '—';

    renderIngredients(recipe.zutaten, currentPortion, basePortion);

    document.getElementById('md-editor').value = recipe.beschreibung;
    document.getElementById('md-rendered').style.display = '';
    document.getElementById('md-editor').style.display = 'none';
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
        const base = parseFloat(el.dataset.base);
        const scaled = Math.round((base * currentPortion / basePortion) * 10) / 10;
        el.textContent = scaled;
    });
}

// ============================================================
// EDIT MODE
// ============================================================
function setEditMode(on) {
    if (isEditMode === on) return;
    isEditMode = on;

    const editableIds = ['rv-titel', 'rv-kurzbeschreibung', 'rv-kalorien', 'rv-kosten', 'rv-dauer'];
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

    document.getElementById('btn-search-ingredient').style.display = on ? 'inline-flex' : 'none';
    document.getElementById('btn-md-toggle').style.display = on ? 'flex' : 'none';

    // Nutri-Score ist nicht mehr direkt editierbar, sondern wird gewichtet berechnet
    const nutriEl = document.getElementById('rv-nutriscore');
    if (nutriEl) nutriEl.style.cursor = 'default';

    document.getElementById('btn-edit-recipe').style.display = on ? 'none' : 'inline-flex';
    document.getElementById('btn-save-recipe').style.display = on ? 'inline-flex' : 'none';

    if (!on && currentRecipe) saveCurrentEdits();
}

function saveCurrentEdits() {
    currentRecipe.titel = document.getElementById('rv-titel').textContent.trim();
    currentRecipe.kurzbeschreibung = document.getElementById('rv-kurzbeschreibung').textContent.trim();
    currentRecipe.kalorien = parseFloat(document.getElementById('rv-kalorien').textContent) || currentRecipe.kalorien;
    currentRecipe.dauer = parseInt(document.getElementById('rv-dauer').textContent) || currentRecipe.dauer;
    currentRecipe.kosten = parseFloat(document.getElementById('rv-kosten').textContent.replace(' €', '')) || currentRecipe.kosten;
    
    // Portionen
    currentRecipe.portionen = parseInt(document.getElementById('rv-portionen').textContent) || currentRecipe.portionen;

    const items = document.querySelectorAll('.zutat-item');
    currentRecipe.zutaten = Array.from(items).map(li => {
        const quantity = parseFloat(li.querySelector('.zutat-menge')?.textContent) || 0;
        
        // Lese die Zutatendaten
        const z = {
            menge: quantity,
            einheit: li.querySelector('.zutat-einheit')?.textContent.trim() || '',
            name: li.querySelector('.zutat-name')?.textContent.trim().replace('🏷️', '').trim()
        };
        
        // Restore meta info if available on LI element
        if (li.dataset.barcode) z.barcode = li.dataset.barcode;
        if (li.dataset.naehrwerte) z.naehrwerte = JSON.parse(li.dataset.naehrwerte);
        if (li.dataset.nutriscore) z.nutriScoreValue = parseFloat(li.dataset.nutriscore);
        
        return z;
    });

    if (mdShowingEditor) {
        currentRecipe.beschreibung = document.getElementById('md-editor').value;
        switchToRendered();
    } else {
        currentRecipe.beschreibung = document.getElementById('md-editor').value;
    }

    // Berechne Nährwerte automatisch neu
    recalculateRecipeNutrition(currentRecipe);

    // Speicher lokal im RAM und sende an Firebase
    saveRecipeToFirebase(currentRecipe);

    // Detail-Rerendering um neue Werte anzuzeigen
    loadRecipe(currentRecipe);
}

// ============================================================
// MARKDOWN TOGGLE
// ============================================================
function switchToEditor() {
    document.getElementById('md-rendered').style.display = 'none';
    document.getElementById('md-editor').style.display = '';
    document.getElementById('md-editor').value = currentRecipe.beschreibung;
    mdShowingEditor = true;
    const btn = document.getElementById('btn-md-toggle');
    btn.innerHTML = '<i data-feather="eye"></i> Vorschau';
    if (typeof feather !== 'undefined') feather.replace();
}

function switchToRendered() {
    const mdText = document.getElementById('md-editor').value;
    currentRecipe.beschreibung = mdText;
    document.getElementById('md-editor').style.display = 'none';
    document.getElementById('md-rendered').style.display = '';
    renderMarkdown(mdText);
    mdShowingEditor = false;
    const btn = document.getElementById('btn-md-toggle');
    btn.innerHTML = '<i data-feather="edit-3"></i> Bearbeiten';
    if (typeof feather !== 'undefined') feather.replace();
}

// ============================================================
// ADD INGREDIENT (Manuell)
// ============================================================
function addIngredient() {
    const list = document.getElementById('zutaten-list');
    const li = document.createElement('li');
    li.className = 'zutat-item';
    li.innerHTML = `
        <span class="zutat-drag-handle"><i data-feather="menu"></i></span>
        <span class="zutat-menge" contenteditable="true" data-base="0">0</span>
        <span class="zutat-einheit" contenteditable="true">g</span>
        <span class="zutat-name" contenteditable="true">Neue Zutat</span>
        <button class="zutat-delete-btn" title="Zutat entfernen" style="display:flex;"><i data-feather="x"></i></button>
    `;
    list.appendChild(li);
    if (typeof feather !== 'undefined') feather.replace();

    const nameEl = li.querySelector('.zutat-name');
    nameEl.focus();
    const range = document.createRange();
    range.selectNodeContents(nameEl);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
}

// ============================================================
// CAMERA BARCODE SCANNER LOGIC (html5-qrcode)
// ============================================================
function startCameraScanner() {
    const viewport = document.getElementById('camera-viewport');
    const scannerLine = document.getElementById('scanner-line');
    if (!viewport) return;

    // Bereinige etwaige Überreste eines vorherigen Scans (verhindert den Initialisierungsfehler!)
    if (html5Qrcode) {
        try { html5Qrcode.clear(); } catch(e) { /* ignorieren */ }
        html5Qrcode = null;
    }
    viewport.innerHTML = '';
    if (scannerLine) viewport.appendChild(scannerLine);

    // Erstelle eine frische Instanz
    html5Qrcode = new Html5Qrcode('camera-viewport');

    const onSuccess = (decodedText) => {
        // Cooldown: gleicher Barcode-Frame wird nicht 10x hintereinander gefeuert
        if (scanCooldown) return;
        scanCooldown = true;
        setTimeout(() => { scanCooldown = false; }, 1500);

        console.log('Barcode erkannt:', decodedText);
        // Kamera läuft WEITER — nur Lookup starten
        handleBarcodeLookup(decodedText);
    };

    html5Qrcode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 100 } },
        onSuccess,
        () => {} // Frame-Fehler geräuschlos ignorieren
    ).then(() => {
        // Scanner läuft — animierte Scan-Linie zeigen
        if (scannerLine) scannerLine.style.display = 'block';
    }).catch(err => {
        console.error('Kamera-Zugriffsfehler:', err);
        const errMsg = err && err.message ? err.message : String(err);
        if (errMsg.includes('Permission') || errMsg.includes('NotAllowed')) {
            showToast('Kamerazugriff verweigert', 'Bitte erlaube den Kamerazugriff im Browser.', true);
        } else {
            showToast('Kamerafehler', 'Kamera konnte nicht gestartet werden.', true);
        }
        stopCameraScanner();
    });
}

function stopCameraScanner() {
    const scannerLine = document.getElementById('scanner-line');
    if (scannerLine) scannerLine.style.display = 'none';

    if (html5Qrcode && html5Qrcode.isScanning) {
        html5Qrcode.stop()
            .then(() => { try { html5Qrcode.clear(); } catch(e) {} html5Qrcode = null; })
            .catch(err => { console.error('Stopp-Fehler:', err); html5Qrcode = null; });
    } else {
        if (html5Qrcode) { try { html5Qrcode.clear(); } catch(e) {} html5Qrcode = null; }
    }
}

// ============================================================
// BARCODE LOOKUP MODAL ENGINE
// ============================================================
async function handleBarcodeLookup(barcode) {
    const cleanBarcode = barcode.trim().replace(/[\.\#\$\[\]\/]/g, '_');
    if (!cleanBarcode) return;

    // 1. Cache-Treffer? → sofortige Antwort (0ms Latenz)
    if (productCache[cleanBarcode] !== undefined) {
        const cached = productCache[cleanBarcode];
        if (!cached) {
            showToast('Nicht gefunden', 'Produkt ist nicht in der Datenbank.', true);
            return;
        }
        addIngredientFromData(cleanBarcode, cached);
        return;
    }

    const spinner = document.getElementById('barcode-loading-spinner');
    if (spinner) spinner.style.display = 'flex';

    try {
        const response = await fetch(`${FIREBASE_URL}/${cleanBarcode}.json`);
        if (!response.ok) throw new Error('Firebase-Verbindung fehlgeschlagen');

        const data = await response.json();
        if (spinner) spinner.style.display = 'none';

        // Ergebnis im Cache speichern (auch null, damit wir es nicht nochmal anfragen)
        productCache[cleanBarcode] = data || null;

        if (!data) {
            showToast('Nicht gefunden', 'Produkt ist nicht in der Datenbank.', true);
            return;
        }

        addIngredientFromData(cleanBarcode, data);

    } catch (error) {
        console.error('Barcode lookup error:', error);
        if (spinner) spinner.style.display = 'none';
        showToast('Fehler', 'Verbindung zur Produktdatenbank fehlgeschlagen.', true);
    }
}

// Zutat aus Firebase-Daten aufbauen und zur Liste hinzufügen
// Kamera und Modal bleiben offen!
function addIngredientFromData(cleanBarcode, data) {
    const title = data.product_name || 'Unbekanntes Produkt';
    const brand = data.brands || '';
    const displayName = brand ? `${title} (${brand})` : title;

    showToast('Hinzugefügt!', displayName);

    const list = document.getElementById('zutaten-list');
    const li = document.createElement('li');
    li.className = 'zutat-item';
    li.dataset.barcode = cleanBarcode;

    const naehrwerte = {
        'energy-kcal_100g':   parseFloat(data['energy-kcal_100g'])   || 0,
        'fat_100g':           parseFloat(data['fat_100g'])           || 0,
        'saturated-fat_100g': parseFloat(data['saturated-fat_100g']) || 0,
        'carbohydrates_100g': parseFloat(data['carbohydrates_100g']) || 0,
        'sugars_100g':        parseFloat(data['sugars_100g'])        || 0,
        'fiber_100g':         parseFloat(data['fiber_100g'])         || 0,
        'proteins_100g':      parseFloat(data['proteins_100g'])      || 0,
        'salt_100g':          parseFloat(data['salt_100g'])          || 0
    };
    li.dataset.naehrwerte = JSON.stringify(naehrwerte);
    if (data.nutriscore_score != null) li.dataset.nutriscore = data.nutriscore_score;

    const barcodeBadge = `<span class="barcode-badge-mini" style="font-size:0.8rem;margin-left:6px;cursor:help;" title="Barcode: ${cleanBarcode}">🏷️</span>`;
    li.innerHTML = `
        <span class="zutat-drag-handle"><i data-feather="menu"></i></span>
        <span class="zutat-menge" contenteditable="true" data-base="100">100</span>
        <span class="zutat-einheit" contenteditable="true">g</span>
        <span class="zutat-name" contenteditable="true">${displayName}${barcodeBadge}</span>
        <button class="zutat-delete-btn" title="Zutat entfernen" style="display:flex;"><i data-feather="x"></i></button>
    `;
    list.appendChild(li);
    if (typeof feather !== 'undefined') feather.replace();
    // Modal und Kamera bleiben offen — nächstes Produkt scannen!
}

// ============================================================
// PRODUKTNAME-SUCHE (Ingredient Search mit Dropdown)
// ============================================================
function setupIngredientSearch() {
    const input = document.getElementById('ingredient-search-input');
    const resultsEl = document.getElementById('ingredient-search-results');
    if (!input || !resultsEl) return;

    // Reset beim Öffnen
    input.value = '';
    resultsEl.style.display = 'none';
    resultsEl.innerHTML = '';

    // Feather Icon nachladen
    if (typeof feather !== 'undefined') feather.replace();

    const doSearch = debounce(async (rawQuery) => {
        if (rawQuery.length < 2) {
            resultsEl.style.display = 'none';
            return;
        }

        const cacheKey = rawQuery.toLowerCase();

        // Cache-Treffer → sofortige Anzeige
        if (ingredientSearchCache[cacheKey] !== undefined) {
            renderIngredientResults(ingredientSearchCache[cacheKey], resultsEl);
            return;
        }

        // Ladeindikator
        resultsEl.innerHTML = '<div class="ingredient-dropdown-item ingredient-dropdown-info">Suche…</div>';
        resultsEl.style.display = 'block';

        try {
            // Firebase Realtime DB: orderBy child-Feld (erfordert .indexOn: ["product_name"] in Rules)
            // Suche mit Groß-/Kleinschreibungsvarianten für bessere Trefferquote
            const cap = rawQuery.charAt(0).toUpperCase() + rawQuery.slice(1);
            const end = cap + '\uf8ff';
            const url = `${FIREBASE_URL}/.json` +
                `?orderBy="product_name"` +
                `&startAt=${encodeURIComponent(JSON.stringify(cap))}` +
                `&endAt=${encodeURIComponent(JSON.stringify(end))}` +
                `&limitToFirst=10`;

            const res = await fetch(url);

            // Firebase gibt 400 zurück wenn kein Index existiert
            if (res.status === 400) {
                const errText = await res.text();
                console.warn('Firebase Index fehlt:', errText);
                resultsEl.innerHTML = '<div class="ingredient-dropdown-item ingredient-dropdown-info">' +
                    '⚠️ Titelsuche erfordert einen Firebase-Index für <code>product_name</code>. Bitte Barcode scannen.' +
                    '</div>';
                resultsEl.style.display = 'block';
                return;
            }

            if (!res.ok) throw new Error('Netzwerkfehler');

            const data = await res.json();
            const items = data
                ? Object.entries(data).map(([barcode, val]) => ({ barcode, ...val }))
                : [];

            // In Cache schreiben
            ingredientSearchCache[cacheKey] = items;
            renderIngredientResults(items, resultsEl);

        } catch (err) {
            console.error('Ingredient search error:', err);
            resultsEl.innerHTML = '<div class="ingredient-dropdown-item ingredient-dropdown-info">Verbindungsfehler — bitte Barcode nutzen.</div>';
            resultsEl.style.display = 'block';
        }
    }, 300);

    input.addEventListener('input', (e) => doSearch(e.target.value.trim()));

    // Dropdown schließen bei Klick außerhalb
    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !resultsEl.contains(e.target)) {
            resultsEl.style.display = 'none';
        }
    }, { capture: false });
}

function renderIngredientResults(items, resultsEl) {
    resultsEl.innerHTML = '';

    if (!items || items.length === 0) {
        resultsEl.innerHTML = '<div class="ingredient-dropdown-item ingredient-dropdown-info">Keine Treffer</div>';
        resultsEl.style.display = 'block';
        return;
    }

    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'ingredient-dropdown-item';
        const brand = item.brands ? `<span class="ingredient-dropdown-brand">${item.brands}</span>` : '';
        const kcal = item['energy-kcal_100g'] != null ? `<span class="ingredient-dropdown-kcal">${item['energy-kcal_100g']} kcal</span>` : '';
        div.innerHTML = `<span class="ingredient-dropdown-name">${item.product_name || '?'}</span>${brand}${kcal}`;

        div.addEventListener('click', () => {
            resultsEl.style.display = 'none';
            // Auch in productCache schreiben damit Barcode-Lookup gecacht ist
            productCache[item.barcode] = item;
            addIngredientFromData(item.barcode, item);
        });

        resultsEl.appendChild(div);
    });

    resultsEl.style.display = 'block';
}

// ============================================================
// DYNAMIC RECIPE RENDERING FOR OVERVIEW
// ============================================================
function renderRecipesList() {
    const listContainer = document.getElementById('recipes-list-container');
    if (!listContainer) return;
    
    listContainer.innerHTML = '';
    
    const keys = Object.keys(recipes);
    if (keys.length === 0) {
        listContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 40px var(--spacing-lg);">
                <p>Keine Rezepte in Firebase vorhanden.</p>
            </div>
        `;
        return;
    }
    
    keys.forEach((key, index) => {
        const recipe = recipes[key];
        
        // Bento Grid Größenverteilung
        let sizeClass = 'size-sm';
        if (index === 0) sizeClass = 'size-lg';
        else if (index === 3) sizeClass = 'size-md';
        
        const card = document.createElement('div');
        card.className = `recipe-card ${sizeClass}`;
        card.dataset.id = recipe.id;
        
        let imgHtml = '';
        if (sizeClass === 'size-lg') {
            imgHtml = `<div class="recipe-card-img placeholder-img"></div>`;
        }
        
        const badgeHtml = index === 0 ? `<div class="recipe-badge">Beliebt</div>` : '';
        
        card.innerHTML = `
            ${badgeHtml}
            ${imgHtml}
            <div class="recipe-card-info">
                <h3>${recipe.titel}</h3>
                <p>${recipe.kurzbeschreibung}</p>
                <span class="recipe-meta">
                    <i data-feather="clock"></i> ${recipe.dauer} Min. &bull; 🔥 ${recipe.kalorien} kcal
                    &bull; ⭐ ${(4.6 + (index % 5) * 0.1).toFixed(1)}
                </span>
            </div>
        `;
        
        card.addEventListener('click', () => {
            addToRecent(recipe.id);
            showRecipeView(recipe);
        });
        
        listContainer.appendChild(card);
    });
    
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
}

// ============================================================
// RECENTLY VIEWED MANAGER
// ============================================================
function addToRecent(id) {
    recentRecipeIds = recentRecipeIds.filter(rid => rid !== id);
    recentRecipeIds.unshift(id);
    recentRecipeIds = recentRecipeIds.slice(0, 3);
    localStorage.setItem('recent_recipes', JSON.stringify(recentRecipeIds));
    updateRecentList();
}

function updateRecentList() {
    const recentContainer = document.querySelector('.recent-list');
    if (!recentContainer) return;
    
    recentContainer.innerHTML = '';
    
    if (recentRecipeIds.length === 0) {
        const saved = localStorage.getItem('recent_recipes');
        if (saved) {
            recentRecipeIds = JSON.parse(saved);
        }
    }
    
    let idsToRender = recentRecipeIds;
    if (idsToRender.length === 0) {
        idsToRender = Object.keys(recipes).slice(0, 3);
    }
    
    idsToRender.forEach(id => {
        const recipe = recipes[id];
        if (!recipe) return;
        
        const item = document.createElement('div');
        item.className = 'recent-item';
        item.dataset.id = recipe.id;
        item.innerHTML = `
            <div class="recent-img placeholder-img"></div>
            <span>${recipe.titel}</span>
        `;
        
        item.addEventListener('click', () => {
            addToRecent(recipe.id);
            showRecipeView(recipe);
        });
        
        recentContainer.appendChild(item);
    });
}

// ============================================================
// SEARCH ENGINE WITH INTERACTIVE DROPDOWN (DEBOUNCED)
// ============================================================
function setupSearch() {
    const searchInput = document.getElementById('recipe-search');
    const searchResults = document.getElementById('search-results');
    if (!searchInput || !searchResults) return;
    
    // Klone das Element um Event Listener Duplikate zu verhindern
    const newSearchInput = searchInput.cloneNode(true);
    searchInput.replaceWith(newSearchInput);
    
    // Debounce die Suche auf 200ms um Tipp-Verzögerungen komplett zu eliminieren!
    const performSearch = debounce((query) => {
        searchResults.innerHTML = '';
        
        if (query.length > 0) {
            const matches = Object.values(recipes).filter(r => 
                r.titel.toLowerCase().includes(query) || 
                r.kurzbeschreibung.toLowerCase().includes(query)
            );
            
            if (matches.length > 0) {
                matches.forEach(recipe => {
                    const item = document.createElement('div');
                    item.className = 'dropdown-item';
                    item.innerHTML = `<i data-feather="file-text" style="width:16px;height:16px;color:var(--text-muted)"></i><span>${recipe.titel}</span>`;
                    
                    item.addEventListener('click', () => {
                        newSearchInput.value = '';
                        searchResults.style.display = 'none';
                        addToRecent(recipe.id);
                        showRecipeView(recipe);
                    });
                    
                    searchResults.appendChild(item);
                });
                if (typeof feather !== 'undefined') feather.replace();
                searchResults.style.display = 'block';
            } else {
                searchResults.innerHTML = '<div class="dropdown-item" style="color:var(--text-muted);cursor:default">Keine Rezepte gefunden</div>';
                searchResults.style.display = 'block';
            }
        } else {
            searchResults.style.display = 'none';
        }
    }, 200);

    newSearchInput.addEventListener('input', (e) => {
        performSearch(e.target.value.toLowerCase().trim());
    });
    
    document.addEventListener('click', (e) => {
        if (!newSearchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });
}

// ============================================================
// NAVIGATION LAYOUT CONTROLLER
// ============================================================
function showView(id) {
    ['main-view', 'recipes-view', 'recipe-view'].forEach(v => {
        document.getElementById(v).style.display = (v === id) ? 'block' : 'none';
    });
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (typeof feather !== 'undefined') feather.replace();
}

function showRecipeView(recipe) {
    showView('recipe-view');
    loadRecipe(recipe);
}

// ============================================================
// INITIALIZATION
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    if (typeof feather !== 'undefined') feather.replace();

    // Firebase Rezepte mit SWR-Verfahren laden
    loadRecipesFromFirebase();

    // Hub-Schaltflächen
    document.getElementById('btn-scan')?.addEventListener('click', () => {
        alert('Kassenzettel scannen steht erst in der Pro-Version zur Verfügung.');
    });

    // Neues Rezept anlegen
    document.getElementById('btn-new-recipe')?.addEventListener('click', () => {
        const newRecipe = {
            id: 'new-' + Date.now(),
            titel: 'Neues Rezept',
            kurzbeschreibung: 'Gib eine kurze Beschreibung ein…',
            schaerfe: 0,
            kalorien: 0,
            kosten: 0.00,
            dauer: 20,
            nutriScore: 'C',
            portionen: 2,
            naehrwerte: {
                'energy-kcal_100g': 0,
                'fat_100g': 0,
                'saturated-fat_100g': 0,
                'carbohydrates_100g': 0,
                'sugars_100g': 0,
                'fiber_100g': 0,
                'proteins_100g': 0,
                'salt_100g': 0
            },
            zutaten: [],
            beschreibung: '## Zubereitung\n\n- [ ] Erster Zubereitungsschritt\n'
        };
        
        saveRecipeToFirebase(newRecipe);
        showRecipeView(newRecipe);
        setTimeout(() => setEditMode(true), 50);
    });

    // Navigation Meine Rezepte Box -> Übersichtseite
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

    // Rezept-Zurück-Button
    document.getElementById('btn-back-from-recipe')?.addEventListener('click', () => {
        if (isEditMode) setEditMode(false);
        showView('recipes-view');
    });

    // Editieren und Speichern
    document.getElementById('btn-edit-recipe')?.addEventListener('click', () => setEditMode(true));
    document.getElementById('btn-save-recipe')?.addEventListener('click', () => setEditMode(false));

    // Markdown Editor Umschalter
    document.getElementById('btn-md-toggle')?.addEventListener('click', () => {
        if (mdShowingEditor) switchToRendered();
        else switchToEditor();
    });

    // Portions-Zähler Stepper
    document.getElementById('btn-portion-up')?.addEventListener('click', () => updatePortions(currentPortion + 1));
    document.getElementById('btn-portion-down')?.addEventListener('click', () => updatePortions(currentPortion - 1));

    // Barcode Button → Modal öffnen & Kamera sofort starten
    const btnBarcode = document.getElementById('btn-barcode');
    const barcodeModal = document.getElementById('barcode-modal');
    const btnCloseBarcodeModal = document.getElementById('btn-close-barcode-modal');

    if (btnBarcode && barcodeModal) {
        btnBarcode.addEventListener('click', () => {
            if (!isEditMode) {
                showToast('Hinweis', 'Zuerst Rezept bearbeiten, um Zutaten hinzuzufügen.', true);
                return;
            }
            document.getElementById('barcode-loading-spinner').style.display = 'none';
            barcodeModal.style.display = 'flex';
            // Kamera + Suche starten
            startCameraScanner();
            setupIngredientSearch();
        });
    }

    // Modal schließen → Kamera stoppen
    if (btnCloseBarcodeModal) {
        btnCloseBarcodeModal.addEventListener('click', () => {
            barcodeModal.style.display = 'none';
            stopCameraScanner();
        });
    }
    if (barcodeModal) {
        barcodeModal.addEventListener('click', (e) => {
            if (e.target === barcodeModal) {
                barcodeModal.style.display = 'none';
                stopCameraScanner();
            }
        });
    }

    // Sonstige statische Klicks
    document.getElementById('btn-bring')?.addEventListener('click', () => alert('🛒 Wird zur Bring!-Liste hinzugefügt…'));

    // Zutat entfernen Delegation
    document.getElementById('zutaten-list')?.addEventListener('click', (e) => {
        const btn = e.target.closest('.zutat-delete-btn');
        if (btn) btn.closest('.zutat-item').remove();
    });

    // ── Produkt-Textsuche Modal ──────────────────────────────
    const searchModal    = document.getElementById('search-modal');
    const btnSearchIngr  = document.getElementById('btn-search-ingredient');
    const btnCloseSearch = document.getElementById('btn-close-search-modal');

    if (btnSearchIngr && searchModal) {
        btnSearchIngr.addEventListener('click', () => {
            if (!isEditMode) return;
            searchModal.style.display = 'flex';
            const inp = document.getElementById('standalone-search-input');
            if (inp) { inp.value = ''; inp.focus(); }
            document.getElementById('standalone-search-results').style.display = 'none';
            document.getElementById('search-modal-spinner').style.display = 'none';
            setupStandaloneSearch();
        });
    }
    if (btnCloseSearch && searchModal) {
        btnCloseSearch.addEventListener('click', () => { searchModal.style.display = 'none'; });
    }
    if (searchModal) {
        searchModal.addEventListener('click', (e) => {
            if (e.target === searchModal) searchModal.style.display = 'none';
        });
    }
});

// ============================================================
// STANDALONE PRODUKT-TEXTSUCHE (/name_index, $key-Ordering)
// Kein Firebase-Index in den Regeln nötig!
// ============================================================
function setupStandaloneSearch() {
    const input     = document.getElementById('standalone-search-input');
    const resultsEl = document.getElementById('standalone-search-results');
    const spinner   = document.getElementById('search-modal-spinner');
    if (!input || !resultsEl) return;

    // Event-Listener nur einmal binden (Clone-Trick)
    const fresh = input.cloneNode(true);
    input.replaceWith(fresh);

    const doSearch = debounce(async (rawQuery) => {
        if (rawQuery.length < 2) {
            resultsEl.style.display = 'none';
            return;
        }
        const cacheKey = rawQuery.toLowerCase();

        // Cache-Treffer
        if (ingredientSearchCache[cacheKey] !== undefined) {
            renderStandaloneResults(ingredientSearchCache[cacheKey], resultsEl);
            return;
        }

        spinner.style.display = 'flex';
        resultsEl.style.display = 'none';

        try {
            // Firebase $key-Ordering — kein .indexOn nötig!
            // Key-Format: "{normalisierter_name}|{barcode}"
            const q   = rawQuery.toLowerCase().replace(/[.#$[\]/]/g, '_');
            const end = q + '\uf8ff';
            const url = `${FIREBASE_URL}/name_index.json` +
                        `?orderBy=%22%24key%22` +
                        `&startAt=${encodeURIComponent(JSON.stringify(q))}` +
                        `&endAt=${encodeURIComponent(JSON.stringify(end))}` +
                        `&limitToFirst=12`;

            const res = await fetch(url);
            spinner.style.display = 'none';

            if (!res.ok) throw new Error('Netzwerkfehler ' + res.status);

            const data = await res.json();
            // Jeder Value ist: { product_name, brands, energy-kcal_100g, ... }
            const items = data ? Object.values(data) : [];

            ingredientSearchCache[cacheKey] = items;
            renderStandaloneResults(items, resultsEl);

        } catch (err) {
            spinner.style.display = 'none';
            console.error('Standalone search error:', err);
            resultsEl.innerHTML = '<div class="ingredient-dropdown-item ingredient-dropdown-info">Fehler — wurde der Name-Index bereits aufgebaut?</div>';
            resultsEl.style.display = 'block';
        }
    }, 280);

    fresh.addEventListener('input', (e) => doSearch(e.target.value.trim()));
}

function renderStandaloneResults(items, resultsEl) {
    resultsEl.innerHTML = '';
    if (!items || items.length === 0) {
        resultsEl.innerHTML = '<div class="ingredient-dropdown-item ingredient-dropdown-info">Keine Treffer</div>';
        resultsEl.style.display = 'block';
        return;
    }
    items.forEach(item => {
        const div   = document.createElement('div');
        div.className = 'ingredient-dropdown-item';
        const brand = item.brands  ? `<span class="ingredient-dropdown-brand">${item.brands}</span>` : '';
        const kcal  = item['energy-kcal_100g'] != null
                      ? `<span class="ingredient-dropdown-kcal">${item['energy-kcal_100g']} kcal</span>` : '';
        div.innerHTML = `<span class="ingredient-dropdown-name">${item.product_name || '?'}</span>${brand}${kcal}`;
        div.addEventListener('click', () => {
            resultsEl.style.display = 'none';
            document.getElementById('search-modal').style.display = 'none';
            productCache[item.barcode] = item;
            addIngredientFromData(item.barcode, item);
        });
        resultsEl.appendChild(div);
    });
    resultsEl.style.display = 'block';
}
