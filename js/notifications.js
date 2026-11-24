// notifications.js
// Browser notifications require permission and are best-effort.
// Browsers may restrict notifications on non-secure origins.

const Notifications = {
  notifiedDoseIds: new Set(),

  supported() {
    return "Notification" in window;
  },

  async requestPermission() {
    if (!this.supported()) {
      alert("This browser does not support notifications.");
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === "granted";
  },

  checkDueDoses(doses) {
    if (!this.supported() || Notification.permission !== "granted") return;

    doses.forEach(dose => {
      if (dose.status !== "Due" || this.notifiedDoseIds.has(dose.id)) return;

      new Notification("Medication reminder", {
        body: `${dose.medicationName} is due now (${dose.time}).`,
        tag: dose.id
      });
      this.notifiedDoseIds.add(dose.id);
    });
  }
};
