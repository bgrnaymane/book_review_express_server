const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  // Extract username and password from request body
  const { username, password } = req.body;

  // Check if username or password is not provided
  if (!username || !password) {
      return res.status(400).json({ message: "Benutzername und Passwort müssen angegeben werden." });
  }

  // Check if the username already exists
  const userExists = users.some(user => user.username === username);
  if (userExists) {
      return res.status(409).json({ message: "Benutzername existiert bereits." });
  }

  // Register the new user
  // Here you would typically hash the password and then store the user
  // For this example, we're directly adding the user
  users.push({ username, password });

  // Return success message
  return res.status(201).json({ message: "Neuer Benutzer erfolgreich registriert." });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  // Angenommen, `books` ist ein Objekt mit ISBN als Schlüssel und Buchdetails als Wert
  let bookList = Object.values(books); // Konvertiert das Buchobjekt in ein Array von Buchdetails

  // Überprüft, ob Bücher vorhanden sind
  if (bookList.length > 0) {
      return res.status(200).json(bookList); // Gibt die Buchliste zurück
  } else {
      return res.status(404).json({message: "Keine Bücher gefunden"}); // Keine Bücher vorhanden
  }
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbnToFind = parseInt(req.params.isbn);

  let foundBook = null;
  for (let key in books) {
      if (books[key].isbn === isbnToFind) {
          foundBook = books[key];
          break;
      }
  }

  if (foundBook) {
      return res.status(200).json(foundBook);
  } else {
      return res.status(404).json({ message: "Kein Buch mit der ISBN " + isbnToFind + " gefunden." });
  }
});

  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  // Extract the author's name from the request parameters
  const authorToFind = req.params.author;

  // Obtain all the keys for the 'books' object
  const bookKeys = Object.keys(books);

  // Find all books by the specified author
  let foundBooks = bookKeys.filter(key => books[key].author === authorToFind).map(key => books[key]);

  // Check if any books were found
  if (foundBooks.length > 0) {
      // Return the found books
      return res.status(200).json(foundBooks);
  } else {
      // No books found by that author, return a 'not found' message
      return res.status(404).json({ message: "Keine Bücher vom Autor " + authorToFind + " gefunden." });
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  // Extract the title from the request parameters
  const titleToFind = req.params.title;

  // Obtain all the keys for the 'books' object
  const bookKeys = Object.keys(books);

  // Find all books that match the specified title
  let foundBooks = bookKeys.filter(key => books[key].title === titleToFind).map(key => books[key]);

  // Check if any books were found
  if (foundBooks.length > 0) {
      // Return the found books
      return res.status(200).json(foundBooks);
  } else {
      // No books found with that title, return a 'not found' message
      return res.status(404).json({ message: "Keine Bücher mit dem Titel " + titleToFind + " gefunden." });
  }
  return res.status(300).json({message: "Yet to be implemented"});
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  // Extract the ISBN from the request parameters and parse it to an integer
  const isbnToFind = parseInt(req.params.isbn);

  // Find the book with the given ISBN
  let foundBook = null;
  for (let key in books) {
      if (books[key].ISBN === isbnToFind) {
          foundBook = books[key];
          break;
      }
  }

  // Check if the book exists
  if (foundBook) {
      // Check if the book has any reviews
      if (Object.keys(foundBook.reviews).length > 0) {
          // Return the reviews of the book
          return res.status(200).json(foundBook.reviews);
      } else {
          // No reviews found for the book
          return res.status(404).json({ message: "Keine Rezensionen für das Buch mit der ISBN " + isbnToFind + " gefunden." });
      }
  } else {
      // Book not found
      return res.status(404).json({ message: "Kein Buch mit der ISBN " + isbnToFind + " gefunden." });
  }
});

module.exports.general = public_users;
