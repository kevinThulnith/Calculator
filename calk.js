// Global UI element references
let field1 = document.getElementById("field1");
let field2 = document.getElementById("field2");

// Allowed operator symbols
const symbols = ["+", "-", "*", "/", "%"];
const MAX_INPUT_LENGTH = 50; // Maximum allowed characters in the input field

/**
 * @file calk.js
 * Core logic for a simple calculator.
 * Includes expression parsing and UI interaction.
 */

/**
 * Parses a mathematical expression string and evaluates it.
 * Handles operator precedence (MDM then AS) and basic error checking.
 * @param {string} expressionString The mathematical expression to parse.
 * @returns {number|NaN} The result of the calculation or NaN if invalid.
 */
function parseExpression(expressionString) {
  // Remove whitespace
  expressionString = expressionString.replace(/\s+/g, "");

  // Stage 1: Basic validation for invalid characters or trivial non-expressions.
  if (/[^0-9+\-*/%.]/.test(expressionString)) { // Invalid characters
    return NaN;
  }
  // Check for expressions that are just operators or empty after trim.
  if (expressionString.trim() === "") return 0; // Empty string is 0
  if (/^[\+\-\*\/%]+$/.test(expressionString.trim())) return NaN; // Only operators

  // Stage 2: Regex for more complex invalid patterns (e.g., multiple operators, leading/trailing)
  // Allows leading +/- for numbers (e.g., "-5", "+5*2")
  // Disallows: "**", "*/", "5*+2", "*5", "5*", etc.
  if (/[\+\-\*\/%]{2,}/.test(expressionString)) return NaN; // Consecutive operators like "5++2" or "5+*2"
  if (/^[\*\/%]/.test(expressionString)) return NaN; // Starts with * / %
  if (/[\+\-\*\/%]$/.test(expressionString)) return NaN; // Ends with any operator

  // Stage 3: Tokenization
  // Splits the string into numbers (including decimals, leading +/-) and operators.
  // Example: "-5.5*2+10" -> ["-5.5", "*", "2", "+", "10"]
  const tokens = expressionString.match(/-?[0-9]+\.?[0-9]*|-?\.[0-9]+|[\+\-\*\/%]/g);
  if (!tokens) return NaN; // Should not happen if previous checks are robust

  // Stage 4: Operator Precedence Calculation
  const ops1 = ["*", "/", "%"]; // Higher precedence
  const ops2 = ["+", "-"]; // Lower precedence
  let currentTokens = [...tokens];

  /** Helper to perform a single arithmetic operation */
  function performOperation(left, operator, right) {
    left = parseFloat(left);
    right = parseFloat(right);
    if (isNaN(left) || isNaN(right)) return NaN;

    let result;
    switch (operator) {
      case '*': result = left * right; break;
      case '/': result = right === 0 ? NaN : left / right; break;
      case '%': result = right === 0 ? NaN : left % right; break;
      case '+': result = left + right; break;
      case '-': result = left - right; break;
      default: return NaN;
    }
    // Check for Infinity directly after operation, before it might get into an array as string "Infinity"
    if (result === Infinity || result === -Infinity) {
        return NaN; // Treat Infinity results from intermediate operations as errors
    }
    return result;
  }

  // Process Phase 1: Multiplication, Division, Modulo (left-to-right)
  let newTokens = [];
  let i = 0;
  while (i < currentTokens.length) {
    const token = currentTokens[i];
    if (ops1.includes(token)) {
      const leftOperand = newTokens.pop();
      const rightOperand = currentTokens[i + 1];
      if (leftOperand === undefined || rightOperand === undefined || isNaN(parseFloat(leftOperand)) || isNaN(parseFloat(rightOperand))) return NaN;
      const result = performOperation(leftOperand, token, rightOperand);
      if (isNaN(result)) return NaN;
      newTokens.push(result.toString());
      i += 2;
    } else {
      newTokens.push(token);
      i++;
    }
  }
  currentTokens = newTokens;

  // Process Phase 2: Addition, Subtraction (left-to-right)
  newTokens = [];
  i = 0;
  while (i < currentTokens.length) {
    const token = currentTokens[i];
    if (ops2.includes(token)) {
      const leftOperand = newTokens.pop();
      const rightOperand = currentTokens[i + 1];
      if (leftOperand === undefined || rightOperand === undefined || isNaN(parseFloat(leftOperand)) || isNaN(parseFloat(rightOperand))) return NaN;
      const result = performOperation(leftOperand, token, rightOperand);
      if (isNaN(result)) return NaN;
      newTokens.push(result.toString());
      i += 2;
    } else {
      newTokens.push(token);
      i++;
    }
  }

  if (newTokens.length !== 1 || isNaN(parseFloat(newTokens[0]))) {
    return NaN;
  }

  const finalResult = parseFloat(newTokens[0]);
  // Final check for Infinity on the overall result
  if (finalResult === Infinity || finalResult === -Infinity) {
      return NaN;
  }
  return finalResult;
}

/**
 * Updates the calculator's secondary display (field2) with the result of
 * parsing the expression in the primary display (field1).
 * Manages placeholder text and error display.
 */
function myfunc() {
  try {
    var anw = parseExpression(field1.value);

    if (anw === Infinity || anw === -Infinity) {
      anw = NaN;
    }

    if (anw !== undefined && !isNaN(anw)) {
      field2.value = anw;
      // Set placeholder AFTER evaluation, so it holds the original expression
      field1.placeholder = field1.value;
    } else if (field1.value === "0" && (anw === 0 || anw === undefined || isNaN(anw))) {
      field2.value = 0;
      field1.placeholder = field1.value;
    } else if (isNaN(anw) && field1.value !== "") {
        field2.value = "Error";
        field1.placeholder = field1.value; // Keep erroneous expression in placeholder
    } else {
        field2.value = (field1.value === "") ? "" : "Error";
        if (field1.value === "") field1.placeholder = "";
        else field1.placeholder = field1.value;
    }
  } catch (error) {
    field2.value = "Error";
    field1.placeholder = field1.value; // Keep expression in placeholder on error
  }
}

/**
 * Clears both calculator displays and the placeholder.
 */
function myfunc2() {
  field1.value = "";
  field2.value = "";
  field1.placeholder = "";
}

// --- New Event Handler Functions ---

/**
 * Handles 'Clear All' (C) and 'Clear Last' (cl) button actions.
 * @param {string} buttonId The ID of the clear button pressed ("C" or "cl").
 */
function handleClear(buttonId) {
  if (buttonId === "C") {
    field1.placeholder = "";
    myfunc2();
    field2.classList.remove("runup");
  } else if (buttonId === "cl") {
    field1.value = field1.value.substring(0, field1.value.length - 1);
    // field1.placeholder = ""; // Let myfunc handle placeholder update after CL
    if (field1.value.length === 0) {
      myfunc2();
    }
  }
}

/**
 * Handles the '=' (Equals) button action.
 * Adds a visual effect if there's an expression to evaluate.
 */
function handleEquals() {
  if (field1.value.length !== 0) {
    field2.classList.add("runup");
  }
}

/**
 * Handles operator button actions (+, -, *, /, %).
 * Appends operator to the input field, respecting MAX_INPUT_LENGTH.
 * @param {string} operator The operator symbol pressed.
 */
function handleOperator(operator) {
  if (field1.value.length >= MAX_INPUT_LENGTH) return;

  if (field1.value.length !== 0) {
    if (symbols.includes(field1.value.charAt(field1.value.length - 1))) {
      field1.value = field1.value.substring(0, field1.value.length - 1);
    }
  }
  if (field1.value.length === 0 && (operator === '*' || operator === '/' || operator === '%')) {
    return;
  }
  field1.value = field1.value + operator;
}

/**
 * Handles the '.' (Decimal) button action.
 * Appends a decimal point, respecting MAX_INPUT_LENGTH.
 */
function handleDecimal() {
  if (field1.value.length >= MAX_INPUT_LENGTH) return;

  if (field1.value.length === 0) {
    field1.value = "0.";
  } else if (symbols.includes(field1.value.charAt(field1.value.length - 1))) {
    field1.value = field1.value + "0.";
  } else if (!field1.value.split(new RegExp(`[${symbols.join('\\')}]`)).pop().includes('.')) {
    field1.value = field1.value + ".";
  }
  field2.classList.remove("runup");
}

/**
 * Handles number button actions (0-9).
 * Appends the number to the input field, respecting MAX_INPUT_LENGTH.
 * @param {string} numberChar The number character pressed.
 */
function handleNumber(numberChar) {
  if (field1.value.length >= MAX_INPUT_LENGTH) return;

  // If placeholder is set (e.g. after = or sq) and field1 is empty (cleared by = or sq),
  // then clear placeholder to start fresh.
  if (field1.placeholder !== "" && field1.value === "") {
      field1.placeholder = "";
  } else if (field2.value === "Error") { // If previous result was an error, clear placeholder
      field1.placeholder = "";
  }

  if (field1.value.length === 0) {
    field2.classList.remove("runup");
  }
  field1.value = field1.value + numberChar;
}

/**
 * Handles the 'sq' (Square) button action.
 * Evaluates the current expression, squares it, and updates displays.
 */
function handleSquare() {
    if (field1.value.length >= 1) {
        let currentExpression = field1.value;
        let currentVal = parseExpression(currentExpression);
        if (!isNaN(currentVal)) {
          let squaredVal = currentVal * currentVal;
          if (squaredVal === Infinity || squaredVal === -Infinity) {
              field2.value = "Error";
          } else {
              field2.value = squaredVal;
          }
          field1.placeholder = currentExpression; // Keep original expression as placeholder
          field1.value = ""; // Clear input field for new calculation
          field2.classList.remove("runup");
        } else {
          field2.value = "Error";
          field1.placeholder = currentExpression; // Keep erroneous expression
          field2.classList.remove("runup");
        }
      } else {
        field2.value = "Error";
        field1.placeholder = "";
        field1.value = "";
        field2.classList.remove("runup");
      }
}

// Event Delegation Setup
const calculatorTable = document.querySelector('.center table');

if (calculatorTable) {
  calculatorTable.addEventListener("click", (event) => {
    const button = event.target.closest('button');
    if (!button) return;

    const buttonId = button.id;

    if (buttonId === "C" || buttonId === "cl") {
      handleClear(buttonId);
    } else if (buttonId === "=") {
      handleEquals();
    } else if (buttonId === "sq") {
      handleSquare();
      return;
    } else if (symbols.includes(buttonId)) {
      handleOperator(buttonId);
    } else if (buttonId === ".") {
      handleDecimal();
    } else if (!isNaN(parseInt(buttonId))) {
      handleNumber(buttonId);
    }

    // Common function call for display update
    if (buttonId !== 'sq') {
        myfunc(); // Evaluates and updates field2, sets field1.placeholder

        // Specific post-myfunc logic for '='
        if (buttonId === "=" && field2.value !== "Error") {
            // After successful calculation via '=', clear field1 to allow
            // new number input to start fresh. Placeholder already has the expression.
            field1.value = "";
        }
    }
  });
}
