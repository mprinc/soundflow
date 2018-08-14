var http = require("https");
// We need this to build our post string
var querystring = require('querystring');

var client_id = "kWisHB1KxJFWuT92ayozRhGe1WC3UKbLtIQo0vnK";
var username = "mprinc";
var password = "kanalizacija";

var download = require('./download');
var transcode = require('./transcode-lame');
var player = require('./player');

var status = {
    debug: false,
    showError: true,
    showFinals: true
}

var tokenCredentials = {
    access_token: null,
    expires_in: null,
    token_type: null,
    scope: null,
    refresh_token: null
}

var searches = {
    active: {},
    finished: {}
}
var sounds = {
    playing: {},
    available: {},
    downloading: {}
}

// curl -X POST https://m.audiocommons.org/api/o/token/ -d 'client_id=<YOUR_CLIENT_ID>&grant_type=password&username=<YOUR_USERNAME>&password=<YOUR_PASSWORD>'
function getToken(callback) {

    // https://stackoverflow.com/questions/6819143/curl-equivalent-in-nodejs
    // https://gist.github.com/bdickason/1105888
    // https://www.npmjs.com/package/curlrequest
    // https: //github.com/mrsarm/reqclient#logging-with-curl-style
    // https://stackoverflow.com/questions/6158933/how-to-make-an-http-post-request-in-node-js
    // Build the post string from an object
    var post_data = querystring.stringify({
        'client_id': client_id,
        'grant_type': 'password',
        'username': username,
        'password': password
    });

    var options = {
        host: 'm.audiocommons.org',
        // https://stackoverflow.com/questions/15421050/node-request-getting-error-ssl23-get-server-hellounknown-protocol
        port: 443,
        path: '/api/o/token/',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(post_data)
        }
    };

    if (status.debug) console.log("getToken: http path: ", options.path);
    var req = http.request(options, function(res) {
        var bodyStr = "";
        if (status.debug) console.log('STATUS: ' + res.statusCode);
        if (status.debug) console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
            if (status.debug) console.log('chunk length: ' + chunk.length);
            bodyStr += chunk;
        });
        res.on('end', function() {
            if (status.debug) console.log('bodyStr: ' + bodyStr);
            var body = JSON.parse(bodyStr);
            tokenCredentials.access_token = body.access_token;
            tokenCredentials.expires_in = body.expires_in;
            tokenCredentials.token_type = body.token_type;
            tokenCredentials.scope = body.scope;
            tokenCredentials.refresh_token = body.refresh_token;

            callback(tokenCredentials);
        });
    });

    req.on('error', function(e) {
        if (status.showError) console.error('problem with request: ' + e.message);
    });

    // write data to request body
    if (status.debug) console.log("Request data: ", post_data);
    req.write(post_data);
    req.end();
};

function searchHigh(searchQuery) {
    searches.active[searchQuery] = {}

    search(searchQuery, function(metaResult) {
        if (status.debug) console.log("Search metaResult: ", metaResult);
        var collect_url = metaResult.meta.collect_url;
        // example: https://m.audiocommons.org/api/v1/collect/?rid=b8f9ad41-c3a5-4417-baa2-046864a9cc34
        if (status.debug) console.log("Collect url: ", collect_url);
        // var rid = /rid\=([^/]*)$/.exec(collect_url)[1];
        var rid = metaResult.meta.response_id;
        if (status.debug) console.log("Collect rid: ", rid);

        var collectRequestNo = 1;

        function collectFinished(result) {
            if (!result.contents.Freesound) {
                if (status.debug) console.log("Collecting try num: ", collectRequestNo++);
                collect(rid, collectFinished);
            } else {
                delete searches.active[searchQuery];
                searches.finished[searchQuery] = {
                    freesound: result.contents.Freesound.results
                };
                if (status.debug) console.log("Search result: ", result);
                if (status.showFinals) console.log("Search for '%s' finished. You can download sound:\n\tac.downloadHigh('%s', 'freesound', 1)", searchQuery, searchQuery, );
            }
        }
        if (status.debug) console.log("Collecting iteration num: ", collectRequestNo++);
        ac.collect(rid, collectFinished);
    });
}

function downloadHigh(searchQuery, source, soundIndex, shouldPlay) {
    var soundInfo = searches.finished[searchQuery][source][soundIndex];
    if (!sounds.downloading[searchQuery]) sounds.downloading[searchQuery] = {};
    var soundName = soundInfo['ac:name'];
    soundName = soundName.replace(/ /g, "_");
    soundName = soundName.replace(/\!/g, "_");
    soundName = soundName.replace(/\./g, "_");
    soundName = soundName.replace(/__/g, "_");
    soundName = soundName.toLowerCase();

    var previewUrl = soundInfo["ac:preview_url"];
    var downloadName = /[^/]*$/.exec(previewUrl)[0];
    if (status.debug) console.log("Freesound preview sound url: ", previewUrl);
    var downloadPath = "./sounds/" + downloadName;

    download.downloadFile(previewUrl, downloadPath,
        function(err) {
            if (err) {
                if (status.showError) console.error(err);
            } else {
                if (status.showFinals) console.log("Downloaded sound: %s", soundName);
                var previewSoundExtension = /[^.]*$/.exec(downloadName)[0];
                if (status.debug) console.log("File extension %s", previewSoundExtension);
                if (previewSoundExtension != 'mp3') {
                    if (status.showFinals) console.log("Transcoding sound from %s to mp3", previewSoundExtension);
                    var outputName = /(.*)\.[^.]*$/.exec(downloadName)[1];
                    outputNameFull = "./sounds/" + outputName + ".mp3";
                    transcode.transcodeFile(downloadPath, outputNameFull, function() {
                        if (!sounds.available[searchQuery]) sounds.available[searchQuery] = {};
                        var sound;
                        sounds.available[searchQuery][soundName] = {
                            fileName: outputNameFull,
                            play: function() {
                                sound = player.play(this.fileName);
                                if (status.showFinals) console.log("You can stop sound with: ac.sounds.available.%s.%s.stop()", searchQuery, soundName);
                            },
                            stop: function() {
                                sound.kill();
                            }
                        }
                        var shortName = source[0] + soundIndex;
                        sounds.available[searchQuery][shortName] = sounds.available[searchQuery][soundName];
                        if (shouldPlay) player.play(outputNameFull);
                        else {
                            if (status.showFinals) {
                                console.log("You can play sound with:\n");
                                console.log("\tac.sounds.available.%s.%s.play()", searchQuery, soundName);
                                console.log("\tac.sounds.available.%s.%s.play()", searchQuery, shortName);
                            }
                        }
                    });
                }
            }
        });

    sounds.downloading[searchQuery][soundName] = {
        request: true
    }
}

// curl -i -H "Authorization: Bearer MMOeBDmt0mHC6NY99xH6bN9yfPkMck" https://m.audiocommons.org/api/v1/search/text/?q=cars
function search(searchQuery, callback) {

    var options = {
        host: 'm.audiocommons.org',
        port: 443,
        path: '/api/v1/search/text/?q=' + searchQuery,
        method: 'GET',
        headers: {
            'Authorization': "Bearer " + tokenCredentials.access_token
        }
    };

    if (status.debug) console.log("search: http path: ", options.path);
    var req = http.request(options, function(res) {
        var bodyStr = "";
        if (status.debug) console.log('STATUS: ' + res.statusCode);
        if (status.debug) console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
            if (status.debug) console.log('chunk length: ' + chunk.length);
            bodyStr += chunk;
        });
        res.on('end', function() {
            if (status.debug) console.log('bodyStr: ' + bodyStr);
            var body = JSON.parse(bodyStr);

            callback(body);
        });
    });

    req.on('error', function(e) {
        if (status.showError) console.error('problem with request: ' + e.message);
    });

    req.end();
};

// curl -i -H "Authorization: Bearer MMOeBDmt0mHC6NY99xH6bN9yfPkMck" https://m.audiocommons.org/api/v1/collect/?rid=ed360c90-3221-4ecc-a471-01ec5ca4a915
function collect(rid, callback) {
    // rid = 'b8f9ad41-c3a5-4417-baa2-046864a9cc34'
    // https://m.audiocommons.org/api/v1/collect/?rid=b8f9ad41-c3a5-4417-baa2-046864a9cc34

    // rid = '937f1086-c42e-4aa2-bfc5-7ce516e914a0';
    // rid = '3e376fb8-1eab-4059-a848-074454dd8028';
    var options = {
        host: 'm.audiocommons.org',
        port: 443,
        path: '/api/v1/collect/?rid=' + rid,
        method: 'GET',
        headers: {
            'Authorization': "Bearer " + tokenCredentials.access_token
        }
    };

    if (status.debug) console.log("collect: http path: ", options.path);
    var req = http.request(options, function(res) {
        var bodyStr = "";
        if (status.debug) console.log('STATUS: ' + res.statusCode);
        if (status.debug) console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
            if (status.debug) console.log('chunk length: ' + chunk.length);
            bodyStr += chunk;
        });
        res.on('end', function() {
            if (status.debug) console.log('bodyStr: ' + bodyStr);
            var body = JSON.parse(bodyStr);

            callback(body);
        });
    });

    req.on('error', function(e) {
        if (status.showError) console.error('problem with request: ' + e.message);
    });

    req.end();
}

function init() {
    ac.getToken(function(tokenCredentials) {
        console.log("Initialized. Go on! Use:\n\tac.searchHigh('dance')");
    });
}

// AC API
exports.getToken = getToken;
exports.search = search;
exports.collect = collect;

// high-level
exports.init = init;
exports.searchHigh = searchHigh;
exports.downloadHigh = downloadHigh;

// data
exports.searches = searches;
exports.status = status;
exports.sounds = sounds;