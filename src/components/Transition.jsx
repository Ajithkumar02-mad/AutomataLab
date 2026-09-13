const Transition = ({
  transition,
  states,
  onDelete,
}) => {
  const from = states.find(
    (state) =>
      state.id ===
      transition.from
  );

  const to = states.find(
    (state) =>
      state.id ===
      transition.to
  );

  if (!from || !to) {
    return null;
  }

  const STATE_SIZE = 64;
  const RADIUS = STATE_SIZE / 2;

  const x1 =
    from.x + RADIUS;

  const y1 =
    from.y + RADIUS;

  const x2 =
    to.x + RADIUS;

  const y2 =
    to.y + RADIUS;


  /* =====================================================
     SELF LOOP
  ===================================================== */

  if (transition.from === transition.to) {
  return (
    <div
      className="self-loop"
      style={{
        left: from.x - 10,
        top: from.y - 58,
      }}
      onDoubleClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onDelete(transition.id);
      }}
      title="Double-click to delete"
    >
      <svg
        className="self-loop-svg"
        width="84"
        height="72"
        viewBox="0 0 84 72"
      >
        <defs>
          <marker
            id={`loop-arrow-${transition.id}`}
            markerWidth="7"
            markerHeight="7"
            refX="5"
            refY="3.5"
            orient="auto"
          >
            <path d="M0,0 L7,3.5 L0,7 Z" />
          </marker>
        </defs>

        <path
          d="M 58 58
             C 78 48, 80 14, 54 5
             C 28 -5, 5 12, 8 35
             C 10 48, 20 55, 31 58"
          markerEnd={`url(#loop-arrow-${transition.id})`}
        />
      </svg>

      <div className="self-loop-label">
        {transition.symbol}
      </div>
    </div>
  );
}


  /* =====================================================
     NORMAL TRANSITION
  ===================================================== */

  const dx =
    x2 - x1;

  const dy =
    y2 - y1;

  const distance =
    Math.sqrt(
      dx * dx +
      dy * dy
    );

  if (distance < 1) {
    return null;
  }


  /*
   * Direction vector.
   */

  const unitX =
    dx / distance;

  const unitY =
    dy / distance;


  /*
   * Start and end positions.
   */

  const startX =
    x1 +
    unitX * RADIUS;

  const startY =
    y1 +
    unitY * RADIUS;

  const endX =
    x2 -
    unitX * RADIUS;

  const endY =
    y2 -
    unitY * RADIUS;


  const lineDx =
    endX - startX;

  const lineDy =
    endY - startY;

  const lineLength =
    Math.sqrt(
      lineDx * lineDx +
      lineDy * lineDy
    );

  const angle =
    Math.atan2(
      lineDy,
      lineDx
    ) *
    (180 / Math.PI);


  return (
    <div
      className="transition-line"
      style={{
        left: startX,
        top: startY,
        width: lineLength,
        transform:
          `rotate(${angle}deg)`,
      }}

      onDoubleClick={(event) => {
        event.preventDefault();
        event.stopPropagation();

        onDelete(
          transition.id
        );
      }}

      title="Double-click to delete"
    >

      <div className="arrow-head" />

      <div className="transition-label">
        {transition.symbol}
      </div>

    </div>
  );
};

export default Transition;