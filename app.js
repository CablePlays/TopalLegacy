const createError = require('http-errors');
const express = require('express');
const rest = require("./server/rest");
const routes = require("./server/routes");

const PORT = 80;
const app = express();

// view engine setup
app.set('views', 'views');
app.set('view engine', 'pug');

app.use(express.static('public'));
app.use(express.json()); // for reading json post requests

// routes
routes.acceptApp(app);

// simulate lag
app.use((req, res, next) => {
    setTimeout(next, 500);
});

// rest
rest(app);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
    let status = err.status || 500;
    res.status(status);

    // set locals
    res.locals.message = err.message;
    res.locals.status = status;

    if (status === 404) {
        routes.render(req, res, "errors/not-found");
    } else {
        routes.render(req, res, "errors/other");
    }
});

app.listen(PORT);
app.on('error', onError);
app.on('listening', onListening);

/**
 * Event listener for HTTP server "error" event.
*/
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    let bind = typeof PORT === 'string'
        ? 'Pipe ' + PORT
        : 'Port ' + PORT;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
*/
function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
}
