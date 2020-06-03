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

    var onDisplay = Object.keys(comments).length;
    document.getElementById('maximumComments').selectedIndex = (onDisplay/5).toString();

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
  commentElement.className = 'comment';

  const commentContent = document.createElement('ul');
  commentContent.className = 'comment-content'

  const headerElement = createCommentHeader(comment);

  const bodyElement = document.createElement('li');
  bodyElement.innerText = comment.body;

  const deleteButtonElement = document.createElement('button');
  deleteButtonElement.innerText = 'Delete';
  deleteButtonElement.addEventListener('click', () => {
    // Remove from datastore
    deleteComment(comment);
    getCommentSection();
  });

  commentContent.appendChild(headerElement);
  commentContent.appendChild(bodyElement);
  commentContent.appendChild(deleteButtonElement);
  commentElement.appendChild(commentContent);

  return commentElement;
}

/** Helper function to build rating in comments */
function createCommentHeader(comment) {
  const headerElement = document.createElement('li');
  headerElement.className = 'comment-header';
  const nameElement = document.createElement('span');
  nameElement.className = 'comment-name';
  const ratingElement = document.createElement('span');
  ratingElement.className = 'comment-rating';
  const dateElement = document.createElement('span');
  dateElement.className = 'comment-date';

  headerElement.style.fontSize = '14px';

  nameElement.innerText = comment.name + " - ";
  nameElement.style.fontWeight = 'bold';

  ratingElement.innerText = comment.rating + '/5';

  var date = new Date(comment.timeStamp);
  dateElement.innerText = date;

  headerElement.appendChild(nameElement);
  headerElement.appendChild(ratingElement);
  headerElement.appendChild(document.createElement('br'))
  headerElement.appendChild(dateElement);

  return headerElement;
}

function postComment(event) {
  event.preventDefault();
  if (validateComment()) {
    const params = new URLSearchParams();
    params.append('name', document.getElementById('name').value);
    params.append('rating', document.getElementById('rating').value);
    params.append('body', document.getElementById('body').value);
    fetch('/new-comment', {method: 'POST', body: params}).then(getCommentSection());
  }
}

/** Tells the server to delete one comment. */
function deleteComment(comment) {
  const params = new URLSearchParams();
  params.append('id', comment.id);
  fetch('/delete-comment', {method: 'POST', body: params});
}

/** Tells the server to show input password field. */
function showAdminPwdField() {
  var adminField = document.getElementById('admin-pwd-field');
  if (adminField.style.display === "none") {
    adminField.style.display = "block";
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
  // If comment contains any html of javascript don't submit the form
  if ((body.includes("<html>")) || (body.includes("<script>")) || (name.includes("<html>")) || (name.includes("<script>"))) {
    document.getElementById('injection-error').innerText = "Please don't inject html or javascript into my website :(";
    return false;
  }
  // If name, body, or both are empty don't submit the form
  if ((body === "") && (name === "")) {
    document.getElementById('name-blank').innerText = "Please enter your name";
    document.getElementById('comment-blank').innerText = "Please enter a comment";
    return false;
  } else if (body === "") {
      document.getElementById('comment-blank').innerText = "Please enter a comment";
      return false;
  } else if (name === "") {
      document.getElementById('name-blank').innerText = "Please enter your name";
      return false;
  } else {
      return true;
  }
}
