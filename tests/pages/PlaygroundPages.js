// tests/pages/PlaygroundPages.js

class AjaxDataPage {
    constructor(page) {
        this.page = page;
        // Selector resiliente por texto en caso de que cambien los IDs
        this.ajaxButton = page.locator('button', { hasText: 'Button Triggering AJAX Request' });
        this.successLabel = page.locator('.bg-success');
    }

    async navigate() {
        await this.page.goto('http://uitestingplayground.com/ajax');
    }

    async triggerAjaxAndGetText() {
        await this.ajaxButton.click();
        // Espera explícita dinámica al estado del elemento, evitando hardcoded sleeps
        await this.successLabel.waitFor({ state: 'visible', timeout: 20000 });
        return this.successLabel;
    }
}

class SampleAppPage {
    constructor(page) {
        this.page = page;
        this.userNameInput = page.getByPlaceholder('User Name');
        this.passwordInput = page.getByPlaceholder('********');
        this.loginButton = page.locator('#login');
        this.loginStatus = page.locator('#loginstatus');
    }

    async navigate() {
        await this.page.goto('http://uitestingplayground.com/sampleapp');
    }

    async login(username, password) {
        if (username) await this.userNameInput.fill(username);
        if (password) await this.passwordInput.fill(password);
        await this.loginButton.click();
    }
}

class TrickyElementsPage {
    constructor(page) {
        this.page = page;
        // Estrategia: Selector basado en texto, ignorando completamente el ID dinámico
        this.dynamicIdButton = page.locator('button', { hasText: 'Button with Dynamic ID' });
        this.nameInput = page.locator('#name');
    }

    async navigateToDynamicId() {
        await this.page.goto('http://uitestingplayground.com/dynamicid');
    }

    async navigateToOverlappedElement() {
        await this.page.goto('http://uitestingplayground.com/overlapped');
    }

    async clickDynamicButton() {
        await this.dynamicIdButton.click();
    }

    async fillOverlappedName(name) {
        // El método nativo scrollIntoView del navegador obliga al contenedor 
        // con overflow a desplazarse hasta revelar el elemento completo.
        await this.nameInput.evaluate(node => node.scrollIntoView());
        
        // Una vez que el scroll nativo lo ha revelado, podemos interactuar sin que el texto se pierda
        await this.nameInput.fill(name);
       
    }
}

module.exports = { AjaxDataPage, SampleAppPage, TrickyElementsPage };