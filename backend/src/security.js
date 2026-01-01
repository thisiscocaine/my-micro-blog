// backend/src/security.js
import cors from 'cors';

const allowed = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];

export const corsMw = () =>
  cors({
    origin: (origin, cb) => {
      if (!origin || allowed.includes(origin)) return cb(null, true);
      return cb(new Error('Not allowed by CORS'));
    },
    // credentials: true, // enable only if you use cookies/sessions
  });
