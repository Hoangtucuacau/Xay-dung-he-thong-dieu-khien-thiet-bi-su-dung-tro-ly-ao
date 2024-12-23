const express = require("express");
const app = express();

var server = require("http").Server(app);
var io = require("socket.io")(server);

module.exports ={io, express,app, server};