/* HVERNIG SKAL NOTA BOOKS
* kasta tomum streng i null
* SELECT CASE WHEN pagecount='' THEN NULL ELSE pagecount::integer END FROM books;
* copy-a tofluna i gagnagrunninn
* copy books (title, author, description, isbn10, isbn13, published, pagecount, language, category) FROM 'C:\\Users\\Sixsmith\\Desktop\\Vef2-hop\\data\\books.csv' DELIMITER ',' CSV HEADER ENCODING 'UTF8' ESCAPE '''';
* GOD HELP YOU IF YOU LOSE THESE COMMANDS.
*/
/* ++++++++++ Fyrsta taflan users l��sing ++++++++++
 * Notendur
 * Au�kenni, primary key
 * Notendanafn, einstakt gildi, a.m.k. 3 stafir, krafist
 * Lykilor�s hash, lykilor� ver�ur a� vera a.m.k. 6 stafir, krafist
 * Nafn, ekki t�mi strengurinn, krafist
 *Sl�� � mynd, ekki krafist
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


/* ++++++++++ 2 taflan l��sing ++++++++++
 * Flokkar
 * Au�kenni, primary key
 * Heiti, einstakt gildi, ekki t�mi strengurinn, krafist
*/
create table categories(
id serial primary key,
categories_name varchar(99) NOT NULL CHECK (categories_name <> ''),
UNIQUE(categories_name)
);

/* ++++++++++ 3 tafla l��sing ++++++++++
 * B�kur
 * Au�kenni, primary key
 * Titill, einstakt gildi, ekki t�mi strengurinn, krafist
 * ISBN13, einstakt gildi, n�kv�mlega 13 stafa strengur ger�ur �r t�lum, krafist
 * H�fundur, ekki krafist
 * L�sing, lengri texti, ekki krafist
 * Flokkur, foreign key � flokka t�flu, krafist
 * ISBN10, strengur, ekki krafist, ekki krafa a� hafa me� � verkefni
 * �tg�fudagsetning, ekki krafist, strengur, ekki krafa a� hafa me� � verkefni
 * S��ufj�ldi, tala, st�rri en 0, ekki krafist, ekki krafa a� hafa me� � verkefni
 * Tungum�l, 2 stafa strengur, ekki krafist, ekki krafa a� hafa me� � verkefni
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
FOREIGN KEY(category) REFERENCES categories(categories_name)
);

/* ++++++++++ 4 tafla l��sing  ++++++++++
 * Lesnar b�kur notenda
 * Au�kenni
 * Au�kenni notanda, foreign key � notanda t�flu, krafist
 * Au�kenni b�kar, foreign key � b�ka t�flu, krafist
 * Einkunn notanda, gildi �r eftirfarandi lista 1, 2, 3, 4, 5 �ar sem 1 er l�gsta einkunn og 5 h�sta, krafist
 * D�mur notanda, lengri texti, ekki krafist
*/
create table booksread(
id serial,
booksread_user varchar(99) NOT NULL,
booksread_title varchar(99) NOT NULL,
booksread_grade INT CHECK (booksread_grade >0 AND booksread_grade < 6) NOT NULL,
booksread_judge TEXT,
FOREIGN KEY (booksread_user) REFERENCES users (username),
FOREIGN KEy (booksread_title) REFERENCES books (title)
);

