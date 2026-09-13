// ============================================================
// NFA GENERATOR
// AutomataLab
// ============================================================


// ============================================================
// HELPERS
// ============================================================

const makeState = (
  id,
  x,
  y,
  isStart = false,
  isFinal = false
) => ({
  id,
  name: id,
  x,
  y,
  isStart,
  isFinal,
});


const makeTransition = (
  from,
  to,
  symbol
) => ({
  id: crypto.randomUUID(),
  from,
  to,
  symbol,
});


// ============================================================
// ENDING WITH
// ============================================================
//
// Example: ending with 01
//
//          0,1
//         ↺
//       ┌─────┐
//       │     │
//       ▼     │
// → q0 ─0→ q1 ─1→ ((q2))
//
// ============================================================

const generateEndsWith = (
  pattern,
  alphabet
) => {

  const states = [];
  const transitions = [];

  const n = pattern.length;

  // ----------------------------------------------------------
  // STATES
  // ----------------------------------------------------------

  for (let i = 0; i <= n; i++) {

    states.push(
      makeState(
        `q${i}`,
        250 + i * 180,
        330,
        i === 0,
        i === n
      )
    );

  }

  // ----------------------------------------------------------
  // q0 LOOP ON ALL SYMBOLS
  // ----------------------------------------------------------

  for (const symbol of alphabet) {

    transitions.push(
      makeTransition(
        "q0",
        "q0",
        symbol
      )
    );

  }

  // ----------------------------------------------------------
  // PATTERN PATH
  // ----------------------------------------------------------

  for (let i = 0; i < n; i++) {

    transitions.push(
      makeTransition(
        `q${i}`,
        `q${i + 1}`,
        pattern[i]
      )
    );

  }

  return {
    states,
    transitions,
    startState: "q0",
    finalStates: [`q${n}`],
  };
};


// ============================================================
// CONTAINS
// ============================================================
//
// Example: containing 101
//
//          0,1
//         ↺
//       ┌─────┐
//       │     │
//       ▼     │
// → q0 ─1→ q1 ─0→ q2 ─1→ ((q3))
//                           ↺
//                           0,1
//
// ============================================================

const generateContains = (
  pattern,
  alphabet
) => {

  const states = [];
  const transitions = [];

  const n = pattern.length;

  // ----------------------------------------------------------
  // STATES
  // ----------------------------------------------------------

  for (let i = 0; i <= n; i++) {

    states.push(
      makeState(
        `q${i}`,
        200 + i * 180,
        330,
        i === 0,
        i === n
      )
    );

  }

  // ----------------------------------------------------------
  // q0 LOOP ON ALL SYMBOLS
  // ----------------------------------------------------------

  for (const symbol of alphabet) {

    transitions.push(
      makeTransition(
        "q0",
        "q0",
        symbol
      )
    );

  }

  // ----------------------------------------------------------
  // PATTERN PATH
  // ----------------------------------------------------------

  for (let i = 0; i < n; i++) {

    transitions.push(
      makeTransition(
        `q${i}`,
        `q${i + 1}`,
        pattern[i]
      )
    );

  }

  // ----------------------------------------------------------
  // FINAL STATE LOOP
  // ----------------------------------------------------------

  for (const symbol of alphabet) {

    transitions.push(
      makeTransition(
        `q${n}`,
        `q${n}`,
        symbol
      )
    );

  }

  return {
    states,
    transitions,
    startState: "q0",
    finalStates: [`q${n}`],
  };
};


// ============================================================
// STARTING WITH
// ============================================================
//
// Example: starting with 1
//
// → q0 ─1→ ((q1))
//            ↺
//            0,1
//
// q0 MUST NOT have a loop.
// ============================================================

const generateStartsWith = (
  pattern,
  alphabet
) => {

  const states = [];
  const transitions = [];

  const n = pattern.length;

  // ----------------------------------------------------------
  // STATES
  // ----------------------------------------------------------

  for (let i = 0; i <= n; i++) {

    states.push(
      makeState(
        `q${i}`,
        300 + i * 180,
        330,
        i === 0,
        i === n
      )
    );

  }

  // ----------------------------------------------------------
  // PATTERN PATH
  // ----------------------------------------------------------

  for (let i = 0; i < n; i++) {

    transitions.push(
      makeTransition(
        `q${i}`,
        `q${i + 1}`,
        pattern[i]
      )
    );

  }

  // ----------------------------------------------------------
  // FINAL STATE LOOP
  // ----------------------------------------------------------

  for (const symbol of alphabet) {

    transitions.push(
      makeTransition(
        `q${n}`,
        `q${n}`,
        symbol
      )
    );

  }

  return {
    states,
    transitions,
    startState: "q0",
    finalStates: [`q${n}`],
  };
};


// ============================================================
// AT LEAST ONE SYMBOL
// ============================================================
//
// Example: at least one 1
//
// → q0 ─1→ ((q1))
//    ↺0     ↺0,1
//
// ============================================================

const generateAtLeastOne = (
  symbol,
  alphabet
) => {

  const states = [

    makeState(
      "q0",
      300,
      330,
      true,
      false
    ),

    makeState(
      "q1",
      520,
      330,
      false,
      true
    ),

  ];

  const transitions = [];

  // q0 loops on everything except target symbol

  for (const currentSymbol of alphabet) {

    if (
      currentSymbol !== symbol
    ) {

      transitions.push(
        makeTransition(
          "q0",
          "q0",
          currentSymbol
        )
      );

    }

  }

  // Target symbol moves to final

  transitions.push(
    makeTransition(
      "q0",
      "q1",
      symbol
    )
  );

  // Final state loops on everything

  for (const currentSymbol of alphabet) {

    transitions.push(
      makeTransition(
        "q1",
        "q1",
        currentSymbol
      )
    );

  }

  return {
    states,
    transitions,
    startState: "q0",
    finalStates: ["q1"],
  };
};


// ============================================================
// MAIN GENERATOR
// ============================================================

export const generateNFA = (
  parsed
) => {

  if (!parsed) {
    throw new Error(
      "Parsed NFA question is missing."
    );
  }

  const alphabet =
    Array.isArray(parsed.alphabet) &&
    parsed.alphabet.length > 0
      ? parsed.alphabet
      : ["0", "1"];

  const pattern =
    String(
      parsed.pattern || ""
    ).trim();

  if (!pattern) {
    throw new Error(
      "NFA pattern is missing."
    );
  }

  let generated;

  // ----------------------------------------------------------
  // ENDING
  // ----------------------------------------------------------

  if (
    parsed.languageType ===
    "ends-with"
  ) {

    generated =
      generateEndsWith(
        pattern,
        alphabet
      );

  }

  // ----------------------------------------------------------
  // STARTING
  // ----------------------------------------------------------

  else if (
    parsed.languageType ===
    "starts-with"
  ) {

    generated =
      generateStartsWith(
        pattern,
        alphabet
      );

  }

  // ----------------------------------------------------------
  // CONTAINS
  // ----------------------------------------------------------

  else if (
    parsed.languageType ===
    "contains"
  ) {

    generated =
      generateContains(
        pattern,
        alphabet
      );

  }

  // ----------------------------------------------------------
  // AT LEAST ONE
  // ----------------------------------------------------------

  else if (
    parsed.languageType ===
    "at-least-one"
  ) {

    generated =
      generateAtLeastOne(
        pattern[0],
        alphabet
      );

  }

  else {

    throw new Error(
      `Unsupported NFA language type: ${parsed.languageType}`
    );

  }

  // ==========================================================
  // FINAL AUTOMATON
  // ==========================================================

  return {
    id: null,

    name:
      parsed.name ||
      "Generated NFA",

    type: "NFA",

    alphabet,

    states:
      generated.states,

    transitions:
      generated.transitions,

    startState:
      generated.startState,

    finalStates:
      generated.finalStates,
  };
};