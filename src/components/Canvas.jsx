import { useEffect, useRef } from "react";
import StateNode from "./StateNode";
import Transition from "./Transition";

const Canvas = ({
  states,
  transitions,
  activeTool,
  transitionStart,
  viewport,
  setViewport,
  simulation,
  onCanvasClick,
  onStateMouseDown,
  onStateClick,
  onDeleteTransition,
  dragMovedRef,
  zoomIn,
  zoomOut,
  resetZoom,
}) => {
  const canvasRef = useRef(null);

  // Canvas panning
  const panRef = useRef(null);

  // Track whether Space is being held
  const spacePressedRef = useRef(false);

  // ---------------------------------------
  // SPACE KEY DETECTION
  // ---------------------------------------
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === "Space") {
        spacePressedRef.current = true;
      }
    };

    const handleKeyUp = (event) => {
      if (event.code === "Space") {
        spacePressedRef.current = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // ---------------------------------------
  // MOUSE / TRACKPAD PAN START
  // ---------------------------------------
  const handlePanStart = (event) => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    // Only start left-click pan when clicking
    // directly on empty canvas
    const clickedEmptyCanvas = event.target === canvas;

    // Middle mouse button always allows panning
    const middleMouse = event.button === 1;

    // Left mouse + Space also allows panning
    const spacePan =
      event.button === 0 &&
      spacePressedRef.current;

    // Normal left click on empty canvas
    const leftDragPan =
      event.button === 0 &&
      clickedEmptyCanvas;

    if (!middleMouse && !spacePan && !leftDragPan) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    panRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      originalX: viewport.x,
      originalY: viewport.y,
    };
  };

  // ---------------------------------------
  // PAN MOVE
  // ---------------------------------------
  const handlePanMove = (event) => {
    if (!panRef.current) return;

    const dx =
      event.clientX - panRef.current.startX;

    const dy =
      event.clientY - panRef.current.startY;

    setViewport((previous) => ({
      ...previous,
      x: panRef.current.originalX + dx,
      y: panRef.current.originalY + dy,
    }));
  };

  // ---------------------------------------
  // PAN END
  // ---------------------------------------
  const handlePanEnd = () => {
    panRef.current = null;
  };

  // ---------------------------------------
  // WHEEL / TRACKPAD
  // ---------------------------------------
  const handleWheel = (event) => {
    event.preventDefault();

    /*
      Normal two-finger trackpad movement
      behaves like wheel events.

      Therefore:
      - Normal wheel/trackpad → PAN
      - Ctrl + wheel/trackpad → ZOOM
    */

    if (!event.ctrlKey) {
      setViewport((previous) => ({
        ...previous,
        x: previous.x - event.deltaX,
        y: previous.y - event.deltaY,
      }));

      return;
    }

    // -----------------------------------
    // CTRL + WHEEL = ZOOM
    // -----------------------------------

    const canvas = canvasRef.current;

    if (!canvas) return;

    const rect =
      canvas.getBoundingClientRect();

    const mouseX =
      event.clientX - rect.left;

    const mouseY =
      event.clientY - rect.top;

    const zoomFactor =
      event.deltaY < 0 ? 1.1 : 0.9;

    setViewport((previous) => {
      const newZoom = Math.min(
        2.5,
        Math.max(
          0.4,
          previous.zoom * zoomFactor
        )
      );

      // Keep zoom centered around cursor
      const worldX =
        (mouseX - previous.x) /
        previous.zoom;

      const worldY =
        (mouseY - previous.y) /
        previous.zoom;

      return {
        x:
          mouseX -
          worldX * newZoom,

        y:
          mouseY -
          worldY * newZoom,

        zoom: newZoom,
      };
    });
  };

  // ---------------------------------------
  // CANVAS CLICK
  // ---------------------------------------
  const handleCanvasClick = (event) => {
    if (dragMovedRef.current) {
      dragMovedRef.current = false;
      return;
    }

    if (activeTool !== "add-state") {
      onCanvasClick(event);
      return;
    }

    const canvas = canvasRef.current;

    if (!canvas) return;

    const rect =
      canvas.getBoundingClientRect();

    const worldX =
      (event.clientX -
        rect.left -
        viewport.x) /
      viewport.zoom;

    const worldY =
      (event.clientY -
        rect.top -
        viewport.y) /
      viewport.zoom;

    onCanvasClick({
      ...event,
      clientX: worldX,
      clientY: worldY,
    });
  };

  return (
    <div
      ref={canvasRef}
      className={`canvas ${
        activeTool === "transition"
          ? "transition-mode"
          : ""
      }`}

      onClick={handleCanvasClick}

      onWheel={handleWheel}

      onMouseDown={handlePanStart}

      onMouseMove={handlePanMove}

      onMouseUp={handlePanEnd}

      onMouseLeave={handlePanEnd}

      onContextMenu={(event) =>
        event.preventDefault()
      }
    >

      {/* ====================================
          CANVAS WORLD
          ==================================== */}

      <div
        className="canvas-world"
        style={{
          transform: `
            translate(${viewport.x}px, ${viewport.y}px)
            scale(${viewport.zoom})
          `,
          transformOrigin: "0 0",
        }}
      >

        {/* TRANSITIONS */}
        {transitions.map((transition) => (
          <Transition
            key={transition.id}
            transition={transition}
            states={states}
            transitions={transitions}
            onDelete={onDeleteTransition}
            isSimulationActive={
              simulation?.activeTransitionId ===
              transition.id
            }
          />
        ))}

        {/* STATES */}
        {states.map((state) => (
          <StateNode
            key={state.id}
            state={state}
            activeTool={activeTool}

            isTransitionStart={
              transitionStart === state.id
            }

            isSimulationCurrent={
              simulation?.currentState === state.id
            }

            isSimulationFailed={
              simulation?.error?.state === state.id
            }

            onMouseDown={onStateMouseDown}
            onClick={onStateClick}
          />
        ))}

        {/* EMPTY CANVAS MESSAGE */}
        {states.length === 0 && (
          <div className="canvas-empty">
            <div className="empty-icon">
              +
            </div>

            <h2>Start Building</h2>

            <p>
              {activeTool === "add-state"
                ? "Click anywhere to add a state."
                : 'Select "Add State" to begin.'}
            </p>
          </div>
        )}

        {/* TRANSITION INSTRUCTION */}
        {activeTool === "transition" &&
          states.length > 0 && (
            <div className="transition-instruction">

              {!transitionStart ? (
                <>
                  <div className="instruction-step">
                    1
                  </div>

                  <span>
                    Select the{" "}
                    <strong>
                      source state
                    </strong>
                  </span>
                </>
              ) : (
                <>
                  <div className="instruction-step active">
                    2
                  </div>

                  <span>
                    Select the{" "}
                    <strong>
                      destination state
                    </strong>
                  </span>
                </>
              )}

            </div>
          )}

      </div>

      {simulation?.error && (
  <div className="simulation-failure-popup">
    <div className="simulation-popup-title">
      ✕ Simulation Failed
    </div>

    <div className="simulation-popup-row">
      <span>Reason</span>
      <strong>
        {simulation.error.message}
      </strong>
    </div>

    {simulation.error.position && (
      <div className="simulation-popup-row">
        <span>Input Position</span>
        <strong>
          {simulation.error.position}
        </strong>
      </div>
    )}

    {simulation.error.symbol && (
      <div className="simulation-popup-row">
        <span>Symbol</span>
        <strong>
          "{simulation.error.symbol}"
        </strong>
      </div>
    )}

    <div className="simulation-popup-explanation">
      {simulation.error.explanation}
    </div>
  </div>
)}

      {/* ====================================
          ZOOM CONTROLS
          ==================================== */}

      <div
        className="canvas-controls"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            zoomOut();
          }}
          title="Zoom out"
        >
          −
        </button>

        <button
          type="button"
          className="zoom-value"
          onClick={(event) => {
            event.stopPropagation();
            resetZoom();
          }}
          title="Reset zoom"
        >
          {Math.round(
            viewport.zoom * 100
          )}
          %
        </button>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            zoomIn();
          }}
          title="Zoom in"
        >
          +
        </button>

      </div>

      {/* ====================================
          PAN HINT
          ==================================== */}

      <div className="canvas-pan-hint">
        Drag empty canvas
        <span>•</span>
        Two-finger drag
        <span>•</span>
        Ctrl + wheel to zoom
      </div>

    </div>
  );
};

export default Canvas;