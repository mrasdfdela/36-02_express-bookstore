process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");
const Book = require("../models/book");
const ExpressError = require("../expressError");

describe("Express Bookstore Tests", function () {
  let firstBook
  beforeEach(async function () {
    await db.query("DELETE FROM books");

    firstBook = {
      isbn: "0691161518",
      amazon_url: "http://a.co/eobPtX2",
      author: "Matthew Lane",
      language: "english",
      pages: 264,
      publisher: "Princeton University Press",
      title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
      year: 2017,
    };
    await Book.create(firstBook);
  });

  describe("GET /books", function () {
    test("get all books", async function () {
      let resp = await request(app).get("/books");
      let books = JSON.parse(resp.text).books;
      expect(books[0]).toEqual(firstBook);
    });
  });

  describe("POST /books", function() {
    test("post new book", async function(){
      let newBook = {
        isbn: "0131478710",
        amazon_url: "https://amzn.to/386P4KE",
        author: "L.G. Wade",
        language: "english",
        pages: 1262,
        publisher: "Prentice Hall College Division",
        title: "Organic Chemistry, 6th Ed.",
        year: 2005,
      };
      let resp = await request(app).post("/books").send(newBook);
      let respBook = JSON.parse(resp.text)
      expect(respBook).toEqual({ book: newBook });
    });
    test("post invalid book", async function(){
      let newBook = {
        isbn: "0131478710",
        amazon_url: "https://amzn.to/386P4KE",
        author: "L.G. Wade",
        language: 13,
        pages: 1262,
        publisher: "Prentice Hall College Division",
        title: "Organic Chemistry, 6th Ed.",
        year: 2005,
      };
      let resp = await request(app).post("/books").send(newBook);
      expect(resp.statusCode).toEqual(400);
    });
  });

  describe("GET /books/[isbn]", function() {
    test("get book by isbn", async function(){
      let resp = await request(app).get(`/books/${firstBook.isbn}`);
      expect(resp.body).toEqual({book:firstBook});
    });
    test("get book by invalid isbn", async function () {
      let resp = await request(app).get(`/books/${firstBook.isbn}1`);
      expect(resp.statusCode).toEqual(404);
    });
  });

  describe("PUT /books/[isbn]", function() {
    test("updated book by isbn", async function () {
      firstBook.language = "en";
      let resp = await request(app).put(`/books/${firstBook.isbn}`).send(firstBook);
      let book = JSON.parse(resp.text)
      expect(book).toEqual({ book: firstBook });
    });
    test("updated book by isbn", async function () {
      firstBook.language = 13;
      let resp = await request(app)
        .put(`/books/${firstBook.isbn}`)
        .send(firstBook);
      expect(resp.statusCode).toEqual(400);
    });
  });

  describe("DELETE /books/[isbn]", function() {
    test("delete book by isbn", async function () {
      await request(app).delete(`/books/${firstBook.isbn}`);
      let resp = await request(app).get('/books');
      let noBooks = JSON.parse(resp.text).books;
      expect(noBooks).toEqual([]);
    });
    test("delete book by invalid isbn", async function () {
      let resp = await request(app).delete(`/books/${firstBook.isbn}1`);
      expect(resp.statusCode).toEqual(404);
    });
  });
});
