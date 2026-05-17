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
        labels: ["Pasta", "Klassiker"],
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
        labels: ["Veggie", "Indisch"],
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
        labels: ["Schnell", "Frühstück"],
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
        labels: ["Cremig", "Pilze"],
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
let allLabels = [];
let basePortion = 1;
let currentPortion = 1;
let sortableIngredients = null;
let recentRecipeIds = [];
let html5Qrcode = null;             // Kamera-Scanner Instanz
let productCache = {};              // In-Memory-Cache: Barcode → Produkt-Daten
let ingredientSearchCache = {};     // In-Memory-Cache: Suchbegriff → Ergebnisliste
let scanCooldown = false;           // Verhindert mehrfaches Auslösen des gleichen Frames
let autosaveTimeout = null;
let selectedIngredientIndex = -1;   // Für das Detail-Modal
let previousView = 'main-view';      // Speichert die vorherige Ansicht für Zurück-Buttons


// ============================================================
// PERFORMANCE UTILITIES
// ============================================================
function debounce(func, wait) {
    let timeout;
    return function (...args) {
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

            // AUTOMATISCHES LABELS UPGRADE / SEED SYNC:
            // Sicherstellen, dass Standardrezepte immer die schönen Labels haben, selbst bei altem Cache/DB
            Object.keys(DEFAULT_RECIPES).forEach(id => {
                if (recipes[id] && (!recipes[id].labels || recipes[id].labels.length === 0)) {
                    recipes[id].labels = DEFAULT_RECIPES[id].labels;
                }
            });

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

function loadLabelsFromCache() {
    const cached = localStorage.getItem('global_labels');
    if (cached) {
        try {
            allLabels = JSON.parse(cached);
        } catch (e) { console.error(e); }
    }
}

async function loadRecipesFromFirebase() {
    // 1. Lade SOFORT aus dem lokalen Cache
    loadRecipesFromCache();
    loadLabelsFromCache();

    // Lade globale Labels
    try {
        const labelsRes = await fetch(`${FIREBASE_URL}/labels.json`);
        if (labelsRes.ok) {
            const ldata = await labelsRes.json();
            if (ldata) {
                allLabels = Object.values(ldata).filter(Boolean);
                localStorage.setItem('global_labels', JSON.stringify(allLabels));
            }
        }
    } catch (e) { console.warn("Konnte Labels nicht laden", e); }

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

            // WICHTIG: Wenn wir gerade ein Rezept bearbeiten, wollen wir dessen lokalen Stand
            // in der recipes-Liste nicht durch den (evtl. veralteten) Stand von Firebase überschreiben!
            if (currentRecipe && currentRecipe.id && data[currentRecipe.id]) {
                data[currentRecipe.id] = currentRecipe;
            }

            recipes = data;

            // Sicherstellen, dass Standardrezepte immer die schönen Labels haben, selbst bei altem Firebase-Stand
            Object.keys(DEFAULT_RECIPES).forEach(id => {
                if (recipes[id] && (!recipes[id].labels || recipes[id].labels.length === 0)) {
                    recipes[id].labels = DEFAULT_RECIPES[id].labels;
                }
            });

            localStorage.setItem('recipes_cache', JSON.stringify(recipes));
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
    const upper = (score || 'C').toUpperCase();
    scaleEl.dataset.score = upper;
    scaleEl.querySelectorAll('.nutri-seg').forEach(seg => {
        seg.classList.toggle('active', seg.dataset.letter === upper);
    });
}

// ============================================================
// NUTRITION PER PORTION CALCULATOR (NEW)
// ============================================================
function getNutritionPerPortion(recipe) {
    const portionen = Math.max(1, recipe.portionen || 1);
    const nw = recipe.naehrwerte || {};

    // Gesamtgewicht aus Zutaten berechnen (nur g/ml/kg/l)
    let totalGrams = 0;
    (recipe.zutaten || []).forEach(z => {
        const unit = (z.einheit || '').toLowerCase().trim();
        const menge = parseFloat(z.menge) || 0;
        if (unit === 'g' || unit === 'ml') totalGrams += menge;
        else if (unit === 'kg' || unit === 'l') totalGrams += menge * 1000;
    });

    // Wenn kein auswertbares Gewicht vorhanden: Fallback auf 100g-Werte
    if (totalGrams === 0) {
        return {
            'energy-kcal': nw['energy-kcal_100g'] !== undefined ? nw['energy-kcal_100g'] : null,
            'fat': nw['fat_100g'] !== undefined ? nw['fat_100g'] : null,
            'saturated-fat': nw['saturated-fat_100g'] !== undefined ? nw['saturated-fat_100g'] : null,
            'carbohydrates': nw['carbohydrates_100g'] !== undefined ? nw['carbohydrates_100g'] : null,
            'sugars': nw['sugars_100g'] !== undefined ? nw['sugars_100g'] : null,
            'fiber': nw['fiber_100g'] !== undefined ? nw['fiber_100g'] : null,
            'proteins': nw['proteins_100g'] !== undefined ? nw['proteins_100g'] : null,
            'salt': nw['salt_100g'] !== undefined ? nw['salt_100g'] : null,
            isFallback: true
        };
    }

    const gramsPerPortion = totalGrams / portionen;
    const round1 = v => Math.round(v * 10) / 10;

    return {
        'energy-kcal': nw['energy-kcal_100g'] !== undefined
            ? Math.round(nw['energy-kcal_100g'] * gramsPerPortion / 100) : null,
        'fat': nw['fat_100g'] !== undefined ? round1(nw['fat_100g'] * gramsPerPortion / 100) : null,
        'saturated-fat': nw['saturated-fat_100g'] !== undefined ? round1(nw['saturated-fat_100g'] * gramsPerPortion / 100) : null,
        'carbohydrates': nw['carbohydrates_100g'] !== undefined ? round1(nw['carbohydrates_100g'] * gramsPerPortion / 100) : null,
        'sugars': nw['sugars_100g'] !== undefined ? round1(nw['sugars_100g'] * gramsPerPortion / 100) : null,
        'fiber': nw['fiber_100g'] !== undefined ? round1(nw['fiber_100g'] * gramsPerPortion / 100) : null,
        'proteins': nw['proteins_100g'] !== undefined ? round1(nw['proteins_100g'] * gramsPerPortion / 100) : null,
        'salt': nw['salt_100g'] !== undefined ? round1(nw['salt_100g'] * gramsPerPortion / 100) : null,
        isFallback: false
    };
}

function updateNutritionDisplay(recipe) {
    const per = getNutritionPerPortion(recipe);
    const fmt = v => (v !== null && v !== undefined) ? v : '—';

    document.getElementById('nw-energy-kcal').textContent = fmt(per['energy-kcal']);
    document.getElementById('nw-fat').textContent = fmt(per['fat']);
    document.getElementById('nw-saturated-fat').textContent = fmt(per['saturated-fat']);
    document.getElementById('nw-carbohydrates').textContent = fmt(per['carbohydrates']);
    document.getElementById('nw-sugars').textContent = fmt(per['sugars']);
    document.getElementById('nw-fiber').textContent = fmt(per['fiber']);
    document.getElementById('nw-proteins').textContent = fmt(per['proteins']);
    document.getElementById('nw-salt').textContent = fmt(per['salt']);
}

// ============================================================
// WEIGHTED NUTRITIONAL ENGINE
// ============================================================
function convertIngredientToGrams(menge, einheit, stkInGrams) {
    if (typeof menge !== 'number' || isNaN(menge)) {
        menge = parseFloat(menge) || 0;
    }
    const u = (einheit || '').trim().toLowerCase();
    switch (u) {
        case 'g':
            return menge;
        case 'ml':
            return menge; // 1 ml ≈ 1 g
        case 'cl':
            return menge * 10; // 1 cl = 10 ml ≈ 10 g
        case 'stk.':
        case 'stk':
            const factor = parseFloat(stkInGrams) || 100;
            return menge * factor;
        case 'tl':
            return menge * 3; // 1 TL = 3 g
        case 'el':
            return menge * 10; // 1 EL = 10 g
        default:
            return menge; // Fallback
    }
}

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
            const grams = convertIngredientToGrams(z.menge, z.einheit, z.stkInGrams);
            const factor = grams / 100;
            totalWeight += grams;

            for (const key in totalNutrients) {
                if (z.naehrwerte[key] !== undefined && z.naehrwerte[key] !== null) {
                    totalNutrients[key] += z.naehrwerte[key] * factor;
                }
            }

            if (z.nutriScoreValue !== undefined && z.nutriScoreValue !== null) {
                weightedScoreSum += z.nutriScoreValue * grams;
                scoreWeightTotal += grams;
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

        recipe.kalorien = Math.round(totalNutrients['energy-kcal_100g'] / port);
        const kcalEl = document.getElementById('rv-kalorien');
        if (kcalEl) {
            kcalEl.textContent = recipe.kalorien;
        }

        // Berechne gewichteten Nutri-Score
        if (scoreWeightTotal > 0) {
            const avgScore = Math.round(weightedScoreSum / scoreWeightTotal);
            recipe.nutriScore = scoreToLetter(avgScore);
        }
    }
}

function recalculateRecipeCost(recipe) {
    if (!recipe.zutaten || recipe.zutaten.length === 0) return;
    let totalCost = 0;
    let hasPricedIngredients = false;
    
    recipe.zutaten.forEach(z => {
        if (z.preisProKg !== undefined && z.preisProKg !== null && z.preisProKg > 0) {
            hasPricedIngredients = true;
            const grams = convertIngredientToGrams(z.menge, z.einheit, z.stkInGrams);
            totalCost += grams * (z.preisProKg / 1000);
        }
    });
    
    if (hasPricedIngredients) {
        recipe.kosten = Math.round(totalCost * 100) / 100;
        const costEl = document.getElementById('rv-kosten');
        if (costEl) {
            costEl.textContent = recipe.kosten.toFixed(2);
        }
    }
}

// ============================================================
// MARKDOWN RENDERER WITH INTERACTIVE TASK ITEMS
// ============================================================
// ============================================================
// PREPARATION STEPS & SECTIONS ENGINE
// ============================================================
function parseMarkdownToSteps(mdText) {
    const lines = mdText.split('\n');
    const structure = [];
    lines.forEach(line => {
        const clean = line.trim();
        if (clean.startsWith('##')) {
            structure.push({ type: 'section', text: clean.replace('##', '').trim() });
        } else if (clean.startsWith('- [x]')) {
            structure.push({ type: 'step', text: clean.replace('- [x]', '').trim(), completed: true });
        } else if (clean.startsWith('- [ ]')) {
            structure.push({ type: 'step', text: clean.replace('- [ ]', '').trim(), completed: false });
        } else if (clean.length > 0) {
            structure.push({ type: 'step', text: clean, completed: false });
        }
    });
    return structure;
}

let sortablePrep = null;

function renderPreparationEditor(recipe) {
    const list = document.getElementById('prep-steps-list');
    list.innerHTML = '';
    const structure = parseMarkdownToSteps(recipe.beschreibung || '');

    let stepCount = 1;
    structure.forEach((item, index) => {
        const div = document.createElement('div');
        if (item.type === 'section') {
            div.className = 'prep-section-item';
            div.dataset.type = 'section';
            div.innerHTML = `
                <span class="prep-drag-handle"><i data-feather="menu"></i></span>
                <h3 class="section-title" contenteditable="true" data-placeholder="Abschnitts-Titel...">${item.text}</h3>
                <button class="zutat-delete-btn" title="Abschnitt entfernen" onclick="this.parentElement.remove(); syncPreparationToMarkdown(); saveCurrentRecipeImmediately();"><i data-feather="x"></i></button>
            `;
        } else {
            div.className = 'prep-step-item' + (item.completed ? ' is-completed' : '');
            div.dataset.type = 'step';
            div.innerHTML = `
                <span class="prep-drag-handle"><i data-feather="menu"></i></span>
                <span class="step-number" onclick="toggleStepCompleted(this)" title="Status umschalten">${stepCount++}</span>
                <div class="step-content" contenteditable="true" data-placeholder="Schritt beschreiben...">${item.text}</div>
                <button class="zutat-delete-btn" title="Schritt entfernen" onclick="this.parentElement.remove(); syncPreparationToMarkdown(); saveCurrentRecipeImmediately();"><i data-feather="x"></i></button>
            `;
        }
        list.appendChild(div);
    });
    if (typeof feather !== 'undefined') feather.replace();

    const box = document.querySelector('.zubereitung-box');
    const isEditing = box && box.classList.contains('is-editing');

    // Sortable für die gesamte Liste (erlaubt Verschieben über Sektionen hinweg)
    if (sortablePrep) sortablePrep.destroy();
    if (typeof Sortable !== 'undefined') {
        sortablePrep = new Sortable(list, {
            handle: '.prep-drag-handle',
            animation: 150,
            ghostClass: 'sortable-ghost',
            disabled: !isEditing, // Nur wenn im Edit-Modus aktiv
            onEnd: () => {
                syncPreparationToMarkdown();
                saveCurrentRecipeImmediately();
                renderPreparationEditor(currentRecipe); // Re-render um Nummern zu korrigieren
            }
        });
    }

    // Event-Listener für Änderungen
    list.querySelectorAll('[contenteditable="true"]').forEach(el => {
        el.addEventListener('input', () => triggerAutosave());
    });
}

function toggleStepCompleted(el) {
    const parent = el.parentElement;
    parent.classList.toggle('is-completed');
    syncPreparationToMarkdown();
    saveCurrentRecipeImmediately();
}

function syncPreparationToMarkdown() {
    const list = document.getElementById('prep-steps-list');
    let md = '';
    list.childNodes.forEach(node => {
        const title = node.querySelector('.section-title');
        const content = node.querySelector('.step-content');
        const isCompleted = node.classList.contains('is-completed');

        if (title) {
            md += `\n## ${title.textContent.trim()}\n`;
        } else if (content) {
            const prefix = isCompleted ? '- [x]' : '- [ ]';
            md += `${prefix} ${content.textContent.trim()}\n`;
        }
    });
    currentRecipe.beschreibung = md.trim();
}


function addPrepStep() {
    syncPreparationToMarkdown();
    currentRecipe.beschreibung += '\n- [ ] ';
    renderPreparationEditor(currentRecipe);
    saveCurrentRecipeImmediately();

    // Focus auf das letzte Element
    setTimeout(() => {
        const items = document.querySelectorAll('.prep-step-item .step-content');
        if (items.length) items[items.length - 1].focus();
    }, 50);
}

function addPrepSection() {
    syncPreparationToMarkdown();
    currentRecipe.beschreibung += '\n## ';
    renderPreparationEditor(currentRecipe);
    saveCurrentRecipeImmediately();

    // Focus auf das letzte Element
    setTimeout(() => {
        const items = document.querySelectorAll('.prep-section-item .section-title');
        if (items.length) items[items.length - 1].focus();
    }, 50);
}

function deletePrepItem(index) {
    // Diese Funktion wird durch die Inline-Delete-Logik in renderPreparationEditor ersetzt
    syncPreparationToMarkdown();
    renderPreparationEditor(currentRecipe);
    saveCurrentRecipeImmediately();
}



// ============================================================
// INGREDIENT RENDERER
// ============================================================
function renderIngredients(zutaten, curPort, basePort) {
    const list = document.getElementById('zutaten-list');
    list.innerHTML = '';

    zutaten.forEach((z, index) => {
        const scaledMenge = Math.round((z.menge * curPort / basePort) * 10) / 10;
        const li = document.createElement('li');
        li.className = 'zutat-item';
        li.onclick = () => openIngredientModal(index);

        li.dataset.index = index;
        if (z.barcode) li.dataset.barcode = z.barcode;
        if (z.naehrwerte) li.dataset.naehrwerte = JSON.stringify(z.naehrwerte);
        if (z.stkInGrams) li.dataset.stkInGrams = z.stkInGrams;
        if (z.preisProKg) li.dataset.preisProKg = z.preisProKg;

        // Dynamischer Dropdown-Generator für Einheiten (streng ohne Fallback)
        const fixedUnits = ["g", "ml", "cl", "Stk.", "TL", "EL"];
        let selectOptionsHtml = '';
        fixedUnits.forEach(u => {
            selectOptionsHtml += `<option value="${u}" ${z.einheit === u ? 'selected' : ''}>${u}</option>`;
        });

        li.innerHTML = `
            <span class="zutat-drag-handle"><i data-feather="menu"></i></span>
            <span class="zutat-menge" contenteditable="true" data-base="${z.menge}" onclick="event.stopPropagation()">${scaledMenge}</span>
            <select class="zutat-einheit-select" onclick="event.stopPropagation()">
                ${selectOptionsHtml}
            </select>
            <span class="zutat-name" contenteditable="true" onclick="event.stopPropagation()">${z.name}</span>
            <button class="zutat-delete-btn" title="Zutat entfernen" onclick="event.stopPropagation(); deleteIngredient(${index})"><i data-feather="x"></i></button>
        `;
        list.appendChild(li);

        // Autosave anhängen für name und menge
        li.querySelectorAll('.zutat-menge, .zutat-name').forEach(el => {
            el.addEventListener('input', () => triggerAutosave());
        });

        // Event-Listener für Einheitsänderung mit Popup bei Stk.
        const selectEl = li.querySelector('.zutat-einheit-select');
        if (selectEl) {
            selectEl.addEventListener('change', (e) => {
                const newUnit = e.target.value;
                if (newUnit === 'Stk.') {
                    const currentVal = z.stkInGrams || 100;
                    const weightStr = prompt(`Wie viel Gramm wiegt 1 Stück (Stk.) dieser Zutat ("${z.name || 'Unbenannt'}")?`, currentVal);
                    const weight = parseFloat(weightStr);
                    if (!isNaN(weight) && weight > 0) {
                        z.stkInGrams = weight;
                        li.dataset.stkInGrams = weight;
                    } else {
                        z.stkInGrams = currentVal;
                        li.dataset.stkInGrams = currentVal;
                    }
                }
                syncIngredientsFromDOM();
                saveCurrentRecipeImmediately();
            });
        }
    });

    if (typeof feather !== 'undefined') feather.replace();

    if (sortableIngredients) sortableIngredients.destroy();
    if (typeof Sortable !== 'undefined') {
        sortableIngredients = new Sortable(list, {
            handle: '.zutat-drag-handle',
            animation: 150,
            ghostClass: 'sortable-ghost',
            onEnd: () => {
                syncIngredientsFromDOM();
                saveCurrentRecipeImmediately();
            }
        });
    }
}

function syncIngredientsFromDOM() {
    const items = document.querySelectorAll('.zutat-item');
    currentRecipe.zutaten = Array.from(items).map(li => {
        const selectEl = li.querySelector('.zutat-einheit-select');
        const unit = selectEl ? selectEl.value : 'g';
        
        // Erhalte das bestehende stkInGrams und preisProKg falls vorhanden
        const indexStr = li.dataset.index || '';
        const idx = parseInt(indexStr);
        let existingStkGrams = null;
        let existingPreisProKg = null;
        if (!isNaN(idx) && currentRecipe.zutaten[idx]) {
            existingStkGrams = currentRecipe.zutaten[idx].stkInGrams;
            existingPreisProKg = currentRecipe.zutaten[idx].preisProKg;
        }

        return {
            menge: parseFloat(li.querySelector('.zutat-menge').textContent) || 0,
            einheit: unit,
            name: li.querySelector('.zutat-name').textContent.trim(),
            barcode: li.dataset.barcode || null,
            naehrwerte: li.dataset.naehrwerte ? JSON.parse(li.dataset.naehrwerte) : null,
            stkInGrams: existingStkGrams || parseFloat(li.dataset.stkInGrams) || null,
            preisProKg: existingPreisProKg || parseFloat(li.dataset.preisProKg) || null
        };
    });
}


// ============================================================
// LOAD RECIPE INTO DETAIL VIEW
// ============================================================
function loadRecipe(recipe) {
    currentRecipe = JSON.parse(JSON.stringify(recipe));
    basePortion = recipe.portionen;
    currentPortion = recipe.portionen;

    document.getElementById('rv-titel').textContent = recipe.titel;
    document.getElementById('rv-kurzbeschreibung').textContent = recipe.kurzbeschreibung;
    document.getElementById('rv-kalorien').textContent = recipe.kalorien;
    document.getElementById('rv-kosten').textContent = recipe.kosten.toFixed(2);
    document.getElementById('rv-dauer').textContent = recipe.dauer;
    document.getElementById('rv-portionen').textContent = currentPortion;
    applyNutriScore(recipe.nutriScore);

    updateNutritionDisplay(recipe);
    renderIngredients(recipe.zutaten, currentPortion, basePortion);
    renderPreparationEditor(recipe);
    renderLabels(recipe.labels || []);

    // Event Listener für Always-Editable Felder
    ['rv-titel', 'rv-kurzbeschreibung', 'rv-dauer'].forEach(id => {
        const el = document.getElementById(id);
        el.addEventListener('input', () => triggerAutosave());
    });
}


// ============================================================
// AUTOSAVE ENGINE (Debounced)
// ============================================================
function triggerAutosave() {
    if (autosaveTimeout) clearTimeout(autosaveTimeout);

    // Lokales Update sofort (für UI Konsistenz)
    syncAllToState();

    // WICHTIG: Sofort lokal speichern, damit Navigieren (Zurück-Button) oder ein Seiten-Reload
    // die Änderungen (wie neue Labels) nicht vergisst!
    if (currentRecipe && currentRecipe.id) {
        recipes[currentRecipe.id] = currentRecipe;
        localStorage.setItem('recipes_cache', JSON.stringify(recipes));
    }

    // Nach 5 Minuten an Firebase senden (Wunsch des Users)
    autosaveTimeout = setTimeout(() => {
        saveRecipeToFirebase(currentRecipe);
    }, 5 * 60 * 1000);
}

function saveCurrentRecipeImmediately() {
    if (autosaveTimeout) clearTimeout(autosaveTimeout);
    if (currentRecipe && currentRecipe.id) {
        syncAllToState();
        recipes[currentRecipe.id] = currentRecipe;
        localStorage.setItem('recipes_cache', JSON.stringify(recipes));
        saveRecipeToFirebase(currentRecipe);
    }
}

function syncAllToState() {
    if (!currentRecipe) return;
    currentRecipe.titel = document.getElementById('rv-titel').textContent.trim();
    currentRecipe.kurzbeschreibung = document.getElementById('rv-kurzbeschreibung').textContent.trim();
    currentRecipe.kalorien = parseFloat(document.getElementById('rv-kalorien').textContent) || 0;
    currentRecipe.dauer = parseInt(document.getElementById('rv-dauer').textContent) || 0;
    currentRecipe.kosten = parseFloat(document.getElementById('rv-kosten').textContent) || 0;

    syncIngredientsFromDOM();
    syncPreparationToMarkdown();

    // Nährwerte neu kalkulieren
    recalculateRecipeNutrition(currentRecipe);
    recalculateRecipeCost(currentRecipe);
    updateNutritionDisplay(currentRecipe);
}

// ============================================================
// PORTION SETTINGS MODAL
// ============================================================
function openPortionModal() {
    document.getElementById('manual-portion-input').value = currentRecipe.portionen;
    document.getElementById('portion-settings-modal').style.display = 'flex';
}

function closePortionModal() {
    document.getElementById('portion-settings-modal').style.display = 'none';
}

function saveManualPortions() {
    const newVal = parseInt(document.getElementById('manual-portion-input').value) || 1;
    currentRecipe.portionen = newVal;
    basePortion = newVal;
    currentPortion = newVal;
    document.getElementById('rv-portionen').textContent = currentPortion;

    updateNutritionDisplay(currentRecipe);
    renderIngredients(currentRecipe.zutaten, currentPortion, basePortion);

    closePortionModal();
    saveRecipeToFirebase(currentRecipe);
}

// ============================================================
// INGREDIENT DETAIL MODAL
// ============================================================
function openIngredientModal(index) {
    selectedIngredientIndex = index;
    const z = currentRecipe.zutaten[index];
    document.getElementById('modal-ingredient-name').textContent = z.name;
    document.getElementById('modal-ingredient-barcode').textContent = z.barcode || 'Kein Barcode';

    const nw = z.naehrwerte || {};
    document.getElementById('mi-kcal').value = nw['energy-kcal_100g'] || 0;
    document.getElementById('mi-proteins').value = nw['proteins_100g'] || 0;
    document.getElementById('mi-fat').value = nw['fat_100g'] || 0;
    document.getElementById('mi-carbs').value = nw['carbohydrates_100g'] || 0;
    document.getElementById('mi-saturated-fat').value = nw['saturated-fat_100g'] || 0;
    document.getElementById('mi-sugars').value = nw['sugars_100g'] || 0;
    document.getElementById('mi-fiber').value = nw['fiber_100g'] || 0;
    document.getElementById('mi-salt').value = nw['salt_100g'] || 0;
    document.getElementById('mi-preis').value = z.preisProKg || 0;

    // Dynamisches Feld für Stückgewicht
    let stkField = document.getElementById('mi-stk-grams-container');
    if (!stkField) {
        const grid = document.querySelector('.modal-nutrition-grid');
        stkField = document.createElement('div');
        stkField.id = 'mi-stk-grams-container';
        stkField.className = 'modal-field';
        stkField.innerHTML = `
            <label>Stückgewicht (g)</label>
            <input type="number" id="mi-stk-grams" step="1">
        `;
        grid.appendChild(stkField);
    }
    
    if (z.einheit === 'Stk.') {
        stkField.style.display = 'block';
        document.getElementById('mi-stk-grams').value = z.stkInGrams || 100;
    } else {
        stkField.style.display = 'none';
    }

    document.getElementById('ingredient-detail-modal').style.display = 'flex';
}

function closeIngredientModal() {
    document.getElementById('ingredient-detail-modal').style.display = 'none';
}

function saveIngredientDetail() {
    if (selectedIngredientIndex < 0) return;
    const z = currentRecipe.zutaten[selectedIngredientIndex];
    if (!z.naehrwerte) z.naehrwerte = {};

    z.naehrwerte['energy-kcal_100g'] = parseFloat(document.getElementById('mi-kcal').value) || 0;
    z.naehrwerte['proteins_100g'] = parseFloat(document.getElementById('mi-proteins').value) || 0;
    z.naehrwerte['fat_100g'] = parseFloat(document.getElementById('mi-fat').value) || 0;
    z.naehrwerte['carbohydrates_100g'] = parseFloat(document.getElementById('mi-carbs').value) || 0;
    z.naehrwerte['saturated-fat_100g'] = parseFloat(document.getElementById('mi-saturated-fat').value) || 0;
    z.naehrwerte['sugars_100g'] = parseFloat(document.getElementById('mi-sugars').value) || 0;
    z.naehrwerte['fiber_100g'] = parseFloat(document.getElementById('mi-fiber').value) || 0;
    z.naehrwerte['salt_100g'] = parseFloat(document.getElementById('mi-salt').value) || 0;
    
    z.preisProKg = parseFloat(document.getElementById('mi-preis').value) || 0;

    const stkInput = document.getElementById('mi-stk-grams');
    if (stkInput && z.einheit === 'Stk.') {
        z.stkInGrams = parseFloat(stkInput.value) || 100;
    }

    closeIngredientModal();
    recalculateRecipeNutrition(currentRecipe);
    recalculateRecipeCost(currentRecipe);
    updateNutritionDisplay(currentRecipe);
    renderIngredients(currentRecipe.zutaten, currentPortion, basePortion);
    saveCurrentRecipeImmediately();
}

function deleteIngredient(index) {
    currentRecipe.zutaten.splice(index, 1);
    renderIngredients(currentRecipe.zutaten, currentPortion, basePortion);
    saveCurrentRecipeImmediately();
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
    currentRecipe.zutaten.push({
        menge: 0,
        einheit: 'g',
        name: ''
    });
    renderIngredients(currentRecipe.zutaten, currentPortion, basePortion);

    // Focus auf die neue Zutat (Name Feld)
    setTimeout(() => {
        const items = document.querySelectorAll('.zutaten-list .zutat-item');
        const lastItem = items[items.length - 1];
        const nameField = lastItem.querySelector('.zutat-name');
        if (nameField) {
            nameField.focus();
        }
    }, 50);
    saveCurrentRecipeImmediately();
}



// ============================================================
// CAMERA BARCODE SCANNER LOGIC (Hybrid: Native + zxing-wasm)
// ============================================================
let cameraStream = null;
let scannerLoopId = null;
let nativeBarcodeDetector = null;
let videoDevices = [];
let currentDeviceIndex = 0;

if ('BarcodeDetector' in window) {
    BarcodeDetector.getSupportedFormats()
        .then(formats => {
            if (formats.includes('ean_13') || formats.includes('ean_8')) {
                nativeBarcodeDetector = new BarcodeDetector({ formats: ['ean_13', 'ean_8'] });
                console.log('Nativer BarcodeDetector aktiviert (unterstützt EAN).');
            } else {
                console.log('Nativer BarcodeDetector unterstützt kein EAN. Nutze Fallback.');
            }
        })
        .catch(e => console.warn('Fehler bei Überprüfung der Barcode-Formate', e));
}

async function startCameraScanner() {
    const video = document.getElementById('barcode-video');
    const scannerLine = document.getElementById('scanner-line');
    if (!video) return;

    // Dynamischer Import von zxing-wasm (nur wenn benötigt und nicht schon geladen)
    if (!nativeBarcodeDetector && !window.zxingReadBarcodes) {
        import("https://cdn.jsdelivr.net/npm/zxing-wasm@3.3.1/dist/reader/index.js")
            .then(module => {
                window.zxingReadBarcodes = module.readBarcodesFromImageData;
                console.log("zxing-wasm erfolgreich geladen");
            })
            .catch(err => console.error("Fehler beim Laden von zxing-wasm:", err));
    }

    try {
        // Liste alle Video-Eingabegeräte auf, falls wir das noch nicht getan haben
        if (videoDevices.length === 0) {
            const allDevices = await navigator.mediaDevices.enumerateDevices();
            // Filtere alle Kameras heraus, die explizit 'front' im Namen tragen
            let backCameras = allDevices.filter(device => {
                if (device.kind !== 'videoinput') return false;
                if (device.label.toLowerCase().includes('front')) return false;
                return true;
            });

            // Fallback, falls der Filter alles aussortiert (z.B. wenn keine Labels verfügbar sind)
            if (backCameras.length === 0) {
                backCameras = allDevices.filter(device => device.kind === 'videoinput');
            }
            videoDevices = backCameras;

            // Finde initial eine gute Linse (kein Ultra-Wide)
            const preferredIndex = videoDevices.findIndex(d =>
                !d.label.toLowerCase().includes('ultra') &&
                !d.label.toLowerCase().includes('wide')
            );
            if (preferredIndex !== -1) {
                currentDeviceIndex = preferredIndex;
            }
        }

        let constraints = { video: { facingMode: 'environment', advanced: [{ focusMode: 'continuous' }, { zoom: 2.0 }] } };

        if (videoDevices.length > 0) {
            constraints.video = {
                deviceId: { exact: videoDevices[currentDeviceIndex].deviceId },
                advanced: [{ focusMode: 'continuous' }, { zoom: 2.0 }]
            };
        }

        cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = cameraStream;

        // Warten bis Metadaten geladen sind um das Video abzuspielen
        await new Promise(resolve => {
            video.onloadedmetadata = () => {
                resolve();
            };
        });

        await video.play();

        if (scannerLine) scannerLine.style.display = 'block';

        scanLoop();
    } catch (err) {
        console.error('Kamera-Zugriffsfehler:', err);
        const errMsg = err && err.message ? err.message : String(err);
        if (errMsg.includes('Permission') || errMsg.includes('NotAllowed')) {
            showToast('Kamerazugriff verweigert', 'Bitte erlaube den Kamerazugriff im Browser.', true);
        } else {
            showToast('Kamerafehler', 'Kamera konnte nicht gestartet werden.', true);
        }
        stopCameraScanner();
    }
}

async function scanLoop() {
    if (!cameraStream) return;

    if (scanCooldown) {
        scannerLoopId = requestAnimationFrame(scanLoop);
        return;
    }

    const video = document.getElementById('barcode-video');
    const canvas = document.getElementById('barcode-canvas');

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        try {
            let barcodeFound = null;

            if (nativeBarcodeDetector) {
                // Priorität 1: Native Hardware-Beschleunigung
                const barcodes = await nativeBarcodeDetector.detect(video);
                if (barcodes.length > 0) {
                    barcodeFound = barcodes[0].rawValue;
                }
            }

            if (!barcodeFound && window.zxingReadBarcodes) {
                // Priorität 2: zxing-wasm Fallback (iPad/Safari oder wenn Nativ versagt)
                const ctx = canvas.getContext('2d', { willReadFrequently: true });
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

                const results = await window.zxingReadBarcodes(imageData, {
                    tryHarder: true
                });

                if (results && results.length > 0) {
                    barcodeFound = results[0].text;
                }
            }

            if (barcodeFound) {
                console.log('Barcode erkannt:', barcodeFound);
                scanCooldown = true;
                setTimeout(() => { scanCooldown = false; }, 2000);

                // Für Debugging: Barcode in das Suchfeld eintragen, damit der Nutzer sieht, was gelesen wurde
                const searchInput = document.getElementById('ingredient-search-input');
                if (searchInput) searchInput.value = barcodeFound;

                // Kamera läuft weiter, Lookup wird asynchron gestartet
                handleBarcodeLookup(barcodeFound);
            }
        } catch (err) {
            // Frame-Fehler ignorieren
        }
    }

    scannerLoopId = requestAnimationFrame(scanLoop);
}

function stopCameraScanner() {
    const scannerLine = document.getElementById('scanner-line');
    if (scannerLine) scannerLine.style.display = 'none';

    if (scannerLoopId) {
        cancelAnimationFrame(scannerLoopId);
        scannerLoopId = null;
    }

    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }

    const video = document.getElementById('barcode-video');
    if (video) {
        video.srcObject = null;
    }
}

async function switchCamera() {
    if (videoDevices.length <= 1) {
        showToast('Info', 'Keine weiteren Kameras zum Umschalten gefunden.', false);
        return;
    }
    stopCameraScanner();
    currentDeviceIndex = (currentDeviceIndex + 1) % videoDevices.length;
    await startCameraScanner();
}

// ============================================================
// BARCODE LOOKUP MODAL ENGINE
// ============================================================
async function handleBarcodeLookup(barcode) {
    let cleanBarcode = barcode.trim().replace(/[\.\#\$\[\]\/]/g, '_');
    if (!cleanBarcode) return;

    // 1. Cache-Treffer? → sofortige Antwort (0ms Latenz)
    if (productCache[cleanBarcode] !== undefined) {
        const cached = productCache[cleanBarcode];
        if (!cached) {
            showToast('Nicht gefunden', `Barcode ${cleanBarcode} ist nicht in der Datenbank.`, true);
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
            showToast('Nicht gefunden', `Barcode ${cleanBarcode} ist nicht in der Datenbank.`, true);
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
    // Verhindere mehrfaches Hinzufügen desselben Produkts und unterdrücke das Popup
    if (cleanBarcode && currentRecipe.zutaten.some(z => z.barcode === cleanBarcode)) {
        return;
    }

    const title = data.product_name || 'Unbekanntes Produkt';
    const brand = data.brands || '';
    const displayName = brand ? `${title} (${brand})` : title;

    showToast('Hinzugefügt!', displayName);

    const naehrwerte = {
        'energy-kcal_100g': parseFloat(data['energy-kcal_100g']) || 0,
        'fat_100g': parseFloat(data['fat_100g']) || 0,
        'saturated-fat_100g': parseFloat(data['saturated-fat_100g']) || 0,
        'carbohydrates_100g': parseFloat(data['carbohydrates_100g']) || 0,
        'sugars_100g': parseFloat(data['sugars_100g']) || 0,
        'fiber_100g': parseFloat(data['fiber_100g']) || 0,
        'proteins_100g': parseFloat(data['proteins_100g']) || 0,
        'salt_100g': parseFloat(data['salt_100g']) || 0
    };

    currentRecipe.zutaten.push({
        menge: 100,
        einheit: 'g',
        name: title,
        barcode: cleanBarcode,
        naehrwerte: naehrwerte,
        nutriScoreValue: data.nutriScoreValue || null
    });

    renderIngredients(currentRecipe.zutaten, currentPortion, basePortion);
    saveCurrentRecipeImmediately();
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
            // 1. Hole lokale Kandidaten
            const candidates = getFuzzyCandidates();

            // 2. Hole Firebase-Kandidaten per Präfix der ersten 3 Zeichen
            const prefixLen = Math.min(3, rawQuery.length);
            const prefix = rawQuery.slice(0, prefixLen).toLowerCase().replace(/[.#$[\]/]/g, '_');
            const end = prefix + '\uf8ff';
            const url = `${FIREBASE_URL}/name_index.json?orderBy="%24key"&startAt=${encodeURIComponent(JSON.stringify(prefix))}&endAt=${encodeURIComponent(JSON.stringify(end))}&limitToFirst=60`;
            
            let fbItems = [];
            try {
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    if (data) {
                        fbItems = Object.values(data);
                    }
                }
            } catch (err) {
                console.warn("Firebase-Präfixsuche fehlgeschlagen:", err);
            }

            // 3. Zusammenführen und Duplikate filtern
            const merged = [...fbItems];
            const seenNames = new Set(fbItems.map(item => (item.product_name || '').toLowerCase().trim()));
            
            candidates.forEach(cand => {
                const candName = cand.product_name.toLowerCase().trim();
                if (!seenNames.has(candName)) {
                    merged.push(cand);
                    seenNames.add(candName);
                }
            });

            // 4. Ähnlichkeit berechnen und sortieren
            const scored = merged.map(item => {
                const name = item.product_name || '';
                const score = getFuzzyMatchScore(name, rawQuery);
                return { item, score };
            });

            // Filter auf vernünftige Übereinstimmung (Score >= 0.35)
            const filtered = scored.filter(entry => entry.score >= 0.35);

            // Sortieren nach Score absteigend
            filtered.sort((a, b) => b.score - a.score);

            // Nimm die Top 10 Ergebnisse
            const finalItems = filtered.slice(0, 10).map(entry => entry.item);

            ingredientSearchCache[cacheKey] = finalItems;
            renderIngredientResults(finalItems, resultsEl);

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

        // Label Badges
        let labelsHtml = '';
        if (recipe.labels && recipe.labels.length > 0) {
            labelsHtml = `<div class="card-labels">` +
                recipe.labels.map(l => `<span class="card-label-badge">${l}</span>`).join('') +
                `</div>`;
        }

        card.innerHTML = `
            ${badgeHtml}
            ${imgHtml}
            <div class="recipe-card-info">
                ${labelsHtml}
                <h3>${recipe.titel}</h3>
                <p>${recipe.kurzbeschreibung}</p>
                <span class="recipe-meta">
                    <i data-feather="clock"></i> ${recipe.dauer} Min. &bull; 🔥 ${recipe.kalorien} kcal
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

        let labelsHtml = '';
        if (recipe.labels && recipe.labels.length > 0) {
            labelsHtml = `<div class="card-labels">` +
                recipe.labels.map(l => `<span class="card-label-badge">${l}</span>`).join('') +
                `</div>`;
        }

        const item = document.createElement('div');
        item.className = 'recent-item';
        item.dataset.id = recipe.id;
        item.innerHTML = `
            <div class="recent-info">
                <span class="recent-title">${recipe.titel}</span>
                ${labelsHtml}
            </div>
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
                r.kurzbeschreibung.toLowerCase().includes(query) ||
                (r.labels && r.labels.some(l => l.toLowerCase().includes(query)))
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
    const currentActiveView = ['main-view', 'recipes-view', 'recipe-view'].find(v => {
        const el = document.getElementById(v);
        return el && getComputedStyle(el).display !== 'none';
    });
    if (currentActiveView && currentActiveView !== id) {
        previousView = currentActiveView;
    }

    ['main-view', 'recipes-view', 'recipe-view'].forEach(v => {
        document.getElementById(v).style.display = (v === id) ? 'block' : 'none';
    });
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (typeof feather !== 'undefined') feather.replace();

    // Re-render lists when returning to dashboard or overview to show latest labels/titles
    if (id === 'recipes-view') {
        renderRecipesList();
    } else if (id === 'main-view') {
        updateRecentList();
    }
}

function showRecipeView(recipeOrId) {
    const id = (recipeOrId && typeof recipeOrId === 'object') ? recipeOrId.id : recipeOrId;
    const recipe = recipes[id] || recipeOrId;
    showView('recipe-view');
    loadRecipe(recipe);
}

// ============================================================
// INITIALIZATION
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    if (typeof feather !== 'undefined') feather.replace();

    loadRecipesFromFirebase();

    // Hub-Navigation
    document.getElementById('btn-scan')?.addEventListener('click', () => alert('Kassenzettel scannen steht erst in der Pro-Version zur Verfügung.'));
    document.getElementById('btn-new-recipe')?.addEventListener('click', createNewRecipe);

    document.getElementById('box-recipes')?.addEventListener('click', (e) => {
        if (!e.target.closest('#recipe-search') && !e.target.closest('#search-results')) showView('recipes-view');
    });

    document.getElementById('btn-back-home')?.addEventListener('click', () => {
        saveCurrentRecipeImmediately();
        showView('main-view');
    });
    document.getElementById('btn-back-from-recipe')?.addEventListener('click', () => {
        saveCurrentRecipeImmediately();
        showView(previousView);
    });

    window.addEventListener('pagehide', () => {
        saveCurrentRecipeImmediately();
    });
    window.addEventListener('beforeunload', () => {
        saveCurrentRecipeImmediately();
    });

    // Rezept-Detail Actions
    document.getElementById('btn-delete-recipe')?.addEventListener('click', () => {
        if (currentRecipe && currentRecipe.id) deleteRecipe(currentRecipe.id);
    });
    document.getElementById('btn-portion-settings')?.addEventListener('click', openPortionModal);
    document.getElementById('btn-close-portion-modal')?.addEventListener('click', closePortionModal);
    document.getElementById('btn-save-portions')?.addEventListener('click', saveManualPortions);

    document.getElementById('btn-close-ingredient-modal')?.addEventListener('click', closeIngredientModal);
    document.getElementById('btn-save-ingredient-detail')?.addEventListener('click', saveIngredientDetail);
    document.getElementById('btn-delete-ingredient-detail')?.addEventListener('click', () => {
        deleteIngredient(selectedIngredientIndex);
        closeIngredientModal();
    });

    // Preparation Editor Settings Toggle
    document.getElementById('btn-prep-settings')?.addEventListener('click', () => {
        const box = document.querySelector('.zubereitung-box');
        if (box) {
            const isEditing = box.classList.toggle('is-editing');
            if (sortablePrep) {
                sortablePrep.option('disabled', !isEditing);
            }
        }
    });

    // Preparation Editor
    document.getElementById('btn-add-step')?.addEventListener('click', addPrepStep);
    document.getElementById('btn-add-section')?.addEventListener('click', addPrepSection);

    // Ingredient Actions (New)
    document.getElementById('btn-add-ingredient-manual')?.addEventListener('click', addIngredient);

    // Ingredient Search & Barcode
    setupInlineIngredientSearch();
    setupLabelSearch();
    document.getElementById('btn-barcode-inline')?.addEventListener('click', () => {
        document.getElementById('barcode-modal').style.display = 'flex';
        startCameraScanner();
        setupIngredientSearch(); // Suche im Scanner-Modal
    });


    document.getElementById('btn-close-barcode-modal')?.addEventListener('click', () => {
        document.getElementById('barcode-modal').style.display = 'none';
        stopCameraScanner();
    });
    document.getElementById('btn-switch-camera')?.addEventListener('click', switchCamera);

    // Stepper
    document.getElementById('btn-portion-up')?.addEventListener('click', () => updatePortions(currentPortion + 1));
    document.getElementById('btn-portion-down')?.addEventListener('click', () => updatePortions(currentPortion - 1));

    document.getElementById('btn-bring')?.addEventListener('click', () => alert('🛒 Wird zur Bring!-Liste hinzugefügt…'));
});

function createNewRecipe() {
    const newRecipe = {
        id: 'new-' + Date.now(),
        titel: 'Neues Rezept',
        kurzbeschreibung: 'Gib eine kurze Beschreibung ein…',
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
}

function updatePortions(newPort) {
    currentPortion = Math.max(1, newPort);
    document.getElementById('rv-portionen').textContent = currentPortion;
    renderIngredients(currentRecipe.zutaten, currentPortion, basePortion);
    updateNutritionDisplay(currentRecipe); // Nährwerte skalieren automatisch im Display
}

// ============================================================
// FUZZY SEARCH UTILITIES FOR TYPO-TOLERANCE
// ============================================================
const COMMON_INGREDIENTS = [
    "Apfel", "Apfelmus", "Apfelsaft", "Banane", "Birne", "Erdbeeren", "Himbeeren", "Heidelbeeren", "Zitrone", "Orange",
    "Karotten", "Zwiebel", "Knoblauch", "Kartoffeln", "Tomaten", "Gurke", "Paprika", "Brokkoli", "Blumenkohl", "Spinat",
    "Zucchini", "Champignons", "Ingwer", "Erbsen", "Mais", "Salat", "Zucker", "Puderzucker", "Salz", "Pfeffer",
    "Olivenöl", "Rapsöl", "Sonnenblumenöl", "Butter", "Margarine", "Milch", "H-Milch", "Hafermilch", "Mandelmilch", "Sojamilch",
    "Sahne", "Schmand", "Saure Sahne", "Creme Fraiche", "Frischkäse", "Quark", "Magerquark", "Joghurt", "Naturjoghurt", "Griechischer Joghurt",
    "Käse", "Gouda", "Parmesan", "Mozzarella", "Feta", "Ei", "Eier", "Mehl", "Weizenmehl", "Dinkelmehl", "Vollkornmehl",
    "Haferflocken", "Zartblatt Haferflocken", "Reis", "Basmatireis", "Jasminreis", "Nudeln", "Spaghetti", "Penne", "Fusilli",
    "Tomatenmark", "Gehackte Tomaten", "Passierte Tomaten", "Gemüsebrühe", "Rinderbrühe", "Hühnerbrühe", "Senf", "Ketchup", "Mayonnaise",
    "Essig", "Balsamico", "Apfelessig", "Honig", "Ahornsirup", "Hefe", "Backpulver", "Vanillezucker", "Zimt", "Oregano",
    "Basilikum", "Petersilie", "Schnittlauch", "Thymian", "Rosmarin", "Kakaopulver", "Schokolade", "Mandeln", "Walnüsse",
    "Cashewkerne", "Erdnüsse", "Kichererbsen", "Linsen", "Rote Linsen", "Bohnen", "Kidneybohnen", "Tofu", "Hähnchenbrust",
    "Hackfleisch", "Gemischtes Hackfleisch", "Rinderhackfleisch", "Lachs", "Thunfisch", "Schinken", "Speck", "Salami"
];

function getUniqueIngredientsFromRecipes() {
    const list = new Set();
    if (typeof recipes === 'object' && recipes !== null) {
        Object.values(recipes).forEach(r => {
            if (r && r.zutaten && Array.isArray(r.zutaten)) {
                r.zutaten.forEach(z => {
                    if (z && z.name) list.add(z.name);
                });
            }
        });
    }
    return Array.from(list);
}

function getFuzzyMatchScore(s1, s2) {
    s1 = s1.toLowerCase().trim();
    s2 = s2.toLowerCase().trim();
    if (s1 === s2) return 1.0;
    
    // Substring bonus
    if (s1.includes(s2) || s2.includes(s1)) {
        return 0.8 + (Math.min(s1.length, s2.length) / Math.max(s1.length, s2.length)) * 0.19;
    }
    
    // Levenshtein
    const track = Array(s2.length + 1).fill(null).map(() => Array(s1.length + 1).fill(null));
    for (let i = 0; i <= s1.length; i += 1) track[0][i] = i;
    for (let j = 0; j <= s2.length; j += 1) track[j][0] = j;
    for (let j = 1; j <= s2.length; j += 1) {
        for (let i = 1; i <= s1.length; i += 1) {
            const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
            track[j][i] = Math.min(
                track[j][i - 1] + 1,
                track[j - 1][i] + 1,
                track[j - 1][i - 1] + indicator
            );
        }
    }
    const distance = track[s2.length][s1.length];
    const maxLength = Math.max(s1.length, s2.length);
    return 1.0 - (distance / maxLength);
}

function getFuzzyCandidates() {
    const list = new Set(COMMON_INGREDIENTS);
    getUniqueIngredientsFromRecipes().forEach(name => list.add(name));
    
    return Array.from(list).map(name => {
        return {
            product_name: name,
            brands: "",
            barcode: "manual-" + encodeURIComponent(name.toLowerCase()),
            'energy-kcal_100g': null
        };
    });
}

function setupInlineIngredientSearch() {
    const input = document.getElementById('inline-ingredient-search');
    const resultsEl = document.getElementById('inline-search-results');
    if (!input || !resultsEl) return;

    const doSearch = debounce(async (rawQuery) => {
        if (rawQuery.length < 2) { resultsEl.style.display = 'none'; return; }

        const cacheKey = rawQuery.toLowerCase();
        if (ingredientSearchCache[cacheKey]) {
            renderInlineResults(ingredientSearchCache[cacheKey], resultsEl);
            return;
        }

        try {
            // 1. Hole lokale Kandidaten
            const candidates = getFuzzyCandidates();

            // 2. Hole Firebase-Kandidaten per Präfix der ersten 3 Zeichen
            const prefixLen = Math.min(3, rawQuery.length);
            const prefix = rawQuery.slice(0, prefixLen).toLowerCase().replace(/[.#$[\]/]/g, '_');
            const end = prefix + '\uf8ff';
            const url = `${FIREBASE_URL}/name_index.json?orderBy="%24key"&startAt=${encodeURIComponent(JSON.stringify(prefix))}&endAt=${encodeURIComponent(JSON.stringify(end))}&limitToFirst=60`;
            
            let fbItems = [];
            try {
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    if (data) {
                        fbItems = Object.values(data);
                    }
                }
            } catch (err) {
                console.warn("Firebase-Präfixsuche fehlgeschlagen:", err);
            }

            // 3. Zusammenführen und Duplikate filtern
            const merged = [...fbItems];
            const seenNames = new Set(fbItems.map(item => (item.product_name || '').toLowerCase().trim()));
            
            candidates.forEach(cand => {
                const candName = cand.product_name.toLowerCase().trim();
                if (!seenNames.has(candName)) {
                    merged.push(cand);
                    seenNames.add(candName);
                }
            });

            // 4. Ähnlichkeit berechnen und sortieren
            const scored = merged.map(item => {
                const name = item.product_name || '';
                const score = getFuzzyMatchScore(name, rawQuery);
                return { item, score };
            });

            // Filter auf vernünftige Übereinstimmung (Score >= 0.35)
            const filtered = scored.filter(entry => entry.score >= 0.35);

            // Sortieren nach Score absteigend
            filtered.sort((a, b) => b.score - a.score);

            // Nimm die Top 8 Ergebnisse
            const finalItems = filtered.slice(0, 8).map(entry => entry.item);

            ingredientSearchCache[cacheKey] = finalItems;
            renderInlineResults(finalItems, resultsEl);
        } catch (err) { 
            console.error("Fuzzy-Zutatensuche Fehler:", err); 
        }
    }, 250);

    input.addEventListener('input', (e) => doSearch(e.target.value.trim()));
    document.addEventListener('click', (e) => { if (!input.contains(e.target)) resultsEl.style.display = 'none'; });
}

function renderInlineResults(items, resultsEl) {
    resultsEl.innerHTML = '';

    // Bestehende Treffer anzeigen
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'ingredient-dropdown-item';
        div.innerHTML = `<span class="ingredient-dropdown-name">${item.product_name || '?'}</span> <span class="ingredient-dropdown-brand">${item.brands || ''}</span>`;
        div.addEventListener('click', () => {
            resultsEl.style.display = 'none';
            document.getElementById('inline-ingredient-search').value = '';
            addIngredientFromData(item.barcode, item);
        });
        resultsEl.appendChild(div);
    });

    // Immer die Option "Manuell hinzufügen" am Ende anzeigen
    const manualDiv = document.createElement('div');
    manualDiv.className = 'ingredient-dropdown-item manual-add-option';
    manualDiv.style.borderTop = '1px solid #f1f5f9';
    manualDiv.style.color = 'var(--accent-blue)';
    manualDiv.style.fontWeight = '700';
    manualDiv.innerHTML = `<i data-feather="plus-circle" style="width:14px;height:14px;margin-right:6px;vertical-align:middle;"></i> hinzufügen`;
    manualDiv.addEventListener('click', () => {
        resultsEl.style.display = 'none';
        document.getElementById('inline-ingredient-search').value = '';
        addIngredient();
    });
    resultsEl.appendChild(manualDiv);

    if (typeof feather !== 'undefined') feather.replace();
    resultsEl.style.display = 'block';
}


// ============================================================
// STANDALONE PRODUKT-TEXTSUCHE (/name_index, $key-Ordering)
// Kein Firebase-Index in den Regeln nötig!
// ============================================================
function setupStandaloneSearch() {
    const input = document.getElementById('standalone-search-input');
    const resultsEl = document.getElementById('standalone-search-results');
    const spinner = document.getElementById('search-modal-spinner');
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
            const q = rawQuery.toLowerCase().replace(/[.#$[\]/]/g, '_');
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
        const div = document.createElement('div');
        div.className = 'ingredient-dropdown-item';
        const brand = item.brands ? `<span class="ingredient-dropdown-brand">${item.brands}</span>` : '';
        const kcal = item['energy-kcal_100g'] != null
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

// ============================================================
// RECIPE DELETION
// ============================================================
async function deleteRecipe(recipeId) {
    if (!confirm("Bist du dir sicher, dass du das Rezept löschen willst?")) return;

    try {
        delete recipes[recipeId];
        localStorage.setItem('recipes_cache', JSON.stringify(recipes));

        const response = await fetch(`${FIREBASE_URL}/recipes/${recipeId}.json`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error("Fehler beim Löschen");

        showToast("Gelöscht", "Rezept wurde gelöscht.", false);
        showView('recipes-view');
        renderRecipesList();
    } catch (error) {
        console.error("Lösch-Fehler:", error);
        showToast("Fehler", "Rezept konnte nicht gelöscht werden.", true);
    }
}

// ============================================================
// RECIPE LABELS
// ============================================================
function renderLabels(labels) {
    const container = document.getElementById('rv-labels-list');
    if (!container) return;
    container.innerHTML = '';

    if (!currentRecipe.labels) currentRecipe.labels = [];

    labels.forEach((label) => {
        const chip = document.createElement('div');
        chip.className = 'label-chip';
        chip.innerHTML = `
            ${label}
            <span class="remove-label" onclick="removeLabelFromRecipe('${label}')" title="Label entfernen">
                <i data-feather="x"></i>
            </span>
        `;
        container.appendChild(chip);
    });
    if (typeof feather !== 'undefined') feather.replace();
}

async function addLabelToRecipe(labelName) {
    if (!labelName) return;
    const cleanLabel = labelName.trim();
    if (!cleanLabel) return;

    if (!currentRecipe.labels) currentRecipe.labels = [];
    if (!currentRecipe.labels.includes(cleanLabel)) {
        currentRecipe.labels.push(cleanLabel);
        renderLabels(currentRecipe.labels);
        saveCurrentRecipeImmediately();

        if (!allLabels.includes(cleanLabel)) {
            allLabels.push(cleanLabel);
            localStorage.setItem('global_labels', JSON.stringify(allLabels));
            // Save to Firebase globally
            const key = cleanLabel.replace(/[.#$[\]/]/g, '_');
            fetch(`${FIREBASE_URL}/labels/${encodeURIComponent(key)}.json`, {
                method: 'PUT',
                body: JSON.stringify(cleanLabel)
            }).catch(e => console.error("Fehler beim Speichern des globalen Labels", e));
        }
    }
}

function removeLabelFromRecipe(labelName) {
    if (!currentRecipe || !currentRecipe.labels) return;
    currentRecipe.labels = currentRecipe.labels.filter(l => l !== labelName);
    renderLabels(currentRecipe.labels);
    saveCurrentRecipeImmediately();
}

function setupLabelSearch() {
    const input = document.getElementById('label-search-input');
    const resultsEl = document.getElementById('label-search-results');
    if (!input || !resultsEl) return;

    input.addEventListener('input', (e) => {
        const val = e.target.value.trim().toLowerCase();
        if (val.length < 1) {
            resultsEl.style.display = 'none';
            return;
        }

        resultsEl.innerHTML = '';
        const matches = allLabels.filter(l => l.toLowerCase().includes(val));

        matches.forEach(item => {
            const div = document.createElement('div');
            div.className = 'ingredient-dropdown-item';
            div.innerHTML = `<span class="ingredient-dropdown-name">${item}</span>`;
            div.addEventListener('click', () => {
                resultsEl.style.display = 'none';
                input.value = '';
                addLabelToRecipe(item);
            });
            resultsEl.appendChild(div);
        });

        // Neu hinzufügen Option
        const exactMatch = allLabels.find(l => l.toLowerCase() === val);
        if (!exactMatch) {
            const manualDiv = document.createElement('div');
            manualDiv.className = 'ingredient-dropdown-item manual-add-option';
            manualDiv.style.borderTop = '1px solid #f1f5f9';
            manualDiv.style.color = 'var(--accent-blue)';
            manualDiv.style.fontWeight = '700';
            manualDiv.innerHTML = `<i data-feather="plus-circle" style="width:14px;height:14px;margin-right:6px;vertical-align:middle;"></i> hinzufügen`;
            manualDiv.addEventListener('click', () => {
                resultsEl.style.display = 'none';
                const newLabelValue = input.value.trim();
                input.value = '';
                addLabelToRecipe(newLabelValue);
            });
            resultsEl.appendChild(manualDiv);
        }

        if (typeof feather !== 'undefined') feather.replace();
        resultsEl.style.display = 'block';
    });

    // Hide dropdown on blur/outside click
    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !resultsEl.contains(e.target)) {
            resultsEl.style.display = 'none';
        }
    });
}
