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

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.google.gson.Gson;
import com.google.sps.classes.Comment;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/** Servlet responsible for listing comments. */
@WebServlet("/load-comments")
public class LoadCommentsServlet extends HttpServlet {

  int maximumComments = 10;

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    Query query = new Query("Comment").addSort("timestamp", SortDirection.DESCENDING);

    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    PreparedQuery results = datastore.prepare(query);

    int count = 0;
    List<Comment> comments = new ArrayList<>();
    comments.add(new Comment(0, "", Integer.toString(results.countEntities()), 0, 0));
    for (Entity entity : results.asIterable()) {
      if (count == maximumComments) {
        break;
      }
      long id = entity.getKey().getId();
      String name = (String) entity.getProperty("name");
      String body = (String) entity.getProperty("body");
      int rating = ((Long)entity.getProperty("rating")).intValue();
      long timestamp = (long) entity.getProperty("timestamp");

      Comment comment = new Comment(id, name, body, rating, timestamp);
      comments.add(comment);
      count++;
    }

    Gson gson = new Gson();

    response.setContentType("application/json;");
    response.getWriter().println(gson.toJson(comments));
    return;
  }

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    // Get the input from the form.
    maximumComments = getMaxComments(request);

    response.sendRedirect("/index.html");
    return;
  }

  /** Returns the choice entered by the user, or -1 if the choice was invalid. */
  private int getMaxComments(HttpServletRequest request) {
    // Get the input from the form.
    String maxCommentsString = request.getParameter("maximumComments");

    // Convert the input to an int.
    int maxCommentsInt;
    if (maxCommentsString.equals("30+")) {
        maxCommentsInt = -1;
    } else {
        try {
          maxCommentsInt = Integer.parseInt(maxCommentsString);
        } catch (NumberFormatException e) {
          System.err.println("Could not convert to int: " + maxCommentsString);
          return -2;
        }
    }

    return maxCommentsInt;
  }
}
