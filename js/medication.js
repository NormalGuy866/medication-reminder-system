// medication.js
// Functions for creating, updating, and deleting medication schedules.

const Medication = {
  getAll() {
    return Storage.getMedications();
  },

  save(medicationData) {
    const medications = this.getAll();
    const now = new Date().toISOString();

    if (medicationData.id) {
      const index = medications.findIndex(item => item.id === medicationData.id);
      if (index === -1) return null;
      medications[index] = { ...medications[index], ...medicationData, updatedAt: now };
    } else {
      const newMedication = {
        ...medicationData,
        id: crypto.randomUUID(),
        createdAt: now
      };
      medications.push(newMedication);
    }

    Storage.saveMedications(medications);
    return medications;
  },

  delete(id) {
    const medications = this.getAll().filter(item => item.id !== id);
    Storage.saveMedications(medications);

    // Remove future dose records belonging to the deleted medication.
    const today = Scheduler.dateKey(new Date());
    const doses = Storage.getDoses().filter(dose =>
      dose.medicationId !== id || (dose.date < today && dose.status !== "Upcoming")
    );
    Storage.saveDoses(doses);
  },

  getById(id) {
    return this.getAll().find(item => item.id === id) || null;
  }
};
