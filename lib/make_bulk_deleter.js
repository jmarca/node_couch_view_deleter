/*global exports Buffer */
/* global JSON console require process */

var request = require('request')
var _ = require('lodash')
var config={'couchdb':{}}
var config_okay = require('config_okay')

// var env = process.env
// var cuser = env.COUCHDB_USER
// var cpass = env.COUCHDB_PASS
// var chost = env.COUCHDB_HOST || 'localhost'
// var cport = env.COUCHDB_PORT || 5984

// var couch = 'http://'+chost+':'+cport


function  make_bulk_deleter(opts){
    if(config.couchdb.host === undefined && opts.config_file !== undefined){
        return config_okay(opts.config_file,function(e,c){
            config.couchdb = c.couchdb
            return _make_bulk_deleter(opts)
        })
    }

    // otherwise, hopefully everything is defined in the opts file!
    return _make_bulk_deleter(opts)

}

function _make_bulk_deleter(opts){
    var c = {}
    _.assign(c,config.couchdb,opts)

    var db = c.db
    var id = c.doc
    var year = c.year
    var cdb = c.host || '127.0.0.1'
    var cport = c.port || 5984
    cdb = cdb+':'+cport +'/'+db
    if(! /http/.test(cdb)){
        cdb = 'http://'+cdb
    }

    function deleter(docs,next){
        // passed a block of docs.  need to DELETE them
        var del_docs = _.map(docs
                             ,function(row){
                                 return {'_id':row.doc._id
                                         ,'_rev':row.doc._rev
                                         ,'_deleted':true}
                             });
        var bulkuri = cdb+ '/_bulk_docs'
        var opts =  {'uri':bulkuri
                     , 'method': "POST"
                     , 'body': JSON.stringify({'docs':del_docs})
                     , 'headers': {}
                    }
        opts.headers.authorization = 'Basic ' + new Buffer(c.auth.username
                                                           + ':'
                                                           + c.auth.password)
            .toString('base64')

        opts.headers['Content-Type'] =  'application/json'
        request(opts
                ,function(e,r,b){
                    if(e){ console.log('bulk delete error '+e)
                           return next(e)
                         }
                    return next()
                });
        return null
    }
    return deleter
}

module.exports=make_bulk_deleter
