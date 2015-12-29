/* global require console process it describe after before */

// make a test couchdb, install a view, and delete some docs using the view

var should = require('should')
var library = require('../.')
var cvd = library.couch_view_deleter
var request = require('request')
var _ = require('lodash')

var path    = require('path')
var rootdir = path.normalize(__dirname)
var config_file = rootdir+'/../test.config.json'


var config_okay = require('config_okay')

var test_db = 'test%2fview%2fdeleter' // default value

var docs = {'docs':[{foo:'bar'}
                   ,{'baz':'bat'}
                   ,{foo:'bar',data:'dits','ts':new Date()}
                   ,{'baz':'bat','ts':new Date()}
                   ,{"_id":"_design/test","language":"javascript","views":{"testview":{"map":"function(doc) {\n  if(doc.ts !== undefined){\n    if(doc.data === undefined){\n      emit(null, 1)\n  }}}"}}}]}

// add 1000 more test docs without valid data
for(var i = 0 ; i<1000; i++){
    docs.docs.push({foo:'bar','ts':new Date()})
}

var config={}

function create_tempdb(cb){
    var date = new Date()
    var test_db_unique = [config.couchdb.db,
                          date.getHours(),
                          date.getMinutes(),
                          date.getSeconds(),
                          date.getMilliseconds()].join('-')
    config.couchdb.db = test_db_unique
    var cdb =
        [config.couchdb.host+':'+config.couchdb.port
        ,config.couchdb.db].join('/')

    if(! /http/.test(cdb)){
        cdb = 'http://'+cdb
    }
    var opts = {'uri':cdb
                ,'method': "PUT"
                ,'headers': {}
               };
    var cuser = config.couchdb.auth.username
    var cpass = config.couchdb.auth.password

    opts.headers.authorization = 'Basic ' + new Buffer(cuser + ':' + cpass).toString('base64')
    opts.headers['Content-Type'] =  'application/json'

    request(opts
            ,function(e,r,b){
                if(e) return cb(e)
                var c = JSON.parse(b)
                if(c.error ){
                    console.log(e,c)
                    return cb('error creating db')
                }
                // now populate that db with some docs
                opts.method='POST'
                opts.json=docs
                opts.uri += '/_bulk_docs'
                request(opts,function(e,r,b){
                    if(e) return cb(e)
                    docs=[]
                    _.each(b
                           ,function(resp){
                               resp.should.have.property('ok')
                               docs.push({_id:resp.id
                                          ,_rev:resp.rev})
                           });
                    return cb()
                })
                return null
    })
    return null
}

function delete_tempdb(cb){
    var cdb =
        [config.couchdb.host+':'+config.couchdb.port
        ,config.couchdb.db].join('/')

    if(! /http/.test(cdb)){
        cdb = 'http://'+cdb
    }
    var opts = {'uri':cdb
                ,'method': "DELETE"
                ,'headers': {}
               };
    var cuser = config.couchdb.auth.username
    var cpass = config.couchdb.auth.password

    opts.headers.authorization = 'Basic ' + new Buffer(cuser + ':' + cpass).toString('base64')
    opts.headers['Content-Type'] =  'application/json'

    request(opts
            ,function(e,r,b){
                if(e) return cb(e)
                var c = JSON.parse(b)
                if(c.error ){
                    console.log(e,c)
                    console.log('manually delete',cdb)
                }
                return cb()

    })
    return null
}

before(function(done){
    config_okay(config_file,function(err,c){
        if(!c.couchdb.db){ throw new Error('need valid db defined in test.config.json')}
        config = c
        create_tempdb(done)
        return null
    })
    return null
})
after(delete_tempdb)

describe('view deletion',function(){

    it('should work',function(done){
        config.couchdb.view='_design/test/_view/testview'
        var bd = cvd(config.couchdb
                     ,function(e){
                        if(e) return done(e)
                        var cdb =
                                [config.couchdb.host+':'+config.couchdb.port
                                 ,config.couchdb.db].join('/')

                         if(! /http/.test(cdb)){
                             cdb = 'http://'+cdb
                         }
                        request.get(cdb+'/_all_docs?include_docs=true'
                                    ,function(e,r,b){
                                        if(e) return done(e)
                                        var c=JSON.parse(b)
                                        c.should.have.property('total_rows')
                                        var tr = c.total_rows
                                        tr.should.eql(4) // one less than I started with
                                        return done()
                                    })
                        return null
                    })
        return null
    })

})
