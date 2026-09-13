/**
 * ============================================================
 * AutomataLab
 * DFA Simulation Engine
 * ============================================================
 *
 * DFA RULE:
 *
 * For every state and every input symbol there can be
 * ONLY ONE destination state.
 *
 * Example:
 *
 * q0 --0--> q1     ✅
 * q0 --1--> q2     ✅
 *
 * q0 --0--> q1
 * q0 --0--> q2     ❌ INVALID DFA
 *
 * A transition label such as:
 *
 * q2 --0,1--> q2
 *
 * is treated as:
 *
 * q2 --0--> q2
 * q2 --1--> q2
 *
 * ============================================================
 */


/**
 * ------------------------------------------------------------
 * Convert transition label into individual symbols
 * ------------------------------------------------------------
 *
 * "0"       -> ["0"]
 * "0,1"     -> ["0", "1"]
 * "a,b,c"   -> ["a", "b", "c"]
 *
 * Spaces are automatically removed.
 */
export const getTransitionSymbols = (
  transition
) => {
  if (
    !transition ||
    transition.symbol === null ||
    transition.symbol === undefined
  ) {
    return [];
  }

  return String(transition.symbol)
    .split(",")
    .map((symbol) => symbol.trim())
    .filter(Boolean);
};


/**
 * ------------------------------------------------------------
 * Find DFA transition
 * ------------------------------------------------------------
 *
 * Searches for a transition from:
 *
 * state + symbol
 *
 * Example:
 *
 * q0 + 0
 *
 * If transition is:
 *
 * q0 --0,1--> q1
 *
 * it matches both 0 and 1.
 */
export const getDFATransition = (
  automaton,
  stateId,
  symbol
) => {
  if (
    !automaton ||
    !Array.isArray(
      automaton.transitions
    )
  ) {
    return null;
  }

  return (
    automaton.transitions.find(
      (transition) => {
        if (
          transition.from !== stateId
        ) {
          return false;
        }

        const symbols =
          getTransitionSymbols(
            transition
          );

        return symbols.includes(
          symbol
        );
      }
    ) || null
  );
};


/**
 * ============================================================
 * SIMULATE DFA
 * ============================================================
 */
export const simulateDFA = (
  automaton,
  inputString
) => {

  // ----------------------------------------------------------
  // AUTOMATON VALIDATION
  // ----------------------------------------------------------

  if (!automaton) {
    return {
      success: false,
      accepted: false,
      error:
        "No automaton provided.",
      steps: [],
    };
  }


  const states =
    Array.isArray(
      automaton.states
    )
      ? automaton.states
      : [];


  const transitions =
    Array.isArray(
      automaton.transitions
    )
      ? automaton.transitions
      : [];


  const finalStates =
    Array.isArray(
      automaton.finalStates
    )
      ? automaton.finalStates
      : [];


  // ----------------------------------------------------------
  // START STATE
  // ----------------------------------------------------------

  if (!automaton.startState) {
    return {
      success: false,
      accepted: false,
      error:
        "No start state is defined.",
      steps: [],
    };
  }


  const startStateExists =
    states.some(
      (state) =>
        state.id ===
        automaton.startState
    );


  if (!startStateExists) {
    return {
      success: false,
      accepted: false,
      error:
        `Start state "${automaton.startState}" does not exist.`,
      steps: [],
    };
  }


  // ----------------------------------------------------------
  // INPUT
  // ----------------------------------------------------------

  const value =
    inputString === null ||
    inputString === undefined
      ? ""
      : String(inputString);


  // ----------------------------------------------------------
  // INITIAL STATE
  // ----------------------------------------------------------

  let currentState =
    automaton.startState;


  const steps = [
    {
      step: 0,
      state: currentState,
      symbol: null,
      nextState: currentState,
      transitionId: null,
    },
  ];


  // ----------------------------------------------------------
  // EMPTY STRING
  // ----------------------------------------------------------

  if (value.length === 0) {

    const accepted =
      finalStates.includes(
        currentState
      );

    return {
      success: true,
      accepted,
      error: accepted
        ? null
        : `Input is empty and the start state "${currentState}" is not final.`,

      steps,

      currentState,

      consumedInput: "",

      remainingInput: "",

      totalSteps: 0,
    };
  }


  // ----------------------------------------------------------
  // PROCESS INPUT
  // ----------------------------------------------------------

  for (
    let index = 0;
    index < value.length;
    index++
  ) {

    const symbol =
      value[index];


    // --------------------------------------------------------
    // FIND TRANSITION
    // --------------------------------------------------------

    const transition =
      getDFATransition(
        automaton,
        currentState,
        symbol
      );


    // --------------------------------------------------------
    // NO TRANSITION
    // --------------------------------------------------------

    if (!transition) {

      return {
        success: true,

        accepted: false,

        error:
          `No transition from ${currentState} for input symbol "${symbol}" at position ${
            index + 1
          }.`,


        steps,


        stoppedAt: {
          state:
            currentState,

          symbol,

          position:
            index,

          inputPosition:
            index + 1,
        },


        consumedInput:
          value.slice(
            0,
            index
          ),


        remainingInput:
          value.slice(index),


        currentState,


        totalSteps:
          steps.length - 1,
      };
    }


    // --------------------------------------------------------
    // DESTINATION
    // --------------------------------------------------------

    const nextState =
      transition.to;


    // --------------------------------------------------------
    // RECORD STEP
    // --------------------------------------------------------

    steps.push({
      step:
        index + 1,

      state:
        currentState,

      symbol,

      nextState,

      transitionId:
        transition.id ||
        null,
    });


    // --------------------------------------------------------
    // MOVE
    // --------------------------------------------------------

    currentState =
      nextState;
  }


  // ----------------------------------------------------------
  // FINAL STATE
  // ----------------------------------------------------------

  const accepted =
    finalStates.includes(
      currentState
    );


  // ----------------------------------------------------------
  // FINAL RESULT
  // ----------------------------------------------------------

  return {

    success: true,

    accepted,

    error: accepted
      ? null
      : `Input was completely processed, but "${currentState}" is not a final state.`,

    steps,

    currentState,

    consumedInput:
      value,

    remainingInput:
      "",

    totalSteps:
      value.length,
  };
};


/**
 * ============================================================
 * SIMPLE ACCEPTANCE CHECK
 * ============================================================
 */
export const acceptsDFA = (
  automaton,
  inputString
) => {

  const result =
    simulateDFA(
      automaton,
      inputString
    );

  return (
    result.success &&
    result.accepted
  );
};


/**
 * ============================================================
 * DFA VALIDATION
 * ============================================================
 *
 * Checks:
 *
 * 1. Start state exists
 * 2. Transition source exists
 * 3. Transition destination exists
 * 4. No epsilon transitions
 * 5. No duplicate symbol from same state
 *
 * IMPORTANT:
 *
 * q0 --0,1--> q1
 *
 * is expanded internally into:
 *
 * q0 --0--> q1
 * q0 --1--> q1
 *
 * This is VALID.
 *
 * But:
 *
 * q0 --0--> q1
 * q0 --0--> q2
 *
 * is INVALID.
 */
export const validateDFAForSimulation = (
  automaton
) => {

  const errors = [];


  // ----------------------------------------------------------
  // AUTOMATON
  // ----------------------------------------------------------

  if (!automaton) {

    errors.push(
      "No automaton provided."
    );

    return errors;
  }


  const states =
    Array.isArray(
      automaton.states
    )
      ? automaton.states
      : [];


  const transitions =
    Array.isArray(
      automaton.transitions
    )
      ? automaton.transitions
      : [];


  // ----------------------------------------------------------
  // START STATE
  // ----------------------------------------------------------

  if (!automaton.startState) {

    errors.push(
      "No start state is defined."
    );

  } else if (
    !states.some(
      (state) =>
        state.id ===
        automaton.startState
    )
  ) {

    errors.push(
      `Start state "${automaton.startState}" does not exist.`
    );
  }


  // ----------------------------------------------------------
  // TRANSITION STATE VALIDATION
  // ----------------------------------------------------------

  transitions.forEach(
    (
      transition,
      index
    ) => {

      const fromExists =
        states.some(
          (state) =>
            state.id ===
            transition.from
        );


      const toExists =
        states.some(
          (state) =>
            state.id ===
            transition.to
        );


      if (!fromExists) {

        errors.push(
          `Transition ${
            index + 1
          }: source state "${transition.from}" does not exist.`
        );
      }


      if (!toExists) {

        errors.push(
          `Transition ${
            index + 1
          }: destination state "${transition.to}" does not exist.`
        );
      }
    }
  );


  // ----------------------------------------------------------
  // EPSILON CHECK
  // ----------------------------------------------------------

  transitions.forEach(
    (
      transition,
      index
    ) => {

      const symbols =
        getTransitionSymbols(
          transition
        );


      if (
        symbols.includes("ε") ||
        symbols.includes("epsilon") ||
        symbols.includes("eps")
      ) {

        errors.push(
          `Transition ${
            index + 1
          }: DFA cannot contain ε transitions.`
        );
      }
    }
  );


  // ----------------------------------------------------------
  // DETERMINISM CHECK
  // ----------------------------------------------------------

  const seen =
    new Map();


  transitions.forEach(
    (
      transition,
      index
    ) => {

      const symbols =
        getTransitionSymbols(
          transition
        );


      symbols.forEach(
        (symbol) => {

          // Ignore epsilon here.
          if (
            symbol === "ε" ||
            symbol === "epsilon" ||
            symbol === "eps"
          ) {
            return;
          }


          const key =
            `${transition.from}::${symbol}`;


          if (
            seen.has(key)
          ) {

            const previous =
              seen.get(key);


            errors.push(
              `DFA violation: state "${transition.from}" has more than one transition for symbol "${symbol}" (transitions ${previous + 1} and ${index + 1}).`
            );

          } else {

            seen.set(
              key,
              index
            );
          }
        }
      );
    }
  );


  // ----------------------------------------------------------
  // RETURN
  // ----------------------------------------------------------

  return errors;
};