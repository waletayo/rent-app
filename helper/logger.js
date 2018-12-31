'use strict';

module.exports.log = log;

function log(tag, value) {

    console.log("----------------------------\n");

    console.log(tag, value);

    console.log("------------------------------");
}