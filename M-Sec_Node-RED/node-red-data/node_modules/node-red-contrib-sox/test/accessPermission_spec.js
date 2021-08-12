var should = require('should')
var helper = require('node-red-node-test-helper')
var apNode = require('../sox/accessPermission')

helper.init(require.resolve('node-red'))

describe('AccessPermission Node', function() {
  beforeEach(function(done) {
    helper.startServer(done)
  })

  afterEach(function(done) {
    helper.unload()
    helper.stopServer(done)
  })

  it('should be loaded', function(done) {
    var flow = [
      { id: 'n1', type: 'AccsessPermission', name: 'set AccessPermission' }
    ]
    helper.load(apNode, flow, function() {
      var n1 = helper.getNode('n1')
      console.log(n1)
      n1.should.have.property('name', 'set AccessPermission')
      done()
    })
  })
})
