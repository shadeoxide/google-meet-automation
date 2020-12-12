const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const chalk = require("chalk")

puppeteer.use(StealthPlugin())


class Meet {
    constructor(email, password, head, forceDisable) {
        this.email = email;
        this.password = password;
        this.head = head;
        this.forceDisable = forceDisable;
        this.browser;
        this.page;
    }
    async join(url) {
        try {
        this.browser = await puppeteer.launch({
                headless: this.head,
                args: [
                    '--no-sandbox',
                    '--disable-audio-output',
                    '--disable-setuid-sandbox',
                ],
        });
        const context = this.browser.defaultBrowserContext()
        await context.overridePermissions(url, ['microphone', 'camera'])
        this.page = await this.browser.newPage()
        await this.page.setDefaultNavigationTimeout(0);
        await this.page.goto("https://accounts.google.com/signin/v2/identifier?flowName=GlifWebSignIn&flowEntry=ServiceLogin")

        await this.page.type("input#identifierId", this.email, {
            delay: 0
        })
        await this.page.click("div#identifierNext")
        console.log(chalk.green("[LOGIN] Entered email"))

        await this.page.waitForTimeout(7000)

        await this.page.type("input[name=password]", this.password, {
            delay: 0
        })
        await this.page.click("div#passwordNext")
        console.log(chalk.green("[LOGIN] Entered password"))

        await this.page.waitForTimeout(15000)
        
        await this.page.goto(url)
        console.log(chalk.green("[LOGIN] Successfully logged into Google Meet"))
        
        await this.page.waitForTimeout(15000)
        try {
            await this.page.click("div.IYwVEf.HotEze.uB7U9e.nAZzG")
            console.log(chalk.green("[AUDIO] Successfully disabled audio"))
        } catch (e) {
            console.log(chalk.red("[AUDIO] Failed to disable audio"))
        }

        await this.page.waitForTimeout(5000)

        try {
            await this.page.click("div.IYwVEf.HotEze.nAZzG")
            console.log(chalk.green("[VIDEO] Successfully disabled video"))

        } catch (e) {
            console.log(chalk.red("[VIDEO] Failed to disable video"))
        }

        if (this.forceDisable) {
            console.log(chalk.blue("[CHECK] Checking if audio and video is disabled"))

            let audio = await this.page.evaluate('document.querySelectorAll("div.sUZ4id")[0].children[0].getAttribute("data-is-muted")')
            let video = await this.page.evaluate('document.querySelectorAll("div.sUZ4id")[1].children[0].getAttribute("data-is-muted")')

            if (audio === "false") {
                console.log(chalk.red("[CHECK] Failed to disable audio. Terminating the process"))
                return
            } 
            if (video === "false") {
                console.log(chalk.red("[CHECK] Failed to disable video. Terminating the process"))
                return
            }
            else console.log(chalk.green("[CHECK] Audio and video is disabled"))
        }

        await this.page.waitForTimeout(2500)
            console.log(chalk.blue('[JOIN] Sending a request to join the meeting'))
            await this.page.click("span.NPEfkd.RveJvd.snByac")

            console.log(chalk.green("[JOIN] Sent request successfully"))
        }
        catch (err) {
            console.log(`[ERROR] ${err}`)
        }
    }
    async leave() {
        await this.browser.close();
    }
}

module.exports = Meet;