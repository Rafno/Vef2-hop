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
    console.log("hey");
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

module.exports = {
    getCategories,
    postCategories,
    getBooks,
}
