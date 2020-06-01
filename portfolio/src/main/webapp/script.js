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

/**
 * Create a promise chain to fetch a string from the Java Servlet and add
   it to the DOM.
 */
function getRandomQuoteUsingArrowFunctions() {

  fetch('/data').then(response => response.text()).then((whatever) => {
    document.getElementById('quote-container').innerText = "For now this servlet is being used for the button below.";
  });
}


/**
 * Fetches stats from the servers and adds them to the DOM.
 */
function getJSONString() {
  fetch('/data').then(response => response.json()).then((myString) => {
    // myString is an object, not a string, so we have to
    // reference its fields to create HTML content

    const stringsListElement = document.getElementById('JSON-strings-container');
    stringsListElement.innerHTML = '';
    
    stringsListElement.appendChild(
        createListElement(myString[0]));
    stringsListElement.appendChild(
        createListElement(myString[1]));
    stringsListElement.appendChild(
        createListElement(myString[2]));
    stringsListElement.appendChild(
        createListElement(myString[3]));
  });
}

/** Creates an <li> element containing text. */
function createListElement(text) {
  const liElement = document.createElement('li');
  liElement.innerText = text;
  return liElement;
}
