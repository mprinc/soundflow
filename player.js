var player = require("play-sound")(opts = {})

function play(soundName) {
    console.log("play: playing sound", soundName);
    audio = player.play(soundName, {
        afplay: ["-v", 1] // lower volume for afplay on OSX
    }, function(err) {
        if (err) throw err;
        console.log("play: finished playing sound");
    })
    return audio;
}

function stop(audio) {
    audio.kill();
}

exports.play = play;
exports.stop = stop;