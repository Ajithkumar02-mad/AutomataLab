const SAVED_KEY =
  "automatalab-saved";

const RECENT_KEY =
  "automatalab-recent";


export const getSavedAutomata = () => {
  try {
    return JSON.parse(
      localStorage.getItem(
        SAVED_KEY
      ) || "[]"
    );
  } catch {
    return [];
  }
};


export const getRecentAutomata = () => {
  try {
    return JSON.parse(
      localStorage.getItem(
        RECENT_KEY
      ) || "[]"
    );
  } catch {
    return [];
  }
};


export const saveAutomaton = (
  automaton,
  name
) => {
  const saved =
    getSavedAutomata();

  const item = {
    id: crypto.randomUUID(),

    name,

    type: automaton.type,

    automaton,

    createdAt:
      new Date().toISOString(),

    updatedAt:
      new Date().toISOString(),
  };

  localStorage.setItem(
    SAVED_KEY,
    JSON.stringify([
      item,
      ...saved,
    ])
  );

  addRecentAutomaton(item);

  return item;
};


export const updateSavedAutomaton = (
  id,
  automaton,
  name
) => {
  const saved =
    getSavedAutomata();

  const updated =
    saved.map((item) =>
      item.id === id
        ? {
            ...item,

            name,

            type: automaton.type,

            automaton,

            updatedAt:
              new Date().toISOString(),
          }
        : item
    );

  localStorage.setItem(
    SAVED_KEY,
    JSON.stringify(updated)
  );

  return updated;
};


export const addRecentAutomaton = (
  item
) => {
  const recent =
    getRecentAutomata();

  const filtered =
    recent.filter(
      (entry) =>
        entry.id !== item.id
    );

  const updated = [
    {
      ...item,
      openedAt:
        new Date().toISOString(),
    },

    ...filtered,
  ].slice(0, 10);

  localStorage.setItem(
    RECENT_KEY,
    JSON.stringify(updated)
  );
};


export const deleteSavedAutomaton = (
  id
) => {
  const saved =
    getSavedAutomata();

  const updated =
    saved.filter(
      (item) =>
        item.id !== id
    );

  localStorage.setItem(
    SAVED_KEY,
    JSON.stringify(updated)
  );

  return updated;
};


export const clearRecentAutomata = () => {
  localStorage.removeItem(
    RECENT_KEY
  );
};