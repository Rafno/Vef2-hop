const express = require('express');

const router = express.Router();
router.use(express.json());

// föll sem hægt að kalla á í users.js
const {
  comparePasswords,
  findByUsername,
  findById,
  createUser,
} = require('./users');
// föll sem er hægt að kalla á í books.js
const {
  getCategories,
  postCategories,
  getbooks,
  postbooks,
  getbooksSearch,
  getBooksId,
  patchBooksId,
} = require('./book');

// Allir routerar settir í sömu röð og gefið í dæminu.
router.post('/register', (req, res) => {
  const { username, password } = req.body;
  const user = await users.findByUsername(username);

  if (user) {
    return res.status(401).json({ error: 'User already exists' });
  }
  const registeredUser = await createUser(username, password);
  return res.status(201).json({ Success: username + 'has been created' });
});

router.post('/login', (req, res, next) => {
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

router.get('/users', (req, res) => {
  // GET skilar stökum notanda ef til
  // Lykilorðs hash skal ekki vera sýnilegt
});

router.get('/users/:id', (req, res) => {
  // GET skilar stökum notanda ef til
  // Lykilorðs hash skal ekki vera sýnilegt
});

router.get('/users/me', (req, res) => {
  // GET skilar innskráðum notanda (þ.e.a.s. þér)
});
router.patch('/users/me', (req, res) => {
  // PATCH uppfærir sendar upplýsingar um notanda fyrir utan notendanafn, þ.e.a.s. nafn eða lykilorð, ef þau eru gild
});

router.post('/users/me/profile', (req, res) => {
  // POST setur eða uppfærir mynd fyrir notanda í gegnum Cloudinary og skilar slóð
});

// GET skilar síðu af flokkum
router.get(
  '/categories',
  async (req, res) => {
    console.log("hallío");
    const data = await getCategories();
    res.status(200).json({data});
});
router.post('/categories', (req, res) => {
  // POST býr til nýjan flokk og skilar
});

router.get('/books', (req, res) => {
  // GET skilar síðu af bókum
});
router.post('/books', (req, res) => {
  // POST býr til nýja bók ef hún er gild og skilar
});

// Skoða betur, óviss hvernig ?search=query virkar.
router.get('/books?search=query', (req, res) => {
  // GET skilar síðu af bókum sem uppfylla leitarskilyrði, sjá að neðan
});

router.get('/books/:id', (req, res) => {
  // GET skilar stakri bók
});
router.patch('/books/:id', (req, res) => {
  // PATCH uppfærir bók
});

router.get('/users/:id/read', (req, res) => {
  // GET skilar síðu af lesnum bókum notanda
});

router.get('/users/me/read', (req, res) => {
  // GET skilar síðu af lesnum bókum innskráðs notanda
});
router.post('/users/me/read', (req, res) => {
  // POST býr til nýjan lestur á bók og skilar
});
router.delete('/users/me/read/:id', (req, res) => {
  // DELETE eyðir lestri bókar fyrir innskráðann notanda
});

module.exports = router;
