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
  if (slideIndex <= 1) {
    slideIndex = 9
  } else {
    slideIndex -= 2;
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

