// =============================================
// FILE: calculator.js
// DESCRIZIONE: Modulo per la gestione della
//              Calcolatrice nella sezione Home.
// =============================================

// === STATO LOCALE DEL MODULO CALCOLATRICE ===
let calculatorState = {
    display: '0',           // Valore mostrato nel display principale
    equation: '',           // Stringa dell'operazione mostrata sopra
    firstOperand: null,     // Primo numero dell'operazione
    waitingForSecondOperand: false, // Flag per inserimento secondo numero
    operator: null          // Operatore selezionato (+, -, *, /)
};

// === INIZIALIZZAZIONE MODULO CALCOLATRICE ===
function initCalculatorModule() {
    console.log('🧮 Inizializzazione modulo Calcolatrice...');
    // Potrebbe caricare stato salvato se necessario, ma di solito si resetta
    resetCalculator();
    console.log('✅ Modulo Calcolatrice inizializzato');
}

// === RENDER COMPONENTE CALCOLATRICE ===
function renderCalculatorComponent(container) {
    console.log('🧮 Rendering componente Calcolatrice...');
    const app = this; // 'this' si riferisce all'istanza App

    container.innerHTML = `
        <div class="card-body calculator">
            <div id="calculator-display-container" class="calculator-display">
                <div class="equation">${calculatorState.equation}</div>
                <div class="result">${calculatorState.display}</div>
            </div>
            <div id="calc-buttons" class="calculator-buttons">
                <button class="calc-btn function" data-value="C">C</button>
                <button class="calc-btn function" data-value="±">±</button>
                <button class="calc-btn function" data-value="%">%</button>
                <button class="calc-btn operator" data-value="/">÷</button>

                <button class="calc-btn number" data-value="7">7</button>
                <button class="calc-btn number" data-value="8">8</button>
                <button class="calc-btn number" data-value="9">9</button>
                <button class="calc-btn operator" data-value="*">×</button>

                <button class="calc-btn number" data-value="4">4</button>
                <button class="calc-btn number" data-value="5">5</button>
                <button class="calc-btn number" data-value="6">6</button>
                <button class="calc-btn operator" data-value="-">−</button>

                <button class="calc-btn number" data-value="1">1</button>
                <button class="calc-btn number" data-value="2">2</button>
                <button class="calc-btn number" data-value="3">3</button>
                <button class="calc-btn operator" data-value="+">+</button>

                <button class="calc-btn number zero" data-value="0">0</button> <button class="calc-btn number" data-value=".">.</button>
                <button class="calc-btn operator equal" data-value="=">=</button>
            </div>
        </div>
    `;

    // Aggiungi event listener specifico per i bottoni della calcolatrice
    setupCalculatorEventListeners.call(app, container); // Passa container

    // Non serve refreshIcons qui se non usi icone Lucide nei bottoni
}

// === SETUP EVENT LISTENERS CALCOLATRICE ===
function setupCalculatorEventListeners(container) {
    const app = this; // 'this' si riferisce all'istanza App
    const buttonsContainer = container.querySelector('#calc-buttons');
    if (buttonsContainer) {
        buttonsContainer.addEventListener('click', (e) => {
            // Usa closest per gestire click anche su eventuali elementi interni al bottone
            const button = e.target.closest('button.calc-btn');
            if (button && button.dataset.value) {
                handleCalculatorInput.call(app, button.dataset.value);
            }
        });
    } else {
        console.error("Contenitore bottoni calcolatrice non trovato.");
    }
}

// === LOGICA CALCOLATRICE ===

// Gestisce l'input da un bottone
function handleCalculatorInput(value) {
    const app = this; // Assicurati che 'this' sia l'istanza app
    const isNumber = /^[0-9]$/.test(value); // Verifica se è una cifra
    const isOperator = ['+', '-', '*', '/'].includes(value);

    switch (value) {
        case 'C':
            resetCalculator.call(app);
            break;
        case '±':
            if (calculatorState.display !== '0') {
                calculatorState.display = String(parseFloat(calculatorState.display) * -1);
            }
            break;
        case '%':
             // Comportamento %: applica subito se c'è un operatore, altrimenti divide per 100
             if (calculatorState.operator && calculatorState.firstOperand !== null) {
                 const percentage = (calculatorState.firstOperand * parseFloat(calculatorState.display)) / 100;
                 calculatorState.display = String(percentage);
                 // Considera il % come fine operazione parziale, pronto per = o altro operatore
                 // calculatorState.waitingForSecondOperand = false; // Opzionale: permette chaining dopo %
             } else {
                 calculatorState.display = String(parseFloat(calculatorState.display) / 100);
             }
            break;
        case '.':
            if (!calculatorState.display.includes('.')) {
                // Se si sta inserendo il secondo operando, inizia da '0.'
                if (calculatorState.waitingForSecondOperand) {
                    calculatorState.display = '0.';
                    calculatorState.waitingForSecondOperand = false;
                } else {
                    calculatorState.display += '.';
                }
            }
            break;
        case '=':
            performCalculation.call(app);
            break;
        default:
            if (isNumber) {
                if (calculatorState.waitingForSecondOperand) {
                    calculatorState.display = value;
                    calculatorState.waitingForSecondOperand = false;
                } else {
                    // Limita lunghezza display per evitare overflow visivo
                    if (calculatorState.display.length < 15) {
                         calculatorState.display = calculatorState.display === '0' ? value : calculatorState.display + value;
                    }
                }
            } else if (isOperator) {
                handleOperator.call(app, value);
            }
            break;
    }

    updateCalculatorDisplay.call(app);
}

// Gestisce la pressione di un operatore
function handleOperator(nextOperator) {
    const calc = calculatorState;
    const inputValue = parseFloat(calc.display);

    // Se un operatore è già stato premuto e stiamo aspettando il secondo numero,
    // cambia semplicemente l'operatore (es. 5 + - 3 diventa 5 - 3)
    if (calc.operator && calc.waitingForSecondOperand) {
        calc.operator = nextOperator;
        calc.equation = `${formatNumberForEquation(calc.firstOperand)} ${getOperatorSymbol(nextOperator)}`;
        return;
    }

    // Se non c'è ancora un primo operando, memorizza quello corrente
    if (calc.firstOperand === null && !isNaN(inputValue)) {
        calc.firstOperand = inputValue;
    } else if (calc.operator) {
        // Se c'è già un operatore, esegui il calcolo precedente prima di memorizzare il nuovo
        const result = performCalculation.call(this, true); // true indica calcolo concatenato
        calc.firstOperand = result;
        // Mostra il risultato intermedio nel display
        calc.display = String(result);
    }

    // Imposta lo stato per ricevere il secondo operando
    calc.waitingForSecondOperand = true;
    calc.operator = nextOperator;
    calc.equation = `${formatNumberForEquation(calc.firstOperand)} ${getOperatorSymbol(nextOperator)}`;
}

// Esegue il calcolo
function performCalculation(isChained = false) {
    const calc = calculatorState;

    if (calc.firstOperand === null || calc.operator === null || calc.waitingForSecondOperand) {
        // Non fare nulla se manca qualcosa o se abbiamo appena premuto un operatore
        // Se premiamo = subito dopo un operatore, usa il display corrente come secondo operando
        if (calc.operator && !calc.waitingForSecondOperand) {
           // ok, procedi
        } else {
             return calc.firstOperand !== null ? calc.firstOperand : 0; // Ritorna il valore corrente o 0
        }
    }


    const secondOperand = parseFloat(calc.display);

    // Evita divisione per zero
    if (calc.operator === '/' && secondOperand === 0) {
        calc.display = 'Errore';
        calc.equation = '';
        calc.firstOperand = null;
        calc.operator = null;
        calculatorState.waitingForSecondOperand = true; // Pronto per nuovo inizio
        return NaN; // O lancia un errore
    }

    const calculations = {
        '+': (a, b) => a + b,
        '-': (a, b) => a - b,
        '*': (a, b) => a * b,
        '/': (a, b) => a / b
    };

    const result = calculations[calc.operator](calc.firstOperand, secondOperand);
    const resultString = String(parseFloat(result.toPrecision(12))); // Limita precisione

    if (!isChained) {
        calc.equation = `${formatNumberForEquation(calc.firstOperand)} ${getOperatorSymbol(calc.operator)} ${formatNumberForEquation(secondOperand)} =`;
    }

    calc.display = resultString;

    // Prepara per il prossimo calcolo
    calc.firstOperand = result; // Il risultato diventa il nuovo primo operando
    if (!isChained) {
        calc.operator = null; // Resetta operatore dopo =
        // calc.waitingForSecondOperand = false; // Dopo =, siamo pronti a inserire un nuovo numero da zero
    }
     calc.waitingForSecondOperand = true; // Dopo un calcolo (anche concatenato), aspettiamo il prossimo operando

    return result;
}

// Resetta lo stato della calcolatrice
function resetCalculator() {
    calculatorState.display = '0';
    calculatorState.equation = '';
    calculatorState.firstOperand = null;
    calculatorState.waitingForSecondOperand = false;
    calculatorState.operator = null;
    // Non serve chiamare updateCalculatorDisplay qui, verrà chiamato da handleCalculatorInput
}

// Aggiorna l'HTML del display
function updateCalculatorDisplay() {
    const container = document.getElementById('calculator-display-container');
    if (container) {
        container.querySelector('.result').textContent = formatDisplayNumber(calculatorState.display);
        container.querySelector('.equation').textContent = calculatorState.equation;
    }
}

// Funzione helper per formattare numeri nel display (es. virgola come separatore decimale)
function formatDisplayNumber(numberString) {
    // Sostituisce il punto con la virgola per i decimali
    return numberString.replace('.', ',');
}
// Formatta numero per l'equazione (usa virgola)
function formatNumberForEquation(num) {
    if (num === null || num === undefined) return '';
    return String(num).replace('.', ',');
}

// Ottiene il simbolo corretto per l'operatore
function getOperatorSymbol(operator) {
    switch(operator) {
        case '+': return '+';
        case '-': return '−'; // Simbolo meno corretto
        case '*': return '×'; // Simbolo moltiplicazione
        case '/': return '÷'; // Simbolo divisione
        default: return '';
    }
}

// === ESPORTAZIONE FUNZIONI PRINCIPALI ===
if (typeof window !== 'undefined') {
    window.initCalculatorModule = initCalculatorModule;
    window.renderCalculatorComponent = renderCalculatorComponent;
    // Le altre funzioni sono interne al modulo
}