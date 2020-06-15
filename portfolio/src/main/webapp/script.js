// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/* 
 * Run all the onload() functions.
 */
function frontPageLoad() {
  showSlides();
  getCommentSection();
  loginFP();
}

/* 
 * Run all the onload() functions.
 */
function galleryLoad() {
  loginGallery();
  fetchBlobstoreUrlAndShowForm();
  generateImageGallery();
}

function fetchBlobstoreUrlAndShowForm() {
  fetch('/blobstore')
      .then((response) => {
        return response.text();
      })
      .then((imageUploadUrl) => {
        const messageForm = document.getElementById('image-submission-form');
        messageForm.action = imageUploadUrl;
      });
}

var asyncRequest;

/* 
 * Run login servlet, check if user is logged in and edit the front page accordingly
 */ 
function loginFP() {
  try
    {
      // Use AJAX to communicate asynchronously with login servlet
      asyncRequest = new XMLHttpRequest();
      // When the state of the request changes, run stateChange() function
      asyncRequest.addEventListener("readystatechange", stateChangeFP, false);
      asyncRequest.open('GET', '/login', true);
      asyncRequest.send(null);
    }
    catch(exception)
   {
    alert("Request failed");
   }
}

/* 
 * Run login servlet, check if user is logged in and edit the gallery page accordingly
 */ 
function loginGallery() {
  try
    {
      // Use AJAX to communicate asynchronously with login servlet
      asyncRequest = new XMLHttpRequest();
      // When the state of the request changes, run stateChange() function
      asyncRequest.addEventListener("readystatechange", stateChangeGallery, false);
      asyncRequest.open('GET', '/login', true);
      asyncRequest.send(null);
    }
    catch(exception)
   {
    alert("Request failed");
   }
}

/* 
 * When asyncRequest is done, display the servlet response on the DOM
 */ 
function stateChangeFP() {
  if (asyncRequest.readyState == 4 && asyncRequest.status == 200) {
    var homePageMsg = document.getElementById("DOMDisplay");
    var commentSubmissionForm = document.getElementById("comment-submission-form");
    var deleteAllbtn = document.getElementById("delete-all");
    // If user is logged in, display comment submission form
    if (asyncRequest.responseText.toString().includes("You are logged in")) {
      commentSubmissionForm.style.display = "block";
      deleteAllbtn.style.display = "none";
    } else if (asyncRequest.responseText.toString().includes("You are an admin")) {
      commentSubmissionForm.style.display = "block";
      deleteAllbtn.style.display = "block";
    } else {
      commentSubmissionForm.style.display = "none";
      deleteAllbtn.style.display = "none";
    }
    // Display response from servlet
    homePageMsg.innerHTML = asyncRequest.responseText;
  }
}

/* 
 * When asyncRequest is done, display the servlet response on the DOM
 */ 
function stateChangeGallery() {
  if (asyncRequest.readyState == 4 && asyncRequest.status == 200) {
    var galleryMsg = document.getElementById("galleryLoginMsg");
    var imageSubmissionForm = document.getElementById("image-submission-form");
    var deleteAllbtn = document.getElementById("delete-all-imgs");
    // If user is logged in, display comment submission form
    if (asyncRequest.responseText.toString().includes("You are logged in")) {
      imageSubmissionForm.style.display = "block";
      deleteAllbtn.style.display = "none";
    } else if (asyncRequest.responseText.toString().includes("You are an admin")) {
      imageSubmissionForm.style.display = "block";
      deleteAllbtn.style.display = "block";
    } else {
      imageSubmissionForm.style.display = "none";
      deleteAllbtn.style.display = "none";
    }
    // Display response from servlet
    galleryMsg.innerHTML = asyncRequest.responseText;
  }
}

/*
 * Fetches the current state of the comment section and builds it in the DOM
 */
function getCommentSection() {
    const maxComment = document.getElementById('maximumComments').value;
    const maxCommentIndex = document.getElementById('maximumComments').selectedIndex;
    const filter = document.getElementById('filter').value;
    const url = "/load-comments?maximumComments=" + maxComment.toString() + "&filter=" + filter;

    fetch(url, {
        method: 'GET'
    }).then(response => response.json()).then((comments) => {
        const totalComments = document.getElementById('total');
        if (comments[0].body === "1") {
            totalComments.innerText = comments[0].body + " Comment";
        } else {
            totalComments.innerText = comments[0].body + " Comments";
        }
        delete comments[0];

        document.getElementById('maximumComments').selectedIndex = maxCommentIndex;

        const commentHistoryElement = document.getElementById('history');
        commentHistoryElement.innerHTML = '';
        comments.forEach((comment) => {
            commentHistoryElement.appendChild(createCommentElement(comment));
        })
    });
}

/** Creates an element that represents a comment, including its delete button. */
function createCommentElement(comment) {
    const commentElement = document.createElement('li');
    commentElement.className = 'comment-element';

    const deleteButtonElement = document.createElement('button');
    deleteButtonElement.className = "far fa-trash-alt media-btns";
    deleteButtonElement.style.padding = "0px";
    deleteButtonElement.style.display = "none";
    deleteButtonElement.addEventListener('click', () => {
        // Remove from datastore
        deleteComment(comment);
    });

    commentElement.addEventListener('mouseenter', () => {
        deleteButtonElement.style.display = "block";
    })
    commentElement.addEventListener('mouseleave', () => {
        deleteButtonElement.style.display = "none";
    })


    const commentContent = document.createElement('div');
    commentContent.className = 'comment-content text'

    const headerElement = createCommentHeader(comment);

    const bodyElement = document.createElement('li');
    bodyElement.className = 'text';
    bodyElement.style.fontSize = '15px'
    bodyElement.innerText = comment.body;

    const dateElement = document.createElement('span');
    dateElement.className = 'comment-date text';

    var date = new Date(comment.timeStamp);
    var dateString = date.toString();
    var pos = dateString.indexOf("GMT") - 10;
    dateElement.innerText = dateString.substring(0, pos);

    commentContent.appendChild(headerElement);
    commentContent.appendChild(bodyElement);
    commentContent.appendChild(dateElement);
    commentElement.appendChild(commentContent);
    commentElement.appendChild(deleteButtonElement);

    return commentElement;
}

/** Helper function to build rating in comments */
function createCommentHeader(comment) {
    const headerElement = document.createElement('li');
    headerElement.className = 'comment-header';
    const nameElement = document.createElement('span');
    nameElement.className = 'comment-name';

    headerElement.style.fontSize = '14px';

    nameElement.innerText = comment.name + " - ";
    nameElement.style.fontWeight = 'bold';

    headerElement.appendChild(nameElement);

    const starFull = document.createElement('button');
    starFull.className = "fas fa-star rating-btns";
    const starEmpty = document.createElement('button');
    starEmpty.className = "far fa-star rating-btns";

    headerElement.appendChild(starFull);
    const rating = parseInt(comment.rating);

    for (star = 1; star < rating; star++) {
        headerElement.appendChild(starFull.cloneNode(true));
    }

    if (rating != 5) {
        headerElement.appendChild(starEmpty);
        for (star = 1; star < (5 - rating); star++) {
            headerElement.appendChild(starEmpty.cloneNode(true));
        }
    }

    return headerElement;
}

/* postComment by with POST request */
async function postComment(event) {
    event.preventDefault();
    if (validateComment()) {
        const params = new URLSearchParams();
        params.append('name', document.getElementById('name').value);
        params.append('rating', document.getElementById('rating').value);
        params.append('body', document.getElementById('body').value);
        await fetch('/new-comment', {
            method: 'POST',
            body: params
        });
        resetCommentSection();
        document.getElementById('body').value = "";
        document.getElementById('name').value = "";
        document.getElementById('rating').value = "0";
    }
}

/** Tells the server to delete one comment. */
async function deleteComment(comment) {
    const params = new URLSearchParams();
    params.append('id', comment.id);
    await fetch('/delete-comment', {
        method: 'POST',
        body: params
    }).then(response => response.text()).then((responseText) => {
        var toWrite = document.getElementById("DeleteError");
        toWrite.innerText = responseText;
    });

    resetCommentSection();
}

/** Submits comment if non-empty and if it contains no html, script tags */
function validateComment() {
    var body = document.getElementById('body').value;
    var name = document.getElementById('name').value;
    var rating = document.getElementById('rating').value;


    const commentError = document.getElementById('comment-blank');
    const nameError = document.getElementById('name-blank');
    const ratingError = document.getElementById('rating-blank');
    const injectionError = document.getElementById('injection-error');

    // If comment contains any html of javascript don't submit the form
    if ((body.includes("<html>")) || (body.includes("<script>")) || (name.includes("<html>")) || (name.includes("<script>"))) {
        injectionError.style.display = "block";
        return false;
    } else {
        injectionError.style.display = "none";

    }
    // If name, body, or both are empty don't submit the form
    if ((body === "") || (name === "") || (rating == 0)) {
        if (body === "") {
            commentError.style.display = "block";
        } else {
            commentError.style.display = "none";
        }
        if (name === "") {
            nameError.style.display = "block";
        } else {
            nameError.style.display = "none";
        }
        if (rating == 0) {
            ratingError.style.display = "block";
        } else {
            ratingError.style.display = "none";
        }
        return false;
    } else {
        commentError.style.display = "none";
        nameError.style.display = "none";
        ratingError.style.display = "none";
    }
    return true;
}

var slideIndex = 1;
var slideInterval = window.setInterval(function(){
  showSlides();
}, 2500);

function showSlides() {
  var gallery = document.getElementById('gallery');

  if (gallery.hasChildNodes()) {
    gallery.removeChild(gallery.firstChild);
  }

  var myImg = document.createElement('img');
  var source = "images/gallery"+slideIndex+".jpg";
  myImg.src = source;
  myImg.className = "gallery-img fade";
  gallery.appendChild(myImg);
  gallery.style.textAlign = "center";

  var dots = document.getElementsByClassName('dot');
   
  for (dot = 0; dot < 10; dot++) {
    dots[dot].className = dots[dot].className.replace(" active", "");
  }

  dots[slideIndex-1].className += " active";
  slideIndex++;
  if (slideIndex == 11) {slideIndex = 1} 
}

function nextSlide() {
  showSlides();
  resetInterval();
}

function previousSlide() {
  if (slideIndex == 1) {
    slideIndex = 9
  } else {
      
  }
  showSlides();
  resetInterval();
}

function changeSlide(slide) {
  slideIndex = slide;
  showSlides();
  resetInterval();
}

function resetInterval() {
  clearInterval(slideInterval);
  slideInterval = window.setInterval(function(){
      showSlides();
  }, 2500);
}

async function resetCommentSection() {
  getCommentSection();
}


/*
 * Fetches information from the Image Servlet and displays images on the DOM
 */
function generateImageGallery() {
    const url = "/load-images";

    fetch(url, {
        method: 'GET'
    }).then(response => response.json()).then((images) => {
        const imageGallery = document.getElementById('image-gallery');
        imageGallery.innerHTML = '';
        images.forEach((image) => {
            imageGallery.appendChild(createImage(image));
        })
    });
}

/** Creates an element that represents an image, including its caption. */
function createImage(image) {
    const imageElement = document.createElement('li');
    imageElement.className = 'image-element';

    const imageContent = document.createElement('img');
    imageContent.src = image.url;

    const caption = document.createElement('p');
    caption.innerHTML = "<b>Caption:</b> " + image.caption;

    imageElement.appendChild(imageContent);
    imageElement.appendChild(caption);

    return imageElement;
}

/** Creates a map and adds it to the page. */
function initMap() {
  const map = new google.maps.Map(
      document.getElementById('map'), {mapTypeId: 'satellite',
      center: {lat: 37.422, lng: -122.084}, zoom: 16});
}
