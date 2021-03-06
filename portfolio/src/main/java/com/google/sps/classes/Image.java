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

package com.google.sps.classes;

import java.util.ArrayList;
import java.util.List;

/**
 * Class representing an individual comment.
 *
 * <p>Note: The private variables in this class are converted into JSON.
 */
public final class Image {

    private final long id;
    private final String url;
    private final String caption;
    private final long timeStamp;

    public Image(long id, String url, String caption, long timeStamp) {
        this.id = id;
        this.url = url;
        this.caption = caption;
        this.timeStamp = timeStamp;
    }
}
