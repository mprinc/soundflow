// based on https://gist.github.com/falkolab/f160f446d0bda8a69172
// https://stackoverflow.com/questions/18323152/get-download-progress-in-node-js-with-request
// https://stackoverflow.com/questions/11944932/how-to-download-a-file-with-node-js-without-using-third-party-libraries
var isWin = false;

var status = {
    debug: false,
    showError: true,
    showFinals: true
}

function downloadFile(fileUrl, apiPath, callback) {
    var url = require('url'),
        http = require('https'),
        fs = require('fs'),
        p = url.parse(fileUrl),
        timeout = 10000;

    var file = fs.createWriteStream(apiPath);

    var timeout_wrapper = function(req) {
        return function() {
            console.log('abort');
            req.abort();
            callback("File transfer timeout!");
        };
    };

    var request = http.get(fileUrl).on('response', function(res) {
        // console.log('in cb');
        var len = parseInt(res.headers['content-length'], 10);
        var downloaded = 0;

        res.on('data', function(chunk) {
            file.write(chunk);
            downloaded += chunk.length;
            // console.log("data");
            if (status.showFinals) {
                process.stdout.write((isWin ? "\033[0G" : "\r") + "Downloading " + (100.0 * downloaded / len).toFixed(2) + "% " + downloaded + " bytes");
            }
            // reset timeout
            clearTimeout(timeoutId);
            timeoutId = setTimeout(fn, timeout);
        }).on('end', function() {
            // clear timeout
            clearTimeout(timeoutId);
            file.end();
            if (status.debug) console.log("\n" + fileUrl + ' downloaded to: ' + apiPath);
            callback(null);
        }).on('error', function(err) {
            // clear timeout
            clearTimeout(timeoutId);
            callback(err.message);
        });
    });

    // generate timeout handler
    var fn = timeout_wrapper(request);

    // set initial timeout
    var timeoutId = setTimeout(fn, timeout);
}

/*
var soundNameDownload = "https://freesound.org/data/previews/400/400402_5121236-hq.ogg";
var soundName = "./sounds/400402_5121236-hq.ogg";

downloadFile(soundNameDownload,
    soundName,
    function(err) {
        console.log("Downloaded sound: ", soundName);
        if (err) { console.error(err) }
    });
*/

exports.downloadFile = downloadFile;