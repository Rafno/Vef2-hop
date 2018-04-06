require('dotenv').config();

const express = require('express');
const passport = require('passport');
const { Strategy, ExtractJwt } = require('passport-jwt');
const jwt = require('jsonwebtoken');
const users = require('./users');
const book = require('./book');
const cloud = require('./cloudinary');
const multer = require('multer');
const errors = require('./villuHandler');

const router = express.Router();
const uploads = multer({ dest: './temp' });
router.use(express.json());

/**
 * Ég biðst innilegrar afsökunar til þanns kennara sem fer yfir þetta.
 * Routerum skipt i eftirfarandi:
 * registration, login
 * sidan users, users/me, users:id,
 * sidan categories og ad lokum books.
 */

const {
  PORT: port = 3000,
  JWT_SECRET: jwtSecret,
  TOKEN_LIFETIME: tokenLifetime = 100000,
} = process.env;

if (!jwtSecret) {
  console.error('JWT_SECRET not registered in .env');
  process.exit(1);
}
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret,
};

async function strat(data, next) {
  const user = await users.findById(data.id);
  if (user) {
    next(null, user);
  } else {
    next(null, false);
  }
}
// Hjarlparfoll sem er hægt að kalla á í users.js
/**
 * Limiter skiptir sql nidurstodum i sidur. Adeins 10 stok mega birtast fyrir hvert query.
 * @param {any} data
 * @param {any} limit
 * @param {any} offset
 * @param {any} type
 */
function limiter(data, limit, offset, type) {
  const result = {
    links: {
      self: {
        href: `https://verkefni2server.herokuapp.com/books?offset=${offset}&limit=${limit}&${type}`,
      },
    },
    items: data,
  };
  if (offset > 0) {
    result.links.prev = {
      href: `https://verkefni2server.herokuapp.com/books?offset=${offset - limit}&limit=${limit}&${type}`,
    };
  }
  if (data.length >= limit) {
    result.links.next = {
      href: `https://verkefni2server.herokuapp.com/books?offset=${Number(offset) + limit}&limit=${limit}&${type}`,
    };
  }
  return result;
}
/**
 * Token Authenticator, gefid af Ola.
 * @param {any} req
 * @param {any} res
 * @param {any} next
 */
function requireAuthentication(req, res, next) {
  return passport.authenticate(
    'jwt',
    { session: false },
    // Eslint disable á fall sem Óli gefur.
    /* eslint-disable */
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
      /* eslint-enable */
    },
  )(req, res, next);
}

// --Allir routerar settir í sömu röð og gefið í dæminu.--

/**
 * Byr til nyjan user og setur inn i sql tofluna users.
 * Krafa ad username er unique, skodar adur en tad baetir vid user
 * ad username se ekki nu thegar stadsett i toflunni.
 */
router.post(
  '/register',
  async (req, res) => {
    let error = [];
    const { username, password, name } = req.body;
    error = errors.errorHandler(username, password, name);
    if (error.length > 0) {
      return res.status(401).json({ error });
    }
    const user = await users.findByUsername(username);
    if (user) {
      return res.status(401).json({ error: 'User already exists' });
    }
    await users.createUser(username, password, name);
    return res.status(201).json({ Success: `${username} has been created` });
  },
);
/**
 * Skrair notanda inn sem fremur ad user stemmi i sql toflunni
 * eftir ad handshake a ser stad ta er gefid user token.
 */
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
  },
);

// GET skilar stökum notanda ef til
// Lykilorðs hash er ekki sýnilegt
router.get(
  '/users',
  requireAuthentication, async (req, res) => {
    let { offset = 0, limit = 10 } = req.query;
    offset = Number(offset);
    limit = Number(limit);
    const data = await users.findAll(limit, offset);
    const response = limiter(data, limit, offset, 'users');
    return res.status(200).json({ response });
  },
);

// GET skilar stökum notanda ef til
// Lykilorðs hash er ekki sýnilegt
router.get('/users/me', requireAuthentication, async (req, res) => {
  const { id, username, name } = await users.findById(req.user.id);
  return res.status(200).json({ identity: id, username, name });
});
// PATCH uppfærir sendar upplýsingar um notanda fyrir utan notendanafn
router.patch('/users/me', requireAuthentication, async (req, res) => {
  let error = [];
  const { username, password, name } = req.body;

  error = errors.errorHandler(username, password, name);
  if (error.length > 0) {
    return res.status(401).json({ error });
  }
  await users.editUser(req.user.id, username, password, name);
  return res.status(200).json({
    Success: 'Your account has been modified', username, password, name,
  });
});
// POST setur eða uppfærir mynd fyrir notanda í gegnum Cloudinary og skilar slóð
router.post('/users/me/profile', requireAuthentication, uploads.single('profile'), cloud.upload);
// GET skilar síðu af lesnum bókum innskráðs notanda
router.get('/users/me/read', requireAuthentication, async (req, res) => {
  let { offset = 0, limit = 10 } = req.query;
  offset = Number(offset);
  limit = Number(limit);
  const myBooks = await users.readBooks(req.user.id, limit, offset);
  if (myBooks === null) {
    return res.status(401).json({ Empty: 'You have not read any books' });
  }
  const response = limiter(myBooks, limit, offset, '/users/me/read');
  return res.status(200).json({ response });
});
// POST býr til nýjan lestur á bók og skilar, grade, id, title, text
router.post('/users/me/read', requireAuthentication, async (req, res) => {
  const { title, grade, judge } = req.body;
  const bookTitle = await users.findBookByTitle(title);
  if (!(bookTitle)) {
    return res.status(400).json({ Error: 'book does not exist' });
  }
  if (grade > 5 || grade < 1 || typeof grade !== 'number') {
    return res.status(400).json({ Error: 'Grade incorrect format, grade must be an integer and between 0 and 5' });
  }
  const books = await users.addReadBook(req.user.id, title, grade, judge);
  return res.status(200).json({ books });
});
// DELETE eydir lesni bok.
router.delete('/users/me/read/:id', requireAuthentication, async (req, res) => {
  const { id } = req.params;
  const books = await users.deleteReadBook(id);
  if (!books) {
    return res.status(404).json({ Error: 'Book does not exist' });
  }
  return res.status(200).json({ Success: 'Book deleted' });
});
// GET skilar ollum bokum sem valin notandi hefur lesid.
router.get('/users/:id/read', requireAuthentication, async (req, res) => {
  let { offset = 0, limit = 10 } = req.query;
  offset = Number(offset);
  limit = Number(limit);
  const user = await users.findById(req.params.id);
  if (user) {
    const userID = await users.readBooks(user.id);
    if (userID) {
      const response = limiter(userID, limit, offset, `users/${req.params.id}/read`);
      return res.status(200).json({ response });
    }
  }
  return res.status(400).json({ Empty: 'This user does not exist or has not read any books' });
});
// GET skilar upplysingar um notanda, synir ekki lykilord.
router.get('/users/:id', requireAuthentication, async (req, res) => {
  const user = await users.findById(req.params.id);
  if (user) {
    return res.status(200).json({ user });
  }
  return res.status(400).json({ Error: 'User not found' });
});
// GET skilar síðu af flokkum
router.get(
  '/categories',
  async (req, res) => {
    let { offset = 0, limit = 10 } = req.query;
    offset = Number(offset);
    limit = Number(limit);
    const data = await book.getCategories(limit, offset);
    const response = limiter(data, limit, offset, 'categories');
    res.status(200).json({ response });
  },
);

// POST býr til nýjan flokk
router.post(
  '/categories', requireAuthentication,
  async (req, res) => {
    const data = req.body;
    if (errors.postCategoriesError(data.categoriesname) === true) {
      const gogn = await book.postCategories({
        categoriesname: data.categoriesname,
      });
      if (gogn !== null) {
        res.status(201).json({ data });
      } else {
        res.status(400).json({ categoriesname: " This name is not valid because it's already in the table" });
      }
    } else {
      res.status(400).json({
        categoriesname: ' Sorry the name of the categories must be a string',
      });
    }
  },
);
// GET skilar síðu af bókum
router.get(
  '/books',
  async (req, res) => {
    const { search } = req.query;
    let { offset = 0, limit = 10 } = req.query;
    offset = Number(offset);
    limit = Number(limit);
    let leita = {};
    if (typeof (search) === 'string') {
      leita = await book.searchBooks(search, limit, offset);
    } else {
      const data = await book.getBooks(limit, offset);
      const response = limiter(data, limit, offset, 'books');
      res.status(200).json(response);
      return;
    }
    if (Object.keys(leita).length === 0) {
      const villa = {
        field: 'Error',
        Error: `Sorry but your search for '${search}' returned nothing`,
      };
      res.status(400).json({ villa });
    } else {
      const response = limiter(leita, limit, offset, `search=${search}`);
      res.status(200).json({ response });
    }
  },
);
// POST býr til nýja bók ef hún er gild og skilar
router.post(
  '/books', requireAuthentication,
  async (req, res) => {
    let fylki = [];
    const data = req.body;
    if (errors.testBookTemplate(data).length !== 0) {
      fylki = errors.testBookTemplate(data);
      res.status(400).json({ fylki });
      return;
    }
    let errarray = [];
    errarray = errors.postBooksError(data);
    if (errarray.length === 0) {
      await book.postBooks(res, {
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
  },
);
// GET nær í upplýsingar um bók og skilar.
router.get(
  '/books/:id',
  async (req, res) => {
    const { id } = req.params;
    if (typeof (id) === 'string') {
      const gogn = await book.getBooksById(id, res);
      res.status(200).json({ gogn });
    } else {
      const err = {
        field: 'ID',
        Error: ' ID must be a integer',
      };
      res.status(400).json({ err });
    }
  },
);
// PATCH breytir upplýsingum um bók ef á gildu formi.
router.patch(
  '/books/:id', requireAuthentication,
  async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    let errarray = [];
    errarray = errors.postBooksError(data);
    if (errarray.length === 0) {
      await book.patchBooksById(res, {
        id,
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
  },
);

passport.use(new Strategy(jwtOptions, strat));
router.use(passport.initialize());
module.exports = router;
