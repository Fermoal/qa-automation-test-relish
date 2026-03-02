# Part 5: KPI Analysis & Test Suite Health Report

## 1. What the Data Tells Us (Trends)
Looking at the table from the last two weeks, it's clear our test suite is getting slower and less reliable:
- **More Fails:** Week 1 looked great (only 14 fails on Friday). But by Friday of Week 2, the fails almost tripled to 41.
- **Taking Longer:** There is a direct link between failing tests and execution time. When 14 tests failed, it took 12m 20s. When 41 tests failed, it took 4 minutes longer (16m 20s). 
- **Ignored Tests:** Every single night, exactly 4 tests are "Skipped". This means we have an old issue that nobody is fixing.

## 2. Proposed KPIs (What we should measure)

**KPI 1: "Fake" Failure Rate (Flakiness)**
- **What it is:** The percentage of failed tests that actually failed because of a random glitch (like a slow loading page), not a real bug.
- **Goal:** Keep this under 5%.
- **Action:** If it goes higher, temporarily turn off the glitchy tests so they don't block the team, and fix them ASAP.

**KPI 2: Average Run Time**
- **What it is:** How long it takes to run all 200 tests.
- **Goal:** Keep it under 15 minutes so developers get fast feedback.
- **Action:** If it takes too long, look for ways to run tests at the same time (in parallel) or remove any hardcoded waiting times in our code.

**KPI 3: Age of Skipped Tests**
- **What it is:** How many days a test stays in the "Skipped" pile without being fixed.
- **Goal:** Less than 5 days.
- **Action:** If a test is skipped for too long, either assign someone to fix it or delete it. Dead tests just clutter the project.

## 3. Why is this happening? (My thoughts and experience-hypothesis)

**Analysis A: Tests are waiting too long and giving up (Timeouts)**
Because the suite takes 4 extra minutes on days with a lot of fails, the tests are probably waiting for elements (like a button) to appear on the screen. When the element doesn't show up, the test waits until the maximum time limit before failing. All those long waiting periods add up and make the whole run slower.

**Analysis B: The test website is getting slower**
The test code might be completely fine, but the website itself became slower during Week 2. Because the pages take longer to load, the tests run out of patience and fail.

## 4. Recommendations for Next Sprint 

To get things back on track next week, we should:
1. **Pause the noisy tests:** Look at the 41 tests that failed on Friday. Temporarily skip the unstable ones so the test suite can be "green" again and developers can trust the results.
2. **Clean up the ignored tests:** Make a decision on the 4 skipped tests. We could either fix them this week, or we delete them.
3. **Check the server speed:** Work with the infrastructure team to see if the testing environment is having performance issues, just to be sure the website isn't the root cause.