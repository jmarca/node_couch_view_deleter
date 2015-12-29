/*global exports Buffer require process JSON */
/* global JSON console require process */

var request = require('request')
var queue = require('queue-async')

var viewer = require('couchdb_get_views')
var to_query = require('couchdb_toQuery')

var make_deleter = require('./make_bulk_deleter')

// todo, add a check to see if the view is really big (and the json is
// big)
function couch_view_deleter(opts,cb){
    var outerq = queue(1)

    var deleter = make_deleter(opts)
    if(opts.limit === undefined){
        opts.limit = 1000
    }
    opts.include_docs=true // need to include docs to get rev to delete
    opts.reduce=false      // need prevent reduce to get back the docs

    var viewsize=1 // force at least one loop
    var loops = 0

    console.log('going to delete everything found in view: '+ opts.view)
    function get_view(done){
        viewer(opts,function(e,r){
            if(e) return done(e)
            var rows = r.rows
            var norows = rows.length === 0
            var alldone = r.total_rows === 0
            viewsize = r.total_rows
            //console.log(rows)
            if(norows || alldone){
                console.log('norows',norows,'alldone',alldone)
                return done(null,0)
            }
            deleter(rows,function(e,r){
                if(e) return done(e)
                return done(null)
            })
            return null
        })
    }


    var quitting_time = function(e){
        if(e) throw new Error(e)
        console.log('done with queue')
        if(opts.looplimit !== undefined ){
            loops++
            if(loops > opts.looplimit){
                return cb()
            }
        }
        if(viewsize>opts.limit){
            console.log(['viewsize was ',viewsize,'remaining',viewsize-opts.limit].join(' '))
            outerq = queue(1)
            outerq.defer(get_view)
            outerq.awaitAll(quitting_time)
        }else{
            return cb()
        }
        return null
    }

    outerq.defer(get_view)
    outerq.awaitAll(quitting_time)

}
module.exports=couch_view_deleter
