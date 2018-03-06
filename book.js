/* todo sækja pakka sem vantar  */
const { Client } = require('pg');
const xss = require('xss');

// const connectionString = process.env.DATABASE_URL;
async function getCategories() {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'library',
        password: 'Pluto050196',
      });
      await client.connect();
  const gogn = await client.query(
      'SELECT id,categories_name FROM categories;');
  await client.end;
  return gogn.rows;
}
async function postCategories(num){
    console.log(num);
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'library',
        password: 'Pluto050196',
    });
    await client.connect();
    const gogn = await client.query(
        'INSERT INT categories (categories_name) VALUES ($1);',[
            xss(categories_name),
        ],
    );
    await client.end();
    return gogn.rows;
}
module.exports = {
    getCategories,
    postCategories,
}
