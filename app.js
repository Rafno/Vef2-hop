require('dotenv').config();

const express = require('express');
const passport = require('passport');
const { Strategy, ExtractJwt } = require('passport-jwt');
const jwt = require('jsonwebtoken');
const users = require('./users');
const app = express();
const api = require('./api');
app.use('/', api);
const books = ('./data/');
/**
 * APP tekið frá Óla dæmi.
 * Býr til token sem leyfir aðila að vera innskráður í spes mikinn tíma (óviss hversu langur)
 * inniheldur router sem leyfir aðila að skrá sig inn sem admin/user.
 * Innskráð á admin með útskýringu frá Óla:
 * {"username": "admin", "password": "123"} í postman.
 * {"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTE5MjU2NDkzLCJleHAiOjE1MTkyNTY1MTN9.5mArJhUdr6fAPQQT1i0f6CgIY_-iO_Oa5odgRkEOJRY"}
 * Til að auðkenna þarf að senda POST á http://localhost:3000 með JSON sem inniheldur username og password fyrir notanda.
 * Ef notandi og lykilorð eru rétt er jwt token skilað, annars koma villuskilaboð.
*/
const {
  PORT: port = 3000,
  JWT_SECRET: jwtSecret,
  TOKEN_LIFETIME: tokenLifetime = 2000,
} = process.env;

if (!jwtSecret) {
  console.error('JWT_SECRET not registered in .env');
  process.exit(1);
}

app.use(express.json());

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret,
}

async function strat(data, next) {
  const user = await users.findById(data.id);

  if (user) {
    next(null, user);
  } else {
    next(null, false);
  }
}

passport.use(new Strategy(jwtOptions, strat));

app.use(passport.initialize());

app.get('/', (req, res) => {
  res.json({
    login: '/login',
    admin: '/admin',
  });
});

function notFoundHandler(req, res, next) { // eslint-disable-line
  res.status(404).json({ error: 'Not found' });
}

function errorHandler(err, req, res, next) { // eslint-disable-line
  console.error(err);

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid json' });
  }

  return res.status(500).json({ error: 'Internal server error' });
}

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
