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
  // -------------- Föll fyrir Categories ------------------ //
async function getCategories() {
    const q = 'SELECT id,categories_name FROM categories;';
    const gogn = await query(q,[]);
    return gogn.rows;
}

async function postCategories({categories_name} = {}) {
    let q = 'SELECT categories_name FROM categories where categories_name = $1';
    let gogn = await query(q,[categories_name]);
    if (gogn.rowCount === 1){
        return null;
    }
    q = 'INSERT INTO categories (categories_name) VALUES($1);'
    gogn = await query(q,[categories_name]);
    return gogn.rows;
}
// -------------- Föll byrir Books -----------------------//
async function getBooks() {
    const q = 'SELECT title, author, description, isbn10, isbn13, published, pagecount, language, category FROM books;';
    const gogn = await query(q,[]);
    return gogn.rows;
}
async function postBooks(res,{title, author, description, isbn10, isbn13, published, pagecount, language, category}={}){
    let checkarray = [];
    let q = 'SELECT title FROM books WHERE title = $1';
    let results = await query(q,[title]);
    if (results.rowCount === 1){
        const svar1 = {
            field: 'Title',
            Error: ' This titls is not possibly because this title already exists in books. ',
        }
        checkarray.push(svar1);
    }
    q = 'SELECT isbn13 FROM books WHERE isbn13 = $1';
    results = await query(q,[isbn13]);
    if (results.rowCount === 1){
        const svar2 = {
            field: 'isbn13',
            Error: ' This isbn13 is not possibly because this isbn13 already exists in books. ',
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
async function patcBooksById(res, {id,title, author, description, isbn10, isbn13, published, pagecount, language, category}={}){
    let checkarray = [];
    let q = 'SELECT title, author, description, isbn10, isbn13, published, pagecount, language, category FROM books WHERE id = $1';
    let results = await query(q,[id]);
    if(results.rowCount === 0){
        const svar3 = {
            field: 'ID',
            Error: ' There is no book wit that ID ',
        }
        checkarray.push(svar3);
    }
    q = 'SELECT title FROM books WHERE title = $1';
    results = await query(q,[title]);
    if (results.rowCount === 1){
        const svar1 = {
            field: 'Title',
            Error: ' This title is not possibly because this title already exists in books. ',
        }
        checkarray.push(svar1);
    }
    q = 'SELECT isbn13 FROM books WHERE isbn13 = $1';
    results = await query(q,[isbn13]);
    if (results.rowCount === 1){
        const svar2 = {
            field: 'isbn13',
            Error: ' This isbn13 is not possibly because this isbn13 already exists in books. ',
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
    console.log("ferðu inn")
    let q = 'SELECT title, author, description, isbn10, isbn13, published, pagecount, language, category FROM books Where id = $1';
    let svar = await query(q,[id]);
    console.log(svar.rowCount);
    if(svar.rowCount > 0){
        console.log("kemstu inn")
        return svar.rows;
    }
    console.log("kemstu hingað");
    const villa = {
        field: 'ID',
        Error: ' There is no book here with this ID ',
    }
        res.status(400).json({villa})
}

module.exports = {
    getCategories,
    postCategories,
    getBooks,
    postBooks,
    getBooksById,
    patcBooksById,
}
