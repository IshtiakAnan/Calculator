# Scientific Calculator

A sleek, modern scientific calculator built with HTML, CSS, and JavaScript.

## Features

- **Basic Arithmetic** — Addition, Subtraction, Multiplication, Division
- **Square** — Compute the square of any number (x²)
- **Square Root** — Compute the square root of any number (√)
- **Trigonometry** — sin, cos, tan (degree-based)
- **Logarithm** — Base-10 logarithm (log)
- **Pi** — Insert the value of π (3.14159...)
- **Percent** — Convert a number to its percentage
- **Parentheses** — Support for grouped expressions
- **Responsive UI** — Clean dark theme with smooth interactions
- **Keyboard Support** — Use your keyboard for quick input

## Screenshot

![Calculator UI](calculator-screenshot.png)

## Getting Started

Open `index.html` in any modern browser. No build tools or dependencies required.

```bash
# Simply open the file
open index.html
```

## Keyboard Shortcuts

| Key       | Action            |
|-----------|-------------------|
| `0-9`     | Enter number      |
| `.`       | Decimal point     |
| `+`       | Addition          |
| `-`       | Subtraction       |
| `*`       | Multiplication    |
| `/`       | Division          |
| `Enter`   | Equals            |
| `Backspace` | Clear last digit |
| `Escape`  | Clear all         |

## Testing

This project includes a comprehensive, zero-dependency automated test suite covering 50 unit tests across 7 suites (arithmetic, precedence, parentheses, scientific functions, unary operations, edge cases, and UI interactions).

### Option 1: Run in Browser (Interactive GUI)

Open `test.html` in any web browser:

```bash
open test.html
# or with Brave/Firefox/Chrome
brave test.html
```

Features:
- Visual pass/fail status and execution timings
- Filter tests (All / Failed Only / Passed Only)
- Detailed error diagnostics with expected vs actual values
- Re-run test suite button

### Option 2: Run from Terminal (Headless CLI)

Run the automated test runner directly from your terminal:

```bash
./run-tests.sh
```

## Project Structure

```
Calculator/
├── index.html       # Main calculator application UI
├── calculator.js    # Core calculation engine, Shunting-Yard parser & state
├── test.html        # Interactive in-browser automated test runner
├── run-tests.sh     # Headless CLI test runner script
└── README.md        # Project documentation
```
