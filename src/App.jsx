import { useEffect, useRef, useState } from "react";

import {
  Plus,
  Play,
  RotateCcw,
  Save,
  Download,
  Settings,
  MousePointer2,
  Circle,
  ArrowRight,
  Trash2,
  Zap,
  FilePlus,
} from "lucide-react";

import Canvas from "./components/Canvas";
import TransitionModal from "./components/TransitionModal";

import {
  createInitialAutomaton,
  createState,
  createTransition,
} from "./models/automatonModel";

import {
  saveAutomaton,
} from "./utils/storage";

import {
  simulateDFA,
  validateDFAForSimulation,
} from "./algorithms/dfaSimulator";

import "./App.css";


// =========================================================
// STORAGE
// =========================================================

const CURRENT_PROJECT_KEY =
  "automatalab-current-project-v1";


// =========================================================
// LOAD CURRENT AUTOMATON
// =========================================================

const loadCurrentAutomaton = () => {
  try {
    const saved = localStorage.getItem(
      CURRENT_PROJECT_KEY
    );

    if (!saved) {
      return null;
    }

    const parsed = JSON.parse(saved);

    if (
      !parsed ||
      !Array.isArray(parsed.states) ||
      !Array.isArray(parsed.transitions)
    ) {
      return null;
    }

    return {
      ...createInitialAutomaton(),
      ...parsed,

      states: Array.isArray(parsed.states)
        ? parsed.states
        : [],

      transitions: Array.isArray(
        parsed.transitions
      )
        ? parsed.transitions
        : [],

      alphabet: Array.isArray(
        parsed.alphabet
      )
        ? parsed.alphabet
        : [],

      finalStates: Array.isArray(
        parsed.finalStates
      )
        ? parsed.finalStates
        : [],
    };
  } catch (error) {
    console.error(
      "AutomataLab load error:",
      error
    );

    return null;
  }
};


// =========================================================
// APP
// =========================================================

function App() {

  // =======================================================
  // AUTOMATON
  // =======================================================

  const [automatonType, setAutomatonType] =
    useState(() => {
      const saved =
        loadCurrentAutomaton();

      return saved?.type || "DFA";
    });


  const [automaton, setAutomaton] =
    useState(() => {
      return (
        loadCurrentAutomaton() ||
        createInitialAutomaton()
      );
    });


  // =======================================================
  // TOOL
  // =======================================================

  const [activeTool, setActiveTool] =
    useState("select");


  // =======================================================
  // INPUT
  // =======================================================

  const [input, setInput] =
    useState("");


  // =======================================================
  // DRAGGING
  // =======================================================

  const [dragging, setDragging] =
    useState(null);

  const dragMovedRef =
    useRef(false);


  // =======================================================
  // TRANSITION
  // =======================================================

  const [
    transitionStart,
    setTransitionStart,
  ] = useState(null);


  const [
    transitionModal,
    setTransitionModal,
  ] = useState({
    open: false,
    from: null,
    to: null,
  });


  // =======================================================
  // STATUS
  // =======================================================

  const [status, setStatus] =
    useState("Ready");


  // =======================================================
  // VIEWPORT
  // =======================================================

  const [viewport, setViewport] =
    useState({
      x: 0,
      y: 0,
      zoom: 1,
    });


  // =======================================================
  // SIMULATION
  // =======================================================

  const [simulation, setSimulation] =
    useState({
      running: false,
      completed: false,
      stepIndex: 0,
      result: null,
      error: null,
      currentState: null,
      activeTransitionId: null,
    });


  // =======================================================
  // AUTO SAVE
  // =======================================================

  useEffect(() => {
    try {
      localStorage.setItem(
        CURRENT_PROJECT_KEY,
        JSON.stringify(automaton)
      );
    } catch (error) {
      console.error(
        "AutomataLab save error:",
        error
      );
    }
  }, [automaton]);


  // =======================================================
  // CLEAR SIMULATION
  // =======================================================

  const clearSimulation = () => {
    setSimulation({
      running: false,
      completed: false,
      stepIndex: 0,
      result: null,
      error: null,
      currentState: null,
      activeTransitionId: null,
    });
  };


  // =======================================================
  // NEW AUTOMATON
  // =======================================================

  const handleNew = () => {
    const confirmed =
      window.confirm(
        "Create a new automaton? Current work will be cleared."
      );

    if (!confirmed) {
      return;
    }

    setAutomaton({
      ...createInitialAutomaton(),
      type: automatonType,
    });

    setInput("");

    setTransitionStart(null);

    setTransitionModal({
      open: false,
      from: null,
      to: null,
    });

    clearSimulation();

    setViewport({
      x: 0,
      y: 0,
      zoom: 1,
    });

    setStatus(
      "New automaton created"
    );
  };


  // =======================================================
  // RESET
  // =======================================================

  const handleReset = () => {
    setAutomaton({
      ...createInitialAutomaton(),
      type: automatonType,
    });

    setInput("");

    setTransitionStart(null);

    setTransitionModal({
      open: false,
      from: null,
      to: null,
    });

    clearSimulation();

    setViewport({
      x: 0,
      y: 0,
      zoom: 1,
    });

    setStatus(
      "Automaton reset"
    );
  };


  // =======================================================
  // CHANGE AUTOMATON TYPE
  // =======================================================

  const handleTypeChange = (
    type
  ) => {

    const confirmed =
      window.confirm(
        `Switch to ${type}? Current automaton will be cleared.`
      );

    if (!confirmed) {
      return;
    }

    setAutomatonType(type);

    setAutomaton({
      ...createInitialAutomaton(),
      type,
    });

    setInput("");

    setTransitionStart(null);

    setTransitionModal({
      open: false,
      from: null,
      to: null,
    });

    clearSimulation();

    setViewport({
      x: 0,
      y: 0,
      zoom: 1,
    });

    setStatus(
      `${type} selected`
    );
  };


  // =======================================================
  // NEXT STATE ID
  // =======================================================

  const getNextStateId = () => {
    let number = 0;

    while (
      automaton.states.some(
        (state) =>
          state.id === `q${number}`
      )
    ) {
      number++;
    }

    return `q${number}`;
  };


  // =======================================================
  // DELETE TRANSITION
  // =======================================================

  const handleDeleteTransition = (
    transitionId
  ) => {

    setAutomaton(
      (previous) => ({
        ...previous,

        transitions:
          previous.transitions.filter(
            (transition) =>
              transition.id !==
              transitionId
          ),
      })
    );

    clearSimulation();

    setStatus(
      "Transition deleted"
    );
  };


  // =======================================================
  // ADD STATE
  // =======================================================

  const handleCanvasClick = (
    event
  ) => {

    if (
      activeTool !==
      "add-state"
    ) {
      return;
    }

    const x =
      event.clientX - 32;

    const y =
      event.clientY - 32;

    const id =
      getNextStateId();

    const newState =
      createState(
        id,
        Math.max(10, x),
        Math.max(10, y)
      );

    setAutomaton(
      (previous) => ({
        ...previous,

        states: [
          ...previous.states,
          newState,
        ],
      })
    );

    clearSimulation();

    setStatus(
      `${id} created`
    );
  };


  // =======================================================
  // CREATE TRANSITION
  // =======================================================

  const handleCreateTransition = (
    symbol
  ) => {

    const from =
      transitionModal.from?.id;

    const to =
      transitionModal.to?.id;

    if (!from || !to) {
      return;
    }

    const cleanSymbol =
      symbol.trim();

    if (!cleanSymbol) {
      return;
    }


    // -----------------------------------------------
    // DFA VALIDATION
    // -----------------------------------------------

    if (
      automatonType ===
      "DFA"
    ) {

      if (
        cleanSymbol ===
        "ε"
      ) {

        setStatus(
          "DFA cannot use ε transitions"
        );

        return;
      }


      const duplicate =
        automaton.transitions.some(
          (transition) =>
            transition.from ===
              from &&
            transition.symbol ===
              cleanSymbol
        );


      if (duplicate) {

        setStatus(
          `DFA already has a transition from ${from} using ${cleanSymbol}`
        );

        return;
      }
    }


    // -----------------------------------------------
    // CREATE
    // -----------------------------------------------

    const newTransition =
      createTransition(
        from,
        to,
        cleanSymbol
      );


    setAutomaton(
      (previous) => ({
        ...previous,

        transitions: [
          ...previous.transitions,
          newTransition,
        ],

        alphabet:
          cleanSymbol === "ε"
            ? previous.alphabet
            : previous.alphabet.includes(
                cleanSymbol
              )
            ? previous.alphabet
            : [
                ...previous.alphabet,
                cleanSymbol,
              ],
      })
    );


    setTransitionModal({
      open: false,
      from: null,
      to: null,
    });

    setTransitionStart(null);

    clearSimulation();

    setStatus(
      `${from} → ${to} (${cleanSymbol}) created`
    );
  };


  // =======================================================
  // CLOSE TRANSITION MODAL
  // =======================================================

  const handleCloseTransitionModal = () => {

    setTransitionModal({
      open: false,
      from: null,
      to: null,
    });

    setTransitionStart(null);

    setStatus(
      "Transition cancelled"
    );
  };


  // =======================================================
  // STATE CLICK
  // =======================================================

  const handleStateClick = (
    event,
    stateId
  ) => {

    // -----------------------------------------------
    // IGNORE CLICK AFTER DRAG
    // -----------------------------------------------

    if (
      dragMovedRef.current
    ) {
      dragMovedRef.current =
        false;

      return;
    }


    // -----------------------------------------------
    // DELETE STATE
    // -----------------------------------------------

    if (
      activeTool ===
      "delete"
    ) {

      setAutomaton(
        (previous) => ({
          ...previous,

          states:
            previous.states.filter(
              (state) =>
                state.id !==
                stateId
            ),

          transitions:
            previous.transitions.filter(
              (transition) =>
                transition.from !==
                  stateId &&
                transition.to !==
                  stateId
            ),

          startState:
            previous.startState ===
            stateId
              ? null
              : previous.startState,

          finalStates:
            previous.finalStates.filter(
              (id) =>
                id !== stateId
            ),
        })
      );

      clearSimulation();

      setStatus(
        `${stateId} deleted`
      );

      return;
    }


    // -----------------------------------------------
    // SET START
    // -----------------------------------------------

    if (
      activeTool ===
      "start"
    ) {

      setAutomaton(
        (previous) => ({
          ...previous,

          startState:
            stateId,

          states:
            previous.states.map(
              (state) => ({
                ...state,

                isStart:
                  state.id ===
                  stateId,
              })
            ),
        })
      );

      clearSimulation();

      setStatus(
        `${stateId} set as start`
      );

      return;
    }


    // -----------------------------------------------
    // SET FINAL
    // -----------------------------------------------

    if (activeTool === "final") {
  setAutomaton((previous) => {
    const alreadyFinal =
      previous.finalStates.includes(stateId);

    return {
      ...previous,

      finalStates: alreadyFinal
        ? previous.finalStates.filter(
            (id) => id !== stateId
          )
        : [
            ...previous.finalStates,
            stateId,
          ],

      states: previous.states.map(
        (state) =>
          state.id === stateId
            ? {
                ...state,
                isFinal: !alreadyFinal,
              }
            : state
      ),
    };
  });

  setStatus(
    automaton.finalStates.includes(stateId)
      ? `${stateId} removed from final states`
      : `${stateId} marked as final`
  );

  return;
}


    // -----------------------------------------------
    // CREATE TRANSITION
    // -----------------------------------------------

    if (
      activeTool ===
      "transition"
    ) {

      // First click = source
      if (
        transitionStart ===
        null
      ) {

        setTransitionStart(
          stateId
        );

        setStatus(
          `${stateId} selected as source`
        );

        return;
      }


      // Second click = destination
      const from =
        transitionStart;

      const to =
        stateId;


      const fromState =
        automaton.states.find(
          (state) =>
            state.id ===
            from
        );

      const toState =
        automaton.states.find(
          (state) =>
            state.id ===
            to
        );


      setTransitionModal({
        open: true,
        from: fromState,
        to: toState,
      });

      setStatus(
        `${from} → ${to} ready`
      );

      return;
    }
  };


  // =======================================================
  // STATE DRAG START
  // =======================================================

  const handleStateMouseDown = (
    event,
    stateId
  ) => {

    event.preventDefault();
    event.stopPropagation();

    const canvas =
      event.currentTarget.closest(
        ".canvas"
      );

    if (!canvas) {
      return;
    }

    const rect =
      canvas.getBoundingClientRect();

    const state =
      automaton.states.find(
        (item) =>
          item.id ===
          stateId
      );

    if (!state) {
      return;
    }

    dragMovedRef.current =
      false;

    setDragging({
      stateId,

      startClientX:
        event.clientX,

      startClientY:
        event.clientY,

      offsetX:
        (event.clientX -
          rect.left -
          viewport.x) /
          viewport.zoom -
        state.x,

      offsetY:
        (event.clientY -
          rect.top -
          viewport.y) /
          viewport.zoom -
        state.y,
    });
  };


  // =======================================================
  // STATE DRAG MOVE
  // =======================================================

  useEffect(() => {

    const handleMouseMove = (
      event
    ) => {

      if (!dragging) {
        return;
      }

      const canvas =
        document.querySelector(
          ".canvas"
        );

      if (!canvas) {
        return;
      }

      const rect =
        canvas.getBoundingClientRect();


      const moveX =
        event.clientX -
        dragging.startClientX;

      const moveY =
        event.clientY -
        dragging.startClientY;


      if (
        Math.abs(moveX) > 4 ||
        Math.abs(moveY) > 4
      ) {

        dragMovedRef.current =
          true;
      }


      const x =
        (event.clientX -
          rect.left -
          viewport.x) /
          viewport.zoom -
        dragging.offsetX;

      const y =
        (event.clientY -
          rect.top -
          viewport.y) /
          viewport.zoom -
        dragging.offsetY;


      setAutomaton(
        (previous) => ({
          ...previous,

          states:
            previous.states.map(
              (state) =>
                state.id ===
                dragging.stateId
                  ? {
                      ...state,

                      x: Math.max(
                        0,
                        x
                      ),

                      y: Math.max(
                        0,
                        y
                      ),
                    }
                  : state
            ),
        })
      );
    };


    const handleMouseUp = () => {
      setDragging(null);
    };


    window.addEventListener(
      "mousemove",
      handleMouseMove
    );

    window.addEventListener(
      "mouseup",
      handleMouseUp
    );


    return () => {

      window.removeEventListener(
        "mousemove",
        handleMouseMove
      );

      window.removeEventListener(
        "mouseup",
        handleMouseUp
      );
    };

  }, [
    dragging,
    viewport,
  ]);


  // =======================================================
  // RUN SIMULATION
  // =======================================================

  const handleRunSimulation = () => {

    if (
      automatonType !==
      "DFA"
    ) {

      setStatus(
        "Simulation currently supports DFA only"
      );

      return;
    }


    // Validate
    const validationErrors =
      validateDFAForSimulation(
        automaton
      );


    if (
      validationErrors.length >
      0
    ) {

      setSimulation({
        running: false,
        completed: true,
        stepIndex: 0,
        result: "error",

        error: {
          type:
            "INVALID_AUTOMATON",

          message:
            validationErrors[0],

          explanation:
            "The automaton must be valid before simulation can start.",
        },

        currentState: null,
        activeTransitionId: null,
      });

      setStatus(
        "Simulation failed: invalid DFA"
      );

      return;
    }


    // Simulate
    const result =
      simulateDFA(
        automaton,
        input
      );


    const steps =
      result.steps || [];


    const lastStep =
      steps.length > 0
        ? steps[steps.length - 1]
        : null;


    const currentState =
      result.stoppedAt?.state ||
      result.currentState ||
      lastStep?.nextState ||
      automaton.startState;


    const activeTransitionId =
      result.error
        ? null
        : lastStep?.transitionId ||
          null;


    let error = null;


    // -----------------------------------------------
    // MISSING TRANSITION
    // -----------------------------------------------

    if (
      result.error &&
      result.stoppedAt
    ) {

      error = {
        type:
          "MISSING_TRANSITION",

        state:
          result.stoppedAt.state,

        symbol:
          result.stoppedAt.symbol,

        position:
          result.stoppedAt.position +
          1,

        message:
          result.error,

        explanation:
          `There is no transition from ${result.stoppedAt.state} for the input symbol "${result.stoppedAt.symbol}". The DFA cannot continue processing the remaining input.`,
      };
    }


    // -----------------------------------------------
    // OTHER ERROR
    // -----------------------------------------------

    else if (
      result.error
    ) {

      error = {
        type:
          "SIMULATION_ERROR",

        message:
          result.error,

        explanation:
          "The simulation could not complete.",
      };
    }


    // -----------------------------------------------
    // NON-FINAL STATE
    // -----------------------------------------------

    else if (
      result.success &&
      !result.accepted
    ) {

      error = {
        type:
          "NON_FINAL_STATE",

        state:
          result.currentState,

        message:
          `Input was completely processed, but ${result.currentState} is not a final state.`,

        explanation:
          "A DFA accepts a string only when the complete input has been consumed and the automaton ends in a final state.",
      };
    }


    setSimulation({
      running: false,

      completed: true,

      stepIndex:
        Math.max(
          0,
          steps.length - 1
        ),

      result:
        result.error
          ? "rejected"
          : result.accepted
          ? "accepted"
          : "rejected",

      error,

      currentState,

      activeTransitionId,
    });


    if (
      result.accepted
    ) {

      setStatus(
        `✓ Input accepted at ${result.currentState}`
      );

    } else {

      setStatus(
        `✕ Input rejected at ${
          currentState ||
          "undefined"
        }`
      );
    }
  };


  // =======================================================
  // STEP SIMULATION
  // =======================================================

  const handleStepSimulation = () => {

    if (
      automatonType !==
      "DFA"
    ) {

      setStatus(
        "Step simulation currently supports DFA only"
      );

      return;
    }


    const validationErrors =
      validateDFAForSimulation(
        automaton
      );


    if (
      validationErrors.length >
      0
    ) {

      setSimulation({
        running: false,
        completed: true,
        stepIndex: 0,
        result: "error",

        error: {
          type:
            "INVALID_AUTOMATON",

          message:
            validationErrors[0],

          explanation:
            "Fix the DFA before starting simulation.",
        },

        currentState: null,
        activeTransitionId: null,
      });

      setStatus(
        "Invalid DFA"
      );

      return;
    }


    const result =
      simulateDFA(
        automaton,
        input
      );


    const steps =
      result.steps || [];


    if (
      steps.length === 0
    ) {

      setStatus(
        "No simulation steps available"
      );

      return;
    }


    setSimulation(
      (previous) => {

        /*
         * If simulation was already completed,
         * start again from step 0.
         */
        const startingIndex =
          previous.completed
            ? -1
            : previous.stepIndex;


        const nextIndex =
          Math.min(
            startingIndex + 1,
            steps.length - 1
          );


        const step =
          steps[nextIndex];


        const finished =
          nextIndex ===
          steps.length - 1;


        let resultType =
          null;

        let error =
          null;


        // -------------------------------------------
        // FINISHED WITH MISSING TRANSITION
        // -------------------------------------------

        if (
          finished &&
          result.error &&
          result.stoppedAt
        ) {

          resultType =
            "rejected";

          error = {
            type:
              "MISSING_TRANSITION",

            state:
              result.stoppedAt.state,

            symbol:
              result.stoppedAt.symbol,

            position:
              result.stoppedAt.position +
              1,

            message:
              result.error,

            explanation:
              `There is no transition from ${result.stoppedAt.state} for "${result.stoppedAt.symbol}". The DFA cannot continue.`,
          };
        }


        // -------------------------------------------
        // FINISHED + ACCEPTED
        // -------------------------------------------

        else if (
          finished &&
          result.accepted
        ) {

          resultType =
            "accepted";
        }


        // -------------------------------------------
        // FINISHED + NON-FINAL
        // -------------------------------------------

        else if (
          finished &&
          !result.accepted
        ) {

          resultType =
            "rejected";

          error = {
            type:
              "NON_FINAL_STATE",

            state:
              result.currentState,

            message:
              `Input was completely processed, but ${result.currentState} is not a final state.`,

            explanation:
              "The input was consumed, but the DFA did not finish in a final state.",
          };
        }


        if (
          finished
        ) {

          setStatus(
            result.accepted
              ? `✓ Input accepted at ${result.currentState}`
              : `✕ Input rejected`
          );

        } else {

          setStatus(
            `Step ${nextIndex} / ${
              steps.length - 1
            }`
          );
        }


        return {

          running: false,

          completed: finished,

          stepIndex:
            nextIndex,

          result:
            resultType,

          error,

          currentState:
            step.nextState,

          activeTransitionId:
            step.transitionId ||
            null,
        };
      }
    );
  };


  // =======================================================
  // SAVE
  // =======================================================

  const handleSave = () => {

    const name =
      window.prompt(
        "Enter automaton name:",
        automaton.name ||
          "My Automaton"
      );


    if (
      name === null ||
      name.trim() === ""
    ) {
      return;
    }


    saveAutomaton(
      {
        ...automaton,

        name:
          name.trim(),
      },

      name.trim()
    );


    setStatus(
      `"${name.trim()}" saved`
    );
  };


  // =======================================================
  // EXPORT JSON
  // =======================================================

  const handleExport = () => {

    const data =
      JSON.stringify(
        automaton,
        null,
        2
      );


    const blob =
      new Blob(
        [data],
        {
          type:
            "application/json",
        }
      );


    const url =
      URL.createObjectURL(
        blob
      );


    const link =
      document.createElement(
        "a"
      );


    link.href =
      url;

    link.download =
      "automatalab-automaton.json";

    link.click();


    URL.revokeObjectURL(
      url
    );


    setStatus(
      "Automaton exported"
    );
  };


  // =======================================================
  // ZOOM
  // =======================================================

  const zoomIn = () => {

    setViewport(
      (previous) => ({
        ...previous,

        zoom:
          Math.min(
            2.5,

            Number(
              (
                previous.zoom +
                0.1
              ).toFixed(2)
            )
          ),
      })
    );
  };


  const zoomOut = () => {

    setViewport(
      (previous) => ({
        ...previous,

        zoom:
          Math.max(
            0.4,

            Number(
              (
                previous.zoom -
                0.1
              ).toFixed(2)
            )
          ),
      })
    );
  };


  const resetZoom = () => {

    setViewport(
      (previous) => ({
        ...previous,
        zoom: 1,
      })
    );
  };


  // =======================================================
  // UI
  // =======================================================

  return (
    <div className="app">

      {/* =================================================
          HEADER
          ================================================= */}

      <header className="header">

        <div className="brand">

          <div className="brand-icon">
            <Zap size={21} />
          </div>

          <div>

            <h1>
              AutomataLab
            </h1>

            <span>
              Interactive Automata Simulator
            </span>

          </div>

        </div>


        <div className="header-actions">

          <select
            value={
              automatonType
            }

            onChange={(event) =>
              handleTypeChange(
                event.target.value
              )
            }

            className="type-select"
          >

            <option value="DFA">
              DFA
            </option>

            <option value="NFA">
              NFA
            </option>

            <option value="ε-NFA">
              ε-NFA
            </option>

          </select>


          <button
            className="icon-button"
            title="New"
            onClick={
              handleNew
            }
          >
            <FilePlus size={18} />
          </button>


          <button
            className="icon-button"
            title="Save"
            onClick={
              handleSave
            }
          >
            <Save size={18} />
          </button>


          <button
            className="icon-button"
            title="Export JSON"
            onClick={
              handleExport
            }
          >
            <Download size={18} />
          </button>


          <button
            className="icon-button"
            title="Settings"
          >
            <Settings size={18} />
          </button>

        </div>

      </header>


      {/* =================================================
          WORKSPACE
          ================================================= */}

      <main className="workspace">

        {/* =================================================
            SIDEBAR
            ================================================= */}

        <aside className="sidebar">

          <div className="sidebar-title">
            TOOLBOX
          </div>


          {/* SELECT */}

          <button
            className={`tool ${
              activeTool ===
              "select"
                ? "active"
                : ""
            }`}

            onClick={() =>
              setActiveTool(
                "select"
              )
            }
          >

            <MousePointer2
              size={18}
            />

            Select

          </button>


          {/* ADD STATE */}

          <button
            className={`tool ${
              activeTool ===
              "add-state"
                ? "active"
                : ""
            }`}

            onClick={() =>
              setActiveTool(
                "add-state"
              )
            }
          >

            <Plus size={18} />

            Add State

          </button>


          {/* TRANSITION */}

          <button
            className={`tool ${
              activeTool ===
              "transition"
                ? "active"
                : ""
            }`}

            onClick={() => {

              setActiveTool(
                "transition"
              );

              setTransitionStart(
                null
              );

              setStatus(
                "Transition tool selected"
              );
            }}
          >

            <ArrowRight
              size={18}
            />

            Transition

          </button>


          {/* START */}

          <button
            className={`tool ${
              activeTool ===
              "start"
                ? "active"
                : ""
            }`}

            onClick={() =>
              setActiveTool(
                "start"
              )
            }
          >

            <Circle size={18} />

            Set Start

          </button>


          {/* FINAL */}

          <button
            className={`tool ${
              activeTool ===
              "final"
                ? "active"
                : ""
            }`}

            onClick={() =>
              setActiveTool(
                "final"
              )
            }
          >

            <Circle size={18} />

            Set Final

          </button>


          {/* DELETE */}

          <button
            className={`tool danger ${
              activeTool ===
              "delete"
                ? "active"
                : ""
            }`}

            onClick={() =>
              setActiveTool(
                "delete"
              )
            }
          >

            <Trash2 size={18} />

            Delete

          </button>


          {/* AUTOMATON INFO */}

          <div className="sidebar-section">

            <span>
              AUTOMATON
            </span>


            <div className="info-row">

              <span>
                Type
              </span>

              <strong>
                {automaton.type}
              </strong>

            </div>


            <div className="info-row">

              <span>
                States
              </span>

              <strong>
                {
                  automaton
                    .states
                    .length
                }
              </strong>

            </div>


            <div className="info-row">

              <span>
                Transitions
              </span>

              <strong>
                {
                  automaton
                    .transitions
                    .length
                }
              </strong>

            </div>


            <div className="info-row">

              <span>
                Final States
              </span>

              <strong>
                {
                  automaton
                    .finalStates
                    .length
                }
              </strong>

            </div>

          </div>

        </aside>


        {/* =================================================
            CANVAS AREA
            ================================================= */}

        <section className="canvas-area">

          <div className="canvas-toolbar">

            <div>

              <strong>
                {
                  automaton.type
                } Editor
              </strong>

              <span>
                {" "}· Build your automaton
              </span>

            </div>


            <div className="canvas-status">

              ● {status}

            </div>

          </div>


          <Canvas

            states={
              automaton.states
            }

            transitions={
              automaton.transitions
            }

            activeTool={
              activeTool
            }

            transitionStart={
              transitionStart
            }

            viewport={
              viewport
            }

            setViewport={
              setViewport
            }

            simulation={
              simulation
            }

            onCanvasClick={
              handleCanvasClick
            }

            onStateMouseDown={
              handleStateMouseDown
            }

            onStateClick={
              handleStateClick
            }

            onDeleteTransition={
              handleDeleteTransition
            }

            dragMovedRef={
              dragMovedRef
            }

            zoomIn={
              zoomIn
            }

            zoomOut={
              zoomOut
            }

            resetZoom={
              resetZoom
            }

          />


          {/* =================================================
              SIMULATION BAR
              ================================================= */}

          <div className="simulation-bar">

            <div className="input-group">

              <label>
                Input String
              </label>

              <input
                type="text"

                placeholder="Enter input e.g. 10101"

                value={input}

                onChange={(event) => {

                  setInput(
                    event.target.value
                  );

                  clearSimulation();
                }}
              />

            </div>


            {/* RUN */}

            <button
              className="run-button"

              onClick={
                handleRunSimulation
              }
            >

              <Play size={18} />

              Run

            </button>


            {/* STEP */}

            <button
              className="secondary-button"

              onClick={
                handleStepSimulation
              }
            >

              <Play size={17} />

              Step

            </button>


            {/* RESET */}

            <button
              className="secondary-button"

              onClick={
                handleReset
              }
            >

              <RotateCcw
                size={17}
              />

              Reset

            </button>


            {/* RESULT */}

            {simulation.result && (

              <div
                className={`simulation-result ${
                  simulation.result ===
                  "accepted"
                    ? "simulation-accepted"
                    : simulation.result ===
                      "rejected"
                    ? "simulation-rejected"
                    : "simulation-error"
                }`}
              >

                <div className="simulation-result-main">

                  {simulation.result ===
                  "accepted"
                    ? "✓ ACCEPTED"
                    : simulation.result ===
                      "rejected"
                    ? "✕ REJECTED"
                    : "⚠ ERROR"}

                </div>


                <div className="simulation-result-detail">

                  Current state:{" "}

                  {simulation.currentState ||
                    "—"}

                </div>

              </div>

            )}

          </div>

        </section>

      </main>


      {/* =================================================
          TRANSITION MODAL
          ================================================= */}

      <TransitionModal

        isOpen={
          transitionModal.open
        }

        fromState={
          transitionModal.from
        }

        toState={
          transitionModal.to
        }

        onClose={
          handleCloseTransitionModal
        }

        onCreate={
          handleCreateTransition
        }

      />


      {/* =================================================
          FOOTER
          ================================================= */}

      <footer className="status-bar">

        <div>

          Status:

          <span className="status-ready">

            {" "}
            {status}

          </span>

        </div>


        <div>
          AutomataLab v1.0
        </div>

      </footer>

    </div>
  );
}


export default App;