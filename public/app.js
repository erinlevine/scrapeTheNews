
$.getJSON("/articles", function(data) {
  // Looping through each article
  for (var i = 0; i < data.length; i++) {
    // Displaying by appending the information to the page
    $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
  }
});

//On click event whenever a user clicks the "p" tag (an article):
$(document).on("click", "p", function() {
  // Emptying the notes:
  $("#notes").empty();
  // Saving the ID.
  var thisId = $(this).attr("data-id");

  // Creating an AJAX call
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // Appending the note information to the page
    .done(function(data) {
      console.log(data);
      // The title:
      $("#notes").append("<h2>");
      // Entering a new title:
      $("#notes").append("<input id='titleinput' name='title' >");
      // Text body:
      $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
      // Button to submit a new note with also the ID attached. 
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

      // If there's a note in the article. Also included a button so that the user can delete the note from the page:
      if (data.note) {
        var notes = data.note; 
        notes.forEach(function(notes){
          $("#notes").append("<p><b>" + notes.title + "</b></p>");
          $("#notes").append("<p>" + notes.body + "</p>");
          $("#notes").append("<form action='/notes/" + notes._id + "' method='get'><button type='submit' class='btn btn-primary'>Delete!</button></form");
        })
      }

    });
});

// When you click the savenote button
$(document).on("click", "#savenote", function() {
  // Grabbing the ID:
  var thisId = $(this).attr("data-id");

  // Changing the note using a POST request
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // value of the title
      title: $("#titleinput").val(),
      // Value of the text area of the actual note
      body: $("#bodyinput").val()
    }
  })
    
    .done(function(data) {
      
      console.log(data);
      // Clearing the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});









