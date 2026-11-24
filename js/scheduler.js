// scheduler.js
// Creates one dose record for each medication scheduled on a given date.
// The scheduler runs while the web application is open; it is not a background service.

const Scheduler = {
  MISSED_AFTER_MINUTES: 60,

  dateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  },

  getScheduledDateTime(dateKey, time) {
    return new Date(`${dateKey}T${time}:00`);
  },

  ensureDoseRecords(date = new Date()) {
    const dateKey = this.dateKey(date);
    const weekday = date.getDay();
    const medications = Medication.getAll();
    const doses = Storage.getDoses();

    medications.forEach(medication => {
      if (!Array.isArray(medication.days) || !medication.days.includes(weekday)) return;

      const doseId = `${medication.id}_${dateKey}_${medication.time}`;
      const exists = doses.some(dose => dose.id === doseId);
      if (!exists) {
        doses.push({
          id: doseId,
          medicationId: medication.id,
          medicationName: medication.name,
          notes: medication.notes || "",
          date: dateKey,
          time: medication.time,
          status: DoseFSM.STATES.UPCOMING,
          createdAt: new Date().toISOString()
        });
      }
    });

    Storage.saveDoses(doses);
  },

  updateDoseStatuses(now = new Date()) {
    this.ensureDoseRecords(now);
    const today = this.dateKey(now);
    let doses = Storage.getDoses();
    let changed = false;

    doses = doses.map(dose => {
      if (dose.date !== today) return dose;

      const scheduledTime = this.getScheduledDateTime(dose.date, dose.time);
      const missedTime = new Date(scheduledTime.getTime() + this.MISSED_AFTER_MINUTES * 60000);
      let updated = dose;

      if (dose.status === DoseFSM.STATES.UPCOMING && now >= scheduledTime) {
        updated = DoseFSM.transition(dose, "TIME_REACHED");
      }

      if (updated.status === DoseFSM.STATES.DUE && now >= missedTime) {
        updated = DoseFSM.transition(updated, "TIME_EXPIRED");
      }

      if (updated !== dose) changed = true;
      return updated;
    });

    if (changed) Storage.saveDoses(doses);
    return doses;
  },

  recordAction(doseId, action) {
    const event = action === "taken" ? "MARK_TAKEN" : "MARK_SKIPPED";
    const doses = Storage.getDoses();
    const index = doses.findIndex(dose => dose.id === doseId);
    if (index === -1) return false;

    const updated = DoseFSM.transition(doses[index], event);
    if (updated === doses[index]) return false;

    doses[index] = updated;
    Storage.saveDoses(doses);
    return true;
  },

  getTodayDoses() {
    const today = this.dateKey(new Date());
    return Storage.getDoses()
      .filter(dose => dose.date === today)
      .sort((a, b) => a.time.localeCompare(b.time));
  }
};
