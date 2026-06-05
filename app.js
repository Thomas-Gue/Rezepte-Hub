// ============================================================
// FIREBASE CONFIGURATION & CONSTANTS
// ============================================================
const FIREBASE_URL = "https://rezepte-hub-default-rtdb.europe-west1.firebasedatabase.app";

// Default-Rezepte (werden in Firebase hochgeladen, falls die DB leer ist)
const DEFAULT_RECIPES = {};

// ============================================================
// STATE
// ============================================================
let recipes = {}; // Geladen von Cache / Firebase / Fallback
let currentRecipe = null;
let allLabels = [];
let activeLabelFilters = new Set();
let labelsEditingMode = false;
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

    // Bereinige vorgerfertigte Standardrezepte falls vorhanden
    const defaultIds = ["carbonara-001", "linsendal-002", "avocadotoast-003", "pilzrisotto-004"];
    let cleanedAny = false;
    defaultIds.forEach(id => {
        if (recipes[id]) {
            delete recipes[id];
            cleanedAny = true;
            // Aus Firebase löschen
            fetch(`${FIREBASE_URL}/recipes/${id}.json`, { method: 'DELETE' })
                .catch(err => console.warn("Fehler beim Löschen des Standardrezepts:", err));
        }
    });
    if (cleanedAny) {
        localStorage.setItem('recipes_cache', JSON.stringify(recipes));
        renderRecipesList();
        updateRecentList();
        setupSearch();
    }

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

        // Bereinige Standardrezepte aus Firebase-Antwort
        defaultIds.forEach(id => {
            if (data[id]) {
                delete data[id];
                // Synchron aus Firebase entfernen
                fetch(`${FIREBASE_URL}/recipes/${id}.json`, { method: 'DELETE' }).catch(e => {});
            }
        });

        // RECONCILIATION: Wenn der lokale Cache Änderungen hat, die nicht auf Firebase sind,
        // behalten wir die lokale Version und synchronisieren sie zurück zu Firebase.
        let mergedRecipes = { ...data };
        let hasLocalEditsToSync = false;

        if (recipes) {
            Object.keys(recipes).forEach(id => {
                const localRec = recipes[id];
                const fbRec = data[id];

                if (!fbRec) {
                    // Rezept existiert lokal, aber nicht auf Firebase (z.B. neu erstellt während offline)
                    mergedRecipes[id] = localRec;
                    hasLocalEditsToSync = true;
                    saveRecipeToFirebase(localRec);
                } else {
                    // Rezept existiert an beiden Stellen. Vergleiche den Inhalt.
                    const localStr = JSON.stringify(localRec);
                    const fbStr = JSON.stringify(fbRec);
                    if (localStr !== fbStr) {
                        // Wenn der Benutzer das Rezept gerade aktiv bearbeitet, behalten wir es bei
                        if (currentRecipe && currentRecipe.id === id) {
                            localRec.beschreibung = currentRecipe.beschreibung || localRec.beschreibung;
                            localRec.titel = currentRecipe.titel || localRec.titel;
                        }
                        
                        console.log(`Lokale Änderung für Rezept ${id} erkannt. Synchronisiere zu Firebase...`);
                        mergedRecipes[id] = localRec;
                        hasLocalEditsToSync = true;
                        saveRecipeToFirebase(localRec);
                    }
                }
            });
        }

        // Vergleiche eingehende Daten mit dem Cache, um Flackern zu verhindern
        const cachedStr = localStorage.getItem('recipes_cache');
        const incomingStr = JSON.stringify(mergedRecipes);

        if (cachedStr !== incomingStr || hasLocalEditsToSync) {
            console.log("Datenbestand aktualisiert. UI wird flüssig geupdatet...");

            if (currentRecipe && currentRecipe.id && mergedRecipes[currentRecipe.id]) {
                mergedRecipes[currentRecipe.id] = currentRecipe;
            }

            recipes = mergedRecipes;

            // Sicherstellen, dass Standardrezepte immer die schönen Labels haben
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

function formatDuration(minutes) {
    if (minutes === undefined || minutes === null || isNaN(minutes) || minutes <= 0) return '—';
    const min = parseInt(minutes);
    if (min < 60) {
        return `${min}min`;
    } else {
        const h = Math.floor(min / 60);
        const m = min % 60;
        if (m === 0) {
            return `${h}h`;
        }
        return `${h}h ${m}min`;
    }
}

// ============================================================
// NUTRI-SCORE CALCULATION & HELPER
// ============================================================
const NUTRI_COLORS = { A: 'nutri-seg-a', B: 'nutri-seg-b', C: 'nutri-seg-c', D: 'nutri-seg-d', E: 'nutri-seg-e' };
const NUTRI_ORDER = ['A', 'B', 'C', 'D', 'E'];

function scoreToLetter(score) {
    if (score === null || score === undefined || score === '' || isNaN(score)) return null;
    const num = parseFloat(score);
    if (num <= -1) return 'A';
    if (num <= 2) return 'B';
    if (num <= 10) return 'C';
    if (num <= 18) return 'D';
    return 'E';
}

function letterToNutriScoreValue(letter) {
    if (!letter) return null;
    const l = letter.trim().toUpperCase();
    if (l === 'A') return 1;
    if (l === 'B') return 2;
    if (l === 'C') return 3;
    if (l === 'D') return 4;
    if (l === 'E') return 5;
    return null;
}

function nutriScoreValueToLetter(value) {
    const v = Math.round(value);
    if (v === 1) return 'A';
    if (v === 2) return 'B';
    if (v === 3) return 'C';
    if (v === 4) return 'D';
    if (v === 5) return 'E';
    return null;
}

function applyNutriScore(score) {
    const scaleEl = document.getElementById('rv-nutriscore');
    if (!scaleEl) return;
    const upper = score ? score.trim().toUpperCase() : '';
    const isValid = ['A', 'B', 'C', 'D', 'E'].includes(upper);
    scaleEl.dataset.score = isValid ? upper : '';
    scaleEl.querySelectorAll('.nutri-seg').forEach(seg => {
        seg.classList.toggle('active', isValid && seg.dataset.letter === upper);
    });
}

// ============================================================
// NUTRITION PER PORTION CALCULATOR (NEW)
// ============================================================
function getNutritionPerPortion(recipe) {
    const portionen = Math.max(1, recipe.portionen || 1);
    const zutaten = recipe.zutaten || [];
    const nw = recipe.naehrwerte || {};

    const keys = [
        'energy-kcal', 'fat', 'saturated-fat', 'carbohydrates', 
        'sugars', 'fiber', 'proteins', 'salt'
    ];

    const sums = {};
    const hasData = {};
    keys.forEach(k => {
        sums[k] = 0;
        hasData[k] = false;
    });

    let totalWeight = 0;
    let hasAnyIngredientData = false;

    zutaten.forEach(z => {
        const grams = convertIngredientToGrams(z.menge, z.einheit, z.stkInGrams);
        if (grams > 0) {
            totalWeight += grams;
            if (z.naehrwerte) {
                keys.forEach(k => {
                    const key100g = k === 'energy-kcal' ? 'energy-kcal_100g' : (k + '_100g');
                    const val100g = z.naehrwerte[key100g];
                    if (val100g !== undefined && val100g !== null && !isNaN(val100g)) {
                        sums[k] += (val100g * grams) / 100;
                        hasData[k] = true;
                        hasAnyIngredientData = true;
                    }
                });
            }
        }
    });

    const result = {};
    const round1 = v => Math.round(v * 10) / 10;

    keys.forEach(k => {
        const key100g = k === 'energy-kcal' ? 'energy-kcal_100g' : (k + '_100g');
        
        if (hasAnyIngredientData) {
            // Calculate directly from ingredients (assess each parameter individually)
            if (hasData[k]) {
                const perPortion = sums[k] / portionen;
                result[k] = k === 'energy-kcal' ? Math.round(perPortion) : round1(perPortion);
            } else {
                result[k] = null;
            }
        } else {
            // Fallback: Calculate from recipe-level naehrwerte using total recipe weight (converting all units!)
            if (nw[key100g] !== undefined && nw[key100g] !== null && !isNaN(nw[key100g])) {
                if (totalWeight === 0) {
                    // Fallback if no weight can be calculated
                    result[k] = nw[key100g];
                } else {
                    const gramsPerPortion = totalWeight / portionen;
                    const perPortion = (nw[key100g] * gramsPerPortion) / 100;
                    result[k] = k === 'energy-kcal' ? Math.round(perPortion) : round1(perPortion);
                }
            } else {
                result[k] = null;
            }
        }
    });

    return result;
}

function updateNutritionDisplay(recipe) {
    const per = getNutritionPerPortion(recipe);
    const fmt = v => (v !== null && v !== undefined) ? v : '—';

    const energyVal = fmt(per['energy-kcal']);
    document.getElementById('nw-energy-kcal').textContent = energyVal;

    const kcalEl = document.getElementById('rv-kalorien');
    if (kcalEl) {
        kcalEl.textContent = energyVal;
    }

    if (per['energy-kcal'] !== null && per['energy-kcal'] !== undefined) {
        recipe.kalorien = per['energy-kcal'];
    }

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
    if (!recipe.zutaten || recipe.zutaten.length === 0) {
        recipe.naehrwerte = null;
        recipe.kalorien = 0;
        recipe.nutriScore = null;
        return;
    }

    let hasBarcodedIngredients = false;

    // Initialisiere Nährwert-Schnittsummen (absolute Mengen)
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

    // Tracken des Gewichts pro Nährwert zur Vermeidung von Verwässerung
    const weightForNutrient = {};
    for (const key in totalNutrients) {
        weightForNutrient[key] = 0;
    }

    let weightedScoreSum = 0;
    let scoreWeightTotal = 0;

    recipe.zutaten.forEach(z => {
        const grams = convertIngredientToGrams(z.menge, z.einheit, z.stkInGrams);

        if (z.naehrwerte && grams > 0) {
            for (const key in totalNutrients) {
                if (z.naehrwerte[key] !== undefined && z.naehrwerte[key] !== null && !isNaN(z.naehrwerte[key])) {
                    hasBarcodedIngredients = true;
                    totalNutrients[key] += z.naehrwerte[key] * (grams / 100);
                    weightForNutrient[key] += grams;
                }
            }
        }

        // Nutri-Score: Zutat muss mindestens 30g wiegen
        if (grams >= 30 && z.nutriscore_score !== undefined && z.nutriscore_score !== null) {
            const letter = scoreToLetter(z.nutriscore_score);
            const val = letterToNutriScoreValue(letter);
            if (val !== null) {
                weightedScoreSum += val * grams;
                scoreWeightTotal += grams;
            }
        }
    });

    if (hasBarcodedIngredients) {
        // Berechne Nährwert pro 100g des fertigen Rezepts
        recipe.naehrwerte = {};
        for (const key in totalNutrients) {
            const w = weightForNutrient[key];
            if (w > 0) {
                recipe.naehrwerte[key] = Math.round((totalNutrients[key] / (w / 100)) * 10) / 10;
            } else {
                recipe.naehrwerte[key] = 0;
            }
        }

        // Verwende getNutritionPerPortion zur konsistenten Kcal-Berechnung!
        const perPortion = getNutritionPerPortion(recipe);
        if (perPortion['energy-kcal'] !== null && perPortion['energy-kcal'] !== undefined) {
            recipe.kalorien = perPortion['energy-kcal'];
            const kcalEl = document.getElementById('rv-kalorien');
            if (kcalEl) {
                kcalEl.textContent = recipe.kalorien;
            }
        }
    }

    // Berechne gewichteten Nutri-Score (auch unabhängig von Barcoded-Ingredients, da nun rein manuell/buchstabenbasiert)
    if (scoreWeightTotal > 0) {
        const avgScore = weightedScoreSum / scoreWeightTotal;
        recipe.nutriScore = nutriScoreValueToLetter(avgScore);
    } else {
        recipe.nutriScore = null;
    }
}

function recalculateRecipeCost(recipe) {
    if (!recipe.zutaten || recipe.zutaten.length === 0) {
        recipe.kosten = 0;
        const costEl = document.getElementById('rv-kosten');
        if (costEl) {
            costEl.textContent = '0.00';
        }
        return;
    }
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
            const portionen = Math.max(1, recipe.portionen || 1);
            costEl.textContent = (recipe.kosten / portionen).toFixed(2);
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
                <p class="step-content" contenteditable="true" data-placeholder="Schritt beschreiben...">${item.text}</p>
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
    if (!list) return;
    let md = '';
    
    // Verwende .children statt .childNodes, um Textknoten/Leerzeichen zu ignorieren
    Array.from(list.children).forEach(node => {
        if (!node || typeof node.querySelector !== 'function') return;
        
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
    
    if (currentRecipe) {
        currentRecipe.beschreibung = md.trim();
    }
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

        li.dataset.index = index;
        if (z.barcode) li.dataset.barcode = z.barcode;
        if (z.naehrwerte) li.dataset.naehrwerte = JSON.stringify(z.naehrwerte);
        if (z.stkInGrams) li.dataset.stkInGrams = z.stkInGrams;
        if (z.preisProKg) li.dataset.preisProKg = z.preisProKg;
        if (z.product_quantity) li.dataset.productQuantity = z.product_quantity;
        if (z.brands) li.dataset.brands = z.brands;

        // Dynamischer Dropdown-Generator für Einheiten (streng ohne Fallback)
        const fixedUnits = ["g", "ml", "cl", "Stk.", "TL", "EL"];
        let selectOptionsHtml = '';
        fixedUnits.forEach(u => {
            selectOptionsHtml += `<option value="${u}" ${z.einheit === u ? 'selected' : ''}>${u}</option>`;
        });

        const baseGrams = convertIngredientToGrams(z.menge, z.einheit, z.stkInGrams);
        const hasKcal = z.naehrwerte && z.naehrwerte['energy-kcal_100g'] !== undefined && z.naehrwerte['energy-kcal_100g'] !== null && z.naehrwerte['energy-kcal_100g'] > 0;
        const hasQty = z.product_quantity !== undefined && z.product_quantity !== null && z.product_quantity > 0;
        const hasPrice = z.preisProKg !== undefined && z.preisProKg !== null && z.preisProKg > 0;
        const letter = scoreToLetter(z.nutriscore_score);
        const hasNutri = (baseGrams < 30) || (letter !== null && ['A', 'B', 'C', 'D', 'E'].includes(letter));
        const isMissingInfo = !hasKcal || !hasQty || !hasPrice || !hasNutri;

        const asteriskHtml = isMissingInfo 
            ? `<span class="ingredient-missing-asterisk" style="color: #cbd5e1; margin-left: 4px; font-weight: bold; cursor: help;" title="Unvollständige Daten (Kcal, Menge, Preis oder Nutri-Score fehlt)">*</span>`
            : '';

        li.innerHTML = `
            <span class="zutat-drag-handle"><i data-feather="menu"></i></span>
            <span class="zutat-menge" contenteditable="true" data-base="${z.menge}" onclick="event.stopPropagation()">${scaledMenge}</span>
            <select class="zutat-einheit-select" onclick="event.stopPropagation()">
                ${selectOptionsHtml}
            </select>
            <span class="zutat-name-wrapper">
                <span class="zutat-name" contenteditable="true" onclick="event.stopPropagation()">${z.name}</span>${asteriskHtml}
            </span>
            <button class="zutat-delete-btn" title="Zutat entfernen" onclick="event.stopPropagation(); deleteIngredient(${index})"><i data-feather="x"></i></button>
        `;
        list.appendChild(li);

        // Klick auf Verschiebe-Button öffnet Details im Bearbeitungsmodus
        const dragHandle = li.querySelector('.zutat-drag-handle');
        if (dragHandle) {
            dragHandle.onclick = (e) => {
                e.stopPropagation();
                const box = document.querySelector('.zutaten-box');
                if (box && box.classList.contains('is-editing')) {
                    openIngredientModal(index);
                }
            };
        }

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
        const box = document.querySelector('.zutaten-box');
        const isEditing = box && box.classList.contains('is-editing');
        sortableIngredients = new Sortable(list, {
            handle: '.zutat-drag-handle',
            animation: 150,
            ghostClass: 'sortable-ghost',
            disabled: !isEditing,
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

        // Erhalte das bestehende stkInGrams, preisProKg, product_quantity und brands falls vorhanden
        const indexStr = li.dataset.index || '';
        const idx = parseInt(indexStr);
        let existingStkGrams = null;
        let existingPreisProKg = null;
        let existingProductQuantity = null;
        let existingBrands = null;
        let existingNutriscoreScore = null;
        if (!isNaN(idx) && currentRecipe.zutaten[idx]) {
            existingStkGrams = currentRecipe.zutaten[idx].stkInGrams;
            existingPreisProKg = currentRecipe.zutaten[idx].preisProKg;
            existingProductQuantity = currentRecipe.zutaten[idx].product_quantity;
            existingBrands = currentRecipe.zutaten[idx].brands;
            existingNutriscoreScore = currentRecipe.zutaten[idx].nutriscore_score;
        }

        const domMenge = parseFloat(li.querySelector('.zutat-menge').textContent) || 0;
        const baseMenge = (currentPortion > 0 && basePortion > 0)
            ? (domMenge * basePortion / currentPortion)
            : domMenge;

        return {
            menge: Math.round(baseMenge * 100) / 100,
            einheit: unit,
            name: li.querySelector('.zutat-name').textContent.trim(),
            barcode: li.dataset.barcode || null,
            naehrwerte: li.dataset.naehrwerte ? JSON.parse(li.dataset.naehrwerte) : null,
            stkInGrams: existingStkGrams || parseFloat(li.dataset.stkInGrams) || null,
            preisProKg: existingPreisProKg || parseFloat(li.dataset.preisProKg) || null,
            product_quantity: existingProductQuantity || parseFloat(li.dataset.productQuantity) || null,
            brands: existingBrands || li.dataset.brands || null,
            nutriscore_score: existingNutriscoreScore !== undefined && existingNutriscoreScore !== null ? existingNutriscoreScore : null
        };
    });
}


// ============================================================
// LOAD RECIPE INTO DETAIL VIEW
// ============================================================
function loadRecipe(recipe) {
    currentRecipe = JSON.parse(JSON.stringify(recipe));
    
    // Robuste Ausfallmechanismen für Portionen
    basePortion = recipe.portionen || 2;
    currentPortion = recipe.portionen || 2;
    currentRecipe.portionen = currentPortion;

    // Robuste Ausfallmechanismen für alle Felder
    currentRecipe.titel = recipe.titel || '';
    currentRecipe.kurzbeschreibung = recipe.kurzbeschreibung || '';
    currentRecipe.kalorien = recipe.kalorien || 0;
    currentRecipe.kosten = recipe.kosten || 0;
    currentRecipe.dauer = recipe.dauer || 0;
    currentRecipe.nutriScore = recipe.nutriScore || null;
    currentRecipe.zutaten = recipe.zutaten || [];
    currentRecipe.naehrwerte = recipe.naehrwerte || null;
    currentRecipe.beschreibung = recipe.beschreibung !== undefined && recipe.beschreibung !== null ? recipe.beschreibung : '';
    currentRecipe.labels = recipe.labels || [];

    // Ensure all loaded ingredients have nutriscore_score resolved and clean up deprecated fields
    if (currentRecipe.zutaten) {
        currentRecipe.zutaten.forEach(z => {
            if (z.nutriscore_score === undefined || z.nutriscore_score === null) {
                const letter = z.nutriScoreLetter || 
                               z.nutriscore_grade || 
                               (z.nutriScoreValue !== undefined && z.nutriScoreValue !== null ? scoreToLetter(z.nutriScoreValue) : null);
                if (letter) {
                    const upper = letter.toUpperCase();
                    z.nutriscore_score = upper === 'A' ? -5 : (upper === 'B' ? 0 : (upper === 'C' ? 5 : (upper === 'D' ? 15 : (upper === 'E' ? 25 : null))));
                } else {
                    z.nutriscore_score = null;
                }
            }
            // Entferne redundante Alt-Felder aus dem Speicherobjekt
            delete z.nutriScoreLetter;
            delete z.nutriScoreValue;
            delete z.nutriscore_grade;
        });
    }

    document.getElementById('rv-titel').textContent = currentRecipe.titel;
    document.getElementById('rv-kurzbeschreibung').textContent = currentRecipe.kurzbeschreibung;
    document.getElementById('rv-kalorien').textContent = currentRecipe.kalorien;
    const portionen = Math.max(1, currentRecipe.portionen || 1);
    document.getElementById('rv-kosten').textContent = (currentRecipe.kosten / portionen).toFixed(2);
    document.getElementById('rv-dauer').textContent = formatDuration(currentRecipe.dauer);
    document.getElementById('rv-portionen').textContent = currentPortion;
    applyNutriScore(currentRecipe.nutriScore);

    updateNutritionDisplay(currentRecipe);
    renderIngredients(currentRecipe.zutaten, currentPortion, basePortion);
    renderPreparationEditor(currentRecipe);
    renderLabels(currentRecipe.labels);

    // Event Listener für Always-Editable Felder
    ['rv-titel', 'rv-kurzbeschreibung'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.oninput = () => triggerAutosave();
        }
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
    
    const titelEl = document.getElementById('rv-titel');
    const descEl = document.getElementById('rv-kurzbeschreibung');
    const kcalEl = document.getElementById('rv-kalorien');
    const dauerEl = document.getElementById('rv-dauer');
    const nutriEl = document.getElementById('rv-nutriscore');

    currentRecipe.titel = titelEl ? titelEl.textContent.trim() : (currentRecipe.titel || '');
    currentRecipe.kurzbeschreibung = descEl ? descEl.textContent.trim() : (currentRecipe.kurzbeschreibung || '');
    currentRecipe.kalorien = kcalEl ? (parseFloat(kcalEl.textContent) || 0) : (currentRecipe.kalorien || 0);
    currentRecipe.dauer = currentRecipe.dauer || 0;

    // Nutri-Score aus DOM zurücklesen (data-score Attribut)
    if (nutriEl && nutriEl.dataset.score) {
        currentRecipe.nutriScore = nutriEl.dataset.score;
    }

    syncIngredientsFromDOM();
    syncPreparationToMarkdown();

    // Nährwerte neu kalkulieren
    recalculateRecipeNutrition(currentRecipe);
    recalculateRecipeCost(currentRecipe);
    updateNutritionDisplay(currentRecipe);

    // Nutri-Score UI aktualisieren (nach Neuberechnung)
    applyNutriScore(currentRecipe.nutriScore);
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

    recalculateRecipeCost(currentRecipe); // Re-calculate cost & update Cost/Portion badge
    updateNutritionDisplay(currentRecipe);
    renderIngredients(currentRecipe.zutaten, currentPortion, basePortion);

    closePortionModal();
    saveRecipeToFirebase(currentRecipe);
}

// ============================================================
// DURATION SETTINGS MODAL
// ============================================================
function openDurationModal() {
    const totalMinutes = currentRecipe.dauer || 0;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    document.getElementById('manual-duration-hours').value = hours > 0 ? hours : '';
    document.getElementById('manual-duration-minutes').value = minutes > 0 ? minutes : '';
    document.getElementById('duration-settings-modal').style.display = 'flex';
}

function closeDurationModal() {
    document.getElementById('duration-settings-modal').style.display = 'none';
}

function saveManualDuration() {
    const hours = parseInt(document.getElementById('manual-duration-hours').value) || 0;
    const minutes = parseInt(document.getElementById('manual-duration-minutes').value) || 0;
    
    const totalMinutes = (hours * 60) + minutes;
    currentRecipe.dauer = totalMinutes;
    
    const dauerEl = document.getElementById('rv-dauer');
    if (dauerEl) {
        dauerEl.textContent = formatDuration(totalMinutes);
    }
    
    closeDurationModal();
    saveCurrentRecipeImmediately();
}

// ============================================================
// INGREDIENT DETAIL MODAL
// ============================================================
function openIngredientModal(index) {
    selectedIngredientIndex = index;
    const z = currentRecipe.zutaten[index];
    document.getElementById('modal-ingredient-name').textContent = z.name;
    document.getElementById('mi-barcode').value = z.barcode || '';
    document.getElementById('mi-nutriscore').value = scoreToLetter(z.nutriscore_score) || '';

    const nw = z.naehrwerte || {};
    document.getElementById('mi-kcal').value = nw['energy-kcal_100g'] || 0;
    document.getElementById('mi-proteins').value = nw['proteins_100g'] || 0;
    document.getElementById('mi-fat').value = nw['fat_100g'] || 0;
    document.getElementById('mi-carbs').value = nw['carbohydrates_100g'] || 0;
    document.getElementById('mi-saturated-fat').value = nw['saturated-fat_100g'] || 0;
    document.getElementById('mi-sugars').value = nw['sugars_100g'] || 0;
    document.getElementById('mi-fiber').value = nw['fiber_100g'] || 0;
    document.getElementById('mi-salt').value = nw['salt_100g'] || 0;
    const qty = parseFloat(z.product_quantity) || 0;
    document.getElementById('mi-product-quantity').value = qty || '';

    const convQty = qty > 0 ? qty : 1000;
    const packagePrice = (z.preisProKg || 0) * (convQty / 1000);
    document.getElementById('mi-preis').value = packagePrice ? packagePrice.toFixed(2) : '0';

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

    const barcodeVal = document.getElementById('mi-barcode').value.trim();
    z.barcode = barcodeVal ? barcodeVal.replace(/[\.\#\$\[\]\/]/g, '_') : null;

    const nutriVal = document.getElementById('mi-nutriscore').value.trim().toUpperCase();
    z.nutriscore_score = ['A', 'B', 'C', 'D', 'E'].includes(nutriVal)
        ? (nutriVal === 'A' ? -5 : (nutriVal === 'B' ? 0 : (nutriVal === 'C' ? 5 : (nutriVal === 'D' ? 15 : 25))))
        : null;

    z.naehrwerte['energy-kcal_100g'] = parseFloat(document.getElementById('mi-kcal').value) || 0;
    z.naehrwerte['proteins_100g'] = parseFloat(document.getElementById('mi-proteins').value) || 0;
    z.naehrwerte['fat_100g'] = parseFloat(document.getElementById('mi-fat').value) || 0;
    z.naehrwerte['carbohydrates_100g'] = parseFloat(document.getElementById('mi-carbs').value) || 0;
    z.naehrwerte['saturated-fat_100g'] = parseFloat(document.getElementById('mi-saturated-fat').value) || 0;
    z.naehrwerte['sugars_100g'] = parseFloat(document.getElementById('mi-sugars').value) || 0;
    z.naehrwerte['fiber_100g'] = parseFloat(document.getElementById('mi-fiber').value) || 0;
    z.naehrwerte['salt_100g'] = parseFloat(document.getElementById('mi-salt').value) || 0;

    const qty = parseFloat(document.getElementById('mi-product-quantity').value) || 0;
    z.product_quantity = qty > 0 ? qty : null;

    const packagePrice = parseFloat(document.getElementById('mi-preis').value) || 0;
    const convQty = qty > 0 ? qty : 1000;
    z.preisProKg = (packagePrice / convQty) * 1000;

    const stkInput = document.getElementById('mi-stk-grams');
    if (stkInput && z.einheit === 'Stk.') {
        z.stkInGrams = parseFloat(stkInput.value) || 100;
    }

    closeIngredientModal();
    recalculateRecipeNutrition(currentRecipe);
    recalculateRecipeCost(currentRecipe);
    updateNutritionDisplay(currentRecipe);
    renderIngredients(currentRecipe.zutaten, currentPortion, basePortion);

    // Selbstlernende Datenbank: Manuell eingetragene Barcodes global in Firebase registrieren
    if (z.barcode && !z.barcode.startsWith('manual-')) {
        const globalProductData = {
            product_name: z.name,
            brands: z.brands || '',
            'energy-kcal_100g': z.naehrwerte['energy-kcal_100g'] || 0,
            'proteins_100g': z.naehrwerte['proteins_100g'] || 0,
            'fat_100g': z.naehrwerte['fat_100g'] || 0,
            'carbohydrates_100g': z.naehrwerte['carbohydrates_100g'] || 0,
            'saturated-fat_100g': z.naehrwerte['saturated-fat_100g'] || 0,
            'sugars_100g': z.naehrwerte['sugars_100g'] || 0,
            'fiber_100g': z.naehrwerte['fiber_100g'] || 0,
            'salt_100g': z.naehrwerte['salt_100g'] || 0,
            product_quantity: z.product_quantity || null,
            preisProKg: z.preisProKg || null,
            nutriScoreLetter: z.nutriScoreLetter || null,
            nutriscore_grade: z.nutriScoreLetter ? z.nutriScoreLetter.toLowerCase() : null,
            nutriscore_score: z.nutriScoreLetter === 'A' ? -5 : (z.nutriScoreLetter === 'B' ? 0 : (z.nutriScoreLetter === 'C' ? 5 : (z.nutriScoreLetter === 'D' ? 15 : (z.nutriScoreLetter === 'E' ? 25 : null))))
        };

        // Direkt unter Barcode abspeichern (Firebase-Suche greift automatisch darauf zu)
        fetch(`${FIREBASE_URL}/${z.barcode}.json`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(globalProductData)
        }).then(res => {
            if (res.ok) console.log(`Produkt ${z.barcode} global unter Barcode registriert.`);
        }).catch(err => console.warn("Fehler beim globalen Produkt-Registrieren:", err));
    }
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
        let constraints;
        if (videoDevices.length > 0) {
            constraints = {
                video: {
                    deviceId: { exact: videoDevices[currentDeviceIndex].deviceId },
                    advanced: [{ focusMode: 'continuous' }, { zoom: 2.0 }]
                }
            };
        } else {
            // Erster Start: Rückseitenkamera (Hauptkamera) bevorzugen
            constraints = {
                video: {
                    facingMode: 'environment',
                    advanced: [{ focusMode: 'continuous' }, { zoom: 2.0 }]
                }
            };
        }

        cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = cameraStream;

        // Wenn videoDevices noch leer ist, rufen wir erst JETZT (mit erteilter Berechtigung) enumerateDevices auf.
        // Das garantiert vollständige Labels und korrekte, stabile Device-IDs ohne Platzhalter.
        if (videoDevices.length === 0) {
            const allDevices = await navigator.mediaDevices.enumerateDevices();
            const rawDevices = allDevices.filter(device => device.kind === 'videoinput');
            
            // Duplikate über die deviceId herausfiltern
            const seen = new Set();
            videoDevices = rawDevices.filter(d => {
                if (!d.deviceId) return false;
                if (seen.has(d.deviceId)) return false;
                seen.add(d.deviceId);
                return true;
            });

            // Finde heraus, welche Kamera der Browser gestartet hat, und passe currentDeviceIndex an
            const activeTrack = cameraStream.getVideoTracks()[0];
            if (activeTrack) {
                const settings = activeTrack.getSettings();
                const activeDeviceId = settings.deviceId;
                if (activeDeviceId) {
                    const idx = videoDevices.findIndex(d => d.deviceId === activeDeviceId);
                    if (idx !== -1) {
                        currentDeviceIndex = idx;
                    }
                }
            }
        }

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

    const rawScore = data.nutriscore_score !== undefined && data.nutriscore_score !== null
        ? data.nutriscore_score
        : (data.nutriScoreValue !== undefined && data.nutriScoreValue !== null ? data.nutriScoreValue : null);

    let score = rawScore !== null ? parseFloat(rawScore) : null;
    if (score === null) {
        const letter = data.nutriScoreLetter || data.nutriscore_grade;
        if (letter) {
            const upper = letter.toUpperCase();
            score = upper === 'A' ? -5 : (upper === 'B' ? 0 : (upper === 'C' ? 5 : (upper === 'D' ? 15 : (upper === 'E' ? 25 : null))));
        }
    }

    currentRecipe.zutaten.push({
        menge: 100,
        einheit: 'g',
        name: title,
        barcode: cleanBarcode,
        naehrwerte: naehrwerte,
        nutriscore_score: score,
        product_quantity: parseFloat(data.product_quantity) || null,
        preisProKg: parseFloat(data.preisProKg) || null,
        brands: brand
    });

    renderIngredients(currentRecipe.zutaten, currentPortion, basePortion);
    saveCurrentRecipeImmediately();
}


// ============================================================
// HILFSFUNKTION: CASE-INSENSITIVE DIREKTSUCHE IN FIREBASE (0% DUPLIKATION)
// ============================================================
async function searchFirebaseByProductName(rawQuery, limit = 20) {
    const cleanQuery = rawQuery.trim().replace(/[.#$[\]/]/g, '_');
    if (cleanQuery.length < 2) return [];

    // Erstelle 4 gängige Casing-Variationen für eine hervorragende Case-Insensitivity
    const v1 = cleanQuery.toLowerCase();
    const v2 = cleanQuery.charAt(0).toUpperCase() + cleanQuery.slice(1).toLowerCase();
    const v3 = cleanQuery.toUpperCase();
    const v4 = cleanQuery.replace(/\b\w/g, c => c.toUpperCase()); // Title Case ("Bio Lachs")

    const variations = Array.from(new Set([v1, v2, v3, v4]));

    const fetchPromises = variations.map(async (v) => {
        const endVal = v + '\uf8ff';
        const url = `${FIREBASE_URL}/.json?orderBy="product_name"&startAt=${encodeURIComponent(JSON.stringify(v))}&endAt=${encodeURIComponent(JSON.stringify(endVal))}&limitToFirst=${limit}`;
        try {
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                if (data && typeof data === 'object') {
                    // Firebase liefert { "barcode1": { ... }, "barcode2": { ... } }
                    return Object.entries(data).map(([barcode, details]) => {
                        if (details && typeof details === 'object') {
                            return {
                                barcode: barcode,
                                product_name: details.product_name || '',
                                brands: details.brands || '',
                                ...details
                            };
                        }
                        return null;
                    }).filter(item => item !== null);
                }
            }
        } catch (err) {
            console.warn(`Firebase-Suche für Variation "${v}" fehlgeschlagen:`, err);
        }
        return [];
    });

    try {
        const resultsArray = await Promise.all(fetchPromises);
        // Zusammenführen und nach Barcode deduplizieren
        const fbMap = new Map();
        resultsArray.flat().forEach(item => {
            if (item && item.barcode) {
                fbMap.set(item.barcode, item);
            }
        });
        return Array.from(fbMap.values());
    } catch (err) {
        console.error("Fehler bei der parallelen Suche:", err);
        return [];
    }
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

            // 2. Hole Firebase-Kandidaten per Direktsuche
            const fbItems = await searchFirebaseByProductName(rawQuery, 30);

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

        div.addEventListener('click', async () => {
            resultsEl.style.display = 'none';
            
            let fullData = item;
            if (item.barcode && !item.barcode.startsWith('manual-') && item['fat_100g'] === undefined) {
                try {
                    const res = await fetch(`${FIREBASE_URL}/${item.barcode}.json`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data) fullData = data;
                    }
                } catch (err) {
                    console.warn("Fehler beim Abrufen der Nährwerte:", err);
                }
            }
            
            productCache[item.barcode] = fullData;
            addIngredientFromData(item.barcode, fullData);
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

    // Render active label filters badges
    const activeLabelsContainer = document.getElementById('active-label-filters-container');
    if (activeLabelsContainer) {
        if (activeLabelFilters.size === 0) {
            activeLabelsContainer.style.display = 'none';
        } else {
            activeLabelsContainer.style.display = 'flex';
            activeLabelsContainer.innerHTML = `<span style="font-size: 0.8rem; font-weight: 600; margin-right: 8px; color: var(--text-muted);">Aktive Filter:</span>`;
            activeLabelFilters.forEach(label => {
                const badge = document.createElement('div');
                badge.className = 'label-chip is-active';
                badge.style.display = 'inline-flex';
                badge.style.alignItems = 'center';
                badge.style.gap = '4px';
                badge.style.cursor = 'pointer';
                badge.style.fontSize = '0.75rem';
                badge.style.padding = '3px 8px';
                badge.style.borderRadius = '12px';
                badge.innerHTML = `
                    ${label}
                    <span class="remove-label" style="display: inline-flex; align-items: center;" title="Filter entfernen">
                        <i data-feather="x" style="width: 12px; height: 12px;"></i>
                    </span>
                `;
                badge.addEventListener('click', () => {
                    activeLabelFilters.delete(label);
                    renderRecipesList();
                    const modal = document.getElementById('labels-manage-modal');
                    if (modal && modal.style.display !== 'none') {
                        renderManageLabelsModal();
                    }
                });
                activeLabelsContainer.appendChild(badge);
            });
        }
    }

    let keys = Object.keys(recipes);

    // Dynamic agile filtering
    const filterPreis = document.getElementById('filter-preis')?.value || 'alle';
    if (filterPreis !== 'alle') {
        keys = keys.filter(key => {
            const recipe = recipes[key];
            const costPerPortion = recipe.kosten !== undefined && recipe.kosten !== null
                ? recipe.kosten / Math.max(1, recipe.portionen || 1)
                : 0;
            if (filterPreis === '€') return costPerPortion < 3;
            if (filterPreis === '€€') return costPerPortion >= 3 && costPerPortion < 6;
            if (filterPreis === '€€€') return costPerPortion >= 6;
            return true;
        });
    }

    const filterZeit = document.getElementById('filter-zeit')?.value || 'alle';
    if (filterZeit !== 'alle') {
        const maxTime = parseInt(filterZeit);
        keys = keys.filter(key => {
            const recipe = recipes[key];
            return (recipe.dauer || 0) <= maxTime;
        });
    }

    const filterKcal = document.getElementById('filter-kcal')?.value || 'alle';
    if (filterKcal !== 'alle') {
        keys = keys.filter(key => {
            const recipe = recipes[key];
            const per = getNutritionPerPortion(recipe);
            const kcalPerPortion = per['energy-kcal'] !== null && per['energy-kcal'] !== undefined
                ? per['energy-kcal']
                : (recipe.kalorien || 0);

            if (filterKcal === 'spargeltarzan') return kcalPerPortion < 300;
            if (filterKcal === 'medium') return kcalPerPortion >= 300 && kcalPerPortion < 700;
            if (filterKcal === 'foodkoma') return kcalPerPortion >= 700;
            return true;
        });
    }

    // Filter by selected labels (AND search logic)
    if (activeLabelFilters.size > 0) {
        keys = keys.filter(key => {
            const recipe = recipes[key];
            if (!recipe.labels || !Array.isArray(recipe.labels)) return false;
            return Array.from(activeLabelFilters).every(l => recipe.labels.includes(l));
        });
    }

    if (keys.length === 0) {
        listContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 40px var(--spacing-lg);">
                <p>Keine passenden Rezepte gefunden.</p>
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

        const portionen = Math.max(1, recipe.portionen || 1);
        const costPerPortion = recipe.kosten !== undefined && recipe.kosten !== null
            ? (recipe.kosten / portionen).toFixed(2)
            : '—';

        card.innerHTML = `
            ${badgeHtml}
            ${imgHtml}
            <div class="recipe-card-info">
                ${labelsHtml}
                <h3>${recipe.titel || 'Unbenanntes Rezept'}</h3>
                <p>${recipe.kurzbeschreibung || 'Keine Beschreibung vorhanden'}</p>
                <span class="recipe-meta">
                    <i data-feather="clock"></i> ${formatDuration(recipe.dauer)} &bull; 🔥 ${recipe.kalorien} kcal &bull; 💶 ${costPerPortion} €
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
                <span class="recent-title">${recipe.titel || 'Unbenanntes Rezept'}</span>
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
                (r.titel || '').toLowerCase().includes(query) ||
                (r.kurzbeschreibung || '').toLowerCase().includes(query) ||
                (r.labels && r.labels.some(l => l.toLowerCase().includes(query)))
            );

            if (matches.length > 0) {
                matches.forEach(recipe => {
                    const item = document.createElement('div');
                    item.className = 'dropdown-item';
                    item.innerHTML = `<i data-feather="file-text" style="width:16px;height:16px;color:var(--text-muted)"></i><span>${recipe.titel || 'Unbenanntes Rezept'}</span>`;

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
// GLOBAL LABEL MANAGEMENT (New)
// ============================================================
function renderManageLabelsModal() {
    const container = document.getElementById('modal-labels-container');
    if (!container) return;
    container.innerHTML = '';

    // Wir holen alle aktuell vergebenen Labels (aus allLabels und allen Rezepten)
    const uniqueLabels = new Set(allLabels || []);
    Object.values(recipes).forEach(r => {
        if (r && r.labels) {
            r.labels.forEach(l => uniqueLabels.add(l));
        }
    });

    const labelsList = Array.from(uniqueLabels).filter(Boolean).sort();
    if (labelsList.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem; padding: 20px 0;">Keine Labels vorhanden.</p>';
        return;
    }

    labelsList.forEach(label => {
        const isActive = activeLabelFilters.has(label);
        const chip = document.createElement('div');
        chip.className = `label-chip ${isActive ? 'is-active' : ''}`;
        chip.style.display = 'inline-flex';
        chip.style.alignItems = 'center';
        chip.style.padding = '4px 10px';
        chip.style.borderRadius = '16px';
        chip.style.cursor = 'pointer';
        if (!isActive) {
            chip.style.background = '#f1f5f9';
            chip.style.border = '1px solid #cbd5e1';
        }
        const showTrash = labelsEditingMode ? 'inline-flex' : 'none';
        chip.innerHTML = `
            <span>${label}</span>
            <span class="remove-label" style="cursor: pointer; margin-left: 8px; display: ${showTrash}; align-items: center; color: #ef4444;" title="Label global löschen">
                <i data-feather="trash-2" style="width: 14px; height: 14px;"></i>
            </span>
        `;
        
        chip.addEventListener('click', (e) => {
            if (e.target.closest('.remove-label')) return; // ignore delete clicks
            if (activeLabelFilters.has(label)) {
                activeLabelFilters.delete(label);
            } else {
                activeLabelFilters.add(label);
            }
            renderManageLabelsModal();
            renderRecipesList();
        });
        
        chip.querySelector('.remove-label').onclick = (e) => {
            e.stopPropagation();
            deleteGlobalLabel(label);
        };
        
        container.appendChild(chip);
    });

    if (typeof feather !== 'undefined') feather.replace();
}

async function deleteGlobalLabel(label) {
    // Rückfrage-Popup
    const confirmDelete = confirm(`Möchtest du das Label "${label}" wirklich unwiderruflich löschen? Es wird aus allen Rezepten und der globalen Liste gelöscht.`);
    if (!confirmDelete) return;

    // Remove from active filters if present
    activeLabelFilters.delete(label);

    // 1. Aus globaler Liste entfernen
    allLabels = (allLabels || []).filter(l => l !== label);
    localStorage.setItem('global_labels', JSON.stringify(allLabels));

    // 2. Aus allen Rezepten entfernen
    let updatedCount = 0;
    const promises = [];
    Object.keys(recipes).forEach(id => {
        const recipe = recipes[id];
        if (recipe && recipe.labels && recipe.labels.includes(label)) {
            recipe.labels = recipe.labels.filter(l => l !== label);
            updatedCount++;
            
            // Firebase-Update vorbereiten
            promises.push(saveRecipeToFirebase(recipe));
        }
    });

    // 3. allLabels in Firebase sichern
    try {
        await fetch(`${FIREBASE_URL}/labels.json`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(allLabels)
        });
    } catch (e) {
        console.warn("Konnte Labels in Firebase nicht aktualisieren", e);
    }

    // Warten bis alle Rezepte aktualisiert sind
    if (promises.length > 0) {
        try {
            await Promise.all(promises);
        } catch (e) {
            console.error("Fehler beim Sichern der geänderten Rezepte", e);
        }
    }

    // 4. Cache aktualisieren und UI neu rendern
    localStorage.setItem('recipes_cache', JSON.stringify(recipes));
    showToast("Label gelöscht", `Das Label "${label}" wurde aus ${updatedCount} Rezepten gelöscht.`);
    
    // UI-Aktualisierung
    renderManageLabelsModal();
    renderRecipesList();
    if (currentRecipe) {
        currentRecipe.labels = (currentRecipe.labels || []).filter(l => l !== label);
        renderLabels(currentRecipe.labels);
    }
}

// Vorwärmen des Firebase-Suchindex, um Kaltstarts bei der ersten Suche zu verhindern
function prewarmFirebaseSearchIndex() {
    console.log("Wärme Firebase-Suchindex vor...");
    fetch(`${FIREBASE_URL}/.json?orderBy="product_name"&limitToFirst=1`)
        .then(res => {
            if (res.ok) console.log("Firebase-Suchindex erfolgreich vorgewärmt.");
        })
        .catch(err => console.warn("Fehler beim Vorwärmen des Firebase-Index:", err));
}

// ============================================================
// INITIALIZATION
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    if (typeof feather !== 'undefined') feather.replace();

    loadRecipesFromFirebase();
    prewarmFirebaseSearchIndex();

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

    document.getElementById('badge-dauer')?.addEventListener('click', openDurationModal);
    document.getElementById('btn-close-duration-modal')?.addEventListener('click', closeDurationModal);
    document.getElementById('btn-save-duration')?.addEventListener('click', saveManualDuration);

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

    // Zutaten Editor Settings Toggle (New)
    document.getElementById('btn-zutaten-settings')?.addEventListener('click', () => {
        const box = document.querySelector('.zutaten-box');
        if (box) {
            const isEditing = box.classList.toggle('is-editing');
            if (sortableIngredients) {
                sortableIngredients.option('disabled', !isEditing);
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

    document.getElementById('btn-bring')?.addEventListener('click', openBringModal);
    document.getElementById('btn-close-bring-modal')?.addEventListener('click', closeBringModal);
    document.getElementById('btn-send-to-bring')?.addEventListener('click', sendToBring);
    document.getElementById('btn-bring-select-all')?.addEventListener('click', () => setBringAllChecked(true));
    document.getElementById('btn-bring-deselect-all')?.addEventListener('click', () => setBringAllChecked(false));

    // Escape-Taste schließt das Bring! Modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const bringModal = document.getElementById('bring-modal');
            if (bringModal && bringModal.style.display !== 'none') {
                closeBringModal();
            }
        }
    });

    // Rezept-Filter Event-Listener (New)
    ['filter-preis', 'filter-zeit', 'filter-kcal'].forEach(id => {
        document.getElementById(id)?.addEventListener('change', () => {
            renderRecipesList();
        });
    });

    document.getElementById('btn-reset-filters')?.addEventListener('click', () => {
        const fp = document.getElementById('filter-preis');
        const fz = document.getElementById('filter-zeit');
        const fk = document.getElementById('filter-kcal');
        if (fp) fp.value = 'alle';
        if (fz) fz.value = 'alle';
        if (fk) fk.value = 'alle';
        activeLabelFilters.clear();
        renderRecipesList();
        const modal = document.getElementById('labels-manage-modal');
        if (modal && modal.style.display !== 'none') {
            renderManageLabelsModal();
        }
    });

    // Label Manager Modal Event-Listener (New)
    document.getElementById('btn-manage-labels')?.addEventListener('click', () => {
        labelsEditingMode = false;
        const modal = document.getElementById('labels-manage-modal');
        if (modal) {
            modal.classList.remove('is-editing');
            modal.style.display = 'flex';
        }
        renderManageLabelsModal();
    });

    document.getElementById('btn-close-labels-modal')?.addEventListener('click', () => {
        document.getElementById('labels-manage-modal').style.display = 'none';
        labelsEditingMode = false;
    });

    document.getElementById('btn-close-labels-modal-action')?.addEventListener('click', () => {
        document.getElementById('labels-manage-modal').style.display = 'none';
        labelsEditingMode = false;
    });

    document.getElementById('btn-labels-settings')?.addEventListener('click', () => {
        labelsEditingMode = !labelsEditingMode;
        const modal = document.getElementById('labels-manage-modal');
        if (modal) {
            modal.classList.toggle('is-editing', labelsEditingMode);
        }
        renderManageLabelsModal();
    });

    document.getElementById('btn-pdf-download')?.addEventListener('click', () => {
        window.print();
    });
});

// ============================================================
// BRING! EXPORT FEATURE
// ============================================================

/**
 * Öffnet das Bring!-Modal und befüllt es mit den aktuell
 * angezeigten Zutaten (korrekte Portionsskalierung aus dem DOM).
 */
function openBringModal() {
    if (!currentRecipe || !currentRecipe.zutaten || currentRecipe.zutaten.length === 0) {
        showToast('Keine Zutaten', 'Dieses Rezept hat noch keine Zutaten.', true);
        return;
    }

    const list = document.getElementById('bring-ingredient-list');
    if (!list) return;
    list.innerHTML = '';

    // Aktuelle Mengen direkt aus dem DOM lesen (korrekte Portionsskalierung)
    const domItems = document.querySelectorAll('.zutaten-list .zutat-item');

    if (domItems.length === 0) {
        // Fallback: Direkt aus currentRecipe (ohne Skalierung)
        currentRecipe.zutaten.forEach((z, i) => {
            renderBringItem(list, z.menge, z.einheit, z.name, i);
        });
    } else {
        domItems.forEach((li, i) => {
            const mengeEl = li.querySelector('.zutat-menge');
            const einheitEl = li.querySelector('.zutat-einheit-select');
            const nameEl = li.querySelector('.zutat-name');
            const menge = mengeEl ? (parseFloat(mengeEl.textContent) || '') : '';
            const einheit = einheitEl ? einheitEl.value : '';
            const name = nameEl ? nameEl.textContent.trim() : '';
            if (name) renderBringItem(list, menge, einheit, name, i);
        });
    }

    document.getElementById('bring-modal').style.display = 'flex';
}

/**
 * Rendert eine einzelne Zutatenzeile mit Custom-Checkbox im Bring!-Modal.
 */
function renderBringItem(list, menge, einheit, name, index) {
    const li = document.createElement('li');
    li.className = 'bring-item is-checked';
    li.dataset.menge = menge !== '' ? menge : '';
    li.dataset.einheit = einheit || '';
    li.dataset.name = name;

    // Lesbaren String zusammenbauen (keine doppelten Leerzeichen)
    const parts = [menge !== '' ? String(menge) : '', einheit || '', name].filter(p => p && String(p).trim() !== '');
    const displayText = parts.join(' ');

    li.innerHTML = `
        <span class="bring-checkbox">
            <svg class="bring-checkbox-check" viewBox="0 0 10 10">
                <polyline points="1.5,5 4,7.5 8.5,2.5"/>
            </svg>
        </span>
        <span class="bring-item-text">
            ${menge !== '' ? `<span class="bring-item-menge">${menge}</span>` : ''}
            ${einheit ? `<span class="bring-item-einheit">${einheit}</span>` : ''}
            ${name}
        </span>
    `;

    // Klick auf die ganze Zeile togglet Checked-Status
    li.addEventListener('click', () => {
        const isChecked = li.classList.contains('is-checked');
        li.classList.toggle('is-checked', !isChecked);
        li.classList.toggle('is-unchecked', isChecked);
    });

    list.appendChild(li);
}

/**
 * Schließt das Bring!-Modal.
 */
function closeBringModal() {
    const modal = document.getElementById('bring-modal');
    if (modal) modal.style.display = 'none';
}

/**
 * Setzt alle Checkboxen im Bring!-Modal auf checked/unchecked.
 */
function setBringAllChecked(checked) {
    const items = document.querySelectorAll('#bring-ingredient-list .bring-item');
    items.forEach(item => {
        item.classList.toggle('is-checked', checked);
        item.classList.toggle('is-unchecked', !checked);
    });
}

/**
 * Exportiert Zutaten zu Bring! über den bewährten RECIPE-Import.
 * 
 * Der type=RECIPE OneLink öffnet die App korrekt im Rezept-Import-Bereich.
 * Die Zutaten werden temporär in Firebase gespeichert (5 Min, dann auto-gelöscht),
 * damit Bring!'s App sie unter einer öffentlichen URL abrufen kann.
 */
function sendToBring() {
    const checkedItems = [...document.querySelectorAll('#bring-ingredient-list .bring-item.is-checked')];

    if (checkedItems.length === 0) {
        showToast('Keine Auswahl', 'Bitte mindestens eine Zutat auswählen.', true);
        return;
    }

    // 1. Zutaten in Bring!'s Parser-Response-Format aufbauen
    //    (Exakt das Format das api.getbring.com/rest/bringrecipes/parser zurückgibt)
    const items = checkedItems.map(item => {
        const menge = item.dataset.menge || '';
        const einheit = item.dataset.einheit || '';
        const name = item.dataset.name || '';
        const spec = [menge, einheit].filter(p => p.trim() !== '').join(' ');
        const obj = { itemId: name };
        if (spec) obj.spec = spec;
        return obj;
    });

    // 2. Rezept-Daten im Parser-Response-Format (wie Chefkoch-Parser zurückgibt)
    const recipeData = {
        name: currentRecipe?.titel || 'Rezept',
        items: items,
        yield: String(currentPortion || 1),
        baseQuantity: currentPortion || 1
    };

    // 3. Temporär in Firebase speichern (öffentliche URL für Bring!)
    const shareKey = 'bring-' + Date.now();
    const firebaseShareUrl = `${FIREBASE_URL}/${shareKey}.json`;

    closeBringModal();
    showToast('Verbinde mit Bring!…', 'Zutaten werden übertragen…');

    fetch(firebaseShareUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipeData)
    })
    .then(res => {
        if (!res.ok) throw new Error(`Fehler ${res.status}`);

        // 4. Base64 URL-safe Encoding (exakt wie Bring!'s Widget)
        function btoaUrlSave(str) {
            return window.btoa(str).replace(/\+/g, '-').replace(/\//g, '_');
        }

        // 5. Deep Link: type=RECIPE mit direkter Firebase-URL als src
        //    Die App ruft diese URL ab und bekommt Daten im Parser-Response-Format
        const srcEncoded = btoaUrlSave(firebaseShareUrl);
        const deepLink = 'https://deeplink.getbring.com/import?type=RECIPE&src=' + srcEncoded;

        // 6. OneLink (bewiesenermaßen öffnet die App im Rezept-Import-Bereich)
        const params = new URLSearchParams();
        params.append('deep_link_value', deepLink);
        params.append('af_web_dp', deepLink);
        params.append('bring_source', 'importWidget');
        params.append('bring_medium', 'thomas-gue.github.io');
        params.append('bring_campaign', 'importRecipe');
        params.append('is_retargeting', 'false');
        params.append('utm_source', 'importWidget');
        params.append('utm_medium', 'thomas-gue.github.io');
        params.append('utm_campaign', 'importRecipe');
        params.append('pid', 'importWidget');
        params.append('c', 'thomas-gue.github.io');
        params.append('af_channel', 'importRecipe');

        const oneLinkUrl = 'https://enjoy.getbring.com/ZAzR?' + params.toString();
        window.location.href = oneLinkUrl;

        // 7. Firebase-Eintrag nach 5 Min aufräumen
        setTimeout(() => {
            fetch(firebaseShareUrl, { method: 'DELETE' }).catch(() => {});
        }, 5 * 60 * 1000);
    })
    .catch(err => {
        console.error('Bring! Export Fehler:', err);
        showToast('Export fehlgeschlagen', 'Prüfe deine Internetverbindung.', true);
    });
}


function createNewRecipe() {
    const newRecipe = {
        id: 'new-' + Date.now(),
        titel: '',
        kurzbeschreibung: '',
        kalorien: 0,
        kosten: 0.00,
        dauer: 20,
        nutriScore: null,
        portionen: 2,
        naehrwerte: null,
        zutaten: [],
        beschreibung: ''
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

            // 2. Hole Firebase-Kandidaten per Direktsuche
            const fbItems = await searchFirebaseByProductName(rawQuery, 20);

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
        div.addEventListener('click', async () => {
            resultsEl.style.display = 'none';
            document.getElementById('inline-ingredient-search').value = '';
            
            let fullData = item;
            if (item.barcode && !item.barcode.startsWith('manual-') && item['fat_100g'] === undefined) {
                try {
                    const res = await fetch(`${FIREBASE_URL}/${item.barcode}.json`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data) fullData = data;
                    }
                } catch (err) {
                    console.warn("Fehler beim Abrufen der Nährwerte:", err);
                }
            }
            
            productCache[item.barcode] = fullData;
            addIngredientFromData(item.barcode, fullData);
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
            // Firebase Direktsuche per indiziertem product_name
            const items = await searchFirebaseByProductName(rawQuery, 15);
            spinner.style.display = 'none';

            ingredientSearchCache[cacheKey] = items;
            renderStandaloneResults(items, resultsEl);

        } catch (err) {
            spinner.style.display = 'none';
            console.error('Standalone search error:', err);
            resultsEl.innerHTML = '<div class="ingredient-dropdown-item ingredient-dropdown-info">Fehler bei der Suche in Firebase.</div>';
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
        div.addEventListener('click', async () => {
            resultsEl.style.display = 'none';
            document.getElementById('search-modal').style.display = 'none';
            
            let fullData = item;
            if (item.barcode && !item.barcode.startsWith('manual-') && item['fat_100g'] === undefined) {
                try {
                    const res = await fetch(`${FIREBASE_URL}/${item.barcode}.json`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data) fullData = data;
                    }
                } catch (err) {
                    console.warn("Fehler beim Abrufen der Nährwerte:", err);
                }
            }
            
            productCache[item.barcode] = fullData;
            addIngredientFromData(item.barcode, fullData);
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
