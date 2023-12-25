const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();
const jwtSecret = 'YOUR_SECRET_KEY'; // Replace this with a strong secret key

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
  return users.some(user => user.username === username && user.password === password);

}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  // Extract username and password from request body
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
  }

  // Validate credentials
  if (authenticatedUser(username, password)) {
      // User is authenticated, create a JWT token
      const token = jwt.sign({ username: username }, jwtSecret, { expiresIn: '1h' }); // Token expires in 1 hour

      // Send the token in the response
      return res.status(200).json({ message: "Login successful", token: token });
  } else {
      // Authentication failed
      return res.status(401).json({ message: "Invalid username or password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
   // Extract the ISBN and review from the request
   const { isbn } = req.params;
   const { review } = req.body;

   // Validate the request
   if (!isbn || !review) {
       return res.status(400).json({ message: "ISBN and review are required." });
   }

   // Verify JWT token to get the username
   const token = req.headers.authorization?.split(' ')[1]; // Bearer Token
   if (!token) {
       return res.status(401).json({ message: "Unauthorized: No token provided." });
   }

   let username;
   try {
       const decoded = jwt.verify(token, jwtSecret);
       username = decoded.username;
   } catch (error) {
       return res.status(403).json({ message: "Unauthorized: Invalid token." });
   }

   // Check if the user has already reviewed the book
   let book = books.find(b => b.isbn === isbn);
   if (!book) {
       return res.status(404).json({ message: "Book not found." });
   }

   const existingReviewIndex = book.reviews.findIndex(r => r.username === username);
   if (existingReviewIndex !== -1) {
       // Update existing review
       book.reviews[existingReviewIndex].review = review;
   } else {
       // Add new review
       book.reviews.push({ username, review });
   }

   return res.status(200).json({ message: "Review updated successfully." });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;

  // Validate ISBN
  if (!isbn) {
      return res.status(400).json({ message: "ISBN is required." });
  }

  // Verify JWT token to get the username
  const token = req.headers.authorization?.split(' ')[1]; // Assuming Bearer token
  if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided." });
  }

  let username;
  try {
      const decoded = jwt.verify(token, jwtSecret);
      username = decoded.username;
  } catch (error) {
      return res.status(403).json({ message: "Unauthorized: Invalid token." });
  }

  // Find the book with the given ISBN
  let book = books.find(b => b.isbn === isbn);
  if (!book) {
      return res.status(404).json({ message: "Book not found." });
  }

  // Filter out the review by the current user
  const initialReviewCount = book.reviews.length;
  book.reviews = book.reviews.filter(review => review.username !== username);

  // Check if a review was actually deleted
  if (book.reviews.length === initialReviewCount) {
      return res.status(404).json({ message: "No review by the user found for this book." });
  }

  return res.status(200).json({ message: "Review deleted successfully." });
});



module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
