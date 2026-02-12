# Ebus Management Based Current Location System

**Domain:** Transport  
**Technologies:** HTML, CSS, JavaScript, Firebase  
**Difficulty:** Easy

Advanced traveler information system for trip time and bus arrival prediction based on current location. Improves ridership, reduces wait times and passenger anxiety, and supports local public transport.

---

## Project Overview

- **Admin:** Login and create driver/travel accounts.
- **Driver/Travel:** Login, post bus information (type, details), contact details, and routes with current location and arrival/linger times.
- **User:** Register, login, and search bus location by source and destination (view only).

---

## Repository & Setup

1. **Clone and open**
   ```bash
   git clone <your-repo-url>
   cd ebus
   ```

2. **Firebase**
   - Create a project at [Firebase Console](https://console.firebase.google.com).
   - Enable **Authentication** → Email/Password.
   - Create a **Firestore** database.
   - Copy your config into `config/firebase-config.js` (replace `YOUR_API_KEY`, `YOUR_PROJECT_ID`, etc.).
   - In **Firestore** → Rules, paste contents of `firestore.rules` and publish.
   - **First admin:** Create a user in Authentication (e.g. your email/password), then in Firestore add a document `roles/<that-user-uid>` with field `role: "admin"`.

3. **Run locally**
   - Serve the project over HTTP (Firebase Auth requires a proper origin). Examples:
     - `npx serve .` (port 3000)
     - VS Code “Live Server” from project root
   - Open `http://localhost:3000` (or the port shown).

---

## Workflow & Execution

| Step | Action |
|------|--------|
| 1 | Open `index.html` (or `/`) → choose Admin / Driver / User. |
| 2 | **Admin:** Login → Dashboard → “Create Driver” to add driver accounts (email + password). After creation, admin is signed out; log in again. |
| 3 | **Driver:** Login → Profile (contact) → My Buses (add bus, type, details) → Routes & Location (source, destination, current location, ETA, linger time). |
| 4 | **User:** Register (first name, last name, email, password) or Login → Search Bus Location (source/destination) → view results (bus, location, ETA, linger). |

---

## Folder Structure

```
ebus/
├── index.html              # Landing
├── config/
│   └── firebase-config.js  # Firebase config (replace with yours)
├── css/
│   └── styles.css          # Global styles (responsive, touch-friendly)
├── js/
│   ├── logger.js            # Centralized logging
│   ├── utils.js             # XSS escaping, user-friendly error mapping
│   ├── firebase-init.js     # Firebase init
│   ├── auth.js              # Auth & roles
│   └── firestore.js         # Firestore helpers (partial search)
├── admin/
│   ├── login.html, admin-login.js
│   ├── dashboard.html, admin-dashboard.js
│   └── create-driver.html, create-driver.js
├── driver/
│   ├── login.html, driver-login.js
│   ├── dashboard.html, driver-dashboard.js
│   ├── profile.html, driver-profile.js
│   ├── buses.html, driver-buses.js
│   └── routes.html, driver-routes.js
├── user/
│   ├── register.html, user-register.js
│   ├── login.html, user-login.js
│   └── dashboard.html, user-dashboard.js
├── firestore.rules          # Firestore security rules
└── README.md
```

---

## Coding Standards & Quality

- **Modular:** Separate JS per page; shared `auth`, `firestore`, `logger`.
- **Safe:** No eval; inputs trimmed; role checks before sensitive actions.
- **Testable:** Pure helpers in `auth.js` and `firestore.js`; logger interface stable.
- **Portable:** No OS-specific code; runs in any modern browser with Firebase.
- **Logging:** All important actions go through `EbusLogger` (see `js/logger.js`).

---

## Database (Firestore)

| Collection     | Purpose |
|----------------|--------|
| `roles`       | `role`: admin \| driver \| user; set by admin or self (user register). |
| `drivers`     | Driver profile: displayName, phone, contactDetails. |
| `buses`       | busNumber, busType, capacity, busDetails, driverUid. |
| `routes`      | busId, source, destination, currentLocation, estimatedArrivalMinutes, lingerTimeMinutes. |
| `userProfiles`| firstName, lastName, email (for users). |

---

## Deployment

- **Option:** Host as a static site (e.g. Firebase Hosting, Netlify, GitHub Pages). Add your domain/origin in Firebase Auth “Authorized domains”.
- **Justification:** Client-only app; Firebase handles auth and data. No backend server required; same code runs locally or in the cloud.

---

## Optimization

- **Code:** Single Firestore read for routes, then in-memory filter by source/destination to avoid composite indexes; shared CSS/JS; minimal DOM updates.
- **Architecture:** Role-based access; Firestore rules restrict reads/writes by role; logging for audit and debugging.

---

## Test Cases

See [TESTCASES.md](TESTCASES.md) for a list of test cases (login, register, create driver, add bus/route, search bus, permissions).

---

## License

Use for educational/project submission as required.
