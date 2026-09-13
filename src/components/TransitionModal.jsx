import { useEffect, useState } from "react";
import { X, ArrowRight, Plus } from "lucide-react";

const TransitionModal = ({
  isOpen,
  fromState,
  toState,
  onClose,
  onCreate,
}) => {
  const [symbol, setSymbol] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSymbol("");
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    const cleanSymbol = symbol.trim();

    if (!cleanSymbol) {
      return;
    }

    onCreate(cleanSymbol);
  };

  return (
    <div
      className="transition-modal-overlay"
      onMouseDown={onClose}
    >
      <div
        className="transition-modal"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        {/* HEADER */}
        <div className="transition-modal-header">
          <div>
            <div className="transition-modal-title">
              Create Transition
            </div>

            <div className="transition-modal-subtitle">
              Define how the automaton moves between states.
            </div>
          </div>

          <button
            type="button"
            className="transition-modal-close"
            onClick={onClose}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* STATE FLOW */}
        <div className="transition-flow">
          <div className="transition-state-box">
            <span>FROM</span>
            <strong>
              {fromState?.name || fromState?.id}
            </strong>
          </div>

          <ArrowRight
            size={24}
            className="transition-flow-arrow"
          />

          <div className="transition-state-box">
            <span>TO</span>
            <strong>
              {toState?.name || toState?.id}
            </strong>
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          <div className="transition-symbol-section">
            <label htmlFor="transition-symbol">
              Transition Symbol
            </label>

            <input
              id="transition-symbol"
              type="text"
              value={symbol}
              onChange={(event) =>
                setSymbol(event.target.value)
              }
              placeholder="Enter symbol, e.g. 0"
              autoFocus
            />

            <div className="transition-symbol-hint">
              For ε-NFA, you can use ε.
            </div>
          </div>

          {/* ACTIONS */}
          <div className="transition-modal-actions">
            <button
              type="button"
              className="transition-cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="transition-create-btn"
              disabled={!symbol.trim()}
            >
              <Plus size={17} />
              Create Transition
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransitionModal;