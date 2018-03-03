/* ++++++++++ Fyrsta taflan users l˝ùsing ++++++++++
 * Notendur
 * Auùkenni, primary key
 * Notendanafn, einstakt gildi, a.m.k. 3 stafir, krafist
 * Lykilorùs hash, lykilorù verùur aù vera a.m.k. 6 stafir, krafist
 * Nafn, ekki tùmi strengurinn, krafist
 *Slùù ù mynd, ekki krafist
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


/* ++++++++++ 2 taflan lù˝sing ++++++++++
 * Flokkar
 * Auùkenni, primary key
 * Heiti, einstakt gildi, ekki tùmi strengurinn, krafist
*/
create table categories(
id serial primary key,
categories_name varchar(99) NOT NULL CHECK (categories_name <> ''),
UNIQUE(categories_name)
);

/* ++++++++++ 3 tafla lù˝sing ++++++++++
 * Bùkur
 * Auùkenni, primary key
 * Titill, einstakt gildi, ekki tùmi strengurinn, krafist
 * ISBN13, einstakt gildi, nùkvùmlega 13 stafa strengur gerùur ùr tùlum, krafist
 * Hùfundur, ekki krafist
 * Lùsing, lengri texti, ekki krafist
 * Flokkur, foreign key ù flokka tùflu, krafist
 * ISBN10, strengur, ekki krafist, ekki krafa aù hafa meù ù verkefni
 * ùtgùfudagsetning, ekki krafist, strengur, ekki krafa aù hafa meù ù verkefni
 * Sùùufjùldi, tala, stùrri en 0, ekki krafist, ekki krafa aù hafa meù ù verkefni
 * Tungumùl, 2 stafa strengur, ekki krafist, ekki krafa aù hafa meù ù verkefni
*/
create table books(
id serial primary key,
book_title varchar(99) NOT NULL CHECK (book_title <> ''),
ISBN13 char(13) NOT NULL,
book_author varchar(99),
book_description TEXT,
book_categories varchar(99) NOT NULL,
ISBN10 varchar(99),
book_release_date varchar(99),
book_pagenum INT CHECK(book_pagenum > 0),
book_lang char(2),
UNIQUE( book_title),
UNIQUE( ISBN13),
FOREIGN KEY(book_categories) REFERENCES categories(categories_name)
);

/* ++++++++++ 4 tafla lù˝sing  ++++++++++
 * Lesnar bùkur notenda
 * Auùkenni
 * Auùkenni notanda, foreign key ù notanda tùflu, krafist
 * Auùkenni bùkar, foreign key ù bùka tùflu, krafist
 * Einkunn notanda, gildi ùr eftirfarandi lista 1, 2, 3, 4, 5 ùar sem 1 er lùgsta einkunn og 5 hùsta, krafist
 * Dùmur notanda, lengri texti, ekki krafist
*/
create table booksread(
id serial,
booksread_user varchar(99) NOT NULL,
booksread_title varchar(99) NOT NULL,
booksread_grade INT CHECK (booksread_grade >0 AND booksread_grade < 6) NOT NULL,
booksread_judge TEXT,
FOREIGN KEY (booksread_user) REFERENCES users (username),
FOREIGN KEy (booksread_title) REFERENCES books (book_title)
);

