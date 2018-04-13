/* HVERNIG SKAL NOTA BOOKS
* kasta tomum streng i null
* SELECT CASE WHEN pagecount='' THEN NULL ELSE pagecount::integer END FROM books;
* copy-a tofluna i gagnagrunninn
* copy books (title, author, description, isbn10, isbn13, published, pagecount, language, category) FROM 'C:\\Users\\Sixsmith\\Desktop\\Vef2-hop\\data\\books.csv' DELIMITER ',' CSV HEADER ENCODING 'UTF8' ESCAPE '''';
* GOD HELP YOU IF YOU LOSE THESE COMMANDS.
*/
/* ++++++++++ Fyrsta taflan users lysing ++++++++++
 * Notendur
 * Auï¿½kenni, primary key
 * Notendanafn, einstakt gildi, a.m.k. 3 stafir, krafist
 * Lykilord hash, lykilord verdur ad vera a.m.k. 6 stafir, krafist
 * Nafn, ekki timi strengurinn, krafist
 * mynd, ekki krafist
*/
create table users(
 id serial primary key,
 username TEXT CHECK (LENGTH(username) > 2) NOT NULL,
 password TEXT CHECK (LENGTH(password) > 5) NOT NULL,
 name varchar (99) NOT NULL,
 urlpic varchar(255),
 UNIQUE( username),
 UNIQUE( password)
);


/* ++++++++++ 2 taflan lysing ++++++++++
 * Flokkar
 * Audkenni, primary key
 * Heiti, einstakt gildi, ekki timi strengurinn, krafist
*/
create table categories(
id serial primary key,
categoriesname varchar(99) NOT NULL CHECK (categoriesname <> ''),
UNIQUE(categoriesname)
);
/*
 * Insert skipanir fyrir töfluna categories
*/
insert into categories(categoriesname) Values('Fiction');
insert into categories(categoriesname) Values('Nonfiction');
insert into categories(categoriesname) Values('Science Fiction');
insert into categories(categoriesname) Values('Fantasy');
insert into categories(categoriesname) Values('Comic');
insert into categories(categoriesname) Values('Psychology');
insert into categories(categoriesname) Values('Design');
insert into categories(categoriesname) Values('Horror');
insert into categories(categoriesname) Values('Economics');
insert into categories(categoriesname) Values('Graphic Novel');
insert into categories(categoriesname) Values('Business');
insert into categories(categoriesname) Values('Computer Science');


/* ++++++++++ 3 tafla lysing ++++++++++
 * Baekur
 * Audkenni, primary key
 * Titill, einstakt gildi, ekki timi strengurinn, krafist
 * ISBN13, einstakt gildi, nakvaemlega 13 stafa strengur, krafist
 * Hofundur, ekki krafist
 * Lysing, lengri texti, ekki krafist
 * Flokkur, foreign key i flokka toflu, krafist
 * ISBN10, strengur, ekki krafist,
 * utgafudagsetning, ekki krafist, strengur
*/

create table books(
id serial primary key,
title varchar(999) NOT NULL CHECK (title <> ''),
author varchar(99),
description TEXT,
isbn10 varchar(99),
isbn13 char(13) NOT NULL,
published varchar(99),
pagecount varchar(99),
language char(2),
category varchar(99) NOT NULL,
UNIQUE(title),
UNIQUE(isbn13),
FOREIGN KEY(category) REFERENCES categories(categoriesname)
);

/* ++++++++++ 4 tafla lysing  ++++++++++
 * Lesnar baekur notenda
 * Audkenni
 * Audkenni notanda, foreign key i notanda toflu, krafist
 * Audkenni bokar, foreign key i boka toflu, krafist
 * Einkunn notanda, gildir i eftirfarandi lista 1, 2, 3, 4, 5 ï¿½ar sem 1 er laegsta einkunn og 5 haesta, krafist
 * Domur notanda, lengri texti, ekki krafist
*/
create table booksread(
id serial PRIMARY key,
booksread_id serial,
booksread_title varchar(99) NOT NULL,
booksread_grade INT CHECK (booksread_grade >0 AND booksread_grade < 6) NOT NULL,
booksread_judge TEXT,
FOREIGN KEY (booksread_id) REFERENCES users (id),
FOREIGN KEy (booksread_title) REFERENCES books (title)
);

