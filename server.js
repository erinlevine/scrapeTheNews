// Dependencies
var express = require("express");
var bodyParser = require("body-parser");

var PORT = process.env.PORT || 3000;

var logger = require("morgan");
var mongoose = require("mongoose");
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");
var request = require("request");
var cheerio = require("cheerio");

mongoose.Promise = Promise;



var app = express();


app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));


app.use(express.static("public"));

// Database configuration with mongoose
// var databaseURL = "mongodb://localhost/scraper";

mongoose.connect("mongodb://heroku_ls66r1mt:vv80gfa6vcd6eqdbvnu37m6vgt@ds025389.mlab.com:25389/heroku_ls66r1mt");
var db = mongoose.connection;

console.log("Hi");

// mongoose.connect(databaseURL);





// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});



app.get("/scrape", function(req, res) {
  console.log("Made it here");
  // Requesting for from the URL 
  request("https://www.reddit.com/r/bigbrother/", function(error, response, html) {
    // Use cheerio
    var $ = cheerio.load(html);
    // Grabbing every p.title from each article
     $("p.title").each(function(i, element) {

      
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(element).children().text();
      result.link = $(element).children().attr("href");
      


    
      var entry = new Article(result);

      // Saving into the DB
      entry.save(function(err, doc) {
        
        if (err) {
          console.log(err);
        }
        
        else {
          console.log(doc);
        }
      });
  });
  // Redirecting to the route.
  res.redirect("/");
});
});

// Getting the articles from the DB:
app.get("/articles", function(req, res) {
  // Grabbing everything that is within the articles array
  Article.find({}, function(error, doc) {
    
    if (error) {
      console.log(error);
    }
   
    else {
      res.json(doc);
    }
  });
});

// Getting articles by their ID.
app.get("/articles/:id", function(req, res) {
  // Finding a matching ID within our DB
  Article.findOne({ "_id": req.params.id })
  // using the populate method
  .populate("note")
  
  .exec(function(error, doc) {
   
    if (error) {
      console.log(error);
    }
    
    else {
      res.json(doc);
    }
  });
});


// Creating a new note
app.post("/articles/:id", function(req, res) {
  
  var newNote = new Note(req.body);

  // Saving the note within the DB
  newNote.save(function(error, doc) {
   
    if (error) {
      console.log(error);
    }
    
    else {
      //finding the ID within the DB and pushing it
      Article.findOneAndUpdate({ "_id": req.params.id }, { $push: { "note": doc._id }}, {new : true })
      
      .exec(function(err, doc) {
        
        if (err) {
          console.log(err);
        }
        else {
          
          res.send(doc);
        }
      });
    }
  });
});

// GET route to delete a note
app.get("/notes/:id", function(req, res){
  //Removing the note based upon it's ID
  Note.remove({"_id": req.params.id}, function(err, doc){
    if (err){
      console.log(err);
    }
    else {
      //Redirecting to the route
      res.redirect("/");
    }
  })
})


app.listen(PORT, function() {
  console.log("App running on port " + PORT);
});
