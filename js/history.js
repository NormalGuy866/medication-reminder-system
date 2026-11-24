// history.js
// Retrieves dose records for the daily and weekly history views.

const History = {
  getRecords(daysBack = 0) {
    const end = new Date();
    end.setHours(0, 0, 0, 0);
    const start = new Date(end);
    start.setDate(start.getDate() - daysBack);

    return Storage.getDoses()
      .filter(dose => {
        const doseDate = new Date(`${dose.date}T00:00:00`);
        return doseDate >= start && doseDate <= end;
      })
      .sort((a, b) => b.date.localeCompare(a.date) || a.time.localeCompare(b.time));
  },

  getSummary(records) {
    return {
      total: records.length,
      taken: records.filter(dose => dose.status === "Taken").length,
      skipped: records.filter(dose => dose.status === "Skipped").length,
      missed: records.filter(dose => dose.status === "Missed").length,
      upcoming: records.filter(dose => dose.status === "Upcoming").length,
      due: records.filter(dose => dose.status === "Due").length
    };
  }
};
