const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const totalSchema = new Schema({
    count: {type: Number},
    name: {type: String}
})

module.exports = mongoose.model('Total', totalSchema);