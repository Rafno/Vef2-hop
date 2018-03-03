/* ++++++++++ Fyrsta taflan users lýsing ++++++++++
 * Notendur
 * Auðkenni, primary key
 * Notendanafn, einstakt gildi, a.m.k. 3 stafir, krafist
 * Lykilorðs hash, lykilorð verður að vera a.m.k. 6 stafir, krafist
 * Nafn, ekki tómi strengurinn, krafist
 *Slóð á mynd, ekki krafist
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

/* ++++++++++ 2 taflan lýsing ++++++++++
 * Flokkar
 * Auðkenni, primary key
 * Heiti, einstakt gildi, ekki tómi strengurinn, krafist
*/
create table categories(
id serial primary key,
categories_name varchar(99) NOT NULL CHECK (categories_name <> ''),
UNIQUE(categories_name)
);

/* ++++++++++ 3 tafla lýsing ++++++++++
 * Bækur
 * Auðkenni, primary key
 * Titill, einstakt gildi, ekki tómi strengurinn, krafist
 * ISBN13, einstakt gildi, nákvæmlega 13 stafa strengur gerður úr tölum, krafist
 * Höfundur, ekki krafist
 * Lýsing, lengri texti, ekki krafist
 * Flokkur, foreign key í flokka töflu, krafist
 * ISBN10, strengur, ekki krafist, ekki krafa að hafa með í verkefni
 * Útgáfudagsetning, ekki krafist, strengur, ekki krafa að hafa með í verkefni
 * Síðufjöldi, tala, stærri en 0, ekki krafist, ekki krafa að hafa með í verkefni
 * Tungumál, 2 stafa strengur, ekki krafist, ekki krafa að hafa með í verkefni
*/
create table books(
id serial primary key,
book_title varchar(99) NOT NULL CHECK (book_title <> ''),
ISBN13 char(13) NOT NULL,
book_author varchar(99),
book_description TEXT,
book_categories varchar(99) NOT NULL,
book_release_date varchar(99),
book_pagenum INT CHECK(book_pagenum > 0),
book_lang char(2),
UNIQUE( book_title),
UNIQUE( ISBN13),
FOREIGN KEY(book_categories) REFERENCES categories(categories_name)
);


/* ++++++++++ 4 tafla lýsing  ++++++++++
 * Lesnar bækur notenda
 * Auðkenni
 * Auðkenni notanda, foreign key í notanda töflu, krafist
 * Auðkenni bókar, foreign key í bóka töflu, krafist
 * Einkunn notanda, gildi úr eftirfarandi lista 1, 2, 3, 4, 5 þar sem 1 er lægsta einkunn og 5 hæsta, krafist
 * Dómur notanda, lengri texti, ekki krafist
*/
create table booksread(
id serial,
booksread_user varchar(99) NOT NULL,
booksread_title varchar(99) NOT NULL,
booksread_grade INT CHECK (booksread_grade >0 AND booksread_grade < 6) NOT NULL,
booksread_judge TEXT,
FOREIGN KEY (booksread_user) REFERENCES users (username),
FOREIGN KEy (booksread_titl) REFERENCES books (book_title)
);

