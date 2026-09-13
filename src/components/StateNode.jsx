const StateNode = ({
  state,
  activeTool,
  isTransitionStart,
  isSimulationCurrent,
  isSimulationFailed,
  onMouseDown,
  onClick,
}) => {
  return (
    <div
      className={`
        state-node
        ${state.isFinal ? "final-state" : ""}
        ${isTransitionStart ? "transition-source" : ""}
        ${
          isSimulationCurrent
            ? "simulation-current"
            : ""
        }
        ${
          isSimulationFailed
            ? "simulation-failed"
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

        onMouseDown(event, state.id);
      }}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();

        onClick(event, state.id);
      }}
    >
      {state.isStart && (
        <div className="start-arrow">
          →
        </div>
      )}

      <div className="state-circle">
        {state.name}
      </div>

      {isTransitionStart && (
        <div className="transition-source-indicator">
          <span className="source-dot" />
          SOURCE
        </div>
      )}

      {isSimulationCurrent && (
        <div className="simulation-state-label">
          CURRENT
        </div>
      )}

      {isSimulationFailed && (
        <div className="simulation-state-label failed">
          FAILED
        </div>
      )}
    </div>
  );
};

export default StateNode;