// Transcodes OGG file into mp3 file
/**
 * Module dependencies.
 */

var fs = require('fs');
var ogg = require('ogg');
var lame = require('lame');
var vorbis = require('vorbis');

var status = {
    debug: false,
    showError: true,
    showFinals: true
}

function transcodeFile(inputFile, outputFile, callback) {
    if (status.debug) console.log("transcode-lame : %s -> %s", inputFile, outputFile);
    var oggDecoder = new ogg.Decoder();

    oggDecoder.on('stream', function(oggStream) {
        var vorbisDecoder = new vorbis.Decoder();

        // the "format" event contains the raw PCM format
        vorbisDecoder.on('format', function(format) {
            var bytesPerSample = format.bitDepth / 8;
            if (status.debug) console.log("vorbisDecoder: bytesPerSample: ", bytesPerSample);
            var lameEncoder = new lame.Encoder({
                // input
                channels: 2, // 2 channels (left and right)
                bitDepth: 16, // 16-bit samples
                sampleRate: 44100, // 44,100 Hz sample rate

                // output
                bitRate: 128,
                outSampleRate: 44100,
                mode: lame.STEREO // STEREO (default), JOINTSTEREO, DUALCHANNEL or MONO
            });
            var out = fs.createWriteStream(outputFile);
            lameEncoder.pipe(out);

            var leftover;

            vorbisDecoder.on('data', function(inputBuffer) {
                // https://www.w3schools.com/nodejs/ref_buffer.asp
                // https://nodejs.org/api/buffer.html#buffer_new_buffer_size
                if (status.debug) console.log("vorbisDecoder: data chank: %d", inputBuffer.length);
                // lameEncoder.write(inputBuffer);

                // first we have to make sure that the Buffer we got is a multiple of
                // "float" sized, so that it will fit nicely into a Float32Array
                if (leftover) {
                    inputBuffer = Buffer.concat([leftover, inputBuffer]);
                }
                var len = (inputBuffer.length / bytesPerSample | 0) * bytesPerSample;
                if (len != inputBuffer.length) {
                    // if (status.debug) console.error('resizing Buffer from %d to %d', inputBuffer.length, len);
                    leftover = inputBuffer.slice(len);
                    inputBuffer = inputBuffer.slice(0, len);
                }

                // now that we know "inputBuffer" is aligned to "float" sized, create a TypedArray
                // from it, and create an output Buffer where the "int" samples will go

                // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray#Syntax
                // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array
                // NOTE: the floatSamples is just a Float32Array-view to the inputBuffer
                // https://stackoverflow.com/questions/8609289/convert-a-binary-nodejs-buffer-to-javascript-arraybuffer
                var floatSamples = new Float32Array(inputBuffer.buffer, inputBuffer.byteOffset, inputBuffer.byteLength / Float32Array.BYTES_PER_ELEMENT);

                var outputBuffer = new Buffer(floatSamples.length * Int16Array.BYTES_PER_ELEMENT);
                // NOTE: the intSamples is just a Int16Array-view to the outputBuffer
                var intSamples = new Int16Array(outputBuffer.buffer, outputBuffer.byteOffset, outputBuffer.byteLength / Int16Array.BYTES_PER_ELEMENT);

                // we need to convert all the float samples into short int samples
                // and populate the "intSamples" array
                for (var i = 0; i < floatSamples.length; i++) {
                    var f = floatSamples[i];
                    var val = Math.floor(f * 32767.0 + 0.5);

                    // might as well guard against clipping
                    if (val > 32767) {
                        if (status.debug) console.error('clipping detected: %d -> %d', val, 32767);
                        val = 32767;
                    }
                    if (val < -32768) {
                        if (status.debug) console.error('clipping detected: %d -> %d', val, -32768);
                        val = -32768;
                    }
                    intSamples[i] = val;
                }
                // write the populated "intSamples" Buffer to the lame encoder
                lameEncoder.write(outputBuffer);
            });

            vorbisDecoder.on('end', function() {
                if (status.showFinals) console.log("transcode-lame to '%s' finished", outputFile);
                if (typeof callback === 'function') {
                    callback();
                }
            });

            // vorbisDecoder.pipe(lameEncoder);

            // an "error" event will get emitted if the stream is not a Vorbis stream
            // (i.e. it could be a Theora video stream instead)
            vorbisDecoder.on('error', function(err) {
                console.log("vorbisDecoder: error: ", err);
                // maybe try another decoder...
            });

        });
        oggStream.pipe(vorbisDecoder);
    });
    fs.createReadStream(inputFile).pipe(oggDecoder);
}

exports.transcodeFile = transcodeFile;

// var soundName1 = "./sounds/400402_5121236-hq.ogg";
// var soundNameOut1 = "./sounds/400402_5121236-hq.mp3";
// transcodeFile(soundName1, soundNameOut1);