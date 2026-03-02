# QA Automation Engineer Technical Test - RelishIQ

## Description
This repository contains the complete solution to the technical test. It covers manual codebase auditing and unit testing (Backend), End-to-End automation (Frontend), strategic analysis of quality metrics (KPIs), and the implementation of a CI/CD pipeline.

## Tools Used
- **Language:** JavaScript (Node.js)
- **Unit Testing Framework:** Jest
- **Web Automation Framework:** Playwright
- **Version Control & DevOps:** Git, GitHub & GitHub Actions

## Deliverables Structure
- **Parts 1 & 2 (Backend):** `BUG-REPORT.md`, `order-processor.fixed.js`, `order-processor.test.js`, and `COVERAGE-REPORT.md` (100% achieved).
- **Parts 3 & 4 (Frontend UI):** `TestCases.md` and the `/tests` folder containing the scripts and the Playwright Page Object Model.
- **Part 5 (QA Strategy):** `KPI-ANALYSIS.md` featuring trend analysis and recommendations for the next sprint.
- **Part 6 (CI/CD):** `.github/workflows/ci-pipeline.yml` for automated cloud execution.

## AI Tool Disclosure
Following the instructions:
* **Environment Setup:** At the beginning of the exercise, I used Gemini to refresh my memory on setting up a Jest environment from scratch, as it had been a while since I last configured one independently.
* **Code Coverage Optimization:** After running my initial code coverage and reaching 87.5%, I consulted with Gemini to identify the specific missing branches. By adding one final targeted test block, I successfully achieved the 100% coverage threshold.
* **Test Case Documentation:** I leveraged Gemini to help draft the standard test steps for my UI test cases. However, the core reasoning, testing strategy, and the actual Playwright implementation were entirely my work.
* **CI/CD Debugging:** I used Gemini to troubleshoot and debug my GitHub Actions workflow, specifically to resolve runner conflicts between Jest and Playwright during the pipeline execution as they are not compatible.
* **Documentation Formatting:** Finally, I used Gemini to standardize and format the structure of this `README.md` file, ensuring a clear, robust, and professional execution guide for the reviewer.


##  How to Execute the Project

### 1. Initial Setup
1. Clone the repository and navigate into the folder:
   git clone <REPOSITORY_URL>
   cd relish-qa-test

2. # Install Node dependencies:
npm install
- Install the necessary browsers for Playwright:
npx playwright install --with-deps
# Execute Unit Tests (Jest):
npm test
- Generate the Code Coverage report:
npm run coverage
3. # Execute UI Automated Tests (Playwright):
npx playwright test
- Run the scenarios in UI mode (opening the browsers visually):
npx playwright test --headed

# Part 4: Automation Framework Strategy

### Tool Selection: Playwright
I chose **Playwright** over Cypress and Selenium for several reasons:
1. **Native Auto-Waiting:** Playwright automatically waits for elements to be actionable (visible, enabled, stable) before executing actions, drastically reducing flakiness.
2. **Modern Web Handling:** It natively handles tricky DOM structures, Shadow DOM, and iframes better than legacy tools.
3. **Execution Speed:** It runs tests in parallel using multiple workers natively, which is critical for scaling test suites in this case it was chrome, firefox and webkit.

### Selector Strategy
My strategy prioritizes **resilience over raw speed**. 
- **Text-Based Locators (`hasText`, `getByPlaceholder`):** Used extensively in Scenario C (Dynamic ID) and Scenario B. While slightly slower than direct ID lookups, text-based locators are completely immune to dynamic ID generation and framework refactoring. They also closely mimic how a real user finds elements on a screen.
- **CSS Selectors:** Used only when elements had stable, semantic classes (`.bg-success`) or fixed IDs (`#login`).

### Considered
1. **Speed vs. Reliability:** Using text-based selectors and explicit conditional waits (`waitFor({ state: 'visible' })`) adds marginal milliseconds to the execution time compared to direct DOM node targeting. However, this tradeoff is highly favorable, as the reliability gained prevents pipeline failures and maintenance overhead (flakiness).
2. **Force Clicks vs. Native Scrolling:** In the overlapped element scenario, I could have bypassed the UI using `element.fill({ force: true })`. I actively chose the tradeoff of writing more complex code (`node.scrollIntoView()`) to maintain a realistic user simulation, ensuring we test the actual UI and not just the DOM state.

## Part 5: QA Strategy & KPI Analysis
Beyond automated test execution, this project includes a strategic analysis of historical test data (detailed in `KPI-ANALYSIS.md`). The analysis focuses on identifying root causes for test suite degradation (such as timeout accumulations and environment bottlenecks) and defines actionable KPIs to maintain test suite health:
- **False Failure Rate (Flakiness):** To maintain pipeline reliability and developer trust.
- **Average Suite Execution Time:** To ensure fast feedback loops during the development cycle.
- **Stale Test Debt:** To prevent skipped or ignored tests from cluttering the automation codebase.

---

## Part 6: CI/CD Pipeline Integration
To ensure continuous quality, a GitHub Actions workflow (`.github/workflows/ci-pipeline.yml`) is fully implemented. The pipeline automatically triggers on pushes and pull requests to the `main` branch, seamlessly orchestrating the following isolated steps:
1. Provisions a clean Ubuntu environment and installs dependencies.
2. Executes backend unit tests and generates code coverage reports via Jest.
3. Installs necessary browser binaries for UI testing.
4. Executes the End-to-End UI automation suite via Playwright.
5. Generates and uploads the Playwright HTML test report as a downloadable artifact for fast debugging.