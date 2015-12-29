/* global JSON console require process */
var request = require('request');

var argv = require('minimist')(process.argv.slice(2))
var path = require('path')

// configuration stuff
var rootdir = path.normalize(__dirname)

// where are the files

var config_file
if(argv.config === undefined){
    config_file = path.normalize(rootdir+'/config.json')
}else{
    config_file = path.normalize(rootdir+'/'+argv.config)
}
console.log('setting configuration file to ',config_file,'.  Change with the --config option.')



var config_okay = require('config_okay')


var cvd = require('.').couch_view_deleter

config_okay(config_file,function(e,c){
    if(e || c === undefined){
        console.log('a proper config file is required.  See the README for help')
        throw new Error('no config file found or wrong permissions')
    }
    if(c.couchdb.view === undefined ) throw new Error('please define a proper view path in the config file under couchdb.view  See the README for help')
    cvd(c.couchdb,function(){
        console.log('all done')
        return null
    })
    return null
})
