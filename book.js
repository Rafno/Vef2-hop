/* todo sækja pakka sem vantar  */
const { Client } = require('pg');
const xss = require('xss');

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
// -------------- Föll fyrir Categories ------------------ //
/**
 * Grípur lista af categories en kemur í veg fyrir að
 * taflan sé á röngu sniði, limit tekur inn int sem
 * stjórnar stökum sem komast fyrir í listanum.
 * Offset tekur in int sem stýrir hvar listinn byrjar.
 * @param {int} LIMIT
 * @param {int} OFFSET
 */
async function getCategories(LIMIT, OFFSET) {
  const q = 'SELECT id,categoriesName FROM categories ORDER BY id LIMIT $1 OFFSET $2 ';
  const gogn = await query(q, [LIMIT, OFFSET]);
  return gogn.rows;
}
/**
 * Bætir við nýjum category, sem fremur að það category hefur ekki nú þegar komið fyrir
 * Ath. skoðar ekki hástafi/lástafi. Science-fiction, science-Fiction og aðrar útgáfur af
 * þessu nafni geta verið til í sömu töflu.
 * Hér má einnig sjá eina skiptið sem við notum xss
 * @param {String} categoriesName
 */
async function postCategories({ categoriesName } = {}) {
  const client = new Client({ connectionString });
  await client.connect();
  let gogn = await client.query('SELECT categoriesName FROM categories where categoriesName = $1', [
    xss(categoriesName),
  ]);
  if (gogn.rowCount === 1) {
    return null;
  }
  gogn = await client.query('INSERT INTO categories (categoriesName) VALUES($1);', [
    xss(categoriesName),
  ]);
  await client.end();
  return gogn.rows;
}
/**
 * Grípur lista af bókum en kemur í veg fyrir að
 * taflan sé á röngu sniði, limit tekur inn int sem
 * stjórnar stökum sem komast fyrir í listanum.
 * Offset tekur in int sem stýrir hvar listinn byrjar.
 * @param {int} LIMIT
 * @param {int} OFFSET
 */
async function getBooks(LIMIT, OFFSET) {
  const q = 'SELECT id, title, author, description, isbn10, isbn13, published, pagecount, language, category FROM books ORDER BY title LIMIT $1 OFFSET $2 ';
  const gogn = await query(q, [LIMIT, OFFSET]);
  return gogn.rows;
}
/**
 * Býr til nýja bók ef bóking er á réttu sniði.
 * Skilar villu ef bókin er nú þegar til.
 * @param {any} res
 * @param {jsonObject} book_information
 */
async function postBooks(res, {
  title,
  author,
  description,
  isbn10,
  isbn13,
  published,
  pagecount,
  language,
  category,
} = {}) {
  const checkarray = [];
  let q = 'SELECT title FROM books WHERE title = $1';
  let results = await query(q, [title]);
  if (results.rowCount === 1) {
    const svar1 = {
      field: 'Title',
      Error: ' This title already exists in books. ',
    };
    checkarray.push(svar1);
  }
  q = 'SELECT isbn13 FROM books WHERE isbn13 = $1';
  results = await query(q, [isbn13]);
  if (results.rowCount === 1) {
    const svar2 = {
      field: 'isbn13',
      Error: ' This isbn13 already exists in books. ',
    };
    checkarray.push(svar2);
  }
  if (checkarray.length === 0) {
    q = 'INSERT INTO books (title, author, description, isbn10, isbn13, published, pagecount, language, category) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)';
    results = await query(q, [
      title,
      author,
      description,
      isbn10,
      isbn13,
      published,
      pagecount,
      language,
      category,
    ]);
    return results.rows;
  }
  return res.status(400).json(checkarray);
}
/**
 * Breytir upplýsingum um bók ef bók er á réttu sniði og ef bók er til í listanum.
 * @param {any} res
 * @param {JsonObject} book_information
 */
async function patchBooksById(res, {
  id,
  title,
  author,
  description,
  isbn10,
  isbn13,
  published,
  pagecount,
  language,
  category,
} = {}) {
  const checkarray = [];
  let q = 'SELECT title, author, description, isbn10, isbn13, published, pagecount, language, category FROM books WHERE id = $1';
  let results = await query(q, [id]);
  if (results.rowCount === 0) {
    const svar3 = {
      field: 'ID',
      Error: ' There is no book with that ID ',
    };
    checkarray.push(svar3);
  }
  q = 'SELECT title FROM books WHERE title = $1';
  results = await query(q, [title]);
  if (results.rowCount === 1) {
    const svar1 = {
      field: 'Title',
      Error: 'Title already exists in books. ',
    };
    checkarray.push(svar1);
  }
  q = 'SELECT isbn13 FROM books WHERE isbn13 = $1';
  results = await query(q, [isbn13]);
  if (results.rowCount === 1) {
    const svar2 = {
      field: 'isbn13',
      Error: 'isbn13 already exists in books. ',
    };
    checkarray.push(svar2);
  }
  if (checkarray.length === 0) {
    q = 'UPDATE books SET title = $1, author = $2, description = $3, isbn10 = $4, isbn13 = $5, published = $6, pagecount = $7, language = $8, category = $9 WHERE id = $10;';
    results = await query(q, [
      title,
      author,
      description,
      isbn10,
      isbn13,
      published,
      pagecount,
      language,
      category,
      id,
    ]);
  } else {
    res.status(400).json(checkarray);
  }
}
/**
 * Skilar stakri bók sem passar við ID gefið.
 * @param {int} id
 * @param {any} res
 */
async function getBooksById(id, res) {
  const q = 'SELECT title, author, description, isbn10, isbn13, published, pagecount, language, category FROM books Where id = $1';
  const svar = await query(q, [id]);

  if (svar.rowCount > 0) {
    return svar.rows;
  }

  const villa = {
    field: 'ID',
    Error: ' There is no book with this ID ',
  };
  res.status(400).json({ villa });
  return null;
}
/**
 * Leitar að bók miðað við upplýsingar gefnar,
 * skilar á sniði gefið með limit/offset
 * (Sjá postCategories fyrir útskýringu á limit/offset)
 * @param {String} search
 * @param {int} LIMIT
 * @param {int} OFFSET
 */
async function searchBooks(search = '', LIMIT, OFFSET) {
  try {
    const q = `
        SELECT id, title, author, description, isbn10, isbn13, published, pagecount, language, category FROM books
        WHERE
          to_tsvector('english', title) @@ to_tsquery('english', $1)
          OR
          to_tsvector('english', description) @@ to_tsquery('english', $1) ORDER BY title LIMIT $2 OFFSET $3
        `;
    const res = await query(q, [search, LIMIT, OFFSET]);
    return res.rows;
  } catch (e) {
    console.error('Error selecting', e);
  }
  return null;
}

module.exports = {
  getCategories,
  postCategories,
  getBooks,
  postBooks,
  getBooksById,
  patchBooksById,
  searchBooks,
};
