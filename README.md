# QA Automation Engineer Technical Test - RelishIQ

## Descripción
Este repositorio contiene la solución a la prueba técnica

## Herramientas Utilizadas
- **Lenguaje:** JavaScript (Node.js)
- **Framework de Pruebas Unitarias:** Jest
- **Framework de Automatización Web:** Playwright (se implementará en la Parte 4)
- **Control de Versiones:** Git & GitHub

## AI Tool Disclosure
Siguiendo las instrucciones:
He utilizado **Google Gemini** como asistente de apoyo para:
1. Analizar la estructura de los requerimientos.
2. Optimizar la documentación de casos de prueba.
las soluciones han sido revisadas, ejecutadas y validadas manualmente por mí.

## Cómo ejecutar el proyecto
1. Clonar el repositorio.
2. Ejecutar `npm install`.
3. Para correr las pruebas unitarias: `npm test`.

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
