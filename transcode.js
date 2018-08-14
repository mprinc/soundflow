/**
 * Module dependencies.
 */

var fs = require('fs');
var ogg = require('ogg');
var lame = require('lame');
var vorbis = require('vorbis');

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

            // first we have to make sure that the Buffer we got is a multiple of
            // "float" sized, so that it will fit nicely into a Float32Array
            if (leftover) {
                b = Buffer.concat([leftover, b]);
            }
            var len = (b.length / bytesPerSample | 0) * bytesPerSample;
            if (len != b.length) {
                console.error('resizing Buffer from %d to %d', b.length, len);
                leftover = b.slice(len);
                b = b.slice(0, len);
            }

            // now that we know "b" is aligned to "float" sized, create a TypedArray
            // from it, and create an output Buffer where the "int" samples will go
            var floatSamples = new Float32Array(b);
            var o = new Buffer(floatSamples.length * 2);
            var intSamples = new Int16Array(o);

            // we need to convert all the float samples into short int samples
            // and populate the "intSamples" array
            for (var i = 0; i < floatSamples.length; i++) {
                var f = floatSamples[i];
                var val = Math.floor(f * 32767.0 + 0.5);

                // might as well guard against clipping
                if (val > 32767) {
                    // console.error('clipping detected: %d -> %d', val, 32767);
                    val = 32767;
                }
                if (val < -32768) {
                    // console.error('clipping detected: %d -> %d', val, -32768);
                    val = -32768;
                }
                intSamples[i] = val;
            }

            // write the populated "intSamples" Buffer to the lame encoder
            encoder.write(o);
        });
    });

    // an "error" event will get emitted if the stream is not a Vorbis stream
    // (i.e. it could be a Theora video stream instead)
    vd.on('error', function(err) {
        console.log(err);
        // maybe try another decoder...
    });

    stream.pipe(vd);
});

var soundName1 = "./sounds/400402_5121236-hq.ogg";

fs.createReadStream(soundName1).pipe(od);