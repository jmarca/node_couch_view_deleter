/*global exports Buffer */
/* global JSON console require process */

var request = require('request')
var _ = require('lodash')

var env = process.env
var cuser = env.COUCHDB_USER
var cpass = env.COUCHDB_PASS
var chost = env.COUCHDB_HOST || 'localhost'
var cport = env.COUCHDB_PORT || 5984

var couch = 'http://'+chost+':'+cport


function  make_bulk_deleter(cdb){
        return function(docs,next){
            // passed a block of docs.  need to DELETE them
            var del_docs = _.map(docs
                                ,function(row){
                                     return {'_id':row.doc._id
                                            ,'_rev':row.doc._rev
                                            ,'_deleted':true}
                                 });
            var bulkuri = couch+'/'+cdb+ '/_bulk_docs'
            var opts =  {'uri':bulkuri
                        , 'method': "POST"
                        , 'body': JSON.stringify({'docs':del_docs})
                        , 'headers': {}
                        }
            opts.headers.authorization = 'Basic ' + new Buffer(cuser + ':' + cpass).toString('base64')

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
}

module.exports=make_bulk_deleter