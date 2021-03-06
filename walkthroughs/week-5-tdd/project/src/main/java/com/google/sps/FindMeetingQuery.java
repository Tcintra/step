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

package com.google.sps;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.HashSet;
import java.util.Set;

public final class FindMeetingQuery {
  public Collection<TimeRange> query(Collection<Event> events, MeetingRequest request) {

    Collection<String> requiredAttendees = request.getAttendees();
    Collection<String> optionalAttendees = request.getOptionalAttendees();
    Collection<TimeRange> blockedTimes = new HashSet<> ();
    Collection<TimeRange> timesToAdd = new HashSet<> ();
    Collection<Event> optionalEvents = new HashSet<> ();

    // EDGE CASE
    if ((requiredAttendees.isEmpty()) && (request.getDuration() < TimeRange.WHOLE_DAY.duration())) {
      if (!optionalAttendees.isEmpty()) {
        timesToAdd.add(TimeRange.WHOLE_DAY);
      }
    }

    // For each event, check if anyone attending the request is also attending that event.
    for (Event event: events) {
      Set<String> intersection = new HashSet<String> (requiredAttendees);
      Set<String> optionalIntersection = new HashSet<String> (optionalAttendees);
      intersection.retainAll(event.getAttendees());
      optionalIntersection.retainAll(event.getAttendees());

      // If one or more requiredAttendees are attending this event, then add it to blockedTimes
      // Otherwise, if any optional attendees are attending this event, then add it to optionalEvents
      if (!intersection.isEmpty()) {
        blockedTimes.add(event.getWhen());
      } else if (!optionalIntersection.isEmpty()) {
        optionalEvents.add(event);
      }
    }

    // Get continuous timeline of blocked events
    Collection<TimeRange> blockedTimeLine = mergeTimeBlocks(blockedTimes);
    // Get available times from helper methods
    timesToAdd = addTimes(blockedTimeLine, request.getDuration());

    // If there are optional attendees, optimize the schedule
    if (!optionalAttendees.isEmpty()) {
      timesToAdd = optimizeForOptionalAttendees(timesToAdd, optionalEvents, request.getDuration(), optionalAttendees, requiredAttendees.isEmpty());
    }

    // Return appropriate timeranges, or an empty array if none
    List<TimeRange> availableTimes = new ArrayList<TimeRange> (timesToAdd);
    Collections.sort(availableTimes, TimeRange.ORDER_BY_START);
    return availableTimes;
  }

  /* Return all the times that are NOT blocked, and are long enough for the meeting */
  private Collection<TimeRange> addTimes(Collection<TimeRange> blockedTimeLine, long meetingDuration) {

    Collection<TimeRange> timesToAdd = new HashSet<> ();
    // Create arraylist so we can index into it
    ArrayList<TimeRange> blockedTimesArrayList = new ArrayList<TimeRange> (blockedTimeLine);
    // Order the blockedTimeLine by the events that happen first
    Collections.sort(blockedTimesArrayList, TimeRange.ORDER_BY_START);


    if (blockedTimeLine.isEmpty()) {
      if (meetingDuration <= TimeRange.WHOLE_DAY.duration()) {
        timesToAdd.add(TimeRange.WHOLE_DAY);
      }
    } else {
      // Go through all the blocked times, add non-blocked periods to timesToAdd
      for (int blockIndex = 0; blockIndex <= blockedTimesArrayList.size(); blockIndex++) {
        int start;
        int end;
        TimeRange toAdd;

        // If this is the first period of the day, start at 0
        if (blockIndex == 0) {
          TimeRange currentBlock = blockedTimesArrayList.get(blockIndex);
          // If the first block starts at 0, skip
          if (currentBlock.start() != TimeRange.START_OF_DAY) {
            start = TimeRange.START_OF_DAY;
            end = currentBlock.start();
          } else {
            continue;
          }
        } else if (blockIndex == blockedTimesArrayList.size()) {
          // Check if the last block of the day ends before midnight, if it does, then add 
          // a free period till midnight
          TimeRange previousBlock = blockedTimesArrayList.get(blockIndex - 1);
          if (previousBlock.end() != TimeRange.END_OF_DAY + 1) {
            start = previousBlock.end();
            end = TimeRange.END_OF_DAY;
          } else {
            continue;
          }
        } else {
          // Create a new free period starting at the end of the previous event
          // and ending at the start of the current event
          TimeRange currentBlock = blockedTimesArrayList.get(blockIndex);
          TimeRange previousBlock = blockedTimesArrayList.get(blockIndex - 1);
          if (previousBlock.end() == currentBlock.start()) {
            continue;
          }
          start = previousBlock.end();
          end = currentBlock.start();
        }

        toAdd = TimeRange.fromStartEnd(start, end, (blockIndex == blockedTimesArrayList.size()));

        // Make sure the non-blocked period is long enough for the meeting request
        if (toAdd.duration()>= meetingDuration) {
          timesToAdd.add(toAdd);
        }
      }
    }

    return timesToAdd;
  }

  /* Takes in a set of timeranges and parses them. Return a continuous, disjoint timeline of the events */
  private Collection<TimeRange> mergeTimeBlocks(Collection<TimeRange> blockedTimes) {

    ArrayList<Integer> startTimes = new ArrayList<> ();
    ArrayList<Integer> endTimes = new ArrayList<> ();
    Collection<TimeRange> blockedTimeline = new HashSet<> ();

    // Get the start and end of all relevant events
    for (TimeRange blockedTime: blockedTimes) {
      startTimes.add(blockedTime.start());
      endTimes.add(blockedTime.end());
    }

    // Sort them in ascending order
    Collections.sort(startTimes);
    Collections.sort(endTimes);

    // Loop through all of the relevant times in the day. Everytime an event starts, we add one to freeness. Every time an event ends
    // we subtract one from freeness. When freeness is zero, we add an event that starts at currentStart and ends at 
    // currentEnd.
    int freeness = 0;
    int currentStart = TimeRange.END_OF_DAY;
    int currentEnd = TimeRange.START_OF_DAY;
    while ((!startTimes.isEmpty()) || (!endTimes.isEmpty())) {

      // If no more events will start, then add an event that ends at the last endTime.
      if (startTimes.isEmpty()) {
        currentEnd = endTimes.get(endTimes.size() - 1);
        TimeRange newTimeBlock = TimeRange.fromStartEnd(currentStart, currentEnd, false);
        blockedTimeline.add(newTimeBlock);
        break;
      }

      // Check whether an event is "ending" or "starting".
      if (endTimes.get(0) <= startTimes.get(0)) {
        if (endTimes.get(0)>= currentEnd) {
          currentEnd = endTimes.get(0);
        }
        endTimes.remove(0);
        freeness--;

      } else if (endTimes.get(0)> startTimes.get(0)) {
        if (startTimes.get(0) <= currentStart) {
          currentStart = startTimes.get(0);
        }
        startTimes.remove(0);
        freeness++;
      }

      // If no event is "open", then create a new timeblock
      if (freeness == 0) {
        TimeRange newTimeBlock = TimeRange.fromStartEnd(currentStart, currentEnd, false);
        blockedTimeline.add(newTimeBlock);
        currentStart = TimeRange.END_OF_DAY;
        currentEnd = TimeRange.START_OF_DAY;
      }
    }

    return blockedTimeline;
  }

  /* Brute Force appraoch to optimize for the optional attendees. Return rmatting the timeranges that fit the most optional attendees */
  private Collection<TimeRange> optimizeForOptionalAttendees(Collection<TimeRange> timesToAdd, Collection<Event> optionalEvents, long meetingDuration, Collection<String> optionalAttendees, boolean noRequiredAttendees) {

    Collection<TimeRange> preferredTimes = new HashSet<> ();
    Collection<TimeRange> betterPeriods = new HashSet<> ();

    // Instead of looping through every minute in the day, loop through every minute in the proposed times and check if there 
    // are any periods where more optional attendees are available
    int currentBest = optionalAttendees.size();
    for (TimeRange period: timesToAdd) {
      for (int minute = period.start(); minute <= period.end() - meetingDuration; minute++) {
        int duration = (int) meetingDuration;
        TimeRange currentPeriod = TimeRange.fromStartDuration(minute, duration);
        Collection<String> attendees = new HashSet<> ();
        // Check which optional attendees are not available during this period
        for (Event event: optionalEvents) {
          if (currentPeriod.overlaps(event.getWhen())) {
            Set<String> intersection = new HashSet<String> (optionalAttendees);
            intersection.retainAll(event.getAttendees());
            attendees.addAll(intersection);
          }
        }
        // If the number of free optional attendees for this period is less than the number of free
        // optional attendees in the proposed set, clear the set and add this period
        if (attendees.size() < currentBest) {
          currentBest = attendees.size();
          betterPeriods.clear();
          betterPeriods.add(currentPeriod);
        } else if (attendees.size() == currentBest) {
          betterPeriods.add(currentPeriod);
        }
      }
    }

    // EDGE CASE
    if ((currentBest == optionalAttendees.size()) && (noRequiredAttendees)) {
      return preferredTimes;
    }

    preferredTimes = mergeTimeBlocks(betterPeriods);
    if ((preferredTimes.size()> 0) || (noRequiredAttendees)) {
      return preferredTimes;
    }

    return timesToAdd;
  }
}
