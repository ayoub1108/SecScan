
// EXAMPLE: DO NOT USE IN PRODUCTION
// This is a demonstration file showing what NOT to do

import express from 'express';
import session from 'express-session';

const app = express();

// Medium: Insecure Session Configuration
app.use(session({
  secret: 'keyboard cat',  // Hardcoded session secret
  resave: true,
  saveUninitialized: true,
  cookie: { 
    secure: false,  // Not using HTTPS
    httpOnly: false,  // Accessible by JavaScript
    maxAge: 86400000 * 30  // 30 days - too long
  }
}));

// Low: Insecure Cookie
function setUserCookie(res: express.Response, userId: string) {
  // Insecure cookie settings
  res.cookie('user_id', userId, {
    secure: false,  // Not using HTTPS
    httpOnly: false,  // Accessible by JavaScript
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)  // 30 days
  });
}

export { app, setUserCookie };
