const express = require('express');
const router = express.Router();

const users = require('./users');
const book = require('./book');
router.use(express.json());

// Föll sem er hægt að kalla á í users.js


/* -------------- Villumeðhöndlun -----------------------*/
function postCategoriesError(gogn){
  console.log(typeof(gogn));
  if (typeof (gogn) === 'string'){
    console.log("kemstu inn")
    return true;
  }
  return false;
}

// Allir routerar settir í sömu röð og gefið í dæminu.
router.post(
  '/register',
  async (req, res) => {
  const { username, password, name } = req.body;
  const user = await users.findByUsername(username);

  if (user) {
    return res.status(401).json({ error: 'User already exists' });
  }
  const registeredUser = await users.createUser(username, password, name);
  return res.status(201).json({ Success: username + 'has been created' });
});

router.post(
  '/login',
  async (req, res) => {
  const { username, password } = req.body;

  const user = await users.findByUsername(username);

  if (!user) {
    return res.status(401).json({ error: 'No such user' });
  }
  const passwordIsCorrect = await comparePasswords(password, user.password);

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
    const data = await book.getCategories();
    res.status(200).json({data});
});

// POST býr til nýjan flokk
router.post(
  '/categories',
  async (req, res) => {
    const data = req.body;
    if(postCategoriesError(data.categories_name) === true){
      const gogn = await book.postCategories({
        categories_name:data.categories_name,
      });
      if(gogn !== null){
        res.status(201).json({data});
      } else {
        res.status(400).json({categories_name: " This name is not valid because it's already in the table"});
      }
    } else {
      res.status(400).json({
        categories_name:" Sorry the name of the categories must be a string"
      });
    }
  }
);

// GET skilar síðu af bókum
router.get(
  '/books',
  async (req, res) => {
    const data = await book.getBooks();
    res.status(200).json({data});
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
/* Rafnar geriri*/
router.post('/users/me/read', (req, res) => {
  // POST býr til nýjan lestur á bók og skilar
});
router.delete('/users/me/read/:id', (req, res) => {
  // DELETE eyðir lestri bókar fyrir innskráðann notanda
});

module.exports = router;
