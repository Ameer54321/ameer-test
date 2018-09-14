"use strict";
const Database = require('./database');
const config = require('./config');
const Hapi = require('hapi');
const glob   = require('glob');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt-nodejs');

var port = process.env.PORT || 1337;

var database = new Database();
var server = new Hapi.Server({debug: {request: ['info', 'error']}});

// Expose database
if (process.env.NODE_ENV === 'test') {
    server.database = database;
}

// Create server
server.connection({
    host: config.host,
    port: config.port
});

function hashPassword(password, cb) {
    // Generate a salt at level 10 strength
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, (err, hash) => {
            return cb(err, hash);
        });
    });
}

// Add routes
const plugins = [];
glob.sync('./routes/*.js', {
    root: __dirname
}).forEach(file => {
    plugins.push({
        register: require(file),
        options: {
            database: database,
            cookie: {
                isSecure: false
            }
        }
    });
});

plugins.push({ register: require('hapi-auth-jwt') });

server.register(plugins, function (err) {
    if (err) { throw err; }

    //For JWT 
    server.auth.strategy('token', 'jwt', {
        key: config.key,
        verifyOptions: { algorithms: config.auth.algorithm }
    });

    //This enables auth for routes under plugins too.
    server.auth.default('token');

    if (!module.parent) {
        server.start(function(err) {
            if (err) { throw err; }
            server.log('info', `Server running at: ${server.info.uri}`);
            console.log(`Server running at: ${server.info.uri}`);
        });
    }
});

module.exports = server;