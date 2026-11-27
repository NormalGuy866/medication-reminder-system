# Medication Schedule and Reminder System

A browser application built with HTML, CSS, and vanilla JavaScript. It uses LocalStorage, a Finite State Machine (FSM), a time-based scheduler, dose history, and optional browser notifications.

## 1. Requirements

- A desktop or laptop computer
- A modern browser such as Chrome, Edge, or Firefox
- Visual Studio Code (recommended)
- The Live Server extension for VS Code (recommended)

No Node.js, database, backend server, or package installation is required.

## 2. Run the project in VS Code

1. Extract the project ZIP file.
2. Open Visual Studio Code.
3. Select **File > Open Folder**.
4. Choose the `medication-reminder-system` folder.
5. Install the **Live Server** extension if it is not already installed.
6. Right-click `index.html`.
7. Select **Open with Live Server**.

You can also open `index.html` directly in a browser, but Live Server is recommended for consistent browser behavior and notification testing.

## 3. Project structure

```text
medication-reminder-system/
│
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   ├── storage.js
│   ├── medication.js
│   ├── scheduler.js
│   ├── fsm.js
│   ├── history.js
│   └── notifications.js
└── README.md
```

### JavaScript file responsibilities

| File | Responsibility |
|---|---|
| `app.js` | Connects the interface and JavaScript modules; handles user interaction and rendering. |
| `storage.js` | Saves and retrieves medication schedules and dose records using LocalStorage. |
| `medication.js` | Adds, edits, retrieves, and deletes medication schedules. |
| `scheduler.js` | Creates daily dose records and checks scheduled times. |
| `fsm.js` | Defines the valid dose states and state transitions. |
| `history.js` | Retrieves daily and weekly dose records and calculates totals. |
| `notifications.js` | Requests browser permission and sends due-dose notifications. |

## 4. How the FSM works

Each scheduled dose has its own lifecycle:

```text
UPCOMING
   |
   | Scheduled time is reached
   v
  DUE
   |-------------------|
   |                   |
   | User marks taken  | User skips
   v                   v
 TAKEN               SKIPPED

  DUE
   |
   | 60 minutes pass without a recorded action
   v
 MISSED
```

- **Upcoming:** The scheduled reminder time has not arrived.
- **Due:** The scheduled time has arrived and the user can record the dose.
- **Taken:** The user records the dose as taken.
- **Skipped:** The user records the dose as skipped.
- **Missed:** The dose remains unrecorded for 60 minutes after its scheduled time.

Taken, Skipped, and Missed are terminal states for that dose. A later scheduled dose receives a new dose record and starts at Upcoming.

The 60-minute missed rule is an application rule for this project, not medical guidance.

## 5. Important scheduler limitation

The scheduler checks the time every 15 seconds while the application is open. LocalStorage does not run background tasks. If the browser or application is closed, automatic status updates and notifications may not happen at the scheduled time. When the user opens the application again, the scheduler checks the current day's records.

Browser notifications require browser support and user permission. Device and browser settings may also affect delivery.

## 6. How data is stored

The application stores two collections in LocalStorage:

- `medicationReminder_medications` — saved medication names, notes, reminder times, and selected days.
- `medicationReminder_doses` — individual dose records and their FSM statuses.

Data is stored in the current browser on the current device. Clearing browser site data can permanently delete it. The application does not synchronize data between devices.

## 8. Scope and safety

This is a schedule organizer and recordkeeping application. It cannot confirm that a person physically consumed a medication. It does not prescribe medication, provide medical advice, or recommend changing a prescribed name, dosage, or schedule.
