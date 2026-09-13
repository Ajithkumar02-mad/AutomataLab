export const createInitialAutomaton = () => ({
  id: null,

  name: "Untitled Automaton",

  type: "DFA",

  alphabet: [],

  states: [],

  transitions: [],

  startState: null,

  finalStates: [],
});


export const createState = (
  id,
  x,
  y
) => ({
  id,

  name: id,

  x,

  y,

  isStart: false,

  isFinal: false,
});


export const createTransition = (
  from,
  to,
  symbol
) => ({
  id: crypto.randomUUID(),

  from,

  to,

  symbol,
});