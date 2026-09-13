import StateNode from "./StateNode";
import Transition from "./Transition";

const Canvas = ({
  states,
  transitions,
  activeTool,
  onCanvasClick,
  onStateMouseDown,
  onStateClick,
  onDeleteTransition,
}) => {
  return (
    <div
      className="canvas"
      onClick={onCanvasClick}
    >

      {/* TRANSITIONS */}

      {transitions.map((transition) => (
        <Transition
          key={transition.id}
          transition={transition}
          states={states}
          onDelete={onDeleteTransition}
        />
      ))}


      {/* STATES */}

      {states.map((state) => (
        <StateNode
          key={state.id}
          state={state}
          onMouseDown={onStateMouseDown}
          onClick={onStateClick}
        />
      ))}


      {/* EMPTY CANVAS */}

      {states.length === 0 && (
        <div className="canvas-empty">

          <div className="empty-icon">
            +
          </div>

          <h2>
            Start Building
          </h2>

          <p>
            {activeTool === "add-state"
              ? "Click anywhere to add a state."
              : 'Select "Add State" to begin.'}
          </p>

        </div>
      )}

    </div>
  );
};

export default Canvas;