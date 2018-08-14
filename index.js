var ac = require('./audio-commons');
var download = require('./download');
var transcode = require('./transcode-lame');
var player = require('./player');

ac.getToken(function(tokenCredentials) {
    console.log('tokenCredentials.access_token: ' + tokenCredentials.access_token);
    ac.search("dance", function(metaResult) {
        console.log("Search metaResult: ", metaResult);
        var collect_url = metaResult.meta.collect_url;
        // example: https://m.audiocommons.org/api/v1/collect/?rid=b8f9ad41-c3a5-4417-baa2-046864a9cc34
        console.log("Collect url: ", collect_url);
        // var rid = /rid\=([^/]*)$/.exec(collect_url)[1];
        var rid = metaResult.meta.response_id;
        console.log("Collect rid: ", rid);

        var collectRequestNo = 1;

        function collectFinished(result) {
            if (!result.contents.Freesound) {
                console.log("Collecting try num: ", collectRequestNo++);
                ac.collect(rid, collectFinished);
            } else {
                console.log("Search result: ", result);
                var previewUrl = result.contents.Freesound.results[0]["ac:preview_url"];
                var downloadName = /[^/]*$/.exec(previewUrl)[0];
                console.log("Freesound preview sound url: ", previewUrl);
                var downloadPath = "./sounds/" + downloadName;

                download.downloadFile(previewUrl, downloadPath,
                    function(err) {
                        console.log("Downloaded sound: ", previewUrl);
                        if (err) { console.error(err) } else {
                            var previewSoundExtension = /[^.]*$/.exec(downloadName)[0];
                            var outputName = /(.*)\.[^.]*$/.exec(downloadName)[1];
                            outputNameFull = "./sounds/" + outputName + ".mp3";
                            transcode.transcodeFile(downloadPath, outputNameFull, function() {
                                player.play(outputNameFull);
                            });
                        }
                    });
            }
        }
        console.log("Collecting try num: ", collectRequestNo++);
        ac.collect(rid, collectFinished);
    });
})