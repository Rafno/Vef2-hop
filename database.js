const { Client } = require('pg');
const xss = require('xss');

const connectionString = process.env.DATABASE_URL;

async function create(){
    const client = new Client({
        user: 'postgres',
       host: 'localhost',
       database: 'postgres',
       password: 'MK301554',
        });
    await client.connect();
    for(let i = 0; books.length; i++) {
    const data = await client.query(
        `INSERT INTO books(title,author,description,isbn10,isbn13,published,pagecount,language,category)
        Values($1$2$23)`,[
            books[i].title,
            books[i].text,
            ...
            parseInt(books[i].pagecount, 10) ? parseInt(books[i].pagecount, 10) : null,
        ]
        }
    )
}
