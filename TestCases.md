# UI Automation Test Cases

## Scenario A: Dynamic Content and Waiting
- **Test Case ID:** TC-001
- **Test Case Description:** Verify that dynamic content loaded via an AJAX request is displayed correctly after a server delay.
- **Preconditions:** The user is on the "AJAX Data" page of the UI Testing Playground.
- **Test Steps:**
  1. Click the button that triggers the AJAX request.
  2. Wait for the data to load.
  3. Verify the text of the loaded element.
- **Test Data:** N/A
- **Expected Result:** The loaded label successfully appears and contains the text "Data loaded with AJAX get request.".

**Reasoning & Strategy:**
- **Challenge:** The AJAX request has a built-in delay of approximately 15 seconds.
- **Strategy:** I will implement an **explicit dynamic wait** instead of a hardcoded sleep (`Thread.sleep` or equivalent). The framework will poll the DOM for the specific element containing the success message up to a maximum timeout threshold. This ensures the test proceeds immediately when the element is ready, optimizing test execution time and preventing flakiness.

---

## Scenario B: Realistic Interactions
- **Test Case ID:** TC-002
- **Test Case Description:** Validate the login form's error handling and state changes upon successful authentication.
- **Preconditions:** The user is on the "Sample App" page.
- **Test Steps:**
  1. Leave the username and password inputs empty.
  2. Click the "Log In" button.
  3. Verify the resulting error message state.
  4. Enter a valid username.
  5. Enter the valid password (`pwd`).
  6. Click the "Log In" button.
  7. Verify the success message state.
  8. Verify the login button text has updated.
- **Test Data:** - Valid Username: `Fernando`
  - Valid Password: `pwd`
- **Expected Result:** - On empty submission, an error state (e.g., "Invalid username/password") is displayed.
  - On valid submission, a success message reading "Welcome, Fernando!" is displayed.
  - The primary action button text changes from "Log In" to "Log Out".

**Reasoning & Strategy:**
- **Challenge:** Asserting multiple sequential DOM state changes accurately without triggering full page reloads.
- **Strategy:** The automation will rely on strict text assertions and visibility checks. By chaining actions and assertions sequentially, I ensure the DOM has fully updated its text nodes and class attributes before moving to the next validation step.

---

## Scenario C: Tricky Selectors
- **Test Case ID:** TC-003
- **Test Case Description:** Interact with elements using dynamic IDs and elements obscured by the viewport.
- **Preconditions:** The user can navigate to the "Dynamic ID" and "Overlapped Element" pages.
- **Test Steps:**
  1. Navigate to the "Dynamic ID" page.
  2. Click the primary button.
  3. Navigate to the "Overlapped Element" page.
  4. Scroll the "Name" input field into the active viewport.
  5. Enter a name into the input field.
  6. Verify the text was correctly entered.
- **Test Data:** Name: `Fernando`
- **Expected Result:** - The dynamic button is successfully clicked regardless of its current ID.
  - The obscured input field successfully receives and retains the text "Fernando".

**Reasoning & Strategy:**
- **Challenge 1 (Dynamic ID):** The button's `id` attribute changes on every page load, breaking standard `#id` locators.
- **Strategy 1:** I will use a locator strategy completely independent of the ID. Using text-based selectors (e.g., `//button[contains(text(), 'Button with Dynamic ID')]`) or specific semantic hierarchical CSS selectors ensures resilience against dynamic attributes.
- **Challenge 2 (Overlapped Element):** The input field is outside the visible area or covered by another element, which blocks standard click/type events.
- **Strategy 2:** I will utilize the framework's built-in scrolling capabilities (or execute a JavaScript `scrollIntoView()` command) to bring the element into the foreground before dispatching the interaction events, mirroring real user behavior.