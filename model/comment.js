/**
 * Created by huwl on 2017/7/15.
 */
var mongoose = require('mongoose');
var CommentSchema = require('../schemas/comment');
var db = mongoose.createConnection('localhost', 'film');

var Comment = db.model('Comment', CommentSchema);

module.exports = Comment;
