soundName1 = "./sounds/1-Marijo_Slavna.mp3";
soundName2 = "./sounds/Barbara.mp3";
soundName3 = "./sounds/Galija-Cujem_te_lepo_kako_dises.mp3";
soundName4 = "./sounds/400402_5121236-hq.ogg";

soundName = soundName3;

var fs = require('fs');
var lame = require('lame');
var Speaker = require('speaker');

fs.createReadStream(soundName)
    .pipe(new lame.Decoder)
    .on('format', console.log)
    .pipe(new Speaker);

// var player = require("play-sound")(opts = {})
// audio = player.play(soundName, {
//     afplay: ["-v", 1] // lower volume for afplay on OSX
// }, function(err) {
//     if (err) throw err;
// })

// audio.kill();

/* LIB: play-sound

var player = require('play-sound')(opts = {})

// $ mplayer foo.mp3 
audio = player.play(soundName1, function(err) {
    if (err) throw err
})

// { timeout: 300 } will be passed to child process
player.play(soundName2, { timeout: 300 }, function(err) {
    if (err) throw err
})

// configure arguments for executable if any
player.play(soundName3, { afplay: ['-v', 1] // lower volume for afplay on OSX
},
function(err) {
    if (err) throw err
})

// access the node child_process in case you need to kill it on demand
var audio = player.play('foo.mp3', function(err) {
    if (err && !err.killed) throw err
})
audio.kill();

*/

/*

// LIB: soundplayer

var SoundPlayer = require('soundplayer');

var player = new SoundPlayer();

// play with a callback
player.sound(soundName1, function() {

    // these are all "fire and forget", no callback
    player.sound(soundName2);
});

//If you want to know when the player has defintely started playing
player.on('play', function(valid) {
    console.log('I just started playing!');
});
var sound = player.sound(soundName3);

//If you want to know if this can't play for some reason
sound.on('error', function(error) {
    console.error("I can't play!", error);
});

*/

/*
var play = require('play').Play();

// play with a callback
play.sound(soundName1, function() {

    // these are all "fire and forget", no callback
    play.sound(soundName2);
});

//If you want to know when the player has defintely started playing
play.on('play', function(valid) {
    console.log('I just started playing!');
});
play.sound(soundName3);

//If you want to know if this can't play for some reason
play.on('error', function() {
    console.log("I can't play!");
});

*/
/*

LIB: sound-player

// All options
var options = {
    filename: "/Users/sasha/Box Sync/should check and clean/crkva/ноте/1-Marijo_Slavna.mp3",
    // gain: 100,
    // debug: true,
    // player: "afplay" // other supported players are 'aplay', 'mpg123', 'mpg321'
    // device: "plughw0:0"
}

// instantiation with options
var soundplayer = require("sound-player");
var player = new soundplayer(options);

player.play();

// options.filename =
//     "/Users/sasha/Box Sync/should check and clean/crkva/ноте/1-Marijo_Slavna.mp3";
// player.play(options);

*/