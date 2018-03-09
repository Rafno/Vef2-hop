require('dotenv').config();

const express = require('express');
const router = express.Router();
const passport = require('passport');

const { Strategy, ExtractJwt } = require('passport-jwt');
const jwt = require('jsonwebtoken');
const users = require('./users');
const book = require('./book');
router.use(express.json());

// Föll sem er hægt að kalla á í users.js
function limiter ( data, limit, offset){
  const result = {
    _links: {
      self: {
        href: `http://localhost:${port}/books?offset=${offset}&limit=${limit}`
      }
    },
    items: data
  };
  if (offset > 0) {
    result._links['prev'] = {
      href: `http://localhost:${port}/books?offset=${offset-limit}&limit=${limit}`
    }
  }
  if (data.length >= limit) {
    result._links['next'] = {
      href: `http://localhost:${port}/books?offset=${Number(offset)+limit}&limit=${limit}`
    }
  }
  return result;
}
/*-------------- Object skoðun------------------- */
function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}
/* -------------- Villumeðhöndlun -----------------------*/
function postCategoriesError(gogn) {
  if (typeof (gogn) === 'string') {
    return true;
  }
  return false;
}
function postBooksError(gogn) {
  const fylki = [];
  if (gogn.title.length === 0) {
    const answ1 = {
      field: 'Title',
      Error: ' Title can not be a empty string or null. ',
    }
    fylki.push(answ1);
  }
  if (gogn.isbn13.toString().length !== 13 || typeof (gogn.isbn13) !== 'number') {
    const answ2 = {
      field: 'Isbn13',
      Error: ' Isbn13 has to be 13 characters and can only be Integers. ',
    }
    fylki.push(answ2);
  }
  if (typeof (gogn.description) !== 'string') {
    const answ3 = {
      field: 'Description',
      Error: ' Description can only be of the type String. ',
    }
    fylki.push(answ3);
  }
  if (gogn.isbn10.toString().length > 99) {
    const answ4 = {
      field: 'Isbn10',
      Error: ' Isbn10 has the maximum length of 99, do not go over that limit. ',
    }
    fylki.push(answ4);
  }
  if (gogn.published.length > 99) {
    const answ5 = {
      field: 'Published',
      Error: ' Published has the maximum length of 99, do not go over that limit. ',
    }
    fylki.push(answ5);
  }
  if (typeof (gogn.pagecount) !== 'number' || gogn.pagecount < 0) {
    const answ6 = {
      field: 'Pagecount',
      Error: ' Pagecount can only include Integer and it can not be a number under cero. ',
    }
    fylki.push(answ6);
  }
  if (gogn.language.length !== 2) {
    const answ7 = {
      field: 'Language',
      Error: ' The length of Language can only be 2. ',
    }
    fylki.push(answ7);
  }
  if (gogn.category.length === 0 || gogn.category.length > 99) {
    const answ8 = {
      field: 'category',
      Error: ' category can not be null or longer than 99 letters. ',
    }
    fylki.push(answ8);
  }
  return fylki;
}

function errorHandler(username, password) {
  const fylki = [];
  if (password.length < 6) {
    const error = {
      error: 'Password must be 6 characters of length minimum',
    }
    fylki.push(error);
  }
  if (username.length < 3) {
    error = {
      error: 'Username must be 3 characters of length minimum',
    }
    fylki.push(error);
  }
  return fylki;
}
const {
  PORT: port = 3000,
  JWT_SECRET: jwtSecret,
  TOKEN_LIFETIME: tokenLifetime = 1000000000000,
} = process.env;

if (!jwtSecret) {
  console.error('JWT_SECRET not registered in .env');
  process.exit(1);
}
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret,
}

// TODO, setja token a betri stad.
async function strat(data, next) {
  const user = await users.findById(data.id);
  if (user) {
    next(null, user);
  } else {
    next(null, false);
  }
}

passport.use(new Strategy(jwtOptions, strat));

// Allir routerar settir í sömu röð og gefið í dæminu.
// TODO, þarf að geta tekið inn mynd.
router.post(
  '/register',
  async (req, res) => {
    let error = [];
    const { username, password, name } = req.body;
    error = errorHandler(username, password);
    if (error.length > 0) {
      return res.status(400).json({ error });
    }
    const user = await users.findByUsername(username);
    if (user) {
      return res.status(401).json({ error: 'User already exists' });
    }
    const registeredUser = await users.createUser(username, password, name);
    return res.status(201).json({ Success: username + ' has been created' });
  });
router.use(passport.initialize());
router.post(
  '/login',
  async (req, res) => {
    const { username, password } = req.body;

    const user = await users.findByUsername(username);

    if (!user) {
      return res.status(401).json({ error: 'No such user' });
    }
    const passwordIsCorrect = await users.comparePasswords(password, user.password);

    if (passwordIsCorrect) {
      const payload = { id: user.id };
      const tokenOptions = { expiresIn: tokenLifetime };
      const token = jwt.sign(payload, jwtOptions.secretOrKey, tokenOptions);
      return res.json({ token });
    }
    return res.status(401).json({ error: 'Invalid password' });
  });
function requireAuthentication(req, res, next) {
  return passport.authenticate(
    'jwt',
    { session: false },
    (err, user, info) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        const error = info.name === 'TokenExpiredError' ? 'expired token' : 'invalid token';
        return res.status(401).json({ error });
      }

      req.user = user;
      next();
    }
  )(req, res, next);
}
// GET skilar stökum notanda ef til
// Lykilorðs hash skal ekki vera sýnilegt
router.get('/users',
  requireAuthentication, async (req, res) => {
    const results = await users.findAll();
    return res.status(200).json({ results });
  });

// GET skilar stökum notanda ef til
// Lykilorðs hash skal ekki vera sýnilegt
router.get('/users/me', requireAuthentication, async (req, res) => {
  const { id, username, name } = await users.findById(req.user.id);
  return res.status(200).json({ identity: id, username, name });
});
router.patch('/users/me', requireAuthentication, async (req, res) => {
  // PATCH uppfærir sendar upplýsingar um notanda fyrir utan notendanafn, þ.e.a.s. nafn eða lykilorð, ef þau eru gild
  let error = [];
  const { username, password, name } = req.body;
  error = errorHandler(username, password);
  if (error.length > 0) {
    return res.status(400).json({ error });
  }
  await users.editUser(req.user.id, username, password, name);
  return res.status(200).json({Success:'Your account has been modified', username, password, name});
});

router.post('/users/me/profile', (req, res) => {
  const slod = req.body.key;
  // POST setur eða uppfærir mynd fyrir notanda í gegnum Cloudinary og skilar slóð
});

router.get('/users/me/read', requireAuthentication, async (req, res) => {
  // GET skilar síðu af lesnum bókum innskráðs notanda
  const my_books = await users.readBooks(req.user.id);
  if (my_books === null) {
    return res.status(401).json({ Empty: 'You have not read any books' });
  }
  return res.status(200).json({ my_books });
});

router.post('/users/me/read', requireAuthentication, async (req, res) => {
  // POST býr til nýjan lestur á bók og skilar, grade, id, title, text
  const { id, title, grade, judge } = req.body;
  const books = await users.addReadBook(id, title, grade, judge);
  return res.status(200).json({ books });
});
router.delete('/users/me/read/:id', requireAuthentication, async (req, res) => {
  const { id } = req.body;
  const books = await users.deleteReadBook(id);
  return res.status(200).json({ books });
});
router.get('/users/:id/read', requireAuthentication, async (req, res) => {
  const users_books = await users.readBooks(req.params.id);
  if (users_books === null) {
    return res.status(401).json({ Empty: 'This user does not exist or has not read any books' });
  }
  return res.status(200).json({ users_books });
});

// GET skilar síðu af flokkum
router.get(
  '/categories', requireAuthentication,
  async (req, res) => {
    const data = await book.getCategories();
    res.status(200).json({ data });
  });

// POST býr til nýjan flokk
router.post(
  '/categories', requireAuthentication,
  async (req, res) => {
    const data = req.body;
    if (postCategoriesError(data.categories_name) === true) {
      const gogn = await book.postCategories({
        categories_name: data.categories_name,
      });
      if (gogn !== null) {
        res.status(201).json({ data });
      } else {
        res.status(400).json({ categories_name: " This name is not valid because it's already in the table" });
      }
    } else {
      res.status(400).json({
        categories_name: " Sorry the name of the categories must be a string"
      });
    }
  }
);
// GET skilar síðu af bókum
router.get(
  '/books', requireAuthentication,
  async (req, res) => {
    const { search } = req.query;
    let { offset = 0, limit = 10  } = req.query;
    offset = Number(offset);
    limit = Number(limit);
    console.info(typeof(search));
    let leita = {};
    if(typeof(search) === 'string'){
      leita = await book.searchBooks(search, limit, offset);
    } else {
      const data = await book.getBooks(limit, offset);
      const response = limiter(data, limit, offset);
      res.status(200).json(response);
      return;
    }
    if(Object.keys(leita).length === 0){
        const villa = {
          field:" Error",
          Error:" Sorry but you're search for '"+ search+ "' returned nothing",
        }
        res.status(400).json({ villa });
    } else {
      const response = limiter(leita, limit, offset);
      res.status(200).json({response});
    }

  });
// POST býr til nýja bók ef hún er gild og skilar
router.post(
  '/books', requireAuthentication,
  async (req, res) => {
    const data = req.body;
    let errarray = [];
    errarray = postBooksError(data);
    if (errarray.length === 0) {
      const gogn = await book.postBooks(res, {
        title: data.title,
        author: data.author,
        description: data.description,
        isbn10: data.isbn10,
        isbn13: data.isbn13,
        published: data.published,
        pagecount: data.pagecount,
        language: data.language,
        category: data.category,
      });
      res.status(200).json({ data });
    } else {
      res.status(400).json({ errarray });
    }
  });
router.get(
  '/books/:id', requireAuthentication,
  async (req, res) => {
    const { id } = req.params;
    if (typeof (id) === 'string') {
      const gogn = await book.getBooksById(id, res);
      res.status(200).json({ gogn });
    } else {
      const err = {
        field: 'ID',
        Error: ' ID must be a integer',
      }
      res.status(400).json({ err });
    }
  }
);

router.patch(
  '/books/:id', requireAuthentication,
  async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    let errarray = [];
    errarray = postBooksError(data);
    if (errarray.length === 0) {
      const gogn = await book.patchBooksById(res, {
        id: id,
        title: data.title,
        author: data.author,
        description: data.description,
        isbn10: data.isbn10,
        isbn13: data.isbn13,
        published: data.published,
        pagecount: data.pagecount,
        language: data.language,
        category: data.category,
      });
      res.status(200).json({ data });
    } else {
      res.status(400).json({ errarray });
    }
  }
);




module.exports = router;
