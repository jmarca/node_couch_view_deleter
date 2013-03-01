/* global JSON console require process */
var request = require('request');
var async = require('async');


var optimist = require('optimist')
var argv = optimist
           .usage('drop troublesome docs from couchdb, using a view.\nUsage: $0')
           .options('d',{'demand':'d'
                        ,'alias':'db'
                        ,'describe':'The database to query'
                        })
           .options('v',{'demand':'v'
                        ,'alias': 'view'
                        ,'describe':'The view to use.  Every doc that is pulled into the view will be deleted'
                        })
           .options('dd',{'demand':'dd'
                        ,'alias': 'designdoc'
                        ,'describe':'The design doc that contains the view, above.'
                        })
.options("l",{'alias':'limit'
                         ,'describe': "how many docs at a time to process"
                         ,'default': 1000
           })
           .options("h", {'alias':'help'
                         ,'describe': "display this hopefully helpful message"
                         ,'type': "boolean"
                         ,'default': false
           })
           .argv
;
if (argv.help){
    optimist.showHelp();
    return null
}

var cvd = require('./index').couch_view_deleter

async.nextTick(function(){
    cvd({db:argv.d
        ,design:argv.dd
        ,view:argv.v
        ,limit:argv.l}
       ,function(){
            console.log('all done')
            return null
        })
});

1; // long live perl
