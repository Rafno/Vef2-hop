create table users(
 id serial primary key,
 username TEXT CHECK (LENGTH(username) > 2) NOT NULL,
 password TEXT CHECK (LENGTH(password) > 5) NOT NULL,
 name varchar (99) NOT NULL,
 urlpic varchar(255),
 UNIQUE(username, password)
);