// ============================================================
// AutomataLab - Transition Renderer
// ============================================================

const STATE_RADIUS = 32;
const CANVAS_SIZE = 5000;

const Transition = ({
  transition,
  states,
  transitions = [],
  onDelete,
  isSimulationActive = false,
}) => {
  // ==========================================================
  // FIND STATES
  // ==========================================================

  const fromState = states.find(
    (state) => state.id === transition.from
  );

  const toState = states.find(
    (state) => state.id === transition.to
  );

  if (!fromState || !toState) {
    return null;
  }

  // ==========================================================
  // COLORS
  // ==========================================================

  const color = isSimulationActive
    ? "#63e6ff"
    : "#6ee7ff";

  // ==========================================================
  // SELF LOOP
  // ==========================================================

  if (transition.from === transition.to) {
    /*
     * Find every transition that is a self-loop
     * on the same state.
     *
     * Example:
     *
     * q1 --0--> q1
     * q1 --1--> q1
     *
     * Visually:
     *
     *             0,1
     *              ↺
     *             q1
     *
     * The actual transitions remain separate.
     */

    const selfLoops = transitions.filter(
      (item) =>
        item.from === transition.from &&
        item.to === transition.to
    );

    if (selfLoops.length === 0) {
      return null;
    }

    /*
     * Only render the first self-loop.
     *
     * This prevents:
     *
     * q1 --0--> q1
     * q1 --1--> q1
     *
     * from creating two overlapping visual loops.
     */

    const firstLoop =
      selfLoops[0];

    if (
      transition.id !== firstLoop.id
    ) {
      return null;
    }

    // ========================================================
    // COMBINE LOOP SYMBOLS
    // ========================================================

    const loopSymbols = [
      ...new Set(
        selfLoops
          .flatMap((item) =>
            String(item.symbol || "")
              .split(",")
              .map((symbol) =>
                symbol.trim()
              )
          )
          .filter(Boolean)
      ),
    ];

    const loopLabel =
      loopSymbols.join(",");

    // ========================================================
    // CENTER OF STATE
    // ========================================================

    const centerX =
      fromState.x + STATE_RADIUS;

    const centerY =
      fromState.y + STATE_RADIUS;

    // ========================================================
    // LOOP GEOMETRY
    // ========================================================

    /*
     * Start and end are placed on the
     * upper part of the state boundary.
     *
     * This ensures that the arrowhead
     * remains visible and isn't hidden
     * behind the state circle.
     */

    const startX =
      centerX - 18;

    const startY =
      centerY - 20;

    const endX =
      centerX + 25;

    const endY =
      centerY - 20;

    /*
     * Control points make the loop rise
     * above the state.
     */

    const control1X =
      centerX - 78;

    const control1Y =
      centerY - 108;

    const control2X =
      centerX + 82;

    const control2Y =
      centerY - 108;

    // ========================================================
    // LABEL
    // ========================================================

    const labelX =
      centerX + 3;

    const labelY =
      centerY - 105;

    // ========================================================
    // MARKER
    // ========================================================

    const markerId =
      `self-loop-arrow-${transition.id}`;

    // ========================================================
    // DELETE
    // ========================================================

    const handleLoopDelete = (
      event
    ) => {
      event.stopPropagation();

      /*
       * Delete all underlying loop transitions
       * represented by this combined visual loop.
       */

      selfLoops.forEach(
        (loop) => {
          onDelete?.(loop.id);
        }
      );
    };

    // ========================================================
    // RENDER SELF LOOP
    // ========================================================

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
          zIndex: 20,
        }}
      >
        <defs>

          {/* ================================================
              SELF LOOP ARROW MARKER
              ================================================ */}

          <marker
            id={markerId}
            markerWidth="14"
            markerHeight="14"
            refX="11"
            refY="7"
            orient="auto"
            markerUnits="userSpaceOnUse"
          >
            <path
              d="
                M 0 0
                L 14 7
                L 0 14
                Z
              "
              fill={color}
            />
          </marker>

        </defs>

        {/* ==================================================
            SELF LOOP PATH
            ================================================== */}

        <path
          d={`
            M
              ${startX}
              ${startY}

            C
              ${control1X}
              ${control1Y},

              ${control2X}
              ${control2Y},

              ${endX}
              ${endY}
          `}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          markerEnd={`url(#${markerId})`}
          style={{
            pointerEvents: "stroke",
            cursor: "pointer",

            filter:
              isSimulationActive
                ? "drop-shadow(0 0 8px rgba(99,230,255,.85))"
                : "none",
          }}
          onDoubleClick={
            handleLoopDelete
          }
        />

        {/* ==================================================
            LABEL BACKGROUND
            ================================================== */}

        <rect
          x={labelX - 24}
          y={labelY - 16}
          width="48"
          height="28"
          rx="6"
          fill="#081019"
          stroke="#294456"
          strokeWidth="1.5"
          style={{
            pointerEvents: "none",
          }}
        />

        {/* ==================================================
            LABEL
            ================================================== */}

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
          {loopLabel}
        </text>

      </svg>
    );
  }

  // ==========================================================
  // NORMAL TRANSITION
  // ==========================================================

  const x1 =
    fromState.x + STATE_RADIUS;

  const y1 =
    fromState.y + STATE_RADIUS;

  const x2 =
    toState.x + STATE_RADIUS;

  const y2 =
    toState.y + STATE_RADIUS;

  // ==========================================================
  // DISTANCE
  // ==========================================================

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

  // ==========================================================
  // REVERSE TRANSITION
  // ==========================================================

  const hasReverse =
    transitions.some(
      (item) =>
        item.id !== transition.id &&
        item.from === transition.to &&
        item.to === transition.from
    );

  // ==========================================================
  // CANONICAL DIRECTION
  // ==========================================================

  const canonicalFrom =
    String(fromState.id) <
    String(toState.id)
      ? fromState
      : toState;

  const canonicalTo =
    canonicalFrom.id ===
    fromState.id
      ? toState
      : fromState;

  const canonicalX1 =
    canonicalFrom.x +
    STATE_RADIUS;

  const canonicalY1 =
    canonicalFrom.y +
    STATE_RADIUS;

  const canonicalX2 =
    canonicalTo.x +
    STATE_RADIUS;

  const canonicalY2 =
    canonicalTo.y +
    STATE_RADIUS;

  const canonicalDX =
    canonicalX2 -
    canonicalX1;

  const canonicalDY =
    canonicalY2 -
    canonicalY1;

  const canonicalDistance =
    Math.sqrt(
      canonicalDX *
        canonicalDX +
        canonicalDY *
        canonicalDY
    );

  if (
    canonicalDistance < 1
  ) {
    return null;
  }

  // ==========================================================
  // CANONICAL UNIT VECTOR
  // ==========================================================

  const canonicalUX =
    canonicalDX /
    canonicalDistance;

  const canonicalUY =
    canonicalDY /
    canonicalDistance;

  // ==========================================================
  // CANONICAL PERPENDICULAR
  // ==========================================================

  const perpendicularX =
    -canonicalUY;

  const perpendicularY =
    canonicalUX;

  // ==========================================================
  // ACTUAL EDGE UNIT VECTOR
  // ==========================================================

  const ux =
    dx / distance;

  const uy =
    dy / distance;

  // ==========================================================
  // START POINT
  // ==========================================================

  const startX =
    x1 +
    ux *
      STATE_RADIUS;

  const startY =
    y1 +
    uy *
      STATE_RADIUS;

  // ==========================================================
  // END POINT
  // ==========================================================

  const endX =
    x2 -
    ux *
      STATE_RADIUS;

  const endY =
    y2 -
    uy *
      STATE_RADIUS;

  // ==========================================================
  // CURVE AMOUNT
  // ==========================================================

  let curveAmount = 0;

  if (hasReverse) {

    const isCanonical =
      transition.from ===
        canonicalFrom.id &&
      transition.to ===
        canonicalTo.id;

    curveAmount =
      isCanonical
        ? 65
        : -65;
  }

  // ==========================================================
  // CONTROL POINT
  // ==========================================================

  const midX =
    (startX + endX) / 2;

  const midY =
    (startY + endY) / 2;

  const controlX =
    midX +
    perpendicularX *
      curveAmount;

  const controlY =
    midY +
    perpendicularY *
      curveAmount;

  // ==========================================================
  // LABEL POSITION
  // ==========================================================

  const labelX =
    0.25 * startX +
    0.5 * controlX +
    0.25 * endX;

  const labelY =
    0.25 * startY +
    0.5 * controlY +
    0.25 * endY;

  // ==========================================================
  // ARROW MARKER
  // ==========================================================

  const arrowId =
    `transition-arrow-${transition.id}`;

  // ==========================================================
  // RENDER NORMAL TRANSITION
  // ==========================================================

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

        {/* ==================================================
            NORMAL ARROW MARKER
            ================================================== */}

        <marker
          id={arrowId}
          markerWidth="14"
          markerHeight="14"
          refX="11"
          refY="7"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path
            d="
              M 0 0
              L 14 7
              L 0 14
              Z
            "
            fill={color}
          />
        </marker>

      </defs>

      {/* ====================================================
          TRANSITION PATH
          ==================================================== */}

      <path
        d={`
          M
            ${startX}
            ${startY}

          Q
            ${controlX}
            ${controlY}

            ${endX}
            ${endY}
        `}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        markerEnd={`url(#${arrowId})`}
        style={{
          pointerEvents: "stroke",
          cursor: "pointer",

          filter:
            isSimulationActive
              ? "drop-shadow(0 0 8px rgba(99,230,255,.85))"
              : "none",
        }}
        onDoubleClick={(event) => {
          event.stopPropagation();

          onDelete?.(
            transition.id
          );
        }}
      />

      {/* ====================================================
          LABEL BACKGROUND
          ==================================================== */}

      <rect
        x={labelX - 18}
        y={labelY - 15}
        width="36"
        height="27"
        rx="6"
        fill="#081019"
        stroke="#294456"
        strokeWidth="1.5"
        style={{
          pointerEvents: "none",
        }}
      />

      {/* ====================================================
          LABEL
          ==================================================== */}

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