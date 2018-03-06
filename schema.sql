/* HVERNIG SKAL NOTA BOOKS
* SELECT og kasta tomum streng i null
* SELECT CASE WHEN pagecount='' THEN NULL ELSE pagecount::integer END FROM books;
* copy-a tofluna i gagnagrunninn
* copy books (title, author, description, isbn10, isbn13, published, pagecount, language, category) FROM 'C:\\Users\\Sixsmith\\Desktop\\Vef2-hop\\data\\books.csv' DELIMITER ',' CSV HEADER ENCODING 'UTF8' ESCAPE '''';
* GOD HELP YOU IF YOU LOSE THESE COMMANDS.
*/
/* ++++++++++ Fyrsta taflan users lï¿½ï¿½sing ++++++++++
 * Notendur
 * Auï¿½kenni, primary key
 * Notendanafn, einstakt gildi, a.m.k. 3 stafir, krafist
 * Lykilorï¿½s hash, lykilorï¿½ verï¿½ur aï¿½ vera a.m.k. 6 stafir, krafist
 * Nafn, ekki tï¿½mi strengurinn, krafist
 *Slï¿½ï¿½ ï¿½ mynd, ekki krafist
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


/* ++++++++++ 2 taflan lï¿½ï¿½sing ++++++++++
 * Flokkar
 * Auï¿½kenni, primary key
 * Heiti, einstakt gildi, ekki tï¿½mi strengurinn, krafist
*/
create table categories(
id serial primary key,
categories_name varchar(99) NOT NULL CHECK (categories_name <> ''),
UNIQUE(categories_name)
);
/*
 * Inser skipanir fyrir töfluna categories
*/
insert into categories(categories_name) Values('Fiction');
insert into categories(categories_name) Values('Nonfiction');
insert into categories(categories_name) Values('Science Fiction');
insert into categories(categories_name) Values('Fantasy');
insert into categories(categories_name) Values('Comic');
insert into categories(categories_name) Values('Psychology');
insert into categories(categories_name) Values('Design');
insert into categories(categories_name) Values('Horror');
insert into categories(categories_name) Values('Economics');
insert into categories(categories_name) Values('Graphic Novel');
insert into categories(categories_name) Values('Business');
insert into categories(categories_name) Values('Computer Science');


/* ++++++++++ 3 tafla lï¿½ï¿½sing ++++++++++
 * Bï¿½kur
 * Auï¿½kenni, primary key
 * Titill, einstakt gildi, ekki tï¿½mi strengurinn, krafist
 * ISBN13, einstakt gildi, nï¿½kvï¿½mlega 13 stafa strengur gerï¿½ur ï¿½r tï¿½lum, krafist
 * Hï¿½fundur, ekki krafist
 * Lï¿½sing, lengri texti, ekki krafist
 * Flokkur, foreign key ï¿½ flokka tï¿½flu, krafist
 * ISBN10, strengur, ekki krafist, ekki krafa aï¿½ hafa meï¿½ ï¿½ verkefni
 * ï¿½tgï¿½fudagsetning, ekki krafist, strengur, ekki krafa aï¿½ hafa meï¿½ ï¿½ verkefni
 * Sï¿½ï¿½ufjï¿½ldi, tala, stï¿½rri en 0, ekki krafist, ekki krafa aï¿½ hafa meï¿½ ï¿½ verkefni
 * Tungumï¿½l, 2 stafa strengur, ekki krafist, ekki krafa aï¿½ hafa meï¿½ ï¿½ verkefni
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

/* ++++++++++ 4 tafla lï¿½ï¿½sing  ++++++++++
 * Lesnar bï¿½kur notenda
 * Auï¿½kenni
 * Auï¿½kenni notanda, foreign key ï¿½ notanda tï¿½flu, krafist
 * Auï¿½kenni bï¿½kar, foreign key ï¿½ bï¿½ka tï¿½flu, krafist
 * Einkunn notanda, gildi ï¿½r eftirfarandi lista 1, 2, 3, 4, 5 ï¿½ar sem 1 er lï¿½gsta einkunn og 5 hï¿½sta, krafist
 * Dï¿½mur notanda, lengri texti, ekki krafist
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

