require('dotenv').config();

const express = require('express');

const router = express.Router();

router.use(express.json());

/* --------------Villumeðhöndlun -----------------------*/

/**
 * Boolean fall sem skodar hvort object se af string type.
 * Kemur i veg fyrir ad categories se sett inn sem er ekki string.
 * @param {any} gogn
 */
function postCategoriesError(gogn) {
  if (typeof (gogn) === 'string') {
    return true;
  }
  return false;
}
/**
 * Villumelding fyrir post router i books se i rettu formi.
 * @param {any} gogn
 */
function postBooksError(gogn) {
  const fylki = [];
  if (gogn.title.length === 0) {
    const answ1 = {
      field: 'Title',
      Error: ' Title can not be a empty string or null. ',
    };
    fylki.push(answ1);
  }
  if (gogn.isbn13.toString().length !== 13 || typeof (gogn.isbn13) !== 'number') {
    const answ2 = {
      field: 'Isbn13',
      Error: ' Isbn13 has to be 13 characters and can only be Integers. ',
    };
    fylki.push(answ2);
  }
  if (typeof (gogn.description) !== 'string') {
    const answ3 = {
      field: 'Description',
      Error: ' Description can only be of the type String. ',
    };
    fylki.push(answ3);
  }
  if (gogn.isbn10.toString().length > 99) {
    const answ4 = {
      field: 'Isbn10',
      Error: ' Isbn10 has the maximum length of 99, do not go over that limit. ',
    };
    fylki.push(answ4);
  }
  if (gogn.published.length > 99) {
    const answ5 = {
      field: 'Published',
      Error: ' Published has the maximum length of 99, do not go over that limit. ',
    };
    fylki.push(answ5);
  }
  if (typeof (gogn.pagecount) !== 'number' || gogn.pagecount < 0) {
    const answ6 = {
      field: 'Pagecount',
      Error: ' Pagecount can only include Integer and it can not be a number under cero. ',
    };
    fylki.push(answ6);
  }
  if (gogn.language.length !== 2) {
    const answ7 = {
      field: 'Language',
      Error: ' The length of Language can only be 2. ',
    };
    fylki.push(answ7);
  }
  if (gogn.category.length === 0 || gogn.category.length > 99) {
    const answ8 = {
      field: 'category',
      Error: ' category can not be null or longer than 99 letters. ',
    };
    fylki.push(answ8);
  }
  return fylki;
}

/**
 * Errorhandler a username/password,
 * skodar i register/login hvort inntak a username/pw se rett.
 * @param {any} username
 * @param {any} password
 */
function errorHandler(username, password,name) {
  const fylki = [];
  if (password.length < 6) {
    const error = {
      error: 'Password must be 6 characters of length minimum',
    };
    fylki.push(error);
  }
  if (username.length < 3) {
    const error = {
      error: 'Username must be 3 characters of length minimum',
    };
    fylki.push(error);
  }
  if (name.length < 0) {
    const error = {
      error: 'Name must not be empty',
    };
    fylki.push(error);
  }
  return fylki;
}
/**
 * bookTemplate kemur i veg fyrir ad book taki a moti rongu snidi.
 * Skilar incorrect format ef eitthvad passar ekki upp.
 * @param {any} data
 */
function testBookTemplate(data) {
  const fylki = [];
  if (!(Object.prototype.hasOwnProperty.call(data, 'title'))) {
    fylki.push({
      Error: 'Incorrect format',
    });
  } else if (!(Object.prototype.hasOwnProperty.call(data, 'author'))) {
    fylki.push({
      Error: 'Incorrect format',
    });
  } else if (!(Object.prototype.hasOwnProperty.call(data, 'description'))) {
    fylki.push({
      Error: 'Incorrect format',
    });
  } else if (!(Object.prototype.hasOwnProperty.call(data, 'isbn10'))) {
    fylki.push({
      Error: 'Incorrect format',
    });
  } else if (!(Object.prototype.hasOwnProperty.call(data, 'isbn13'))) {
    fylki.push({
      Error: 'Incorrect format',
    });
  } else if (!(Object.prototype.hasOwnProperty.call(data, 'published'))) {
    fylki.push({
      Error: 'Incorrect format',
    });
  } else if (!(Object.prototype.hasOwnProperty.call(data, 'language'))) {
    fylki.push({
      Error: 'Incorrect format',
    });
  } else if (!(Object.prototype.hasOwnProperty.call(data, 'category'))) {
    fylki.push({
      Error: 'Incorrect format',
    });
  }
  return fylki;
}
module.exports = {
  errorHandler,
  postBooksError,
  postCategoriesError,
  testBookTemplate,
};
