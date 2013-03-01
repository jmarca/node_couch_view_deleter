/* global require console process it describe after before */

// make a test couchdb, install a view, and delete some docs using the view

var should = require('should')
var library = require('../.')
var request = require('request')
var _ = require('lodash')
var mbd = library.make_bulk_deleter
var env = process.env;
var cuser = env.COUCHDB_USER ;
var cpass = env.COUCHDB_PASS ;
var chost = env.COUCHDB_HOST || 'localhost';
var cport = env.COUCHDB_PORT || 5984;

var test_db ='test%2fbulk%2fdeleter'
var couch = 'http://'+chost+':'+cport+'/'+test_db

var docs = {'docs':[{foo:'bar'}
                   ,{'baz':'bat'}]}

describe('bulk deleter',function(){
    var created_locally=false
    before(function(done){
        // create a test db, the put data into it
        var opts = {'uri':couch
                   ,'method': "PUT"
                   ,'headers': {}
                   };
        opts.headers.authorization = 'Basic ' + new Buffer(cuser + ':' + cpass).toString('base64')
        opts.headers['Content-Type'] =  'application/json'
        request(opts
               ,function(e,r,b){
                    if(!e)
                        created_locally=true
                    // now populate that db with some docs
                    opts.method='POST'
                    opts.json=docs
                    opts.uri += '/_bulk_docs'
                    request(opts,function(e,r,b){
                        if(e) done(e)
                        docs=[]
                        _.each(b
                              ,function(resp){
                                   resp.should.have.property('ok')
                                   docs.push({doc:{_id:resp.id
                                                  ,_rev:resp.rev}})
                               });
                        return done()
                    })
                    return null
                })
        return null
    })
    after(function(done){
        if(!created_locally) return done()

        var couch = 'http://'+chost+':'+cport+'/'+test_db
        // bail in development
        //console.log(couch)
        //return done()
        var opts = {'uri':couch
                   ,'method': "DELETE"
                   ,'headers': {}
                   };
        opts.headers.authorization = 'Basic ' + new Buffer(cuser + ':' + cpass).toString('base64')
        opts.headers['Content-Type'] =  'application/json'
        request(opts
               ,function(e,r,b){
                    if(e) return done(e)
                    return done()
                })
        return null
    })


    it('should work',function(done){
        var bd = mbd(test_db)
        bd(docs,function(e){
            if(e) return done(e)
            // check that there are no documents in the db anymore
            return request.get(couch+'/_all_docs?include_docs=true'
                              ,function(e,r,b){
                                   if(e) return done(e)
                                   var c=JSON.parse(b)
                                   c.should.have.property('total_rows',0)
                                   return done()
                               })
        })
    })
})
