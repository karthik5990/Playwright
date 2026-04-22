import { test, expect } from "@playwright/test";
import { HomePage } from "../pages/HomePage";
import { PortalPage } from "../pages/PortalPage";
import { AuthPage } from "../pages/AuthPage";
import { BugPage } from "../pages/BugPage";
import { OrderPage } from "../pages/OrderPage";
import { CreditCardPage } from "../pages/CreditCardPage";

//test.json contains all the static values as key value pairs
import Data from "../test.json";

test.describe("Sharelane Tests @smoke", () => {
    
    // This before each is going to open the sharelane website
    // and also click the ENTER link.
    test.beforeEach(async ({ page }) => {
        // creating object with HomePage class to access its methods
        const home = new HomePage(page);
        await home.open();
        await home.clickEnter();
    });

    // Below test is for successful creation of account
    test("Happy Path Account Creation @smoke @ui", async ({ page }) => {

        // home and auth are objects created using the classes mentioned below
        // const home = new HomePage(page);
        const auth = new AuthPage(page);

        //opens home page of sharelane
        // await home.open();
        // await page.pause()

        // await home.clickEnter();

        // importing data from test.json and sending to signUp method
        await auth.signUp(
            Data.happyPath.zip,
            Data.happyPath.firstName,
            Data.happyPath.lastName,
            Data.happyPath.email,
            Data.happyPath.password,
        );

        // Assertion to verify account creation
        await auth.expectSignUpSuccess(Data.happyPath.successMessage);
    });

    test("Sad Path Account Creation @ui", async ({ page }) => {
        // const home = new HomePage(page);
        const auth = new AuthPage(page);

        // await home.open();
        // await home.clickEnter();
        await auth.signUp(
            Data.sadPath.zip,
            Data.sadPath.firstName,
            Data.sadPath.lastName,
            Data.sadPath.email,
            Data.sadPath.password1,
            Data.sadPath.password2,
        );

        await auth.expectSignUpFailure(Data.sadPath.errorMessage);
    });

    // test('@smoke Account Setup Flow', async ({ page }) => {
    //   const home = new HomePage(page);
    //   const portal = new PortalPage(page);
    //   const auth = new AuthPage(page);

    //   await home.open();
    //   await home.clickEnter();
    //   await portal.openTestPortal();
    //   await portal.openTrainingBTS();
    //   await portal.openSubmitBug();
    //   await auth.createAccountAutoLogin();
    //   // await page.pause()
    // });

    test("@regression Full Bug Submission Flow @e2e", async ({ page }) => {
        // const home = new HomePage(page);
        const portal = new PortalPage(page);
        const auth = new AuthPage(page);
        const bug = new BugPage(page);

        // await home.open();
        await page.pause();

        // await home.clickEnter();
        await portal.openTestPortal();
        await portal.openTrainingBTS();
        await portal.openSubmitBug();
        await auth.createAccountAutoLogin();

        await portal.openTestPortal();
        await portal.openTrainingBTS();

        await portal.openSubmitBug();
        await bug.populateResolutionOptions(); // Scan and populate dropdown values
        await bug.submitBug(
            "Login page not reloaded properly",
            "When I enter the username and password the login page is not loading properly.",
        );
        // await bug.updateBug();
        // await page.pause()
    });

    test("@e2e Register and Order Flow @ui @e2e", async ({ page }) => {
        // const home = new HomePage(page);
        await page.pause()

        const auth = new AuthPage(page);
        const portal = new PortalPage(page);
        const order = new OrderPage(page);
        const card = new CreditCardPage(page);

        // await home.open();
        // await home.clickEnter();
        await auth.signUp(
            Data.happyPath.zip,
            Data.happyPath.firstName,
            Data.happyPath.lastName,
            Data.happyPath.email,
            Data.happyPath.password,
        );

        const creds = await auth.getCredentials();
        await auth.login(creds.email, creds.password);

        await order.addBookAndCheckout();
        await portal.openTestPortal();
        await portal.openCreditCardGenerator();
        const cardNumber = await card.generateCard();
        await card.pay(cardNumber);

        await expect(page.getByText(Data.bookOrder.orderSuccess)).toBeVisible();
        // await page.pause()
    });
});
