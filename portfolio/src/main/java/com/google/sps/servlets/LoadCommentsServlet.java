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

    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        Query query = new Query("Comment");

        String[] filter = request.getParameter("filter").split(",");

        // Not sure how to append sortType[1] to SortDirection method call without converting it to a string
        if (filter[1].equals("DESCENDING")) {
            query.addSort(filter[0], SortDirection.DESCENDING);
        } else {
            query.addSort(filter[0], SortDirection.ASCENDING);
        }

        int maximumComments = Integer.parseInt(request.getParameter("maximumComments"));

        DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
        PreparedQuery results = datastore.prepare(query);
        List < Entity > resultsList = results.asList(FetchOptions.Builder.withDefaults());
        List < Comment > comments = new ArrayList < > ();

        if (maximumComments == 20) {
            maximumComments = resultsList.size();
        }

        comments.add(new Comment(0, "", Integer.toString(resultsList.size()), 0, 0));
        for (int i = 0; i < Math.min(maximumComments, resultsList.size()); i++) {
            Entity entity = resultsList.get(i);
            long id = entity.getKey().getId();
            String name = (String) entity.getProperty("name");
            String body = (String) entity.getProperty("body");
            int rating = ((Long) entity.getProperty("rating")).intValue();
            long timestamp = (long) entity.getProperty("timestamp");

            Comment comment = new Comment(id, name, body, rating, timestamp);
            comments.add(comment);
        }

        Gson gson = new Gson();

        response.setContentType("application/json;");
        response.getWriter().println(gson.toJson(comments));
    }
}
