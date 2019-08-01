var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var blogSchema = new Schema({
    idUser: {
        type: String,
        required: true,
        trim: true
    },
    dateRequest: {
        type: Date,
        required: true,
        trim: true
    },
    requestType : {
        type : String,
        required :true
    }
});

module.exports = mongoose.model('log', blogSchema);
