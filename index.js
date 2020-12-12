const config = require('./config');
const Meet = require('./src/Meet');
const chalk = require('chalk');

meet = new Meet(config.email, config.password, config.head, config.forceDisable);

let start = new Date(config.start).getTime();
let end = new Date(config.end).getTime();

setInterval(() => {
    if (start < Date.now()) {
        console.log(chalk.blue(`[PROCESS] Starting the process`))
        meet.join(config.url)
        start = end + 5000        
    }
    if (end < Date.now()) {
        console.log(chalk.blue(`[PROCESS] Ending the process`))
        meet.leave();
        process.exit()
    }
}, 1000)