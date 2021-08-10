const should = require('should')
const { expect } = require('chai')
const helper = require('node-red-node-test-helper')
const soxNode = require('../sox/sox')
const subscribeNode = require('../sox/subscribe')

helper.init(require.resolve('node-red'))

describe('Subscribe Node', function() {
  this.timeout(10000)
  beforeEach(function(done) {
    helper.startServer(done)
  })

  afterEach(function(done) {
    helper.unload()
    helper.stopServer(done)
  })

  describe('Success', function() {
    it('should be loaded', function(done) {
      var flow = [{ id: 'n1', type: 'Subscribe', name: 'Subscribe Device' }]
      helper.load(subscribeNode, flow, function() {
        var n1 = helper.getNode('n1')
        n1.should.have.property('name', 'Subscribe Device')
        done()
      })
    })

    it('Success get the sox server data', function(done) {
      var flow = [
        {
          id: 'b962aadc.99ef58',
          type: 'Subscribe',
          z: '2ca93200.9acbde',
          name: 'Subscribe Device',
          device: 'fujisawaGeoTweets',
          transducer: '',
          login: 'fc7980bd.49f74',
          x: 280,
          y: 160,
          wires: [['h1']]
        },
        {
          id: 'h1',
          type: 'helper'
        },
        {
          id: 'fc7980bd.49f74',
          type: 'sox-credentials',
          z: ''
        }
      ]

      helper.load([soxNode, subscribeNode], flow, n1_credential, function() {
        var helper_node = helper.getNode('h1')

        helper_node.on('input', function(msg) {
          try {
            expect(msg)
              .to.be.an('object')
              .with.any.keys('payload')
              .and.property('payload')
            done()
          } catch (err) {
            done(err)
          }
        })
      })
    })
  })

  describe('Error', function() {
    // soxjs2 is return nothing
    /*
    it('Device name is incorrect', function(done) {
      var flow = [
        {
          id: 'b962aadc.99ef58',
          type: 'Subscribe',
          z: '2ca93200.9acbde',
          name: 'Subscribe Device',
          device: 'it_is_inccorect_node_name_hahaha',
          transducer: '',
          login: 'fc7980bd.49f74',
          x: 280,
          y: 160,
          wires: [['h1']]
        },
        {
          id: 'h1',
          type: 'helper'
        },
        {
          id: 'fc7980bd.49f74',
          type: 'sox-credentials',
          z: ''
        }
      ]

      helper.load([soxNode, subscribeNode], flow, n1_credential, function() {
        var subscribe = helper.getNode('b962aadc.99ef58')
        var helper_node = helper.getNode('h1')

        helper_node.on('input', function(msg) {
          try {
            console.log('error message')
            console.log(msg)
          } catch (err) {
            done(err)
          }
        })
      })
    })
    */
  })
})
