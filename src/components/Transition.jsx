const Transition = ({
  transition,
  states,
  onDelete,
}) => {
  const from = states.find(
    (state) => state.id === transition.from
  );

  const to = states.find(
    (state) => state.id === transition.to
  );

  if (!from || !to) return null;

  const x1 = from.x + 32;
  const y1 = from.y + 32;

  const x2 = to.x + 32;
  const y2 = to.y + 32;

  const dx = x2 - x1;
  const dy = y2 - y1;

  const length = Math.sqrt(
    dx * dx + dy * dy
  );

  if (length === 0) {
    return (
      <div
        className="self-loop"
        style={{
          left: from.x + 28,
          top: from.y - 45,
        }}
        onDoubleClick={() =>
          onDelete(transition.id)
        }
      >
        <span>↻</span>
        <label>{transition.symbol}</label>
      </div>
    );
  }

  const angle =
    Math.atan2(dy, dx) *
    (180 / Math.PI);

  const centerX =
    (x1 + x2) / 2;

  const centerY =
    (y1 + y2) / 2;

  return (
    <div
      className="transition-line"
      style={{
        left: x1,
        top: y1,
        width: length,
        transform: `rotate(${angle}deg)`,
      }}
      onDoubleClick={() =>
        onDelete(transition.id)
      }
    >
      <div className="arrow-head" />

      <span className="transition-label">
        {transition.symbol}
      </span>
    </div>
  );
};

export default Transition;