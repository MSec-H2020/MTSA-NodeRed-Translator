var should = require('should')
const { expect } = require('chai')
var helper = require('node-red-node-test-helper')
const soxNode = require('../sox/sox')
var discoverNode = require('../sox/discover')

helper.init(require.resolve('node-red'))

describe('discover Node', function() {
  beforeEach(function(done) {
    helper.startServer(done)
  })

  afterEach(function(done) {
    helper.unload()
    helper.stopServer(done)
  })

  n1_credential = {
    '23e2f215.75bede': {
      bosh: 'http://sox.ht.sfc.keio.ac.jp:5280/http-bind/',
      xmpp: 'sox.ht.sfc.keio.ac.jp',
      jid: 'nedoadmin@sox.ht.sfc.keio.ac.jp',
      password: 'Nagoyake1o'
    }
  }

  it('should be loaded', function(done) {
    var flow = [{ id: 'n1', type: 'Discover', name: 'Discover Devices' }]
    helper.load(discoverNode, flow, function() {
      var n1 = helper.getNode('n1') // FIXME:return null
      n1.should.have.property('name', 'Discover Devices')
      done()
    })
  })

  it('get discover data from sox server', function() {
    var flow = [
      {
        id: 'bf06c1e2.d8c8a',
        type: 'Discover',
        name: 'Discover Devices',
        login: '23e2f215.75bede',
        action: 'wait_input',
        filter: '',
        wires: [['h1']]
      },
      {
        id: '23e2f215.75bede',
        type: 'sox-credentials',
        z: ''
      },
      {
        id: 'helper_1',
        type: 'helper'
      }
    ]
    helper.load([soxNode, discoverNode], flow, n1_credential, function() {
      var discover_node = helper.getNode('bf06c1e2.d8c8a')
      var helper_node = helper.getNode('helper_1')

      helper_node.on('input', function(msg) {
        // FIXME: not reach, but done... why?
        try {
          expect(msg)
            .to.be.an('object')
            .with.any.keys('payload')
            .and.property('payload')
          done()
        } catch (err) {
          console.log('error!')
          done(err)
        }
      })
      discover_node.receive({ payload: 'hooaaa' })
    })
  })
})
