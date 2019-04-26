const mongoose = require("mongoose");

const Schema = mongoose.Schema;


const CommentSchema = new Schema({
  body: String
});

// This creates our model from the above schema, using mongoose's model method
var Comment = mongoose.model("Comment", CommentSchema);

// Export the Note model
module.exports = Comment;
