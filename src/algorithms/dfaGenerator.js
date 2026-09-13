/*
 * AutomataLab
 * Deterministic DFA Generator
 */

const state = (
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

const transition = (
  id,
  from,
  to,
  symbol
) => ({
  id,
  from,
  to,
  symbol,
});

const makeId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `t-${Date.now()}-${Math.random()}`;
};

/*
 * =========================================================
 * ENDING WITH PATTERN
 * =========================================================
 *
 * States represent the longest suffix of the input
 * that is also a prefix of the required pattern.
 */

const buildEndingDFA = (pattern) => {
  const m = pattern.length;

  const states = [];

  for (let i = 0; i <= m; i++) {
    states.push(
      state(
        `q${i}`,
        250 + i * 150,
        300,
        i === 0,
        i === m
      )
    );
  }

  const transitions = [];

  const alphabet = ["0", "1"];

  for (let i = 0; i <= m; i++) {
    for (const symbol of alphabet) {
      const candidate =
        pattern.slice(0, i) + symbol;

      let next = Math.min(
        candidate.length,
        m
      );

      while (
        next > 0 &&
        !candidate.endsWith(
          pattern.slice(0, next)
        )
      ) {
        next--;
      }

      transitions.push(
        transition(
          makeId(),
          `q${i}`,
          `q${next}`,
          symbol
        )
      );
    }
  }

  return {
    name: `DFA - strings ending with ${pattern}`,
    type: "DFA",
    alphabet,
    states,
    transitions,
    startState: "q0",
    finalStates: [`q${m}`],
  };
};

/*
 * =========================================================
 * CONTAINING PATTERN
 * =========================================================
 */

const buildContainingDFA = (pattern) => {
  const m = pattern.length;

  const states = [];

  for (let i = 0; i <= m; i++) {
    states.push(
      state(
        `q${i}`,
        250 + i * 150,
        300,
        i === 0,
        i === m
      )
    );
  }

  const transitions = [];

  const alphabet = ["0", "1"];

  for (let i = 0; i <= m; i++) {
    for (const symbol of alphabet) {
      let next;

      if (i === m) {
        next = m;
      } else {
        const candidate =
          pattern.slice(0, i) + symbol;

        next = Math.min(
          candidate.length,
          m
        );

        while (
          next > 0 &&
          !candidate.endsWith(
            pattern.slice(0, next)
          )
        ) {
          next--;
        }
      }

      transitions.push(
        transition(
          makeId(),
          `q${i}`,
          `q${next}`,
          symbol
        )
      );
    }
  }

  return {
    name: `DFA - strings containing ${pattern}`,
    type: "DFA",
    alphabet,
    states,
    transitions,
    startState: "q0",
    finalStates: [`q${m}`],
  };
};

/*
 * =========================================================
 * STARTING WITH
 * =========================================================
 */

const buildStartingDFA = (firstSymbol) => {
  const other =
    firstSymbol === "0"
      ? "1"
      : "0";

  const states = [
    state("q0", 300, 300, true, false),
    state("q1", 500, 300, false, true),
    state("qdead", 700, 300, false, false),
  ];

  const transitions = [
    transition(makeId(), "q0", "q1", firstSymbol),
    transition(makeId(), "q0", "qdead", other),

    transition(makeId(), "q1", "q1", "0"),
    transition(makeId(), "q1", "q1", "1"),

    transition(makeId(), "qdead", "qdead", "0"),
    transition(makeId(), "qdead", "qdead", "1"),
  ];

  return {
    name: `DFA - strings starting with ${firstSymbol}`,
    type: "DFA",
    alphabet: ["0", "1"],
    states,
    transitions,
    startState: "q0",
    finalStates: ["q1"],
  };
};

/*
 * =========================================================
 * PARITY DFA
 * =========================================================
 */

const buildParityDFA = (symbol, odd) => {
  const evenName = "qEven";
  const oddName = "qOdd";

  const states = [
    state(
      evenName,
      350,
      300,
      true,
      !odd
    ),

    state(
      oddName,
      600,
      300,
      false,
      odd
    ),
  ];

  const transitions = [];

  const other =
    symbol === "0"
      ? "1"
      : "0";

  transitions.push(
    transition(
      makeId(),
      evenName,
      oddName,
      symbol
    )
  );

  transitions.push(
    transition(
      makeId(),
      oddName,
      evenName,
      symbol
    )
  );

  transitions.push(
    transition(
      makeId(),
      evenName,
      evenName,
      other
    )
  );

  transitions.push(
    transition(
      makeId(),
      oddName,
      oddName,
      other
    )
  );

  return {
    name: `DFA - ${odd ? "odd" : "even"} number of ${symbol}s`,
    type: "DFA",
    alphabet: ["0", "1"],
    states,
    transitions,
    startState: evenName,
    finalStates: [
      odd ? oddName : evenName,
    ],
  };
};

/*
 * =========================================================
 * EXACTLY TWO 1s
 * =========================================================
 */

const buildExactlyTwoOnes = () => {
  const states = [
    state("q0", 200, 300, true, false),
    state("q1", 400, 300, false, false),
    state("q2", 600, 300, false, true),
    state("qdead", 800, 300, false, false),
  ];

  const transitions = [
    transition(makeId(), "q0", "q0", "0"),
    transition(makeId(), "q0", "q1", "1"),

    transition(makeId(), "q1", "q1", "0"),
    transition(makeId(), "q1", "q2", "1"),

    transition(makeId(), "q2", "q2", "0"),
    transition(makeId(), "q2", "qdead", "1"),

    transition(makeId(), "qdead", "qdead", "0"),
    transition(makeId(), "qdead", "qdead", "1"),
  ];

  return {
    name: "DFA - exactly two 1s",
    type: "DFA",
    alphabet: ["0", "1"],
    states,
    transitions,
    startState: "q0",
    finalStates: ["q2"],
  };
};

/*
 * =========================================================
 * DIVISIBLE BY 3
 * =========================================================
 */

const buildDivisibleBy3 = () => {
  const states = [
    state("q0", 300, 300, true, true),
    state("q1", 500, 420, false, false),
    state("q2", 700, 300, false, false),
  ];

  const transitions = [
    transition(makeId(), "q0", "q0", "0"),
    transition(makeId(), "q0", "q1", "1"),

    transition(makeId(), "q1", "q2", "0"),
    transition(makeId(), "q1", "q0", "1"),

    transition(makeId(), "q2", "q1", "0"),
    transition(makeId(), "q2", "q2", "1"),
  ];

  return {
    name: "DFA - binary numbers divisible by 3",
    type: "DFA",
    alphabet: ["0", "1"],
    states,
    transitions,
    startState: "q0",
    finalStates: ["q0"],
  };
};

/*
 * =========================================================
 * MAIN GENERATOR
 * =========================================================
 */

export const generateDFA = (parsedQuestion) => {
  if (!parsedQuestion?.success) {
    return {
      success: false,
      error:
        parsedQuestion?.error ||
        "Invalid automata question.",
    };
  }

  let automaton;

  switch (parsedQuestion.type) {
    case "ending":
      automaton =
        buildEndingDFA(
          parsedQuestion.pattern
        );
      break;

    case "containing":
      automaton =
        buildContainingDFA(
          parsedQuestion.pattern
        );
      break;

    case "starting":
      automaton =
        buildStartingDFA(
          parsedQuestion.pattern
        );
      break;

    case "even-zero":
      automaton =
        buildParityDFA("0", false);
      break;

    case "odd-zero":
      automaton =
        buildParityDFA("0", true);
      break;

    case "even-one":
      automaton =
        buildParityDFA("1", false);
      break;

    case "odd-one":
      automaton =
        buildParityDFA("1", true);
      break;

    case "exactly-two-one":
      automaton =
        buildExactlyTwoOnes();
      break;

    case "divisible-by-3":
      automaton =
        buildDivisibleBy3();
      break;

    default:
      return {
        success: false,
        error: "Unsupported DFA problem.",
      };
  }

  return {
    success: true,
    automaton,
  };
};