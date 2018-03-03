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
FOREIGN KEy (booksread_title) REFERENCES books (book_title)
);

