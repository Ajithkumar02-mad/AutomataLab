const StateNode = ({
  state,
  onMouseDown,
  onClick,
}) => {
  return (
    <div
      className={`state-node ${
        state.isFinal ? "final-state" : ""
      }`}
      style={{
        left: state.x,
        top: state.y,
      }}
      onMouseDown={(event) => {
        event.stopPropagation();
        onMouseDown(event, state.id);
      }}
      onClick={(event) => {
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
    </div>
  );
};

export default StateNode;