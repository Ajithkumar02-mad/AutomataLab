/*
 * AutomataLab
 * Deterministic Automata Question Parser
 */

export const parseAutomataQuestion = (question) => {
  const text = String(question || "")
    .toLowerCase()
    .trim();

  if (!text) {
    return {
      success: false,
      error: "Please enter an automata question.",
    };
  }

  /*
   * ---------------------------------------------------------
   * ENDING WITH PATTERN
   * ---------------------------------------------------------
   */

  const endingMatch = text.match(
    /ending\s+(?:with|in)\s+([01]+)/
  );

  if (endingMatch) {
    return {
      success: true,
      type: "ending",
      pattern: endingMatch[1],
      alphabet: ["0", "1"],
      description: `strings ending with ${endingMatch[1]}`,
    };
  }

  /*
   * ---------------------------------------------------------
   * CONTAINING PATTERN
   * ---------------------------------------------------------
   */

  const containingMatch = text.match(
    /contain(?:ing)?\s+([01]+)/
  );

  if (containingMatch) {
    return {
      success: true,
      type: "containing",
      pattern: containingMatch[1],
      alphabet: ["0", "1"],
      description: `strings containing ${containingMatch[1]}`,
    };
  }

  /*
   * ---------------------------------------------------------
   * STARTING WITH
   * ---------------------------------------------------------
   */

  const startingMatch = text.match(
    /start(?:ing)?\s+(?:with|from)\s+([01])/
  );

  if (startingMatch) {
    return {
      success: true,
      type: "starting",
      pattern: startingMatch[1],
      alphabet: ["0", "1"],
      description: `strings starting with ${startingMatch[1]}`,
    };
  }

  /*
   * ---------------------------------------------------------
   * EVEN NUMBER OF 0s
   * ---------------------------------------------------------
   */

  if (
    text.includes("even number of 0") ||
    text.includes("even number of zeros")
  ) {
    return {
      success: true,
      type: "even-zero",
      alphabet: ["0", "1"],
      description: "strings containing an even number of 0s",
    };
  }

  /*
   * ---------------------------------------------------------
   * ODD NUMBER OF 0s
   * ---------------------------------------------------------
   */

  if (
    text.includes("odd number of 0") ||
    text.includes("odd number of zeros")
  ) {
    return {
      success: true,
      type: "odd-zero",
      alphabet: ["0", "1"],
      description: "strings containing an odd number of 0s",
    };
  }

  /*
   * ---------------------------------------------------------
   * EVEN NUMBER OF 1s
   * ---------------------------------------------------------
   */

  if (
    text.includes("even number of 1") ||
    text.includes("even number of ones")
  ) {
    return {
      success: true,
      type: "even-one",
      alphabet: ["0", "1"],
      description: "strings containing an even number of 1s",
    };
  }

  /*
   * ---------------------------------------------------------
   * ODD NUMBER OF 1s
   * ---------------------------------------------------------
   */

  if (
    text.includes("odd number of 1") ||
    text.includes("odd number of ones")
  ) {
    return {
      success: true,
      type: "odd-one",
      alphabet: ["0", "1"],
      description: "strings containing an odd number of 1s",
    };
  }

  /*
   * ---------------------------------------------------------
   * EXACTLY TWO 1s
   * ---------------------------------------------------------
   */

  if (
    text.includes("exactly two 1") ||
    text.includes("exactly 2 1") ||
    text.includes("two ones")
  ) {
    return {
      success: true,
      type: "exactly-two-one",
      alphabet: ["0", "1"],
      description: "strings containing exactly two 1s",
    };
  }

  /*
   * ---------------------------------------------------------
   * DIVISIBLE BY 3
   * ---------------------------------------------------------
   */

  if (
    text.includes("divisible by 3") ||
    text.includes("multiple of 3")
  ) {
    return {
      success: true,
      type: "divisible-by-3",
      alphabet: ["0", "1"],
      description: "binary strings representing numbers divisible by 3",
    };
  }

  return {
    success: false,
    error:
      "I couldn't recognize this DFA problem yet. Try a supported question such as: \"DFA accepting strings ending with 01\".",
  };
};