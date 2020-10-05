const { response } = require('express');
const express = require('express')
const mongoose = require('mongoose');
const axios = require('axios');

const Player = require('./models/player');
const { findOne } = require('./models/player');
const player = require('./models/player');

const app = express()
const port = 8080

var GLOBAL_K = 30;

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
    fetchGame(2706481);

    // console.log(calculateChange(GLOBAL_K, 1500, 1600));
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

function updatePlayer(player_id3, username, elo_change) {
    Player.findOneAndUpdate({ id3: player_id3 }, { $inc: { elo: elo_change } }, { new: true }, function (err, player) {
        if (err) {
            console.log(err);
        } else {
            if (player) {
                // found player, update in db
                // console.log("found: ", player);
            } else {
                // no player in db
                //console.log("no player: " + player_id3)
                var new_player = new Player({
                    id3: player_id3,
                    last_username: username,
                    elo: 1500
                });
                new_player.save();
            }
        }
    });
}

function getPlayer(player_id3, callback) {
    Player.findOne({ id3: player_id3 }, (err, player_found) => {
        callback(player_found);
    })
}

function calculateProbability(rating, rating_opponent) {
    return 1 / (1 + Math.pow(10, ((rating - rating_opponent) / 400)));
}

function calculateChange(K, winnerElo, loserElo) {
    var probB = calculateProbability(winnerElo, loserElo);
    var probA = calculateProbability(loserElo, winnerElo);

    console.log(probA);
    console.log(probB);

    var resultA;
    var resultB;

    resultA = winnerElo + K * (1 - probA);
    resultB = loserElo + K * (0 - probB);

    return { 'winner': resultA, 'loser': resultB };
}

function recordGame(game) {
    console.log(game.info.map);
    var players = game.players;

    for (player_id3 in players) {
        console.log(player_id3 + " + " + game.names[player_id3]);
        updatePlayer(player_id3, game.names[player_id3], +30);
    }

    var teams = game.teams;

    var blue_elo = 0;
    var red_elo = 0;

    for (player_id3 in players) {
        getPlayer(player_id3, (player) => {

            if (game.players[player_id3].team == "Red") {
                red_elo += player.elo;
            } else if (game.players[player_id3].team == "Blue") {
                blue_elo += player.elo;
            }

        })

    }

    if (teams.Red.score > teams.Blue.score) {
        // red won
        console.log("red won");
    } else {
        // blue won
        console.log("blue won");
    }
    console.log("blue elo: " + blue_elo + " red elo: " + red_elo);


}