#!/usr/bin/env node

'use strict';

var _ = require('lodash');
var opts = require('opts');
var playlists = require("playlists");
var lastfm = require('playlists-lastfm');

var services = {
    youtube: require('playlists-youtube'),
    spotify: require('playlists-spotify')
};

var settings = require('../settings.js');

//******* Command line parsing
var options = [
  { short       : 'v'
  , long        : 'version'
  , description : 'Show version and exit'
  , callback    : function () { console.log('v0.2.3'); process.exit(1); }
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

var mylastfm = playlists.makeMusicService(lastfm, {key: settings.lastfm_api_key, user: user});
var playTarget = playlists.makeMusicService(services[service]);

mylastfm.getLovedTracks().then(function(lastfm_loved_tracks){
    console.log('------------------------------------------');
    console.log('Found ' + lastfm_loved_tracks.length + ' loved tracks on LastFM for '+user+'.');
    console.log('Searching on ' + service);
    console.log('------------------------------------------\n\n');

    playTarget.searchPlaylist(new playlists.Playlist(lastfm_loved_tracks), function(searchstring, found){
            console.log(searchstring + " "  + (found?"found":"not found"));
        }).then(function(playlist){
            console.log("\n");
            console.log(playlist.toText());
        }).done();

})
.catch(function (error){
        console.log(error.message);
    });
