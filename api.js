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
// Föll sem er hægt að kalla á í users.js
function limiter(data, limit, offset, type) {
  const result = {
    links: {
      self: {
        href: `http://localhost:${port}/${type}?offset=${offset}&limit=${limit}`,
      },
    },
    items: data,
  };
  if (offset > 0) {
    result.links.prev = {
      href: `http://localhost:${port}/${type}?offset=${offset - limit}&limit=${limit}`,
    };
  }
  if (data.length >= limit) {
    result.links.next = {
      href: `http://localhost:${port}/${type}?offset=${Number(offset) + limit}&limit=${limit}`,
    };
  }
  return result;
}
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

// Allir routerar settir í sömu röð og gefið í dæminu.
router.post(
  '/register',
  async (req, res) => {
    let error = [];
    const { username, password, name } = req.body;
    error = errors.errorHandler(username, password);
    if (error.length > 0) {
      return res.status(400).json({ error });
    }
    const user = await users.findByUsername(username);
    if (user) {
      return res.status(401).json({ error: 'User already exists' });
    }
    await users.createUser(username, password, name);
    return res.status(201).json({ Success: `${username} has been created` });
  },
);
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
// Lykilorðs hash skal ekki vera sýnilegt
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
// Lykilorðs hash skal ekki vera sýnilegt
router.get('/users/me', requireAuthentication, async (req, res) => {
  const { id, username, name } = await users.findById(req.user.id);
  return res.status(200).json({ identity: id, username, name });
});
router.patch('/users/me', requireAuthentication, async (req, res) => {
  // PATCH uppfærir sendar upplýsingar um notanda fyrir utan notendanafn
  let error = [];
  const { username, password, name } = req.body;

  error = errors.errorHandler(username, password);
  if (error.length > 0) {
    return res.status(400).json({ error });
  }
  await users.editUser(req.user.id, username, password, name);
  return res.status(200).json({
    Success: 'Your account has been modified', username, password, name,
  });
});
router.post('/users/me/profile', requireAuthentication, uploads.single('profile'), cloud.upload);
// POST setur eða uppfærir mynd fyrir notanda í gegnum Cloudinary og skilar slóð
router.get('/users/me/read', requireAuthentication, async (req, res) => {
// GET skilar síðu af lesnum bókum innskráðs notanda
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
router.post('/users/me/read', requireAuthentication, async (req, res) => {
  // POST býr til nýjan lestur á bók og skilar, grade, id, title, text
  const { title, grade, judge } = req.body;
  const bookTitle = await users.findBookByTitle(title);
  if (!(bookTitle)) {
    return res.status(400).json({ Error: 'book does not exist' });
  }
  const books = await users.addReadBook(req.user.id, title, grade, judge);
  return res.status(200).json({ books });
});
router.delete('/users/me/read/:id', requireAuthentication, async (req, res) => {
  const { id } = req.params;
  const books = await users.deleteReadBook(id);
  if (!books) {
    return res.status(404).json({ Error: 'Book does not exist' });
  }
  return res.status(200).json({ Success: 'Book deleted' });
});
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
router.get('/users/:id', requireAuthentication, async (req, res) => {
  const user = await users.findById(req.params.id);
  if (user) {
    return res.status(200).json({ user });
  }
  return res.status(400).json({ Error: 'User not found' });
});
// GET skilar síðu af flokkum
router.get(
  '/categories', requireAuthentication,
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
    if (errors.postCategoriesError(data.categories_name) === true) {
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
        categories_name: ' Sorry the name of the categories must be a string',
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
      const response = limiter(data, limit, offset, search);
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
      const response = limiter(leita, limit, offset);
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
      };
      res.status(400).json({ err });
    }
  },
);

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
