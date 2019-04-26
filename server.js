const express = require("express");
var exphbs = require("express-handlebars");
const mongoose = require("mongoose");
const axios = require("axios");
const cheerio = require("cheerio");
const db = require("./models");

const PORT = process.env.PORT || 3000;
const app = express();

//Middleware
app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());
app.use(express.static(__dirname + "/public"));

//Handlebars
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main"
  })
);
app.set("view engine", "handlebars");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost/MongoScraper";

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true
});


// Routes

// A GET route for scraping the echoJS website
app.get("/api/scrape", function (req, res) {
  // First, we grab the body of the html with axios
  axios.get("https://www.cheaptickets.com/Destinations-In-United-States-Of-America.d201.Flight-Destinations").then(function (response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $("div.flex-content").each(function (i, element) {
      // Save an empty result object
      var result = {};
      // Add the text and href of every link, and save them as properties of the result object
      result.date = $(this)
        .find(
          "div.flex-area-primary > div > div.flight-listing.flight-title.date-range"
        )
        .text()
        .trim();

      result.fromShort = $(this)
        .find(
          "div.flex-area-primary > div > div.flight-listing.OD-color.flight-from > div"
        )
        .text()
        .trim();
      result.from = $(this).find(
          "div.flex-area-primary > div > div.flight-listing.OD-color.flight-from > small"
        )
        .text()
        .trim();
      result.toShort = $(this).find("div.flex-area-primary > div > div.flight-listing.OD-color.flight-to > div").text().trim();
      result.to = $(this).find("div.flex-area-primary > div > div.flight-listing.OD-color.flight-to > small").text().trim();
      result.price = $(this).find("div.flex-area-secondary > div > strong").text().trim();


      console.log(result);

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function (dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function (err) {
          // If an error occurred, log it
          console.log(err);
        });
    });

    // Send a message to the client
    res.send("Scrape Complete");
  });
});
//Render home page
app.get("/", (req, res) => {
  res.render("home");
});

//Display articles on load
app.get("/articles", (req, res) => {
  db.Article.find({
      saved: false
    })
    .sort({
      createdAt: -1
    })
    .then(dbArticles => {
      res.json(dbArticles);
    })
    .catch(err => {
      res.json(err);
    });
});

//Load saved articles
app.get("/saved", (req, res) => {
  db.Article.find({
      saved: true
    })
    .sort({
      createdAt: -1
    })
    .then(results => {
      res.render("saved", {
        articles: results
      });
    });
});


//Save an article for later
app.put("/api/save", (req, res) => {
  db.Article.updateOne({
    _id: req.body.id
  }, {
    $set: {
      saved: true,
      createdAt: new Date()
    }
  }).then(record => {
    res.json(record);
  });
});

//Remove an article from saved
app.put("/api/delete", (req, res) => {
  db.Article.updateOne({
    _id: req.body.id
  }, {
    $set: {
      saved: false
    }
  }).then(
    record => {
      res.json(record);
    }
  );
});

//Load comments for and article
app.get("/api/comments/:id", (req, res) => {
  db.Article.findOne({
      _id: req.params.id
    })
    .populate("comment")
    .then(response => {
      res.json(response);
    })
    .catch(err => {
      res.json(err);
    });
});

//Add comment to an article
app.post("/api/addcomment/:id", (req, res) => {
  db.Comment.create(req.body).then(dbComment => {
    return db.Article.findOneAndUpdate({
      _id: req.params.id
    }, {
      $push: {
        comment: dbComment._id
      }
    }, {
      new: true
    }).then(dbArticle => {
      res.json(dbComment);
    });
  });
});

//Delete a comment from an article
app.delete("/api/deletecomment/:id", (req, res) => {
  db.Comment.deleteOne({
    _id: req.params.id
  }).then(result => {
    res.json(result);
  });
});

app.listen(PORT, () => {
  console.log("App running on port " + PORT + "!");
});