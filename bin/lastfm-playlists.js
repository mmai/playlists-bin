#!/usr/bin/env node

'use strict';

var _ = require('lodash');
var opts = require('opts');
var colors = require('colors');
var playlists = require("playlists");

var settings = require('../settings.js');
var services = {
    youtube: playlists.makeMusicService("youtube", {key: settings.youtube_api_key}),
    soundcloud: playlists.makeMusicService("soundcloud", {key: settings.soundcloud_api_key}),
    spotify: playlists.makeMusicService("spotify")
};


//******* Command line parsing
var options = [
  { short       : 'v'
  , long        : 'version'
  , description : 'Show version and exit'
  , callback    : function () { console.log('v0.5.0'); process.exit(1); }
  },
  { short       : 's'
  , long        : 'service'
  , description : 'The service to generate a playlist for'
  , value        : true
  },
];

var args = [ { name : 'user' , required : true } ];
opts.parse(options, args, true);

var user = opts.arg('user');
var service = opts.get('service');
// end command line parsing

if (! _.has(services, service)){
    console.log(service + ' is not available as a service. Please use one of the following : ' + _.keys(services).join(', '));
  process.exit(1);
}

var mylastfm = playlists.makeMusicService("lastfm", {key: settings.lastfm_api_key, user: user});
var playTarget = services[service];

mylastfm.getLovedTracks().then(function(lastfm_loved_tracks){
    console.log('------------------------------------------'.bold);
    console.log('Found ' + lastfm_loved_tracks.length + ' loved tracks on LastFM for '+user+'.');
    console.log('Searching on ' + service);
    console.log('------------------------------------------\n\n'.bold);

    playTarget.searchPlaylist(new playlists.Playlist(lastfm_loved_tracks), function(track, foundSong){
            var found = (foundSong !== undefined) && (foundSong !== false);

            console.log(track.name + " "  + (found?"found".green:"not found".red));
        }).then(function(playlist){
            console.log("\n");
            console.log(playlist.toText());
        }).done();

})
.catch(function (error){
        console.log(error.message);
    });
