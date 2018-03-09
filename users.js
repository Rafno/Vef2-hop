const bcrypt = require('bcrypt');
const { Client } = require('pg');
const fs = require('fs');
const util = require('util');

const connectionString = process.env.DATABASE_URL || 'library://:@localhost/postgres';
/**
 * USERS tekið frá Óla dæmi
 * TODO:
 * Bæta við XSS?, skoða hvaða föll eru óþarfi, hvaða þarf að bæta við.
 * öll föll sem eiga að vera notuð í öðrum hluta þarf að vera bætt við í
 * module.exports, sem leyfir okkur að nota föll annarstaðar.
 */
async function query(q, values = []) {
  // const client = new Client({ connectionString });
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'library',
    password: 'Pluto050196',
  });
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

async function comparePasswords(hash, password) {
  const result = await bcrypt.compare(hash, password);

  return result;
}

async function findByUsername(username) {
  const q = 'SELECT * FROM users WHERE username = $1';

  const result = await query(q, [username]);

  if (result.rowCount === 1) {
    return result.rows[0];
  }

  return null;
}
async function findAll(limit, offset) {
  const q = 'SELECT username, name FROM users ORDER BY name limit $1 offset $2';

  const result = await query(q, [limit, offset]);
  if (result.rowCount > 0) {
    return result.rows;
  }
  return null;
}
async function findById(id) {
  const q = 'SELECT id, username,name FROM users WHERE id = $1';

  const result = await query(q, [id]);

  if (result.rowCount === 1) {
    return result.rows[0];
  }
  return null;
}

async function createUser(username, password, name) {
  const hashedPassword = await bcrypt.hash(password, 11);

  const q = 'INSERT INTO users (username, password, name) VALUES ($1, $2, $3) RETURNING *';

  const result = await query(q, [username, hashedPassword, name]);

  return result.rows[0];
}
async function editUser(id, username, password, name) {
  if (!findById(id)) {
    return null;
  }
  const hashedPassword = await bcrypt.hash(password, 11);
  const q = 'UPDATE users SET username = $1, password = $2, name = $3 WHERE id = $4;';
  const result = await query(q, [username, hashedPassword, name, id]);
  return result.rows[0];
}

async function readBooks(id, limit, offset) {
  if (!findById(id)) {
    return null;
  }
  const q = 'SELECT booksread_id, booksread_title, booksread_grade, booksread_judge FROM booksread where booksread_id = $1 ORDER BY booksread_title limit $2 offset $3;';
  const result = await query(q, [id, limit, offset]);

  if (result.rowCount === 0) {
    return null;
  }
  return result.rows;
}

async function addReadBook(book_id, title, grade, judge) {
  const q = 'INSERT INTO booksread(booksread_id, booksread_title, booksread_grade, booksread_judge) VALUES($1,$2,$3,$4) RETURNING * ';
  const result = await query(q, [book_id, title, grade, judge]);
  return result.rows[0];
}
async function deleteReadBook(book_id) {
  let q = 'SELECT id FROM booksread WHERE id = $1';
  let result = await query(q, [book_id]);
  if (result.rowCount === 0) {
    return null;
  }
  q = 'DELETE from booksread WHERE id = $1';
  result = await query(q, [book_id]);
  return result.rows;
}
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
}
