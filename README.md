## Ebus Management Based Current Location System

**Domain:** Transport  
**Technologies:** HTML, CSS, JavaScript, Firebase (Auth + Firestore)  

E‑Bus Management is a browser‑based system that shows bus arrival information based on current location.  
It supports three roles: **Admin/Staff**, **Driver**, and **Passenger (User)**.

---

## Features

- **Admin / Staff**
  - Register new staff accounts (self‑service) via `admin/register.html`.
  - Login to the staff dashboard.
  - Create driver accounts (email + password) for drivers.
- **Driver**
  - Login using the driver account given by staff.
  - Maintain driver profile and contact details.
  - Add **buses** (bus number, type, details, capacity).
  - Add **routes & locations** (source, destination, current location, ETA, linger time).
- **Passenger / User**
  - Register with name, email and password.
  - Login to see bus information.
  - Search buses by **source** and **destination**, and view location + ETA.

The UI is responsive (mobile‑first) and uses shared styles and widgets across all pages.

##  Prerequisites

- **Node.js** (for running a simple local HTTP server).  
- A **Firebase project** with:
  - **Authentication → Email/Password** sign‑in method enabled.
  - **Firestore** database created (in test or production mode).

---

##  Firebase Configuration

1. Go to **Firebase Console → Project settings → General → Your apps → Web app**.
2. Copy the web app configuration.
3. Open `config/firebase-config.js` and replace the placeholder config with your own:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

if (typeof window !== 'undefined') {
  window.EbusFirebaseConfig = firebaseConfig;
}
```

4. In **Authentication → Settings → Authorized domains**, add:
   - `localhost`
   - Your hosting domain (e.g. `your-project.web.app`, `your-project.firebaseapp.com`, or Netlify/GitHub domain).
5. In **Firestore → Rules**, paste the contents of `firestore.rules` from this project and click **Publish**.

Firestore collections used:

| Collection       | Purpose                                                                 |
|------------------|-------------------------------------------------------------------------|
| `roles`          | Maps `uid` → `role` (`admin` \| `driver` \| `user`).                    |
| `drivers`        | Driver profile and contact details.                                    |
| `buses`          | Bus info (number, type, details, driverUid, capacity, etc.).          |
| `routes`         | Route info (busId, source, destination, currentLocation, ETA, linger).|
| `userProfiles`   | Passenger profile (firstName, lastName, email).                        |


## Typical Workflow (Demo Steps)

1. **Landing page**  
   Open `index.html` (via `http://localhost:8080/`). Choose **Staff**, **Driver**, or **Passenger**.

2. **Staff / Admin registration and login**
   - New staff opens `admin/register.html`, fills name, email, password, and submits.
   - The app:
     - Creates a Firebase Auth user.
     - Stores `role: "admin"` in `roles/<uid>`.
     - Optionally stores profile in `userProfiles/<uid>`.
   - After success, staff is redirected to the **Admin Dashboard**.
   - Existing staff can login from `admin/login.html`.

3. **Add driver accounts (by staff)**
   - From `admin/dashboard.html`, go to **Add Driver**.
   - Fill driver email and a password, submit.
   - The app creates a Firebase Auth user and sets `role: "driver"` for that uid.

4. **Driver flow**
   - Driver logs in via `driver/login.html` with the email/password provided by staff.
   - On the driver dashboard:
     - Fill **Profile** (contact info).
     - Add **Buses** (bus number, type, details).
     - Add **Routes** (source, destination, current location, ETA, linger time).

5. **Passenger flow**
   - New passenger registers at `user/register.html` (first name, last name, email, password).
   - On login (`user/login.html`), they are taken to the passenger dashboard.
   - Enter **source** and **destination** to see matching buses, current location, ETA and linger time.

---

## Code Quality & Design

- **Modular JavaScript**
  - Separate JS file per page (`admin-login.js`, `user-register.js`, etc.).
  - Shared modules: `auth.js`, `firestore.js`, `logger.js`, `utils.js`, `firebase-init.js`.
- **Responsive UI**
  - Single `styles.css` with CSS variables, responsive containers, touch‑friendly buttons, and mobile layout.
- **Error handling & feedback**
  - `utils.js` maps Firebase error codes to simple messages (e.g., “Wrong email or password. Try again.”).
  - Consistent alert component (`.ebus-alert`) for success and error messages.
- **Security**
  - Role checks in both the front‑end modules and Firestore security rules.
  - No use of `eval` or dynamic script injection; inputs are trimmed; helper for escaping HTML.
- **Logging**
  - `logger.js` exposes `EbusLogger` which prefixes logs with timestamp, level and module; used throughout the app.
