var express = require("express")
var post = require("./post")
var app = express();

app.get('/post',post.service)


exports.http = app