/* todo sækja pakka sem vantar  */
const { Client } = require('pg');
const xss = require('xss');

// const connectionString = process.env.DATABASE_URL;
async function query(q, values = []) {
    // const client = new Client({ connectionString });
    const client = new Client({
      user: 'postgres',
      host: 'localhost',
      database: 'library',
      password: 'MK301554',
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
  // -------------- Föll fyrir Categories ------------------ //
async function getCategories() {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'library',
        password: 'MK301554',
      });
    await client.connect();
    const gogn = await client.query('SELECT id,categories_name FROM categories;');
    await client.end;
    return gogn.rows;
}

async function postCategories({categories_name} = {}) {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'library',
        password: 'MK301554',
      });
    await client.connect();
    let gogn = await client.query('SELECT categories_name FROM categories where categories_name = $1',[
        xss(categories_name)
    ]);
    if (gogn.rowCount === 1){
        return null;
    }
    gogn = await client.query('INSERT INTO categories (categories_name) VALUES($1);',[
        xss(categories_name)
    ])
    await client.end();
    return gogn.rows;
}
async function getBooks(LIMIT, OFFSET) {
    const q = 'SELECT id, title, author, description, isbn10, isbn13, published, pagecount, language, category FROM books ORDER BY title LIMIT $1 OFFSET $2 ';
    const gogn = await query(q,[LIMIT, OFFSET]);
    return gogn.rows;
}
async function postBooks(res,{title, author, description, isbn10, isbn13, published, pagecount, language, category}={}){
    let checkarray = [];
    let q = 'SELECT title FROM books WHERE title = $1';
    let results = await query(q,[title]);
    if (results.rowCount === 1){
        const svar1 = {
            field: 'Title',
            Error: ' This title already exists in books. ',
        }
        checkarray.push(svar1);
    }
    q = 'SELECT isbn13 FROM books WHERE isbn13 = $1';
    results = await query(q,[isbn13]);
    if (results.rowCount === 1){
        const svar2 = {
            field: 'isbn13',
            Error: ' This isbn13 already exists in books. ',
        }
        checkarray.push(svar2);
    }
    if(checkarray.length === 0){
        q = 'INSERT INTO books (title, author, description, isbn10, isbn13, published, pagecount, language, category) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)';
        results = await query(q,[title, author, description, isbn10, isbn13, published, pagecount, language, category]);
        return results.rows;
    } else {
        res.status(400).json(checkarray);
    }
}
async function patchBooksById(res, {id,title, author, description, isbn10, isbn13, published, pagecount, language, category}={}){
    let checkarray = [];
    let q = 'SELECT title, author, description, isbn10, isbn13, published, pagecount, language, category FROM books WHERE id = $1';
    let results = await query(q,[id]);
    if(results.rowCount === 0){
        const svar3 = {
            field: 'ID',
            Error: ' There is no book with that ID ',
        }
        checkarray.push(svar3);
    }
    q = 'SELECT title FROM books WHERE title = $1';
    results = await query(q,[title]);
    if (results.rowCount === 1){
        const svar1 = {
            field: 'Title',
            Error: 'Title already exists in books. ',
        }
        checkarray.push(svar1);
    }
    q = 'SELECT isbn13 FROM books WHERE isbn13 = $1';
    results = await query(q,[isbn13]);
    if (results.rowCount === 1){
        const svar2 = {
            field: 'isbn13',
            Error: 'isbn13 already exists in books. ',
        }
        checkarray.push(svar2);
    }
    if(checkarray.length === 0){
        q = 'UPDATE books SET title = $1, author = $2, description = $3, isbn10 = $4, isbn13 = $5, published = $6, pagecount = $7, language = $8, category = $9 WHERE id = $10;';
        results = await query(q,[title, author, description, isbn10, isbn13, published, pagecount, language, category,id]);
    } else {
        res.status(400).json(checkarray);
    }
}
async function getBooksById(id, res){

    let q = 'SELECT title, author, description, isbn10, isbn13, published, pagecount, language, category FROM books Where id = $1';
    let svar = await query(q,[id]);

    if(svar.rowCount > 0){
        return svar.rows;
    }

    const villa = {
        field: 'ID',
        Error: ' There is no book with this ID ',
    }
        res.status(400).json({villa})
}
async function searchBooks(search = '',LIMIT,OFFSET) {
    try {
      let q = `
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
  }

module.exports = {
    getCategories,
    postCategories,
    getBooks,
    postBooks,
    getBooksById,
    patchBooksById,
    searchBooks,
}
