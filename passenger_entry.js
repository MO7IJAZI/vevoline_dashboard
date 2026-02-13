const app = require('./dist/index.js');
const fs = require('fs');
const path = require('path');

// Simple logger to verify if this file is even hit
function log(msg) {
    const logMsg = `${new Date().toISOString()} - [PASSENGER_ENTRY] ${msg}\n`;
    try {
        fs.appendFileSync(path.join(__dirname, 'startup_debug.txt'), logMsg);
    } catch (e) {}
    console.log(msg);
}

log("Passenger entry file triggered");

// For Phusion Passenger
if (typeof module !== 'undefined' && module.exports) {
    module.exports = app;
}
