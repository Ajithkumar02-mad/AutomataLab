// ============================================================
// NFA QUESTION PARSER
// AutomataLab
// ============================================================

export const parseNFAQuestion = (question) => {
  if (!question || !question.trim()) {
    return {
      success: false,
      error: "Please enter an NFA question.",
    };
  }

  const originalQuestion = question.trim();
  const text = originalQuestion.toLowerCase();

  // ==========================================================
  // 1. DETECT NFA
  // ==========================================================

  const isNFA =
    /\bnfa\b/i.test(originalQuestion) ||
    text.includes("non deterministic") ||
    text.includes("nondeterministic");

  if (!isNFA) {
    return {
      success: false,
      error:
        "This question does not appear to be an NFA question.",
    };
  }

  // ==========================================================
  // 2. EXTRACT ALPHABET
  // ==========================================================

  let alphabet = [];

  // Example:
  // over {0,1}
  // alphabet {0,1}
  // Σ = {0,1}

  const alphabetMatch =
    originalQuestion.match(
      /(?:over|alphabet)\s*\{([^}]+)\}/i
    ) ||
    originalQuestion.match(
      /Σ\s*=\s*\{([^}]+)\}/i
    );

  if (alphabetMatch) {
    alphabet = alphabetMatch[1]
      .split(",")
      .map((symbol) => symbol.trim())
      .filter(Boolean);
  }

  // Default binary alphabet
  if (alphabet.length === 0) {
    alphabet = ["0", "1"];
  }

  // Remove duplicates
  alphabet = [
    ...new Set(alphabet),
  ];

  // ==========================================================
  // 3. DETECT LANGUAGE OPERATION
  // ==========================================================

  let languageType = null;

  if (
    /\b(?:ending|ends)\s+with\b/i.test(
      originalQuestion
    )
  ) {
    languageType = "ends-with";
  }

  else if (
    /\b(?:starting|starts)\s+with\b/i.test(
      originalQuestion
    )
  ) {
    languageType = "starts-with";
  }

  else if (
    /\b(?:containing|contains|contain)\b/i.test(
      originalQuestion
    ) ||
    /\bsubstring\b/i.test(
      originalQuestion
    )
  ) {
    languageType = "contains";
  }

  else if (
    /\bat\s+least\s+one\b/i.test(
      originalQuestion
    ) ||
    /\batleast\s+one\b/i.test(
      originalQuestion
    )
  ) {
    languageType = "at-least-one";
  }

  if (!languageType) {
    return {
      success: false,
      error:
        "I could not determine the NFA language condition. Try: ending with 01, containing 101, or starting with 1.",
    };
  }

  // ==========================================================
  // 4. EXTRACT PATTERN
  // ==========================================================
  //
  // IMPORTANT:
  // Extract ONLY the symbols immediately after the
  // language condition.
  //
  // This prevents words like "NFA", "accepting", etc.
  // from becoming part of the pattern.
  // ==========================================================

  let pattern = null;

  // ----------------------------------------------------------
  // ENDING WITH
  // ----------------------------------------------------------

  if (languageType === "ends-with") {

    const match =
      originalQuestion.match(
        /(?:ending|ends)\s+with\s+["'`]?([01]+)["'`]?/i
      );

    if (match) {
      pattern = match[1];
    }
  }

  // ----------------------------------------------------------
  // STARTING WITH
  // ----------------------------------------------------------

  else if (languageType === "starts-with") {

    const match =
      originalQuestion.match(
        /(?:starting|starts)\s+with\s+["'`]?([01]+)["'`]?/i
      );

    if (match) {
      pattern = match[1];
    }
  }

  // ----------------------------------------------------------
  // CONTAINS
  // ----------------------------------------------------------

  else if (languageType === "contains") {

    const match =
      originalQuestion.match(
        /(?:containing|contains|contain)\s+["'`]?([01]+)["'`]?/i
      );

    if (match) {
      pattern = match[1];
    }

    // substring 101
    if (!pattern) {

      const substringMatch =
        originalQuestion.match(
          /substring\s+["'`]?([01]+)["'`]?/i
        );

      if (substringMatch) {
        pattern = substringMatch[1];
      }
    }
  }

  // ----------------------------------------------------------
  // AT LEAST ONE
  // ----------------------------------------------------------

  else if (
    languageType === "at-least-one"
  ) {

    const match =
      originalQuestion.match(
        /at\s+least\s+one\s+["'`]?([01])["'`]?/i
      );

    if (match) {
      pattern = match[1];
    }
  }

  // ==========================================================
  // 5. VALIDATE PATTERN
  // ==========================================================

  if (!pattern) {
    return {
      success: false,
      error:
        "Could not extract the binary pattern from the question.",
    };
  }

  pattern = pattern.trim();

  // Make sure every symbol belongs to alphabet
  const invalidSymbols = [
    ...new Set(
      [...pattern].filter(
        (symbol) =>
          !alphabet.includes(symbol)
      )
    ),
  ];

  if (invalidSymbols.length > 0) {
    return {
      success: false,
      error:
        `Pattern "${pattern}" contains symbol(s) not present in the alphabet: ${invalidSymbols.join(", ")}`,
    };
  }

  // ==========================================================
  // 6. RETURN PARSED QUESTION
  // ==========================================================

  return {
    success: true,

    type: "NFA",

    isNFA: true,

    question: originalQuestion,

    alphabet,

    pattern,

    languageType,

    patternType: languageType,

    explanation:
      `NFA accepting strings ${languageType.replace(
        "-",
        " "
      )} ${pattern}.`,
  };
};