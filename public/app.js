//scrape data
$(document).ready(function() {
  $("#scrape").on("click", function() {
    $.get("/scrape", function(data) {
      console.log("data scraped");
    });
  });
  //SAVE ARTICLE
  $(document).on("click", ".save", function() {
    var article = $(this)
      .parent()
      .attr("data-id");
    // console.log(article);
    $.get("/save/" + article, function(data) {
      alert("Article saved!");
    });
  });
  // DELETE ARTICLE FROM SAVED
  $(document).on("click", ".delete", function() {
    var id = $(this).attr("data-id");
    $.ajax("/delete/" + id, {
      type: "PUT"
    }).then(function() {
      location.reload();
    });
  });
  //add note
  $(document).on("click", ".note", function() {
    var id = $(this).attr("data-id");
    $(".notesBox").show();
    $.get("/note/" + id).then(function(data) {
      console.log(data);
    });
  });

  // $(document).on("click", ".saveNote", function() {
  //   var note = $("#noteText").val();
  //   var id = $(this).attr("data-id");
  //   $("#noteText").val("");
  //   $.post("/note/" + id, { note: note }).then(function(data) {
  //     console.log(data);
  //   });
  // });
});
