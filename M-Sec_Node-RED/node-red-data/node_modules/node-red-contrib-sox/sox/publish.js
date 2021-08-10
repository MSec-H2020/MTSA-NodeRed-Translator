// TODO: translate comments into English when complete
const DEFAULT_BOSH = 'http://sox.ht.sfc.keio.ac.jp:5280/http-bind/'
const DEFAULT_XMPP = 'sox.ht.sfc.keio.ac.jp'
const SoxConnection = require('soxjs2').SoxConnection
const TransducerValue = require('soxjs2').TransducerValue
const Data = require('soxjs2').Data

module.exports = function(RED) {
  'use strict'
  function SoxPublishNode(config) {
    RED.nodes.createNode(this, config)

    this.login = RED.nodes.getNode(config.login)
    if (!this.login) {
      this.status({
        fill: 'red',
        shape: 'dot',
        text: 'Credential error'
      })
      this.error('No credentials specified')
      return
    }

    this.device = config.device

    this.bosh = this.login.bosh || DEFAULT_BOSH
    this.xmpp = this.login.xmpp || DEFAULT_XMPP
    this.jid = this.login.jid
    this.password = this.login.password

    var node = this

    node.on('input', function(msg) {
      node.client = new SoxConnection(node.bosh, node.xmpp)
      var domain = node.client.getDomain()

      if (!msg.transducer) {
        node.status({
          fill: 'red',
          shape: 'dot',
          text: 'Input data error'
        })
        node.error('Input error. msg.transducer is empty')
        return
      }

      node.client.connect(() => {
        node.status({ fill: 'green', shape: 'dot', text: 'request...' })

        var device = node.client.bind(node.device, domain)
        var values = []
        Object.keys(msg.transducer).forEach(function(key) {
          var t_val = new TransducerValue(
            key,
            msg.transducer[key],
            msg.transducer[key]
          )
          values.push(t_val)
        })

        var data = new Data(device, values)

        var suc = function(result) {
          console.log('publish success')
          console.log(result.outerHTML)
          node.send({ payload: 'Success' })
          node.client.disconnect()
          node.status({})
        }

        var err = function(result) {
          console.log('publish error')
          console.log(result.outerHTML)
          node.send({ payload: result.outerHTML })
          node.client.disconnect()
          node.status({ fill: 'red', shape: 'dot', text: 'error' })
        }

        node.client.publish(data, suc, err)
      })
    })

    node.on('close', function() {
      node.client.disconnect()
      node.status({})
    })
  }
  RED.nodes.registerType('Publish', SoxPublishNode)
}
