require('dotenv').config();

const express = require('express');
const api = require('./api');

const app = express();
app.use('/', api);

/**
 * APP tekið frá Óla dæmi.
 * Býr til token sem leyfir aðila að vera innskráður í spes mikinn tíma (óviss hversu langur)
 * inniheldur router sem leyfir aðila að skrá sig inn sem admin/user.
 * Innskráð á admin með útskýringu frá Óla:
 * {"username": "admin", "password": "123"} í postman.
 * Til að auðkenna þarf að senda POST á http://localhost:3000 með JSON sem inniheldur username og password fyrir notanda.
 * Ef notandi og lykilorð eru rétt er jwt token skilað, annars koma villuskilaboð.
*/
const {
  PORT: port = 3000,
} = process.env;
/* Þessir Handlerar eru teknir beint frá óla og þeir virka aðeins
 *með því að hafa next en eslint kvartar yfir því.Svo við ákváðum að disable þá.
 */
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
