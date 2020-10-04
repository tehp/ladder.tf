const { response } = require('express');
const express = require('express')
const mongoose = require('mongoose');
const axios = require('axios');

const Player = require('./models/player');
const { findOne } = require('./models/player');

const app = express()
const port = 8080

var last = 2705740;

mongoose.connect('mongodb://localhost/ladder', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
  
  var i = last;
  
    setInterval(() => {fetchGame(i); i++}, 1000);

})

function fetchGame(id) {
    axios.get("https://logs.tf/json/" + id).then(response => {
        console.log("parsing: " + id)
        if (response.data.success == true) {
            recordGame(response.data);
        } else {
            throw new Error("Parse error. Doesn't appear to be a game.")
        }
    }).catch(function (error) {
        if (error.response.status == 404) {
            console.log("no game")
        } else {
            console.log(error);
        }
        
    });
}

function recordGame(game) {
    console.log(game.info.map);
    var players = game.players;

    for (player_id3 in players) {
        
        console.log(player_id3 + " + " + game.names[player_id3]);


        var query = {id3: player_id3}, update = { expire: new Date() }, options = { upsert: true, new: true, setDefaultsOnInsert: true };
        // Find the document
        Player.findOneAndUpdate(query, update, options, function(error, result) {
            if (error) return;

            // do something with the document
            console.log(result);
            var new_player = new Player({
                id3: player_id3,
                last_username: game.names[player_id3],
                elo: 1000
            });
        });




    }
}