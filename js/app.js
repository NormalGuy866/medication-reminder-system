// app.js
// Connects the interface to medication management, scheduling, FSM, history, and notifications.

const elements = {
  form: document.getElementById("medicationForm"),
  medicationId: document.getElementById("medicationId"),
  medicationName: document.getElementById("medicationName"),
  medicationNotes: document.getElementById("medicationNotes"),
  medicationTime: document.getElementById("medicationTime"),
  formTitle: document.getElementById("formTitle"),
  saveMedicationButton: document.getElementById("saveMedicationButton"),
  cancelEditButton: document.getElementById("cancelEditButton"),
  formMessage: document.getElementById("formMessage"),
  medicationList: document.getElementById("medicationList"),
  emptyMedications: document.getElementById("emptyMedications"),
  todayDoseList: document.getElementById("todayDoseList"),
  emptyToday: document.getElementById("emptyToday"),
  todayLabel: document.getElementById("todayLabel"),
  totalCount: document.getElementById("totalCount"),
  dueCount: document.getElementById("dueCount"),
  takenCount: document.getElementById("takenCount"),
  missedCount: document.getElementById("missedCount"),
  historyList: document.getElementById("historyList"),
  emptyHistory: document.getElementById("emptyHistory"),
  historySummary: document.getElementById("historySummary"),
  dailyHistoryButton: document.getElementById("dailyHistoryButton"),
  weeklyHistoryButton: document.getElementById("weeklyHistoryButton"),
  notificationButton: document.getElementById("notificationButton")
};

let historyDays = 0;

function formatDate(dateString) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "short", month: "short", day: "numeric", year: "numeric"
  });
}

function formatTime(time) {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function statusClass(status) {
  return `status-${status.toLowerCase()}`;
}

function renderSummary(doses) {
  elements.totalCount.textContent = doses.length;
  elements.dueCount.textContent = doses.filter(dose => dose.status === "Due").length;
  elements.takenCount.textContent = doses.filter(dose => dose.status === "Taken").length;
  elements.missedCount.textContent = doses.filter(dose => dose.status === "Missed").length;
}

function renderToday() {
  const doses = Scheduler.getTodayDoses();
  elements.todayLabel.textContent = new Date().toLocaleDateString(undefined, {
    weekday: "long", month: "long", day: "numeric"
  });
  renderSummary(doses);
  elements.todayDoseList.innerHTML = "";

  doses.forEach(dose => {
    const card = document.createElement("article");
    card.className = "dose-card";

    const main = document.createElement("div");
    main.className = "item-main";
    const title = document.createElement("p");
    title.className = "item-title";
    title.textContent = dose.medicationName;
    const meta = document.createElement("p");
    meta.className = "item-meta";
    meta.textContent = `${formatTime(dose.time)}${dose.notes ? " · " + dose.notes : ""}`;
    main.append(title, meta);

    const actions = document.createElement("div");
    actions.className = "item-actions";
    const status = document.createElement("span");
    status.className = `status ${statusClass(dose.status)}`;
    status.textContent = dose.status;
    actions.append(status);

    if (dose.status === "Due") {
      const takenButton = document.createElement("button");
      takenButton.className = "button button-small button-primary";
      takenButton.textContent = "Taken";
      takenButton.addEventListener("click", () => handleDoseAction(dose.id, "taken"));

      const skippedButton = document.createElement("button");
      skippedButton.className = "button button-small button-secondary";
      skippedButton.textContent = "Skip";
      skippedButton.addEventListener("click", () => handleDoseAction(dose.id, "skipped"));
      actions.append(takenButton, skippedButton);
    }

    card.append(main, actions);
    elements.todayDoseList.append(card);
  });

  elements.emptyToday.classList.toggle("hidden", doses.length > 0);
}

function renderMedications() {
  const medications = Medication.getAll().sort((a, b) => a.time.localeCompare(b.time));
  elements.medicationList.innerHTML = "";

  medications.forEach(medication => {
    const card = document.createElement("article");
    card.className = "medication-card";

    const main = document.createElement("div");
    main.className = "item-main";
    const title = document.createElement("p");
    title.className = "item-title";
    title.textContent = medication.name;
    const days = medication.days.map(day => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day]).join(", ");
    const meta = document.createElement("p");
    meta.className = "item-meta";
    meta.textContent = `${formatTime(medication.time)} · ${days}${medication.notes ? " · " + medication.notes : ""}`;
    main.append(title, meta);

    const actions = document.createElement("div");
    actions.className = "item-actions";
    const edit = document.createElement("button");
    edit.className = "button button-small button-secondary";
    edit.textContent = "Edit";
    edit.addEventListener("click", () => startEdit(medication.id));

    const remove = document.createElement("button");
    remove.className = "button button-small button-secondary";
    remove.textContent = "Delete";
    remove.addEventListener("click", () => {
      if (confirm(`Delete the schedule for "${medication.name}"?`)) {
        Medication.delete(medication.id);
        refresh();
      }
    });

    actions.append(edit, remove);
    card.append(main, actions);
    elements.medicationList.append(card);
  });

  elements.emptyMedications.classList.toggle("hidden", medications.length > 0);
}

function renderHistory() {
  const records = History.getRecords(historyDays);
  const summary = History.getSummary(records);
  elements.historySummary.textContent =
    `${summary.total} scheduled dose record(s): ${summary.taken} taken, ${summary.skipped} skipped, ` +
    `${summary.missed} missed, ${summary.due} due, ${summary.upcoming} upcoming.`;

  elements.historyList.innerHTML = "";
  records.forEach(dose => {
    const card = document.createElement("article");
    card.className = "history-card";

    const date = document.createElement("span");
    date.className = "history-date";
    date.textContent = formatDate(dose.date);

    const main = document.createElement("div");
    main.className = "item-main";
    const title = document.createElement("p");
    title.className = "item-title";
    title.textContent = dose.medicationName;
    const meta = document.createElement("p");
    meta.className = "item-meta";
    meta.textContent = formatTime(dose.time);
    main.append(title, meta);

    const status = document.createElement("span");
    status.className = `status ${statusClass(dose.status)}`;
    status.textContent = dose.status;
    card.append(date, main, status);
    elements.historyList.append(card);
  });

  elements.emptyHistory.classList.toggle("hidden", records.length > 0);
  elements.dailyHistoryButton.className = `button button-small ${historyDays === 0 ? "button-primary" : "button-secondary"}`;
  elements.weeklyHistoryButton.className = `button button-small ${historyDays === 6 ? "button-primary" : "button-secondary"}`;
}

function resetForm() {
  elements.form.reset();
  elements.medicationId.value = "";
  elements.formTitle.textContent = "Add medication";
  elements.saveMedicationButton.textContent = "Save medication";
  elements.cancelEditButton.classList.add("hidden");
  document.querySelectorAll('input[name="day"]').forEach(input => { input.checked = true; });
}

function startEdit(id) {
  const medication = Medication.getById(id);
  if (!medication) return;

  elements.medicationId.value = medication.id;
  elements.medicationName.value = medication.name;
  elements.medicationNotes.value = medication.notes || "";
  elements.medicationTime.value = medication.time;
  document.querySelectorAll('input[name="day"]').forEach(input => {
    input.checked = medication.days.includes(Number(input.value));
  });
  elements.formTitle.textContent = "Edit medication";
  elements.saveMedicationButton.textContent = "Update medication";
  elements.cancelEditButton.classList.remove("hidden");
  elements.form.scrollIntoView({ behavior: "smooth", block: "start" });
}

function handleDoseAction(doseId, action) {
  const changed = Scheduler.recordAction(doseId, action);
  if (!changed) {
    alert("This dose can no longer be changed. Only doses in the Due state can be recorded.");
    return;
  }
  refresh();
}

function refresh() {
  const doses = Scheduler.updateDoseStatuses(new Date());
  Notifications.checkDueDoses(doses);
  renderToday();
  renderMedications();
  renderHistory();
}

elements.form.addEventListener("submit", event => {
  event.preventDefault();

  const selectedDays = [...document.querySelectorAll('input[name="day"]:checked')]
    .map(input => Number(input.value));

  if (selectedDays.length === 0) {
    elements.formMessage.textContent = "Choose at least one day for this schedule.";
    return;
  }

  Medication.save({
    id: elements.medicationId.value || undefined,
    name: elements.medicationName.value.trim(),
    notes: elements.medicationNotes.value.trim(),
    time: elements.medicationTime.value,
    days: selectedDays
  });

  elements.formMessage.textContent = "Medication schedule saved.";
  resetForm();
  refresh();
});

elements.cancelEditButton.addEventListener("click", () => {
  resetForm();
  elements.formMessage.textContent = "";
});

elements.dailyHistoryButton.addEventListener("click", () => {
  historyDays = 0;
  renderHistory();
});

elements.weeklyHistoryButton.addEventListener("click", () => {
  historyDays = 6;
  renderHistory();
});

elements.notificationButton.addEventListener("click", async () => {
  const granted = await Notifications.requestPermission();
  elements.notificationButton.textContent = granted ? "Notifications enabled" : "Notifications unavailable";
  if (!granted) alert("Notifications were not enabled. You can still use the dashboard while it is open.");
});

// Run once at startup, then check the clock every 15 seconds while the page is open.
refresh();
setInterval(refresh, 15000);
