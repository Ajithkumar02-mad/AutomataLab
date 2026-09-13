import { useState } from "react";
import { Bot, Sparkles, X } from "lucide-react";

import { parseNFAQuestion } from "../parsers/nfaQuestionParser";
import { generateNFA } from "../algorithms/nfaGenerator";

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
  "Construct an NFA accepting strings ending with 01",
  "Construct an NFA accepting strings containing 101",
  "Construct a DFA accepting strings starting with 1",
  "Construct an NFA accepting strings with at least one 1",
];

  const handleGenerate = () => {
  setError("");

  if (!question.trim()) {
    setError("Please enter an automata question.");
    return;
  }

  setLoading(true);

  setTimeout(() => {
    try {
      const text = question.toLowerCase();

      // =====================================================
      // DETECT AUTOMATON TYPE
      // =====================================================

      const isEpsilonNFA =
        text.includes("ε-nfa") ||
        text.includes("epsilon nfa") ||
        text.includes("epsilon-nfa") ||
        text.includes("e-nfa");

      const isNFA =
        text.includes("nfa") ||
        text.includes("non deterministic") ||
        text.includes("nondeterministic");

      // =====================================================
      // NFA / ε-NFA
      // =====================================================

      if (isNFA || isEpsilonNFA) {
        const parsed = parseNFAQuestion(question);

        if (!parsed.success) {
          setError(parsed.error);
          setLoading(false);
          return;
        }

        const generated = generateNFA({
          ...parsed,
          type: isEpsilonNFA ? "ε-NFA" : "NFA",
        });

        if (!generated) {
          setError("Unable to generate NFA.");
          setLoading(false);
          return;
        }

        onGenerate({
          question,
          parsed,
          automaton: {
            ...generated,
            type: isEpsilonNFA
              ? "ε-NFA"
              : "NFA",
          },
        });

        setLoading(false);
        return;
      }

      // =====================================================
      // DFA
      // =====================================================

      const parsed =
        parseAutomataQuestion(question);

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
        automaton: generated.automaton,
      });

      setLoading(false);

    } catch (error) {
      console.error(
        "Automata generation error:",
        error
      );

      setError(
        "Something went wrong while generating the automaton."
      );

      setLoading(false);
    }
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
              : "Generate Automaton"}
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