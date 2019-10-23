var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = process.env.PORT || 8080;

// // Initialize Express
var app = express();

// Configure middleware
// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/test123";
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

// Routes


// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with axios
  axios.get("https://korrespondent.net/ukraine/").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);
    $("div.article_rubric_top").each(function(i, element) {
      var result = {};
      result.title = $(element)
        .find("div.article__title a")
        .text();
      result.link = $(element)
        .find("a")
        .attr("href");
      result.description = $(element)
        .find("div.article__text")
        .text();
      // console.log(result);
      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        });
    });
  });
  res.end();
});
// Route for getting all Articles from the db
app.get("/", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      let hbsObject;
      hbsObject = {
          articles: dbArticle
      };
      res.render("index", hbsObject);   
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});
//route for marking articles as saved
app.get("/save/:id", function (req, res) {
  db.Article.findOneAndUpdate({ _id: req.params.id }, { isSaved: true })
      .then(function (data) {
          res.json(data);
      })
      .catch(function (err) {
          res.json(err);
      });
});
//find saved articles
app.get("/saved", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({isSaved:true})
    .then(function(dbArticle) {
      let hbsObject;
      hbsObject = {
          articles: dbArticle
      };
      res.render("saved", hbsObject);   
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

app.put("/delete/:id", function (req, res) {
  db.Article.findOneAndUpdate({ _id: req.params.id }, { isSaved: false })
      .then(function (data) {
          res.json(data)
      })
      .catch(function (err) {
          res.json(err);
      });
});

app.post("/note/:id", function (req, res) {
     db.Note.create(req.body)
     .then(function (dbNote) {
         return db.Article.findOneAndUpdate({ _id: req.params.id }, {$push: { note: dbNote._id }}, { new: true });
     })
     .then(function (dbArticle) {
       console.log(dbArticle)
         res.json(dbArticle);
     })
     .catch(function (err) {
         res.json(err);
     });
});
app.get("/note/:id", function (req, res) {
  // Grab every document in the Articles collection
  db.Note.find({ _id: req.params.id })
    .then(function(dbNote) {
      let hbsObject;
      hbsObject = {
          note: dbNote
      };
      res.render("saved", hbsObject);   
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});


// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
