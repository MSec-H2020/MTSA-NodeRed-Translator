var should = require('should')
var helper = require('node-red-node-test-helper')
var createNode = require('../sox/create')

helper.init(require.resolve('node-red'))

describe('Create Node', function() {
  beforeEach(function(done) {
    helper.startServer(done)
  })

  afterEach(function(done) {
    helper.unload()
    helper.stopServer(done)
  })

  it('should be loaded', function(done) {
    var flow = [{ id: 'n1', type: 'Create', name: 'Create Device' }]
    helper.load(createNode, flow, function() {
      var n1 = helper.getNode('n1') // FIXME:return null
      console.log(n1)
      n1.should.have.property('name', 'Create Device')
      done()
    })
  })
})
