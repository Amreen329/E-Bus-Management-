# Ebus Management – Test Cases

Use these to verify the project manually and to document test coverage.

---

## 1. Admin Module

| ID | Description | Steps | Expected |
|----|-------------|--------|----------|
| A1 | Admin login with invalid credentials | Open admin login, enter wrong email/password, submit | Error message; no redirect |
| A2 | Admin login with valid admin credentials | Login with user that has `roles/{uid}.role = "admin"` | Redirect to admin dashboard |
| A3 | Non-admin cannot access admin dashboard | Login as user or driver, navigate to `admin/dashboard.html` | Redirect to admin login |
| A4 | Create driver account | Admin → Create Driver, enter email + password (min 6), submit | Success message; driver can login at driver login |
| A5 | Create driver – short password | Enter password &lt; 6 characters | Validation/error |
| A6 | Admin logout | Click Logout on dashboard | Redirect to admin login |

---

## 2. Driver Module

| ID | Description | Steps | Expected |
|----|-------------|--------|----------|
| D1 | Driver login with invalid credentials | Driver login with wrong email/password | Error message; no redirect |
| D2 | Driver login with account created by admin | Login with driver email/password | Redirect to driver dashboard |
| D3 | Non-driver cannot access driver dashboard | Login as user/admin, go to `driver/dashboard.html` | Redirect to driver login |
| D4 | Save driver profile (contact) | Driver → My Profile, fill name/phone/details, Save | Success; data persists after refresh |
| D5 | Add bus | My Buses → fill bus number, type, capacity, details → Add Bus | Bus appears in “Your Buses” list |
| D6 | Add bus – required fields | Submit without bus number or type | Validation/error |
| D7 | Add route | Routes & Location → select bus, source, destination, optional current location/ETA/linger → submit | Route appears in “Your Routes” |
| D8 | Update route (same bus, source, destination) | Add route once; submit again with same bus/source/destination but new location/ETA | Route updated; success message |
| D9 | Driver logout | Click Logout | Redirect to driver login |

---

## 3. User Module

| ID | Description | Steps | Expected |
|----|-------------|--------|----------|
| U1 | User register | Register with first name, last name, email, password (min 6) | Account created; redirect to user dashboard or login |
| U2 | User register – short password | Password &lt; 6 characters | Validation/error |
| U3 | User register – duplicate email | Register again with same email | Firebase error (email already in use) |
| U4 | User login with valid credentials | Login with registered email/password | Redirect to user dashboard (Search Bus) |
| U5 | Non-user cannot access user dashboard | Login as admin/driver, go to `user/dashboard.html` | Redirect to user login |
| U6 | Search bus – no criteria | Submit search with empty source and destination | Error or “enter at least source or destination” |
| U7 | Search bus – by source only | Enter source only, search | List of routes with that source (if any) |
| U8 | Search bus – by destination only | Enter destination only, search | List of routes with that destination (if any) |
| U9 | Search bus – source and destination | Enter source and destination matching a driver route | Table with bus, current location, ETA, linger time |
| U10 | User logout | Click Logout on user dashboard | Redirect to user login |

---

## 4. Cross-Module & Security

| ID | Description | Steps | Expected |
|----|-------------|--------|----------|
| C1 | Unauthenticated access to dashboard | Open `admin/dashboard.html` or `driver/dashboard.html` or `user/dashboard.html` without login | Redirect to respective login |
| C2 | Firestore rules – user cannot write roles for others | From client (as user), try writing `roles/{otherUid}` | Denied by rules |
| C3 | Firestore rules – driver can only update own buses/routes | Driver A cannot update driver B’s bus or route | Denied by rules |

---

## 5. Logging

| ID | Description | Steps | Expected |
|----|-------------|--------|----------|
| L1 | Login attempts logged | Perform admin/driver/user login (success or fail) | Console shows log entries with module and message |
| L2 | Create driver and search logged | Admin creates driver; user searches bus | Console shows corresponding info logs |

---

## How to Run Tests

1. **Manual:** Follow steps in each row; verify expected result.
2. **Environment:** Use a test Firebase project; optionally use a separate browser/incognito for different roles.
3. **First run:** Create one admin in Firestore (`roles/<uid>` with `role: "admin"`), then run A2, A4, D2, D5, D7, U1, U4, U9.

---

## Summary

- **Admin:** 6 cases (login, access, create driver, logout).
- **Driver:** 9 cases (login, access, profile, bus CRUD, route add/update, logout).
- **User:** 10 cases (register, login, access, search variants, logout).
- **Security/Cross:** 3 cases (unauth access, roles, driver isolation).
- **Logging:** 2 cases (login and key actions).

Total: **30** test cases.
