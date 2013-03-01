/* global require console process it describe after before */

// these tests are for a user, but not one with admin privs

var should = require('should')
describe('export two functions',function(){
    var library = require('../.')
    it('should export make_bulk_deleter',function(done){
        library.should.have.property('make_bulk_deleter')
        done()
    })
    it('should export couch_view_deleter',function(done){
        library.should.have.property('couch_view_deleter')
        done()
    })
})
