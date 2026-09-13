/**
 * =========================================================
 * AutomataLab - DFA Simulation Engine
 * =========================================================
 *
 * Formal DFA simulation:
 *
 * M = (Q, Σ, δ, q0, F)
 *
 * A string is accepted iff:
 *
 *   1. Every input symbol can be processed
 *   2. The complete input is consumed
 *   3. The final state belongs to F
 *
 * NOTHING is hard-coded for particular inputs.
 * =========================================================
 */


/**
 * ---------------------------------------------------------
 * Get final states
 * ---------------------------------------------------------
 *
 * finalStates is the canonical source.
 */
const getFinalStates = (automaton) => {
  if (
    Array.isArray(
      automaton.finalStates
    )
  ) {
    return new Set(
      automaton.finalStates
    );
  }

  return new Set();
};


/**
 * ---------------------------------------------------------
 * Find transition
 * ---------------------------------------------------------
 *
 * DFA transition:
 *
 * δ(currentState, symbol)
 */
const findTransition = (
  transitions,
  currentState,
  symbol
) => {
  return (
    transitions.find(
      (transition) =>
        transition.from ===
          currentState &&
        transition.symbol ===
          symbol
    ) || null
  );
};


/**
 * =========================================================
 * SIMULATE DFA
 * =========================================================
 */

export const simulateDFA = (
  automaton,
  inputString
) => {

  // -------------------------------------------------------
  // BASIC CHECK
  // -------------------------------------------------------

  if (!automaton) {
    return {
      success: false,
      accepted: false,
      error:
        "No automaton was provided.",
      steps: [],
    };
  }


  // -------------------------------------------------------
  // DATA
  // -------------------------------------------------------

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

  const alphabet =
    Array.isArray(
      automaton.alphabet
    )
      ? automaton.alphabet
      : [];

  const finalStates =
    getFinalStates(
      automaton
    );


  // -------------------------------------------------------
  // START STATE
  // -------------------------------------------------------

  const startState =
    automaton.startState;


  if (!startState) {
    return {
      success: false,
      accepted: false,

      error:
        "No start state has been defined.",

      explanation:
        "A DFA must have exactly one start state.",

      steps: [],
    };
  }


  // -------------------------------------------------------
  // START STATE EXISTS?
  // -------------------------------------------------------

  const startExists =
    states.some(
      (state) =>
        state.id === startState
    );


  if (!startExists) {
    return {
      success: false,
      accepted: false,

      error:
        `Start state "${startState}" does not exist.`,

      explanation:
        "The DFA cannot start because its configured start state is not present in the automaton.",

      steps: [],
    };
  }


  // -------------------------------------------------------
  // INPUT
  // -------------------------------------------------------

  const input =
    inputString ===
      null ||
    inputString ===
      undefined
      ? ""
      : String(
          inputString
        );


  // -------------------------------------------------------
  // INPUT SYMBOL VALIDATION
  // -------------------------------------------------------

  for (
    let i = 0;
    i < input.length;
    i++
  ) {

    const symbol =
      input[i];


    /*
     * If an alphabet is explicitly defined,
     * every input symbol must belong to it.
     */
    if (
      alphabet.length > 0 &&
      !alphabet.includes(
        symbol
      )
    ) {

      return {
        success: true,
        accepted: false,

        error:
          `Input symbol "${symbol}" is not part of the DFA alphabet.`,

        explanation:
          `The symbol "${symbol}" does not belong to the DFA's defined alphabet.`,

        steps: [],

        stoppedAt: {
          state:
            startState,

          symbol,

          position: i,
        },

        consumedInput:
          input.slice(
            0,
            i
          ),

        remainingInput:
          input.slice(i),
      };
    }
  }


  // -------------------------------------------------------
  // INITIAL STATE
  // -------------------------------------------------------

  let currentState =
    startState;


  /*
   * Step 0 means:
   *
   * Before reading any input,
   * the DFA is at q0.
   */
  const steps = [
    {
      step: 0,

      state:
        currentState,

      symbol: null,

      nextState:
        currentState,

      transitionId:
        null,

      position: -1,
    },
  ];


  // =======================================================
  // PROCESS INPUT
  // =======================================================

  for (
    let index = 0;
    index < input.length;
    index++
  ) {

    const symbol =
      input[index];


    // -----------------------------------------------------
    // FIND δ(currentState, symbol)
    // -----------------------------------------------------

    const transition =
      findTransition(
        transitions,
        currentState,
        symbol
      );


    // -----------------------------------------------------
    // NO TRANSITION
    // -----------------------------------------------------

    if (!transition) {

      return {
        success: true,

        accepted: false,

        error:
          `No transition from ${currentState} for input symbol "${symbol}" at position ${index + 1}.`,

        explanation:
          `The DFA is currently in ${currentState}, but no transition exists for the symbol "${symbol}". Therefore the DFA cannot consume the remaining input.`,

        steps,

        stoppedAt: {
          state:
            currentState,

          symbol,

          position:
            index,
        },

        consumedInput:
          input.slice(
            0,
            index
          ),

        remainingInput:
          input.slice(
            index
          ),

        currentState,
      };
    }


    // -----------------------------------------------------
    // TRANSITION EXISTS
    // -----------------------------------------------------

    const nextState =
      transition.to;


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

      position:
        index,
    });


    // Move DFA
    currentState =
      nextState;
  }


  // =======================================================
  // INPUT COMPLETELY CONSUMED
  // =======================================================

  const accepted =
    finalStates.has(
      currentState
    );


  // -------------------------------------------------------
  // ACCEPTED
  // -------------------------------------------------------

  if (accepted) {

    return {
      success: true,

      accepted: true,

      error: null,

      explanation:
        `The complete input was consumed and the DFA ended in final state ${currentState}.`,

      steps,

      currentState,

      consumedInput:
        input,

      remainingInput:
        "",

      totalSteps:
        input.length,
    };
  }


  // -------------------------------------------------------
  // REJECTED - NON FINAL STATE
  // -------------------------------------------------------

  return {
    success: true,

    accepted: false,

    error:
      `Input was completely processed, but ${currentState} is not a final state.`,

    explanation:
      `The complete input was consumed, but the DFA ended in ${currentState}, which is not a final state.`,

    steps,

    currentState,

    consumedInput:
      input,

    remainingInput:
      "",

    totalSteps:
      input.length,
  };
};


/**
 * =========================================================
 * GET DFA TRANSITION
 * =========================================================
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


  return findTransition(
    automaton.transitions,
    stateId,
    symbol
  );
};


/**
 * =========================================================
 * ACCEPTS DFA
 * =========================================================
 *
 * Simple true / false helper.
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
 * =========================================================
 * VALIDATE DFA
 * =========================================================
 *
 * This checks whether the structure itself follows
 * DFA requirements.
 */

export const validateDFAForSimulation = (
  automaton
) => {

  const errors = [];


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


  const alphabet =
    Array.isArray(
      automaton.alphabet
    )
      ? automaton.alphabet
      : [];


  // -------------------------------------------------------
  // STATE EXISTENCE
  // -------------------------------------------------------

  if (
    states.length === 0
  ) {

    errors.push(
      "The DFA has no states."
    );
  }


  // -------------------------------------------------------
  // START STATE
  // -------------------------------------------------------

  if (
    !automaton.startState
  ) {

    errors.push(
      "No start state is defined."
    );

  } else {

    const startExists =
      states.some(
        (state) =>
          state.id ===
          automaton.startState
      );


    if (!startExists) {

      errors.push(
        `Start state "${automaton.startState}" does not exist.`
      );
    }
  }


  // -------------------------------------------------------
  // FINAL STATES EXIST
  // -------------------------------------------------------

  const finalStates =
    Array.isArray(
      automaton.finalStates
    )
      ? automaton.finalStates
      : [];


  finalStates.forEach(
    (finalStateId) => {

      const exists =
        states.some(
          (state) =>
            state.id ===
            finalStateId
        );


      if (!exists) {

        errors.push(
          `Final state "${finalStateId}" does not exist.`
        );
      }
    }
  );


  // -------------------------------------------------------
  // TRANSITIONS
  // -------------------------------------------------------

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
          `Transition ${index + 1}: source state "${transition.from}" does not exist.`
        );
      }


      if (!toExists) {

        errors.push(
          `Transition ${index + 1}: destination state "${transition.to}" does not exist.`
        );
      }


      // DFA cannot use epsilon
      if (
        transition.symbol ===
        "ε"
      ) {

        errors.push(
          `Transition ${index + 1}: DFA cannot contain ε transitions.`
        );
      }


      // Empty symbol
      if (
        !transition.symbol ||
        transition.symbol.trim() ===
          ""
      ) {

        errors.push(
          `Transition ${index + 1}: transition symbol cannot be empty.`
        );
      }


      // Alphabet check
      if (
        alphabet.length > 0 &&
        transition.symbol &&
        !alphabet.includes(
          transition.symbol
        )
      ) {

        errors.push(
          `Transition ${index + 1}: symbol "${transition.symbol}" is not in the DFA alphabet.`
        );
      }
    }
  );


  // -------------------------------------------------------
  // DFA DETERMINISM
  // -------------------------------------------------------

  const seen =
    new Set();


  transitions.forEach(
    (transition) => {

      const key =
        `${transition.from}::${transition.symbol}`;


      if (
        seen.has(key)
      ) {

        errors.push(
          `DFA violation: multiple transitions exist from "${transition.from}" using symbol "${transition.symbol}".`
        );
      }


      seen.add(key);
    }
  );


  return errors;
};