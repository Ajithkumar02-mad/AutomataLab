/**
 * ============================================================
 * AutomataLab
 * NFA Simulation Engine
 * ============================================================
 *
 * NFA RULE:
 *
 * An NFA may have multiple possible destinations for the
 * same state and input symbol.
 *
 * Example:
 *
 * q0 --0--> q1
 * q0 --0--> q2
 *
 * This is VALID in an NFA.
 *
 * The simulator therefore keeps a SET of possible states.
 *
 *
 * A label:
 *
 * q2 --0,1--> q2
 *
 * is interpreted as:
 *
 * q2 --0--> q2
 * q2 --1--> q2
 *
 *
 * ε transitions are intentionally NOT processed here.
 * They will be handled by the ε-NFA engine.
 *
 * ============================================================
 */


/**
 * ------------------------------------------------------------
 * Convert transition label to individual symbols
 * ------------------------------------------------------------
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


  return String(
    transition.symbol
  )
    .split(",")
    .map(
      (symbol) =>
        symbol.trim()
    )
    .filter(Boolean);
};


/**
 * ------------------------------------------------------------
 * Check whether a symbol is epsilon
 * ------------------------------------------------------------
 */
export const isEpsilonSymbol = (
  symbol
) => {

  const value =
    String(symbol)
      .trim()
      .toLowerCase();

  return (
    value === "ε" ||
    value === "epsilon" ||
    value === "eps"
  );
};


/**
 * ============================================================
 * GET ALL NFA TRANSITIONS
 * ============================================================
 *
 * Returns EVERY transition that can consume the given symbol.
 *
 * Example:
 *
 * q0 --0--> q1
 * q0 --0--> q2
 *
 * getNFATransitions(
 *   automaton,
 *   "q0",
 *   "0"
 * )
 *
 * returns BOTH transitions.
 */
export const getNFATransitions = (
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
    return [];
  }


  return automaton.transitions.filter(
    (transition) => {

      if (
        transition.from !==
        stateId
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
  );
};


/**
 * ============================================================
 * SIMULATE NFA
 * ============================================================
 */
export const simulateNFA = (
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
  // CURRENT POSSIBLE STATES
  // ----------------------------------------------------------

  let currentStates =
    new Set([
      automaton.startState,
    ]);


  // ----------------------------------------------------------
  // INITIAL STEP
  // ----------------------------------------------------------

  const steps = [
    {
      step: 0,

      symbol: null,

      states: [
        ...currentStates,
      ],

      transitionIds: [],
    },
  ];


  // ----------------------------------------------------------
  // EMPTY INPUT
  // ----------------------------------------------------------

  if (value.length === 0) {

    const accepted =
      [
        ...currentStates,
      ].some(
        (state) =>
          finalStates.includes(
            state
          )
      );


    return {

      success: true,

      accepted,

      error: accepted
        ? null
        : `Input is empty and the start state "${automaton.startState}" is not final.`,

      steps,

      currentStates: [
        ...currentStates,
      ],

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
    // NEXT POSSIBLE STATES
    // --------------------------------------------------------

    const nextStates =
      new Set();


    const transitionIds =
      [];


    // --------------------------------------------------------
    // CHECK EVERY CURRENT STATE
    // --------------------------------------------------------

    currentStates.forEach(
      (currentState) => {

        const matchingTransitions =
          getNFATransitions(
            automaton,
            currentState,
            symbol
          );


        matchingTransitions.forEach(
          (transition) => {

            // ----------------------------------------------
            // NFA does not process epsilon here.
            // ----------------------------------------------

            if (
              transition.symbol &&
              isEpsilonSymbol(
                transition.symbol
              )
            ) {
              return;
            }


            nextStates.add(
              transition.to
            );


            if (
              transition.id
            ) {

              transitionIds.push(
                transition.id
              );
            }
          }
        );
      }
    );


    // --------------------------------------------------------
    // NO POSSIBLE PATH
    // --------------------------------------------------------

    if (
      nextStates.size === 0
    ) {

      const stoppedStates =
        [
          ...currentStates,
        ];


      return {

        success: true,

        accepted: false,

        error:
          `No transition from any current state for input symbol "${symbol}" at position ${
            index + 1
          }.`,


        steps,


        stoppedAt: {

          states:
            stoppedStates,

          symbol,

          position:
            index,

          inputPosition:
            index + 1,
        },


        currentStates:
          stoppedStates,


        consumedInput:
          value.slice(
            0,
            index
          ),


        remainingInput:
          value.slice(index),


        totalSteps:
          steps.length - 1,
      };
    }


    // --------------------------------------------------------
    // MOVE TO NEXT STATE SET
    // --------------------------------------------------------

    currentStates =
      nextStates;


    // --------------------------------------------------------
    // RECORD STEP
    // --------------------------------------------------------

    steps.push({

      step:
        index + 1,

      symbol,

      states: [
        ...currentStates,
      ],

      transitionIds: [
        ...new Set(
          transitionIds
        ),
      ],
    });
  }


  // ----------------------------------------------------------
  // FINAL STATE CHECK
  // ----------------------------------------------------------

  const currentStateArray =
    [
      ...currentStates,
    ];


  const accepted =
    currentStateArray.some(
      (state) =>
        finalStates.includes(
          state
        )
    );


  // ----------------------------------------------------------
  // RESULT
  // ----------------------------------------------------------

  return {

    success: true,

    accepted,

    error: accepted
      ? null
      : `Input was completely processed, but none of the possible states (${currentStateArray.join(
          ", "
        )}) is final.`,


    steps,


    currentStates:
      currentStateArray,


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
 * SIMPLE NFA ACCEPTANCE CHECK
 * ============================================================
 */
export const acceptsNFA = (
  automaton,
  inputString
) => {

  const result =
    simulateNFA(
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
 * NFA VALIDATION
 * ============================================================
 *
 * NFA allows:
 *
 * q0 --0--> q1
 * q0 --0--> q2
 *
 * Therefore we DO NOT perform the DFA duplicate check.
 *
 * We only validate:
 *
 * 1. Start state
 * 2. Source states
 * 3. Destination states
 * 4. No epsilon transitions
 *
 * ε-NFA will be implemented separately.
 */
export const validateNFAForSimulation = (
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
  // TRANSITION VALIDATION
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
  // EPSILON VALIDATION
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


      const containsEpsilon =
        symbols.some(
          (symbol) =>
            isEpsilonSymbol(
              symbol
            )
        );


      if (
        containsEpsilon
      ) {

        errors.push(
          `Transition ${
            index + 1
          }: NFA cannot contain ε transitions. Use ε-NFA mode for epsilon transitions.`
        );
      }
    }
  );


  // ----------------------------------------------------------
  // RETURN
  // ----------------------------------------------------------

  return errors;
};