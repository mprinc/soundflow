// transcodes OGG file into WAV file
/**
 * Module dependencies.
 */

var soundName1 = "./sounds/400402_5121236-hq.ogg";
var soundNameOut = "./sounds/400402_5121236-hq.wav";

var fs = require('fs');
var ogg = require('ogg');
var lame = require('lame');
var vorbis = require('vorbis');

var FileWriter = require('wav').FileWriter;

var Speaker = require('speaker');

var od = new ogg.Decoder();

od.on('stream', function(stream) {
    var vd = new vorbis.Decoder();

    var outputFileStream = new FileWriter(soundNameOut, {
        sampleRate: 16000,
        channels: 1
    });

    // the "format" event contains the raw PCM format
    vd.on('format', function(format) {

        vd.on('data', function(b) {
            console.log("data chank: %d", b.length);

            // encoder.write(o);
        });
    });

    vd.pipe(outputFileStream);

    // an "error" event will get emitted if the stream is not a Vorbis stream
    // (i.e. it could be a Theora video stream instead)
    vd.on('error', function(err) {
        console.log("error: ", err);
        // maybe try another decoder...
    });

    stream.pipe(vd);


});

fs.createReadStream(soundName1).pipe(od);