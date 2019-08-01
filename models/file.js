var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var blogSchema = new Schema({
    path: {
        type: String,
        required: true,
        trim: true
    },
    idUser: {
        type: String,
        required: true,
        trim: true
    },
    dateConvert: {
        type: Date,
        required: true
    },
    size : {
        type : Number
    }
});

module.exports = mongoose.model('file', blogSchema);
