const StateNode = ({
  state,
  activeTool,
  isTransitionStart,
  onMouseDown,
  onClick,
}) => {

  return (

    <div
      className={`
        state-node

        ${
          state.isFinal
            ? "final-state"
            : ""
        }

        ${
          isTransitionStart
            ? "transition-source"
            : ""
        }
      `}

      style={{
        left: state.x,
        top: state.y,
      }}

      onMouseDown={(event) => {

        event.preventDefault();

        event.stopPropagation();

        onMouseDown(
          event,
          state.id
        );

      }}

      onClick={(event) => {

        event.preventDefault();

        event.stopPropagation();

        onClick(
          event,
          state.id
        );

      }}
    >


      {/* ===============================================
          START ARROW
          =============================================== */}

      {state.isStart && (

        <div className="start-arrow">
          →
        </div>

      )}


      {/* ===============================================
          STATE CIRCLE
          =============================================== */}

      <div className="state-circle">

        {state.name}

      </div>


      {/* ===============================================
          TRANSITION SOURCE
          =============================================== */}

      {isTransitionStart && (

        <div className="transition-source-indicator">

          <span className="source-dot" />

          SOURCE

        </div>

      )}

    </div>
  );
};


export default StateNode;