const bcrypt = require('bcrypt');
const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL || 'library://:@localhost/postgres';
/**
 * Hjálparfall sem Óli gaf,
 * tekur inn Query og gildi
 * skilar töflu frá client query.
 * @param {String} q
 * @param {Object} values
 */
async function query(q, values = []) {
  const client = new Client({ connectionString });
  await client.connect();
  let result;
  try {
    result = await client.query(q, values);
  } catch (err) {
    throw err;
  } finally {
    await client.end();
  }
  return result;
}

/**
 * Ber saman hvort lykilorð stemmi.
 * @param {hash} hash
 * @param {String} password
 */
async function comparePasswords(hash, password) {
  const result = await bcrypt.compare(hash, password);

  return result;
}
/**
 * Finnur notanda með því að fara í gegnum töfluna.
 * Skilar öllum upplýsingum um notanda.
 * @param {String} username
 */
async function findByUsername(username) {
  const q = 'SELECT id, username, password,name FROM users WHERE username = $1';

  const result = await query(q, [username]);

  if (result.rowCount === 1) {
    return result.rows[0];
  }

  return null;
}
/**
 * Finnur alla notendur, en skilar aðeins notendanafni og nafni.
 * @param {int} limit
 * @param {int} offset
 */
async function findAll(limit, offset) {
  const q = 'SELECT username, name FROM users ORDER BY id limit $1 offset $2';

  const result = await query(q, [limit, offset]);
  if (result.rowCount > 0) {
    return result.rows;
  }
  return null;
}
/**
 * Finnur notanda með því að nota ID, skilar öllum upplýsingum um notanda nema password.
 * @param {int} id
 */
async function findById(id) {
  const q = 'SELECT id, username,name FROM users WHERE id = $1';

  const result = await query(q, [id]);

  if (result.rowCount === 1) {
    return result.rows[0];
  }
  return null;
}
/**
 * Býr til notanda, stingur inn í töflu.
 * Skila upplýsingum um notanda.
 * @param {String} username
 * @param {String} password
 * @param {String} name
 * @param {String} urlpic
 */
async function createUser(username, password, name, urlpic) {
  const hashedPassword = await bcrypt.hash(password, 11);

  const q = 'INSERT INTO users (username, password, name, urlpic) VALUES ($1, $2, $3, $4) RETURNING *';

  const result = await query(q, [username, hashedPassword, name, urlpic]);

  return result.rows[0];
}
/**
 * Skoðar hvort notandi sé til, ef notandi er ekki til þá er skilað null.
 * Ef notandi er til þá er tekið inn gögn og breytt þeim sem voru umbeðin.
 * Hashar nýtt lykilorð eftir þörf.
 * @param {int} id
 * @param {String} username
 * @param {String} password
 * @param {String} name
 */
async function editUser(id, username, password, name) {
  if (!findById(id)) {
    return null;
  }
  const hashedPassword = await bcrypt.hash(password, 11);
  const q = 'UPDATE users SET username = $1, password = $2, name = $3 WHERE id = $4;';
  const result = await query(q, [username, hashedPassword, name, id]);
  return result.rows[0];
}
/**
 * Uppfærir notanda með mynd.
 * @param {int} id
 * @param {String} urlPic
 */
async function editPic(id, urlPic) {
  const q = 'UPDATE users SET urlpic = $1 WHERE id = $2;';
  const result = await query(q, [urlPic, id]);
  return result.rows[0];
}
/**
 * Skoðar hvort notandi sé til, ef notandi er til þá finnur það
 * bækurnar sem sá notandi hefur lesið.
 * skilar töflu af bókum sem eru lesin.
 * @param {int} id
 * @param {int} limit
 * @param {int} offset
 */
async function readBooks(id, limit, offset) {
  if (!findById(id)) {
    return null;
  }
  const q = 'SELECT id, booksread_id, booksread_title, booksread_grade, booksread_judge FROM booksread where booksread_id = $1 ORDER BY booksread_title limit $2 offset $3;';
  const result = await query(q, [id, limit, offset]);

  if (result.rowCount === 0) {
    return null;
  }
  return result.rows;
}
/**
 * Bætir við lesni bók fyrir innskráðum notanda.
 * Gerum ráð fyrir að notandi er til.
 * Gerum ekki ráð fyrir að banna aðila að lesa bók 'aftur'
 * @param {int} bookId
 * @param {String} title
 * @param {String} grade
 * @param {String} judge
 */
async function addReadBook(bookId, title, grade, judge) {
  const q = 'INSERT INTO booksread(booksread_id, booksread_title, booksread_grade, booksread_judge) VALUES($1,$2,$3,$4) RETURNING * ';
  const result = await query(q, [bookId, title, grade, judge]);
  return result.rows[0];
}
/**
 * Eyðir bók/um úr leslista.
 * @param {int} bookId
 */
async function deleteReadBook(bookId) {
  let q = 'SELECT id FROM booksread WHERE id = $1';
  let result = await query(q, [bookId]);
  if (result.rowCount === 0) {
    return null;
  }
  q = 'DELETE from booksread WHERE id = $1';
  result = await query(q, [bookId]);
  return result.rows;
}
/**
 * Finnur hvaða bók sem er miðað við titil.
 * @param {String} title
 */
async function findBookByTitle(title) {
  const q = 'SELECT title from books WHERE title = $1';
  const result = await query(q, [title]);

  if (result.rowCount === 0) {
    return null;
  }
  return true;
}
module.exports = {
  comparePasswords,
  findByUsername,
  findById,
  findAll,
  createUser,
  editUser,
  readBooks,
  addReadBook,
  deleteReadBook,
  findBookByTitle,
  editPic,
};
