var should = require('should')
var helper = require('node-red-node-test-helper')
var publishNode = require('../sox/publish')

helper.init(require.resolve('node-red'))

describe('Publish Node', function() {
  beforeEach(function(done) {
    helper.startServer(done)
  })

  afterEach(function(done) {
    helper.unload()
    helper.stopServer(done)
  })

  it('should be loaded', function(done) {
    var flow = [{ id: 'n1', type: 'Publish', name: 'Publish Device' }]
    helper.load(publishNode, flow, function() {
      var n1 = helper.getNode('n1') // FIXME:return null
      console.log(n1)
      n1.should.have.property('name', 'Publish Device')
      done()
    })
  })
})
