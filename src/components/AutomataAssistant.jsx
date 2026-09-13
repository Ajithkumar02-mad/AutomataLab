import { useState } from "react";
import { Bot, Sparkles, X } from "lucide-react";

import { parseAutomataQuestion } from "../parsers/automataQuestionParser";
import { generateDFA } from "../algorithms/dfaGenerator";

const AutomataAssistant = ({
  onGenerate,
  onClose,
}) => {
  const [question, setQuestion] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const examples = [
    "Construct a DFA accepting strings ending with 01",
    "DFA accepting strings containing 101",
    "DFA accepting strings starting with 1",
    "DFA accepting strings with even number of 0s",
  ];

  const handleGenerate = () => {
    setError("");

    if (!question.trim()) {
      setError(
        "Please enter an automata question."
      );
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const parsed =
        parseAutomataQuestion(
          question
        );

      if (!parsed.success) {
        setError(parsed.error);
        setLoading(false);
        return;
      }

      const generated =
        generateDFA(parsed);

      if (!generated.success) {
        setError(generated.error);
        setLoading(false);
        return;
      }

      onGenerate({
        question,
        parsed,
        automaton:
          generated.automaton,
      });

      setLoading(false);
    }, 250);
  };

  return (
    <div className="assistant-overlay">
      <div className="assistant-panel">

        <div className="assistant-header">

          <div className="assistant-title">

            <div className="assistant-icon">
              <Bot size={21} />
            </div>

            <div>
              <h2>
                Ask Automata
              </h2>

              <span>
                Generate automata from questions
              </span>
            </div>

          </div>

          <button
            className="assistant-close"
            onClick={onClose}
          >
            <X size={19} />
          </button>

        </div>

        <div className="assistant-body">

          <label>
            Automata Question
          </label>

          <textarea
            value={question}
            onChange={(event) => {
              setQuestion(
                event.target.value
              );
              setError("");
            }}
            placeholder="Example: Construct a DFA accepting strings ending with 01"
            rows={5}
          />

          {error && (
            <div className="assistant-error">
              {error}
            </div>
          )}

          <button
            className="assistant-generate"
            onClick={handleGenerate}
            disabled={loading}
          >
            <Sparkles size={18} />

            {loading
              ? "Generating..."
              : "Generate DFA"}
          </button>

          <div className="assistant-examples">

            <div className="assistant-example-title">
              Try an example
            </div>

            {examples.map(
              (example) => (
                <button
                  key={example}
                  onClick={() =>
                    setQuestion(
                      example
                    )
                  }
                >
                  {example}
                </button>
              )
            )}

          </div>

        </div>

      </div>
    </div>
  );
};

export default AutomataAssistant;