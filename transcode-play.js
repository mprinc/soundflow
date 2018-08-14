// Plays OGG file on speakers

/**
 * Module dependencies.
 */

var soundName1 = "./sounds/400402_5121236-hq.ogg";

var fs = require('fs');
var ogg = require('ogg');
var lame = require('lame');
var vorbis = require('vorbis');

var Speaker = require('speaker');

var od = new ogg.Decoder();

od.on('stream', function(stream) {
    var vd = new vorbis.Decoder();

    // the "format" event contains the raw PCM format
    vd.on('format', function(format) {
        var bytesPerSample = format.bitDepth / 8;
        var encoder = new lame.Encoder();
        var out = fs.createWriteStream(new Date().getTime() + '.mp3');
        encoder.pipe(out);

        var leftover;
        vd.on('data', function(b) {
            console.log("data chank: %d", b.length);

            // encoder.write(o);
        });
    });

    vd.pipe(new Speaker);

    // an "error" event will get emitted if the stream is not a Vorbis stream
    // (i.e. it could be a Theora video stream instead)
    vd.on('error', function(err) {
        console.log("error: ", err);
        // maybe try another decoder...
    });

    stream.pipe(vd);
});

fs.createReadStream(soundName1).pipe(od);