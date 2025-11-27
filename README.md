# CodiFi - React Frontend

This is the React frontend for the CodiFi E-Learning Platform. It uses TailwindCSS and Axios.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Run dev server:

```bash
npm run dev
```

3. Set API URL if your backend is not on localhost:8000

Create a `.env` file with:

```
VITE_API_URL=http://localhost:8000/api
```

The frontend assumes certain endpoints exist; adjust `src/api/api.js` if needed.
