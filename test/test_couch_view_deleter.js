/* global require console process it describe after before */

// make a test couchdb, install a view, and delete some docs using the view

var should = require('should')
var library = require('../.')
var cvd = library.couch_view_deleter
var request = require('request')
var _ = require('lodash')
var env = process.env;
var cuser = env.COUCHDB_USER ;
var cpass = env.COUCHDB_PASS ;
var chost = env.COUCHDB_HOST || 'localhost';
var cport = env.COUCHDB_PORT || 5984;

var test_db ='test%2fview%2fdeleter'
var couch = 'http://'+chost+':'+cport+'/'+test_db

var docs = {'docs':[{foo:'bar'}
                   ,{'baz':'bat'}
                   ,{foo:'bar',data:'dits','ts':new Date()}
                   ,{'baz':'bat','ts':new Date()}
                   ,{"_id":"_design/test","language":"javascript","views":{"testview":{"map":"function(doc) {\n  if(doc.ts !== undefined){\n    if(doc.data === undefined){\n      emit(null, 1)\n  }}}"}}}]}

describe('view deletion',function(){
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
                                   docs.push({_id:resp.id
                                             ,_rev:resp.rev})
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
        var bd = cvd({'db':test_db
                     ,'design':'test'
                     ,'view':'testview'}
                    ,function(e){
                         if(e) return done(e)
                         request.get(couch+'/_all_docs?include_docs=true'
                                           ,function(e,r,b){
                                                if(e) return done(e)
                                                var c=JSON.parse(b)
                                                c.should.have.property('total_rows',4) // one less than I started with
                                                return done()
                                            })
                         return null
                     })
        return null
    })

})
