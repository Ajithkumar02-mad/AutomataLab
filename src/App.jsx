import { useEffect, useState } from "react";

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

import {
  createInitialAutomaton,
  createState,
  createTransition,
} from "./models/automatonModel";

import {
  saveAutomaton,
  getSavedAutomata,
  getRecentAutomata,
  deleteSavedAutomaton,
  clearRecentAutomata,
  addRecentAutomaton,
} from "./utils/storage";

import "./App.css";

function App() {
  const [automatonType, setAutomatonType] = useState("DFA");

  const [automaton, setAutomaton] = useState(
    createInitialAutomaton()
  );

  const [activeTool, setActiveTool] = useState("select");

  const [input, setInput] = useState("");

  const [dragging, setDragging] = useState(null);

  const [status, setStatus] = useState("Ready");

  /*
   * --------------------------------
   * NEW AUTOMATON
   * --------------------------------
   */

  const handleNew = () => {
    const confirmed = window.confirm(
      "Create a new automaton? Current work will be cleared."
    );

    if (!confirmed) return;

    setAutomaton({
      ...createInitialAutomaton(),
      type: automatonType,
    });

    setInput("");
    setActiveTool("select");
    setStatus("New automaton created");
  };

  /*
   * --------------------------------
   * RESET
   * --------------------------------
   */

  const handleReset = () => {
    setAutomaton((previous) => ({
      ...previous,
      states: [],
      transitions: [],
      startState: null,
      finalStates: [],
    }));

    setInput("");
    setActiveTool("select");
    setStatus("Automaton reset");
  };

  /*
   * --------------------------------
   * CHANGE AUTOMATON TYPE
   * --------------------------------
   */

  const handleTypeChange = (type) => {
    setAutomatonType(type);

    setAutomaton((previous) => ({
      ...previous,
      type,
      states: [],
      transitions: [],
      startState: null,
      finalStates: [],
    }));

    setActiveTool("select");
    setStatus(`${type} selected`);
  };

  /*
   * --------------------------------
   * GENERATE STATE ID
   * --------------------------------
   */

  const getNextStateId = () => {
    let number = 0;

    while (
      automaton.states.some(
        (state) => state.id === `q${number}`
      )
    ) {
      number++;
    }

    return `q${number}`;
  };

/*
   * --------------------------------
   * DELETE TRANSITION
   * --------------------------------
   */

  const handleDeleteTransition = (
  transitionId
) => {
  setAutomaton((previous) => ({
    ...previous,

    transitions:
      previous.transitions.filter(
        (transition) =>
          transition.id !==
          transitionId
      ),
  }));

  setStatus(
    "Transition deleted"
  );
};

  /*
   * --------------------------------
   * ADD STATE
   * --------------------------------
   */

  const handleCanvasClick = (event) => {
    if (activeTool !== "add-state") {
      return;
    }

    const canvas = event.currentTarget;

    const rect = canvas.getBoundingClientRect();

    const x =
      event.clientX -
      rect.left -
      32;

    const y =
      event.clientY -
      rect.top -
      32;

    const id = getNextStateId();

    const newState = createState(
      id,
      Math.max(10, x),
      Math.max(10, y)
    );

    setAutomaton((previous) => ({
      ...previous,

      states: [
        ...previous.states,
        newState,
      ],
    }));

    setStatus(`${id} created`);
  };

  /*
   * --------------------------------
   * STATE CLICK
   * --------------------------------
   */

  const handleStateClick = (
  event,
  stateId
) => {

  /*
   * DELETE
   */

  if (activeTool === "delete") {

    setAutomaton((previous) => ({
      ...previous,

      states:
        previous.states.filter(
          (state) =>
            state.id !== stateId
        ),

      transitions:
        previous.transitions.filter(
          (transition) =>
            transition.from !== stateId &&
            transition.to !== stateId
        ),

      startState:
        previous.startState === stateId
          ? null
          : previous.startState,

      finalStates:
        previous.finalStates.filter(
          (id) =>
            id !== stateId
        ),
    }));

    setStatus(
      `${stateId} deleted`
    );

    return;
  }


  /*
   * SET START
   */

  if (activeTool === "start") {

    setAutomaton((previous) => ({
      ...previous,

      startState: stateId,

      states:
        previous.states.map(
          (state) => ({
            ...state,

            isStart:
              state.id === stateId,
          })
        ),
    }));

    setActiveTool("select");

    setStatus(
      `${stateId} set as start`
    );

    return;
  }


  /*
   * SET FINAL
   */

  if (activeTool === "final") {

    setAutomaton((previous) => {

      const alreadyFinal =
        previous.finalStates.includes(
          stateId
        );

      return {
        ...previous,

        finalStates:
          alreadyFinal
            ? previous.finalStates.filter(
                (id) =>
                  id !== stateId
              )
            : [
                ...previous.finalStates,
                stateId,
              ],

        states:
          previous.states.map(
            (state) => ({
              ...state,

              isFinal:
                state.id === stateId
                  ? !alreadyFinal
                  : state.isFinal,
            })
          ),
      };
    });

    setActiveTool("select");

    setStatus(
      `${stateId} final state updated`
    );

    return;
  }


  /*
   * CREATE TRANSITION
   */

  if (activeTool === "transition") {

    if (!transitionStart) {

      setTransitionStart(stateId);

      setStatus(
        `Select destination state`
      );

      return;
    }

    const from = transitionStart;
    const to = stateId;

    const symbol =
      window.prompt(
        "Enter transition symbol:",
        "0"
      );

    if (
      symbol === null ||
      symbol.trim() === ""
    ) {
      setTransitionStart(null);
      setStatus(
        "Transition cancelled"
      );
      return;
    }

    const newTransition =
      createTransition(
        from,
        to,
        symbol.trim()
      );

    setAutomaton((previous) => ({
      ...previous,

      transitions: [
        ...previous.transitions,
        newTransition,
      ],

      alphabet:
        previous.alphabet.includes(
          symbol.trim()
        )
          ? previous.alphabet
          : [
              ...previous.alphabet,
              symbol.trim(),
            ],
    }));

    setTransitionStart(null);

    setActiveTool("select");

    setStatus(
      `${from} → ${to} created`
    );
  }
};

  /*
   * --------------------------------
   * DRAG STATE
   * --------------------------------
   */

  const handleStateMouseDown = (
    event,
    stateId
  ) => {
    if (activeTool !== "select") {
      return;
    }

    const canvas =
      event.currentTarget.parentElement;

    const rect =
      canvas.getBoundingClientRect();

    const state =
      automaton.states.find(
        (item) => item.id === stateId
      );

    if (!state) return;

    setDragging({
      stateId,
      offsetX:
        event.clientX -
        rect.left -
        state.x,

      offsetY:
        event.clientY -
        rect.top -
        state.y,
    });
  };

  /*
   * --------------------------------
   * HANDLE DRAGGING
   * --------------------------------
   */

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (!dragging) return;

      const canvas =
        document.querySelector(".canvas");

      if (!canvas) return;

      const rect =
        canvas.getBoundingClientRect();

      const x =
        event.clientX -
        rect.left -
        dragging.offsetX;

      const y =
        event.clientY -
        rect.top -
        dragging.offsetY;

      setAutomaton((previous) => ({
        ...previous,

        states: previous.states.map(
          (state) =>
            state.id ===
            dragging.stateId
              ? {
                  ...state,
                  x: Math.max(0, x),
                  y: Math.max(0, y),
                }
              : state
        ),
      }));
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
  }, [dragging]);

  /*
   * --------------------------------
   * SAVE
   * --------------------------------
   */

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

  const project =
    saveAutomaton(
      {
        ...automaton,
        name: name.trim(),
      },
      name.trim()
    );

  setSavedProjectId(
    project.id
  );

  setSavedAutomata(
    getSavedAutomata()
  );

  setRecentAutomata(
    getRecentAutomata()
  );

  setStatus(
    `"${name.trim()}" saved`
  );
};

  /*
   * --------------------------------
   * EXPORT JSON
   * --------------------------------
   */

  const handleExport = () => {
    const data = JSON.stringify(
      automaton,
      null,
      2
    );

    const blob = new Blob(
      [data],
      {
        type: "application/json",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      "automatalab-automaton.json";

    link.click();

    URL.revokeObjectURL(url);

    setStatus("Automaton exported");
  };

  return (
    <div className="app">

      {/* HEADER */}

      <header className="header">

        <div className="brand">

          <div className="brand-icon">
            <Zap size={21} />
          </div>

          <div>
            <h1>AutomataLab</h1>

            <span>
              Interactive Automata Simulator
            </span>
          </div>

        </div>

        <div className="header-actions">

          <select
            value={automatonType}
            onChange={(event) =>
              handleTypeChange(
                event.target.value
              )
            }
            className="type-select"
          >
            <option>DFA</option>
            <option>NFA</option>
            <option>ε-NFA</option>
          </select>

          <button
            className="icon-button"
            title="New"
            onClick={handleNew}
          >
            <FilePlus size={18} />
          </button>

          <button
            className="icon-button"
            title="Save"
            onClick={handleSave}
          >
            <Save size={18} />
          </button>

          <button
            className="icon-button"
            title="Export JSON"
            onClick={handleExport}
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


      {/* WORKSPACE */}

      <main className="workspace">

        {/* SIDEBAR */}

        <aside className="sidebar">

          <div className="sidebar-title">
            TOOLBOX
          </div>

          <button
            className={`tool ${
              activeTool === "select"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveTool("select")
            }
          >
            <MousePointer2 size={18} />
            Select
          </button>


          <button
            className={`tool ${
              activeTool === "add-state"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveTool("add-state")
            }
          >
            <Plus size={18} />
            Add State
          </button>


          <button
            className={`tool ${
              activeTool === "transition"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveTool("transition")
            }
          >
            <ArrowRight size={18} />
            Transition
          </button>


          <button
            className={`tool ${
              activeTool === "start"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveTool("start")
            }
          >
            <Circle size={18} />
            Set Start
          </button>


          <button
            className={`tool ${
              activeTool === "final"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveTool("final")
            }
          >
            <Circle size={18} />
            Set Final
          </button>


          <button
            className={`tool danger ${
              activeTool === "delete"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveTool("delete")
            }
          >
            <Trash2 size={18} />
            Delete
          </button>


          <div className="sidebar-section">

            <span>AUTOMATON</span>

            <div className="info-row">
              <span>Type</span>

              <strong>
                {automaton.type}
              </strong>
            </div>

            <div className="info-row">
              <span>States</span>

              <strong>
                {automaton.states.length}
              </strong>
            </div>

            <div className="info-row">
              <span>Transitions</span>

              <strong>
                {automaton.transitions.length}
              </strong>
            </div>

            <div className="info-row">
              <span>Final States</span>

              <strong>
                {automaton.finalStates.length}
              </strong>
            </div>

          </div>

        </aside>


        {/* CANVAS */}

        <section className="canvas-area">

          <div className="canvas-toolbar">

            <div>
              <strong>
                {automaton.type} Editor
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
            states={automaton.states}
            transitions={automaton.transitions}
            activeTool={activeTool}
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
          />


          {/* SIMULATION BAR */}

          <div className="simulation-bar">

            <div className="input-group">

              <label>
                Input String
              </label>

              <input
                type="text"
                placeholder="Enter input e.g. 10101"
                value={input}
                onChange={(event) =>
                  setInput(
                    event.target.value
                  )
                }
              />

            </div>


            <button className="run-button">
              <Play size={18} />
              Run
            </button>


            <button className="secondary-button">
              <Play size={17} />
              Step
            </button>


            <button
              className="secondary-button"
              onClick={handleReset}
            >
              <RotateCcw size={17} />
              Reset
            </button>

          </div>

        </section>

      </main>


      {/* FOOTER */}

      <footer className="status-bar">

        <div>
          Status:

          <span className="status-ready">
            {" "}{status}
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