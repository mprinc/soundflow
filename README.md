# node.js

## Discussion
+ [Play audio with Node.JS](https://stackoverflow.com/questions/12543237/play-audio-with-node-js)

## Libs

+ [oeuillot/node-soundplayer](https://github.com/oeuillot/node-soundplayer#readme)
    + `npm install soundplayer`
    + https://npm.runkit.com/soundplayer
+ [shime/play-sound](https://github.com/shime/play-sound)
    + `npm install play-sound`
    + works!
+ [victordibia/soundplayer](https://github.com/victordibia/soundplayer)
    + Node.js wrapper for afplay(mac), aplay, mpg123, mpg321 audio players. Will run on mac and linux distros (including raspberry pi)
    + https://www.npmjs.com/package/sound-player
    + `npm install sound-player`
+ [Marak/play.js](https://github.com/Marak/play.js/)
    + `npm install play`
    + play sound files from node.js to your speakers, simple as cake and kid approved! http://www.maraksquires.com
+ [andrewrk/node-groove](https://github.com/andrewrk/node-groove)
    + bindings to libgroove - music player backend library
    + uses [andrewrk/libgroove](https://github.com/andrewrk/libgroove) set of libraries that use [ffmpeg](http://ffmpeg.org/) for robust decoding and encoding
+ [node-speaker](https://www.npmjs.com/package/speaker)
    + Output PCM audio data to the speakers
+ [node-opus](https://github.com/Rantanen/node-opus)
    + http://opus-codec.org/

# Additional libs

+ [node-ogg](https://github.com/TooTallNate/node-ogg)
    + Node.js native binding to libogg

+ [node-vorbis](https://github.com/TooTallNate/node-vorbis)
    + Node.js native binding to libvorbis

+ [(node-)lame](https://www.npmjs.com/package/lame)
    + https://www.npmjs.com/package/lame
    + NodeJS native bindings to libmp3lame & libmpg123
    + https://github.com/TooTallNate/node-lame
    + https://github.com/TooTallNate/node-lame/blob/master/examples/mp3player.js
+ [wav](https://www.npmjs.com/package/wav)
    + This module offers streams to help work with Microsoft WAVE files.
+ [node-wav](https://www.npmjs.com/package/node-wav)
    + High performance WAV decoder and encoder. The decoder is up to 750x faster than the 'wav-decoder' npm module.
+ ogg
    + transcode
        + https://gist.github.com/TooTallNate/4170656
    + https://xiph.org/downloads/
    + ogg123
        + https://apple.stackexchange.com/questions/89103/play-ogg-on-command-line
        + MacPort
        + https://trac.macports.org/wiki/UsingMacPortsQuickStart
        + https://guide.macports.org/#installing.xcode
        + `sudo port install vorbis-tools configure.args=--enable-ogg123`
            + https://trac.macports.org/browser/trunk/dports/audio/vorbis-tools/Portfile
        + `sudo port -v install vorbis-tools`
        + https://guide.macports.org/#development
# Browser

## Discussion

+ [Playing audio with Javascript?](https://stackoverflow.com/questions/9419263/playing-audio-with-javascript)

# Media playing

+ [MediaElement.js](https://www.mediaelementjs.com/)
    + A dependable HTML media framework

# Visualisers

## Waveforms

+ [wavesurfer.js](https://wavesurfer-js.org/)
    + wavesurfer.js is a customizable audio waveform visualization, built on top of [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) and [HTML5 Canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API).

# Players

+ [AmplitudeJS](https://521dimensions.com/open-source/amplitudejs)
    + HTML5 audio player
    + https://github.com/521dimensions/amplitudejs