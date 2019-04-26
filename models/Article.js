const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let ArticleSchema = new Schema({
  date: {
    type: String,
    required: true
  },
  fromShort: {
    type: String,
    required: true
  },
  from: {
    type: String,
    required: true
  },
  toShort: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: true
  },
  price: {
    type: String,
    required: true
  },
  saved: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  comment: [{
    type: Schema.Types.ObjectId,
    ref: "Comment"
  }]
});

let Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;