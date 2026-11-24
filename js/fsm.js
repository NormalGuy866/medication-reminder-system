// fsm.js
// Finite State Machine for one scheduled dose.
// Allowed transitions:
// UPCOMING -> DUE
// DUE -> TAKEN, SKIPPED, or MISSED
// TAKEN, SKIPPED, and MISSED are terminal states.

const DoseFSM = {
  STATES: {
    UPCOMING: "Upcoming",
    DUE: "Due",
    TAKEN: "Taken",
    SKIPPED: "Skipped",
    MISSED: "Missed"
  },

  transition(dose, event) {
    const transitions = {
      UPCOMING: { TIME_REACHED: "DUE" },
      DUE: {
        MARK_TAKEN: "TAKEN",
        MARK_SKIPPED: "SKIPPED",
        TIME_EXPIRED: "MISSED"
      },
      TAKEN: {},
      SKIPPED: {},
      MISSED: {}
    };

    const currentState = String(dose.status || "UPCOMING").toUpperCase();
    const nextState = transitions[currentState]?.[event];

    // An event not listed above is invalid and does not change the dose.
    if (!nextState) return dose;

    return {
      ...dose,
      status: this.STATES[nextState],
      updatedAt: new Date().toISOString()
    };
  }
};
