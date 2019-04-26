//Materialize JS
document.addEventListener("DOMContentLoaded", function () {
  var elems = document.querySelectorAll(".modal");
  var instances = M.Modal.init(elems);
});

$(document).ready(function () {
  $('.sidenav').sidenav();
});
//Load articles when home page loads
$.getJSON("/articles", function (data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    $(".all-articles").append(
      `<div class='col-lg-3 col-sm-6 cardbackground'>
      <div class='accomodation_item text-center'>
      <div class="hotel_img">
                        <img src="http://clipart-library.com/images/8cEbRerRi.png" class='responsive-img' alt="">
                        <button class='btn-small btn theme_btn button_hover save-article red darken-2' data-id='${
                          data[i]._id
                        }'>Save Flight</button>
                    </div>
     
      
      <a href='#'><h5 class='title'>${data[i].from}' to '${data[i].to}</h5></span></a>
      <h5>${data[i].price}<small> Round Trip</small></h5></div></div></div></div></div>`
    );
  }
});


//Scrape articles
$(".scrape").on("click", () => {
  $.ajax("/api/scrape", {
    type: "GET"
  }).then(articles => {
    location.reload();
  });
});

//Save an article
$(document).on("click", ".save-article", function () {
  $.ajax("/api/save", {
      type: "PUT",
      data: {
        id: $(this).attr("data-id")
      }
    })
    .then(result => {
      location.reload();
    })
    .catch(err => {
      console.log(err);
    });
});

//Remove article from saves
$(document).on("click", ".delete-save", function () {
  $.ajax("/api/delete", {
      type: "PUT",
      data: {
        id: $(this).attr("data-id")
      }
    })
    .then(result => {
      location.reload();
    })
    .catch(err => {
      console.log(err);
    });
});

//View comments. Saves id of article your are viewing for use in loading
$(document).on("click", ".article-comments", function () {
  let id = $(this).attr("data-id");
  $(".add-comment").attr("data-id", id);
  loadComments(id);
});

//Load comments of an article. Used when deleting and first viewing comments
function loadComments(id) {
  $(".comment-section").empty();
  $.ajax("/api/comments/" + id, {
    type: "GET"
  }).then(articles => {
    if (articles.comment.length < 1) {
      $(".comment-section").append("<h5>Add Your Comments!</h5");
    } else {
      articles.comment.forEach(comment => {
        let commentId = comment._id;
        let commentBody = comment.body;
        $(".comment-section").append(
          `<div class='comment-box'><p>${commentBody}</p><button data-id='${commentId}' class='btn-small red delete-comment'>X</button></div>`
        );
      });
    }
  });
}

//Add a comment to an article
$(document).on("click", ".add-comment", function (e) {
  e.preventDefault();
  if (
    $(".comment-section").children()[0].innerHTML ===
    "Add comment"
  ) {
    $(".comment-section").empty();
  }
  let id = $(this).attr("data-id");
  let comment = $(".comment-body")
    .val()
    .trim();
  $.ajax("/api/addcomment/" + id, {
    type: "POST",
    data: {
      body: comment
    }
  }).then(dbComment => {
    $(".comment-section").append(
      `<div class='comment-box'><p>${dbComment.body}</p><button data-id='${
        dbComment._id
      }' class='btn-small red delete-comment'>X</button></div>`
    );
    $(".comment-body").val("");
  });
});

//Remove a comment from an article
$(document).on("click", ".delete-comment", function () {
  let commentId = $(this).attr("data-id");
  $.ajax("/api/deletecomment/" + commentId, {
    type: "DELETE",
    data: {
      _id: commentId
    }
  }).then(result => {
    $(".comment-section").empty();
    loadComments($(".add-comment").attr("data-id"));
  });
});