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
 * Fetches the current state of the comment section and builds it in the DOM
*/
function getCommentSection(){
  const maxComment = document.getElementById('maximumComments').value;
  const maxCommentIndex = document.getElementById('maximumComments').selectedIndex;
  const filter = document.getElementById('filter').value;
  const url = "/load-comments?maximumComments=" + maxComment.toString() + "&" + "filter=" + filter;
  
  fetch(url, {method: 'GET'}).then(response => response.json()).then((comments) => {
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
  var pos = dateString.indexOf("GMT")-10;
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

  for (i = 1; i < rating; i++) {
    headerElement.appendChild(starFull.cloneNode(true));
  }

  if (rating != 5) {
    headerElement.appendChild(starEmpty);
    for (i = 1; i < (5 - rating); i++) {
      headerElement.appendChild(starEmpty.cloneNode(true));
    }
  }
  
  return headerElement;
}

/* postComment by with POST request */
function postComment(event) {
  event.preventDefault();
  if (validateComment()) {
    const params = new URLSearchParams();
    params.append('name', document.getElementById('name').value);
    params.append('rating', document.getElementById('rating').value);
    params.append('body', document.getElementById('body').value);
    fetch('/new-comment', {method: 'POST', body: params}).then(location.reload());
  }
}

/** Tells the server to delete one comment. */
function deleteComment(comment) {
  const params = new URLSearchParams();
  params.append('id', comment.id);
  let response = fetch('/delete-comment', {method: 'POST', body: params}).then(location.reload());
}

/** Tells the server to show input password field. */
function showAdminPwdField() {
  var adminField = document.getElementById('admin-pwd-field');
  if (adminField.style.display === "none") {
    adminField.style.display = "inline-block";
    adminField.style.position = "relative";
    adminField.style.top = "-10px";
  } else {
      adminField.style.display = "none";
  }
}

/** Deletes all comments if password is correct. */
function validatePWD() {
  var pwd = document.getElementById('pwd').value;
  if (pwd === "commentBonanza") {
    return true;
  } else if (pwd === "") {
      document.getElementById('incorrect-pwd').innerText = "Please enter a password";
  } else {
      document.getElementById('incorrect-pwd').innerText = "Password Incorrect";
  }
  return false;
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
