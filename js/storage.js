// storage.js
// This file is responsible for reading and writing data in the browser's LocalStorage.

const STORAGE_KEYS = {
  medications: "medicationReminder_medications",
  doses: "medicationReminder_doses"
};

const Storage = {
  getMedications() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.medications) || "[]");
  },

  saveMedications(medications) {
    localStorage.setItem(STORAGE_KEYS.medications, JSON.stringify(medications));
  },

  getDoses() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.doses) || "[]");
  },

  saveDoses(doses) {
    localStorage.setItem(STORAGE_KEYS.doses, JSON.stringify(doses));
  }
};
