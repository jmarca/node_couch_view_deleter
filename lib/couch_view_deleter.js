/*global exports Buffer require process JSON */
/* global JSON console require process */

var request = require('request')
var async = require('async')

var env = process.env
var cuser = env.COUCHDB_USER
var cpass = env.COUCHDB_PASS
var chost = env.COUCHDB_HOST
var cport = env.COUCHDB_PORT || 5984
var couch = 'http://'+chost+':'+cport

var make_deleter = require('./make_bulk_deleter')

// todo, add a check to see if the view is really big (and the json is
// big)
function couch_view_deleter(opts,cb){
    var db = opts.db
    var design = opts.design
    var view = opts.view
    var limit = opts.limit || 1000
    var deleter = make_deleter(db)
    var viewuri = [couch,db, '_design',design,'_view',view].join('/')
    // the first request ascertains the size of the view
    console.log(viewuri)
    var viewsize=1 // force at least one loop

    function get_view(cb){
        var ropts =  {'uri':viewuri+'?limit='+limit+'&include_docs=true'
                     ,'method': "GET"
                     }
        return request(ropts,function(e,r,b){
                   if(e) cb(e)
                   var c=JSON.parse(b)
                   console.log(b)
                   viewsize=c.total_rows
                   if(viewsize===0){return cb('view is empty')}
                   viewsize -= limit
                   return cb(null,c.rows)
               })
    }

    function delete_some(cb){
        async.waterfall([get_view
                        ,deleter
                        ],cb)
    }

    // first check the rows, then go into a loop until the rows are finished up
    async.whilst(function(){ return viewsize > 0}
                ,delete_some
                ,function(e){
                     // puke and die option
                     if(e && e != 'view is empty') throw new Error(e)
                     console.log('done deleting view')
                     cb()
                 })
}
module.exports=couch_view_deleter
