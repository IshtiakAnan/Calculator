/**
 * Scientific Calculator Engine
 * Core logic for expression token parsing, Shunting-Yard evaluation,
 * and user input state management.
 */

function formatResult(num) {
  if (isNaN(num) || !isFinite(num)) return 'Error';
  if (Math.abs(num) < 1e-12) return '0';
  const rounded = Math.round(num);
  if (Math.abs(num - rounded) < 1e-12) return rounded.toString();
  return parseFloat(num.toFixed(10)).toString();
}

function evaluateTokens(tokens) {
  if (!tokens || tokens.length === 0) return 0;

  const outputQueue = [];
  const operatorStack = [];

  const precedence = { '+': 1, '-': 1, '*': 2, '/': 2, '^': 3, '%': 2 };
  const rightAssociative = { '^': true };

  const isNumber = str => (!isNaN(parseFloat(str)) && isFinite(str)) || str === 'PI';
  const isFunction = str => ['sin(', 'cos(', 'tan(', 'log(', 'sqrt('].includes(str);
  const isOperator = str => ['+', '-', '*', '/', '^', '%'].includes(str);

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (isNumber(token)) {
      outputQueue.push(token === 'PI' ? Math.PI : parseFloat(token));
    } else if (isFunction(token)) {
      operatorStack.push(token);
    } else if (isOperator(token)) {
      // Check for unary minus: at start, or preceded by '(', function, or another operator
      if (token === '-' && (i === 0 || tokens[i - 1] === '(' || isFunction(tokens[i - 1]) || isOperator(tokens[i - 1]))) {
        outputQueue.push(0);
      }
      while (
        operatorStack.length > 0 &&
        isOperator(operatorStack[operatorStack.length - 1]) &&
        ((!rightAssociative[token] && precedence[token] <= precedence[operatorStack[operatorStack.length - 1]]) ||
          (rightAssociative[token] && precedence[token] < precedence[operatorStack[operatorStack.length - 1]]))
      ) {
        outputQueue.push(operatorStack.pop());
      }
      operatorStack.push(token);
    } else if (token === '(') {
      operatorStack.push(token);
    } else if (token === ')') {
      while (
        operatorStack.length > 0 &&
        operatorStack[operatorStack.length - 1] !== '(' &&
        !isFunction(operatorStack[operatorStack.length - 1])
      ) {
        outputQueue.push(operatorStack.pop());
      }
      if (operatorStack.length === 0) throw new Error("Mismatched parentheses");

      const match = operatorStack.pop();
      if (isFunction(match)) {
        outputQueue.push(match);
      } else if (operatorStack.length > 0 && isFunction(operatorStack[operatorStack.length - 1])) {
        outputQueue.push(operatorStack.pop());
      }
    } else {
      throw new Error("Invalid token: " + token);
    }
  }

  while (operatorStack.length > 0) {
    const top = operatorStack.pop();
    if (top === '(' || top === ')' || isFunction(top)) {
      throw new Error("Mismatched parentheses");
    }
    outputQueue.push(top);
  }

  // Evaluate Reverse Polish Notation (RPN)
  const evalStack = [];
  for (let token of outputQueue) {
    if (typeof token === 'number') {
      evalStack.push(token);
    } else if (isOperator(token)) {
      if (evalStack.length < 2) throw new Error("Invalid expression");
      const b = evalStack.pop();
      const a = evalStack.pop();
      switch (token) {
        case '+': evalStack.push(a + b); break;
        case '-': evalStack.push(a - b); break;
        case '*': evalStack.push(a * b); break;
        case '/':
          if (b === 0) throw new Error("Divide by zero");
          evalStack.push(a / b);
          break;
        case '^': evalStack.push(Math.pow(a, b)); break;
        case '%':
          if (b === 0) throw new Error("Divide by zero");
          evalStack.push(a % b);
          break;
      }
    } else if (isFunction(token)) {
      if (evalStack.length < 1) throw new Error("Invalid function argument");
      const arg = evalStack.pop();
      switch (token) {
        case 'sin(': evalStack.push(Math.sin(arg * Math.PI / 180)); break;
        case 'cos(': evalStack.push(Math.cos(arg * Math.PI / 180)); break;
        case 'tan(': evalStack.push(Math.tan(arg * Math.PI / 180)); break;
        case 'log(':
          if (arg <= 0) throw new Error("Invalid log argument");
          evalStack.push(Math.log10(arg));
          break;
        case 'sqrt(':
          if (arg < 0) throw new Error("Invalid sqrt argument");
          evalStack.push(Math.sqrt(arg));
          break;
      }
    }
  }

  if (evalStack.length !== 1) throw new Error("Invalid expression");
  return evalStack[0];
}

class CalculatorEngine {
  constructor() {
    this.exprTokens = [];
    this.isEvaluated = false;
    this.lastResult = null;
    this.lastError = null;
  }

  isOp(str) {
    return ['+', '-', '*', '/', '^', '%'].includes(str);
  }

  isFunc(str) {
    return ['sin(', 'cos(', 'tan(', 'log(', 'sqrt('].includes(str);
  }

  appendNumber(num) {
    if (this.isEvaluated) {
      this.exprTokens = [];
      this.isEvaluated = false;
    }

    const lastToken = this.exprTokens[this.exprTokens.length - 1];
    if (lastToken && !isNaN(lastToken)) {
      this.exprTokens[this.exprTokens.length - 1] = lastToken + num;
    } else if (lastToken === 'PI' || lastToken === ')') {
      this.exprTokens.push('*', num);
    } else {
      this.exprTokens.push(num);
    }
  }

  appendDecimal() {
    if (this.isEvaluated) {
      this.exprTokens = ['0.'];
      this.isEvaluated = false;
      return;
    }

    const lastToken = this.exprTokens[this.exprTokens.length - 1];
    if (lastToken && !isNaN(lastToken)) {
      if (!lastToken.includes('.')) {
        this.exprTokens[this.exprTokens.length - 1] = lastToken + '.';
      }
    } else if (lastToken === 'PI' || lastToken === ')') {
      this.exprTokens.push('*', '0.');
    } else {
      this.exprTokens.push('0.');
    }
  }

  appendOperator(op) {
    if (this.isEvaluated) {
      this.isEvaluated = false;
    }

    if (this.exprTokens.length === 0) {
      if (op === '-') this.exprTokens.push('-');
      return;
    }

    const lastToken = this.exprTokens[this.exprTokens.length - 1];
    if (this.isOp(lastToken)) {
      this.exprTokens[this.exprTokens.length - 1] = op;
    } else if (lastToken === '(' || this.isFunc(lastToken)) {
      if (op === '-') this.exprTokens.push('-');
    } else {
      this.exprTokens.push(op);
    }
  }

  appendFunction(func) {
    if (this.isEvaluated) {
      this.isEvaluated = false;
    }

    const lastToken = this.exprTokens[this.exprTokens.length - 1];
    if (lastToken && (!isNaN(lastToken) || lastToken === 'PI' || lastToken === ')')) {
      this.exprTokens.push('*');
    }
    this.exprTokens.push(func + '(');
  }

  appendParenthesis(paren) {
    if (this.isEvaluated) {
      this.isEvaluated = false;
    }

    if (paren === '(') {
      const lastToken = this.exprTokens[this.exprTokens.length - 1];
      if (lastToken && (!isNaN(lastToken) || lastToken === 'PI' || lastToken === ')')) {
        this.exprTokens.push('*');
      }
      this.exprTokens.push('(');
    } else if (paren === ')') {
      const openCount = this.exprTokens.filter(t => t === '(' || this.isFunc(t)).length;
      const closeCount = this.exprTokens.filter(t => t === ')').length;
      const lastToken = this.exprTokens[this.exprTokens.length - 1];

      if (openCount > closeCount && lastToken && lastToken !== '(' && !this.isFunc(lastToken) && !this.isOp(lastToken)) {
        this.exprTokens.push(')');
      }
    }
  }

  insertPi() {
    if (this.isEvaluated) {
      this.exprTokens = [];
      this.isEvaluated = false;
    }

    const lastToken = this.exprTokens[this.exprTokens.length - 1];
    if (lastToken && (!isNaN(lastToken) || lastToken === 'PI' || lastToken === ')')) {
      this.exprTokens.push('*');
    }
    this.exprTokens.push('PI');
  }

  applyPercent() {
    if (this.exprTokens.length === 0) return;
    this.appendOperator('%');
  }

  calculate() {
    if (this.exprTokens.length === 0) return { result: '0', error: null };

    try {
      const val = evaluateTokens(this.exprTokens);
      const formatted = formatResult(val);

      this.isEvaluated = true;
      if (formatted !== 'Error') {
        this.lastResult = formatted;
        this.lastError = null;
        this.exprTokens = [formatted];
      } else {
        this.lastResult = 'Error';
        this.lastError = 'Invalid calculation';
        this.exprTokens = [];
      }
      return { result: formatted, error: null };
    } catch (err) {
      this.isEvaluated = false;
      this.lastResult = 'Error';
      this.lastError = err.message;
      this.exprTokens = [];
      return { result: 'Error', error: err.message };
    }
  }

  clearAll() {
    this.exprTokens = [];
    this.isEvaluated = false;
    this.lastResult = null;
    this.lastError = null;
  }

  backspace() {
    if (this.isEvaluated) {
      this.clearAll();
      return;
    }

    if (this.exprTokens.length === 0) return;

    const lastToken = this.exprTokens[this.exprTokens.length - 1];
    if (!isNaN(lastToken) && lastToken.length > 1) {
      this.exprTokens[this.exprTokens.length - 1] = lastToken.slice(0, -1);
    } else {
      this.exprTokens.pop();
    }
  }

  getDisplayExpression() {
    const displayStr = this.exprTokens.map(t => {
      if (t === '*') return '×';
      if (t === '/') return '÷';
      if (t === '-') return '−';
      if (t === 'sqrt(') return '√(';
      if (t === 'PI') return 'π';
      return t;
    }).join(' ');

    return displayStr;
  }

  getDisplayResult() {
    if (this.lastResult !== null) return this.lastResult;
    return this.getDisplayExpression() || '0';
  }
}

// Module export support (Node.js/CommonJS)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    evaluateTokens,
    formatResult,
    CalculatorEngine
  };
}
