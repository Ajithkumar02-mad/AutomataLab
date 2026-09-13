const STATE_RADIUS = 32;
const CANVAS_SIZE = 5000;

const Transition = ({
  transition,
  states,
  transitions = [],
  onDelete,
  isSimulationActive = false,
}) => {
  const fromState = states.find(
    (state) => state.id === transition.from
  );

  const toState = states.find(
    (state) => state.id === transition.to
  );

  if (!fromState || !toState) {
    return null;
  }

  const color = isSimulationActive
    ? "#63e6ff"
    : "#6ee7ff";

  /*
   * =========================================================
   * SELF LOOP
   * =========================================================
   */

  if (transition.from === transition.to) {
    const markerId = `loop-${transition.id}`;

    return (
      <svg
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: `${CANVAS_SIZE}px`,
          height: `${CANVAS_SIZE}px`,
          overflow: "visible",
          pointerEvents: "none",
          zIndex: 10,
        }}
      >
        <defs>
          <marker
            id={markerId}
            markerWidth="10"
            markerHeight="10"
            refX="8"
            refY="5"
            orient="auto"
          >
            <path
              d="M0,0 L10,5 L0,10 Z"
              fill={color}
            />
          </marker>
        </defs>

        <path
          d={`
            M ${fromState.x + 12}
              ${fromState.y + 18}

            C ${fromState.x - 25}
              ${fromState.y - 45},

              ${fromState.x + 70}
              ${fromState.y - 45},

              ${fromState.x + 52}
              ${fromState.y + 18}
          `}
          fill="none"
          stroke={color}
          strokeWidth="3"
          markerEnd={`url(#${markerId})`}
          style={{
            pointerEvents: "stroke",
            cursor: "pointer",
          }}
          onDoubleClick={(event) => {
            event.stopPropagation();
            onDelete?.(transition.id);
          }}
        />

        <rect
          x={fromState.x + 24}
          y={fromState.y - 58}
          width="28"
          height="24"
          rx="6"
          fill="#081019"
          stroke="#294456"
        />

        <text
          x={fromState.x + 38}
          y={fromState.y - 41}
          textAnchor="middle"
          fill="#ffffff"
          fontSize="14"
          fontWeight="700"
        >
          {transition.symbol}
        </text>
      </svg>
    );
  }

  /*
   * =========================================================
   * STATE CENTERS
   * =========================================================
   */

  const x1 =
    fromState.x + STATE_RADIUS;

  const y1 =
    fromState.y + STATE_RADIUS;

  const x2 =
    toState.x + STATE_RADIUS;

  const y2 =
    toState.y + STATE_RADIUS;

  /*
   * =========================================================
   * DISTANCE
   * =========================================================
   */

  const dx = x2 - x1;
  const dy = y2 - y1;

  const distance = Math.sqrt(
    dx * dx + dy * dy
  );

  if (distance < 1) {
    return null;
  }

  /*
   * =========================================================
   * FIND REVERSE TRANSITION
   * =========================================================
   */

  const hasReverse =
    transitions.some(
      (item) =>
        item.id !== transition.id &&
        item.from === transition.to &&
        item.to === transition.from
    );

  /*
   * =========================================================
   * CANONICAL DIRECTION
   *
   * THIS IS THE IMPORTANT FIX.
   *
   * We establish ONE fixed direction for the pair.
   *
   * Example:
   *
   * q1 <-> q2
   *
   * canonical direction:
   *
   * q1 -> q2
   *
   * Then:
   *
   * q1 -> q2 = upper curve
   * q2 -> q1 = lower curve
   *
   * They can no longer overlap.
   * =========================================================
   */

  const canonicalFrom =
    String(fromState.id) <
    String(toState.id)
      ? fromState
      : toState;

  const canonicalTo =
    canonicalFrom.id === fromState.id
      ? toState
      : fromState;

  const cx1 =
    canonicalFrom.x + STATE_RADIUS;

  const cy1 =
    canonicalFrom.y + STATE_RADIUS;

  const cx2 =
    canonicalTo.x + STATE_RADIUS;

  const cy2 =
    canonicalTo.y + STATE_RADIUS;

  const cdx = cx2 - cx1;
  const cdy = cy2 - cy1;

  const canonicalDistance =
    Math.sqrt(
      cdx * cdx +
      cdy * cdy
    );

  const canonicalUx =
    cdx / canonicalDistance;

  const canonicalUy =
    cdy / canonicalDistance;

  /*
   * Perpendicular to canonical direction.
   */

  const canonicalPx =
    -canonicalUy;

  const canonicalPy =
    canonicalUx;

  /*
   * =========================================================
   * ACTUAL EDGE DIRECTION
   * =========================================================
   */

  const ux =
    dx / distance;

  const uy =
    dy / distance;

  /*
   * =========================================================
   * START / END
   * =========================================================
   */

  const startX =
    x1 + ux * STATE_RADIUS;

  const startY =
    y1 + uy * STATE_RADIUS;

  const endX =
    x2 - ux * STATE_RADIUS;

  const endY =
    y2 - uy * STATE_RADIUS;

  /*
   * =========================================================
   * CURVE
   * =========================================================
   */

  let curveAmount = 0;

  if (hasReverse) {
    /*
     * Canonical direction gets +60.
     *
     * Reverse direction gets -60.
     */

    const isCanonicalDirection =
      transition.from === canonicalFrom.id &&
      transition.to === canonicalTo.id;

    curveAmount =
      isCanonicalDirection
        ? 60
        : -60;
  }

  /*
   * =========================================================
   * CONTROL POINT
   * =========================================================
   */

  const midX =
    (startX + endX) / 2;

  const midY =
    (startY + endY) / 2;

  /*
   * IMPORTANT:
   *
   * Always use the CANONICAL perpendicular.
   *
   * This is what prevents the two reverse
   * transitions from collapsing onto the same curve.
   */

  const controlX =
    midX +
    canonicalPx * curveAmount;

  const controlY =
    midY +
    canonicalPy * curveAmount;

  /*
   * =========================================================
   * LABEL POSITION
   * =========================================================
   */

  const labelX =
    0.25 * startX +
    0.5 * controlX +
    0.25 * endX;

  const labelY =
    0.25 * startY +
    0.5 * controlY +
    0.25 * endY;

  /*
   * =========================================================
   * ARROW
   * =========================================================
   */

  const arrowId =
    `arrow-${transition.id}`;

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <svg
      width={CANVAS_SIZE}
      height={CANVAS_SIZE}
      viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: `${CANVAS_SIZE}px`,
        height: `${CANVAS_SIZE}px`,
        overflow: "visible",
        pointerEvents: "none",
        zIndex: 10,
      }}
    >
      <defs>
        <marker
          id={arrowId}
          markerWidth="11"
          markerHeight="11"
          refX="9"
          refY="5.5"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path
            d="M0,0 L11,5.5 L0,11 Z"
            fill={color}
          />
        </marker>
      </defs>

      {/* ===================================================
          TRANSITION
          =================================================== */}

      <path
        d={`
          M ${startX} ${startY}
          Q ${controlX} ${controlY}
            ${endX} ${endY}
        `}
        fill="none"
        stroke={color}
        strokeWidth="3"
        markerEnd={`url(#${arrowId})`}
        style={{
          pointerEvents: "stroke",
          cursor: "pointer",
          filter: isSimulationActive
            ? "drop-shadow(0 0 8px rgba(99,230,255,.8))"
            : "none",
        }}
        onDoubleClick={(event) => {
          event.stopPropagation();
          onDelete?.(transition.id);
        }}
      />

      {/* ===================================================
          LABEL
          =================================================== */}

      <rect
        x={labelX - 17}
        y={labelY - 15}
        width="34"
        height="27"
        rx="6"
        fill="#081019"
        stroke="#294456"
        strokeWidth="1.5"
        style={{
          pointerEvents: "none",
        }}
      />

      <text
        x={labelX}
        y={labelY + 4}
        textAnchor="middle"
        fill="#ffffff"
        fontSize="14"
        fontWeight="700"
        style={{
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        {transition.symbol}
      </text>
    </svg>
  );
};

export default Transition;