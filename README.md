# Mock Admin Panel

React + TypeScript admin frontend for your backend running at `http://localhost:8000`.

## Features

- Login with admin email/password (`POST /auth/login`)
- Manual token input (if you already have a JWT)
- Questions management: create, edit, delete, list
- Sessions management: create, edit, delete, list
- User management: create users/admins, edit role/status, delete

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Backend endpoints expected

The app uses these default endpoints:

- `POST /auth/login`
- `GET/POST /questions`
- `PUT/DELETE /questions/:id`
- `GET/POST /sessions`
- `PUT/DELETE /sessions/:id`
- `GET/POST /users`
- `PUT/DELETE /users/:id`

If your backend paths are different, update the constants in `src/App.tsx` (`ENDPOINTS`).

## Token response format

Login expects token in either:

- `accessToken`
- `token`

## Build

```bash
npm run build
```
