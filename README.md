# Hópverkefni 1

## Hópmeðlimir
Rafnar Ólafsson - Rao13@hi.is
Helgi Grétar Gunnarsson - Hgg26@hi.is
## Notendaumsjón

Hægt á að vera að skrá notendur með nafni, notendanafni og lykilorði. Auðkenning skal fara fram með JWT og passport, token er úthlutað þegar `POST`að er á `/login`.

Útfæra þarf middleware sem passar upp á slóðir sem eiga að vera læstar séu læstar nema token sé sent með í `Authorization` haus í request.

Eftir að notandi er innskráður er möguleiki á að setja inn mynd fyrir notanda með því að framkvæma `POST` á `/users/me/profile` með mynd (`.png`, `.jpg` eða `.jpeg`) í body á request. Þar sem ekki er hægt að vista myndir beint á disk á Heroku skal notast við [Cloudinary](https://cloudinary.com/), þjónustu sem geymir myndir og bíður upp á API til að vista, sækja og eiga við myndir. Heroku bíður upp á ókeypis útgáfu gegnum [Cloudinary add-on](https://elements.heroku.com/addons/cloudinary).

Flæði væri:

1. Notandi sendir `multipart/form-data` `POST` á `/users/me/profile` með mynd
2. Bakendi les mynd úr request, t.d. með [`multer`](https://github.com/expressjs/multer)
3. Mynd er send á cloudinary API, sjá [Heroku: Cloudinary with node.js](https://devcenter.heroku.com/articles/cloudinary#using-with-node-js)
4. Ef allt gengur eftir skilar Cloudinary JSON hlut með upplýsingum
5. `url` úr svari er vistað í notenda töflu

## Gögn
Hér má sjá SQL töflurnar okkar. Einnig kommentað og með insert skipunum í schema.sql skjalinu.
* Notendur
```
create table users(
 id serial primary key,
 username TEXT CHECK (LENGTH(username) > 2) NOT NULL,
 password TEXT CHECK (LENGTH(password) > 5) NOT NULL,
 name varchar (99) NOT NULL,
 urlpic varchar(255),
 UNIQUE( username),
 UNIQUE( password)
);
```
* Flokkar
```
create table categories(
id serial primary key,
categoriesname varchar(99) NOT NULL CHECK (categoriesname <> ''),
UNIQUE(categoriesname)
);
```
* Bækur
```
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
```

* Lesnar bækur notenda
```
create table booksread(
id serial,
booksread_id integer NOT NULL,
booksread_title varchar(99) NOT NULL,
booksread_grade INT CHECK (booksread_grade >0 AND booksread_grade < 6) NOT NULL,
booksread_judge TEXT,
FOREIGN KEY (booksread_id) REFERENCES users (id),
FOREIGN KEy (booksread_title) REFERENCES books (title)
);
```
* Bækur teknar inn með postgresql skipun, sem má sjá hér  
``` copy books (title, author, description, isbn10, isbn13, published, pagecount, language, category) FROM 'C:\\Users\\myComputer\\Desktop\\Vef2-hop\\data\\books.csv' DELIMITER ',' CSV HEADER ENCODING 'UTF8' ESCAPE ''''; ```
  
Skipunin virkar svo að hún tekur við csv skjali og setur í útbúna töflu, delimiter sýnir hvar á að fara í næsta gildi, encoding gefur íslenska stafi ef notaðir, header kemur í veg fyrir að fyrsta línan er notuð og escape sýnir að ef '' er í streng skal hunsa semi-kommur inn í því.  

Þar sem merkt er _krafist_ verða gögn að innihalda gildi og þau að vera gild skv. lýsingu. Þar sem merkt er _ekki krafst_ má sleppa gildi í gögnum, bæði þegar eining er búin til og henni skilað.

Þar sem merkt er _primary key_, _foreign key_ eða _einstakt gildi_ (unique) þarf að setja viðeigandi skoður á töflu, sjá https://www.postgresql.org/docs/current/static/ddl-constraints.html

Gögn eru gefin innan `data/` möppu þar sem `books.csv` inniheldur 532 færslur, fyrsta lína skilgreinir dálka. Ef `"` kemur fyrir í texta er það kóðað sem `""`, t.d.
`"Þetta er lýsing með ""gæsalöppum"""`. Gögn innihalda ekki nýlínu tákn.

## Vefþjónustur

Eftirfarandi slóðir eiga að vera til staðar, öll gögn sem send eru inn skulu vera á `JSON` formi og gögnum skilað á `JSON` formi.
Token endist í 100000 mínútur upp á þægindi. Stóð engin krafa um lengdartíma í verkefninu.
## Notendalýsing á vefþjónustum
* `/register`
  - Fara á /Register í POST stillingu, skal skrifa í Body ```{"username":"Foo", "password":"Bar","name":"FooBar"}```(Lágstafur skiptir máli)
* `/login`
  - Fara á /login í `POST` stillingu, skal skrifa í Body ```{"username":"Foo", "password":"Bar","name":"FooBar"}```
Skilað er TOKEN sem þarf að vista og setja í Bearer Token, sem má finna í Autherization flipanum í Postman.
* `/users`
  - `GET` skilar _síðu_ (sjá að neðan) af notendum
  - Fara á /users í GET stillingu, ekkert þarf í Body.
* `/users/:id`
  - `GET` skilar stökum notanda ef til
  - Lykilorðs hash skal ekki vera sýnilegt
* `/users/me`
  - `GET` skilar innskráðum notanda (þ.e.a.s. _þér_)
  - `PATCH` uppfærir sendar upplýsingar um notanda fyrir utan notendanafn, þ.e.a.s. nafn eða lykilorð, ef þau eru gild
  Fara á /users/me í PATCH stillingu, skal skrifa í Body ```{"username":"Foo", "password":"Bar","name":"FooBar"}```
* `/users/me/profile`
  - `POST` setur eða uppfærir mynd fyrir notanda í gegnum Cloudinary og skilar slóð
  - Fara á /users/me/ í `POST` stillingu, í body þarf að velja form-data, key þarf að heita 'Profile', þá má hlaða inn mynd. 
* `/categories`
  - `GET` skilar _síðu_ af flokkum
  - Til að búa til nýjan category, fara á /categories í `POST` stillingu, skal skrifa í Body ```{"categoriesname":"Foo"}```
* `/books`
  - `GET` skilar _síðu_ af bókum
  - Til að skrifa nýja bók, þarf að fara á /books í `POST` stillingu, skal skrifa í ```{"title":"foo", "author":"bar", "description":"foobar","isbn10":INTEGER,"isbn13":INTEGER,"published":"fizz","pagecount":INTEGER,"language":"EN","category":"FIZZBUZZ"}```
* `/books?search=query`
  - `GET` skilar _síðu_ af bókum sem uppfylla leitarskilyrði, sjá að neðan
  - til að leita, skal fara í /books?search=foobar í `GET` stillingu, þar sem foobar er leitarskilyrði.
* `/books/:id`
  - `GET` skilar stakri bók
  - `PATCH` uppfærir bók
  - Til að uppfæra bók, skal nota {"title":"foo", "author":"bar", "description":"foobar","isbn10":INTEGER,"isbn13":INTEGER,"published":"fizz","pagecount":INTEGER,"language":"EN","category":"FIZZBUZZ"}
* `/users/:id/read`
  - `GET` skilar _síðu_ af lesnum bókum notanda
* `/users/me/read`
  - `GET` skilar _síðu_ af lesnum bókum innskráðs notanda
  - `POST` býr til nýjan lestur á bók og skilar
  - Til að skrifa nýjan lestur á bók , skal nota ```{"title":Foo,"grade":INTEGER, "judge":"Foobar"}```
* `/users/me/read/:id`
  - `DELETE` eyðir lestri bókar fyrir innskráðann notanda

Þegar gögn eru sótt,  búin til eða uppfærð þarf að athuga hvort allt sé gilt og einingar séu til og skila viðeigandi status kóðum/villuskilaboðum ef svo er ekki.

Fyrir notanda sem ekki er skráður er inn skal vera hægt að:

* Skoða allar bækur og flokka
* Leita að bókum

Fyrir innskráðan notanda skal einnig vera hægt að:

* Uppfæra upplýsingar um sjálfan sig
* Skrá nýja bók
* Uppfæra bók
* Skrá nýjan flokk
* Skrá lestur á bók
* Eyða lestur á bók

### Síður (paging)

Fyrir fyrirspurnir sem skila listum af gögnum þarf að _page_a þau gögn. Þ.e.a.s. að sækja aðeins takmarkað magn úr heildarlista í einu og láta vita af næstu síðu. Þetta kemur í veg fyrir að við sækjum of mikið af efni í einu, t.d. ef gagnagrunnur myndi innihalda tugþúsundir bóka og notanda.

Til að útfæra með postgres nýtum við [`LIMIT` og `OFFSET`](https://www.postgresql.org/docs/current/static/queries-limit.html) í fyrirspurnum. Við útfærum almennu fyrirspurnina (með `ORDER BY <dálk til að raða eftir>`) en bætum síðan við t.d. `LIMIT 10 OFFSET 0` sem biður um fyrstu 10 niðurstöður, `LIMIT 10 OFFSET 10` myndi skila okkur næstu 10, þ.e. frá 11-20 o.s.fr.

Upplýsingum um limit og offset skal skila í svari ásamt gögnum á forminu:

```json
{
  "limit": 10,
  "offset": 0,
  "items": [
    // 10 hlutir úr svari
  ]
}
```

### Leit

Aðeins þarf að leita í bókatöflu í reitunum titil og lýsingarreitum. Postgres býður upp á textaleit í töflum án þess að setja upp eitthvað sérstakt, sjá [Chapter 12. Full Text Search: Tables and Indexes](https://www.postgresql.org/docs/current/static/textsearch-tables.html).

## Annað

Ekki þarf að útfæra „týnt lykilorð“ virkni.

Bækur geta aðeins verið í einum flokk.

Þegar gögn eru flutt inn í gagnagrunn getur verið gott að nýta `await` í lykkju þó að eslint mæli gegn því. Ef t.d. er reynt að setja inn yfir 500 færslur í einu í gagnagrunn með `Promise.all`, getur tenging rofnað vegna villu.

## Hópavinna

Verkefnið skal unnið í hóp, helst með þremur einstaklingum. Hópar með tveim eða fjórum einstaklingum eru einnig í lagi. Hafið samband við kennara ef ekki tekst eða ekki mögulegt að vinna í hóp.

## README

Í rót verkefnis skal vera `README.md` skjal sem tilgreinir:

* Upplýsingar um hvernig setja skuli upp verkefnið
  - Hvernig gagnagrunnur og töflur eru settar upp
  - Hvernig gögnum er komið inn í töflur
* Dæmi um köll í vefþjónustu
* Nöfn og notendanöfn allra í hóp

## Git og GitHub

Verkefni þetta er sett fyrir á GitHub og almennt ætti að skila því úr einka (private) repo nemanda. Nemendur geta fengið gjaldfrjálsan aðgang að einka repos á meðan námi stendur, sjá https://education.github.com/.

Til að byrja er hægt að afrita þetta repo og bæta við á sínu eigin:

```bash
> git clone https://github.com/vefforritun/vef2-2018-h1.git
> cd vef2-2018-h1
> git remote remove origin # fjarlægja remote sem verkefni er í
> git remote add origin <slóð á repo> # bæta við í þínu repo
> git push
```

## Mat

* 20% – Töflur og gögn lesin inn
* 30% – Auðkenning og notendaumsjón
* 50% – Vefþjónusta

## Sett fyrir

Verkefni sett fyrir í fyrirlestri fimmtudaginn 22. febrúar 2018.

## Skil

Einn aðili í hóp skal skila fyrir hönd allra og skila skal undir „Verkefni og hlutaprófa“ á Uglu í seinasta lagi fyrir lok dags fimmtudaginn 15. mars 2018.

Skilaboð skulu innihalda slóð á GitHub repo fyrir verkefni, slóð á Heroku og nöfn allra þá sem eru í hópnum. Dæmatímakennurum skal hafa verið boðið í repo ([sjá leiðbeiningar](https://help.github.com/articles/inviting-collaborators-to-a-personal-repository/)). Notendanöfn þeirra eru `ernir` og `elvarhelga`.

## Einkunn

Sett verða fyrir sex minni verkefni þar sem fimm bestu gilda 6% hvert, samtals 30% af lokaeinkunn.

Sett verða fyrir tvö hópa verkefni þar sem hvort um sig gildir 15%, samtals 30% af lokaeinkunn.

