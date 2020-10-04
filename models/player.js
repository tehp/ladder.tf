const mongoose = require('mongoose'),

Schema = mongoose.Schema;

const playerSchema = new Schema({
    id3: { type: String, default: null, unique: true },
    last_username: { type: String, default: null },
    elo: {type: Number, default: null }
});

module.exports = Player = mongoose.model('players', playerSchema);