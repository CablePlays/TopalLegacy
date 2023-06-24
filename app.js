const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const consoleCommands = require("./server/console-commands");
const requestsRouter = require("./requests/index");
const renderRouter = require("./render/index-router");

const PORT = 80;
const ARTIFICIAL_LATENCY = 0;
const REQUESTS_PATH = "/requests";
const USING_NEW = true; // FOR TESTING

const app = express();

consoleCommands();

// view engine setup
app.set('views', 'views' + (USING_NEW ? '-new' : ''));
app.set('view engine', 'pug');

app.use(express.static('public' + (USING_NEW ? '-new' : '')));
app.use(express.json()); // for reading json post requests
app.use(cookieParser()); // for cookie object

function simulateLag(req, res, next) {
    setTimeout(next, ARTIFICIAL_LATENCY);
}

app.use("/", renderRouter); // render

if (ARTIFICIAL_LATENCY > 0) {
    console.info(`Using artificial latency: ${ARTIFICIAL_LATENCY}ms`);
    app.use("/", simulateLag);
}

app.use(REQUESTS_PATH, requestsRouter); // requests

app.use((req, res, next) => { // catch 404 and forward to error handler
    console.warn("Not found: " + req.url);
    next(createError(404));
});

app.use(REQUESTS_PATH, (err, req, res, next) => { // handle request errors
    console.error(err);
    let status = err.status || 500;
    res.sendStatus(status);
});

app.use((err, req, res, next) => { // handle render errors
    let status = err.status || 500;
    res.status(status);
    console.error(err);

    // set locals
    res.locals.message = err.message;
    res.locals.status = status;

    if (status === 404) {
        res.advancedRender("errors/not-found");
    } else {
        res.advancedRender("errors/other");
    }
});

app.listen(PORT);