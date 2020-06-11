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
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.gson.Gson;
import com.google.sps.classes.Comment;
import java.io.PrintWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/** Servlet responsible for listing comments. */
@WebServlet("/login")
public class AuthServlet extends HttpServlet {

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    response.setContentType("text/html;");
    PrintWriter out = response.getWriter();
    
    // Loggedin users get to see comment input form and logout link
    UserService userService = UserServiceFactory.getUserService();
    if (userService.isUserLoggedIn()) {
      String logoutUrl = userService.createLogoutURL("/index.html");
      String userEmail = userService.getCurrentUser().getEmail();
      if (userService.isUserAdmin()) {
        out.println("You are an admin logged in with " + userEmail + ". Leave a comment/image below, or logout <a href=\"" + logoutUrl + "\">here</a>.");
      } else {
          out.println("You are logged in with " + userEmail + ". Leave a comment/image below, or logout <a href=\"" + logoutUrl + "\">here</a>.");
      }
    } // Otherwise, display loginURL
    else {
      String redirectAfterLogin = "/index.html";
      String loginUrl = userService.createLoginURL(redirectAfterLogin);
      out.println("To leave a comment/image, please login <a href=\"" + loginUrl + "\">here</a> first. I appreciate any feedback on how to make this website better!");
    }
  }
}
