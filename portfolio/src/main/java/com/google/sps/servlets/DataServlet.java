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

package com.google.sps.servlets;
 
import com.google.sps.classes.CommentSection;
import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import com.google.gson.Gson;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
 
/** Servlet that returns a comment section. */
@WebServlet("/comment-section")
public class DataServlet extends HttpServlet {
 
  private CommentSection commentSection = new CommentSection();

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    response.setContentType("application/json");
    String json = new Gson().toJson(commentSection);
    response.getWriter().println(json);
  }

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {

    // Get the input from the form and log it.
    String comment = getComment(request);
    commentSection.logComment(comment);

    // Redirect back to the HTML page.
    response.sendRedirect("/index.html");
  }
  
  /** Returns the comment entered by the user */
  private String getComment(HttpServletRequest request) {
    // Get the input from the form.
    String commentString = request.getParameter("comment");

    return commentString;
  }

  /**
   * Converts a ServerStats instance into a JSON string using the Gson library. Note: We first added
   * the Gson library dependency to pom.xml.
   */
  private String convertToJsonUsingGson(ArrayList<String> myString) {
    Gson gson = new Gson();
    String json = gson.toJson(myString);
    return json;
  }
}
