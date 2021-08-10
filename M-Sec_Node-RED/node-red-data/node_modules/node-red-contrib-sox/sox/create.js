// TODO: translate comments into English when complete
const DEFAULT_BOSH = 'http://sox.ht.sfc.keio.ac.jp:5280/http-bind/'
const DEFAULT_XMPP = 'sox.ht.sfc.keio.ac.jp'
const uuidv1 = require('uuid/v1')
const SoxConnection = require('soxjs2').SoxConnection
const Device = require('soxjs2').Device
const DeviceMeta = require('soxjs2').DeviceMeta
const MetaTransducer = require('soxjs2').MetaTransducer

module.exports = function(RED) {
  'use strict'
  function SoxCreateNode(config) {
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

    this.bosh = this.login.bosh || DEFAULT_BOSH
    this.xmpp = this.login.xmpp || DEFAULT_XMPP
    this.jid = this.login.jid || DEFAULT_XMPP
    this.password = this.login.password

    var node = this

    function createSoxDevice(data) {
      node.client = new SoxConnection(node.bosh, node.jid, node.password)

      node.client.connect(() => {
        node.status({ fill: 'green', shape: 'dot', text: 'connected' })

        var name = data.device_name
        var type = data.device_type
        var transducer = data.transducer

        if (!name || !type || !transducer) {
          node.status({
            fill: 'red',
            shape: 'dot',
            text: 'Input data error'
          })
          node.error('Input data error. One of the inputs is blank')
          return
        }

        var domain = node.client.getDomain()
        var device = new Device(node.client, name, domain)

        var metaTransducers = []
        transducer.forEach(function(tr) {
          var name = tr.name
          var tdrId = tr.name
          var units = tr.units
          var mTransducer = new MetaTransducer(device, name, tdrId, units)
          metaTransducers.push(mTransducer)
        })

        var serialNumber = uuidv1()

        var deviceMeta = new DeviceMeta(
          device,
          name,
          type,
          serialNumber,
          metaTransducers
        )

        var suc = function(result) {
          console.log('create success')
          console.log(result.outerHTML)

          node.send({ payload: 'Success' })
          node.client.disconnect()
          node.status({})
        }

        var err = function(result) {
          console.log('create error')
          console.log(result.outerHTML)
          node.send({
            payload: result.outerHTML
          })
          node.status({ fill: 'red', shape: 'dot', text: 'Publish error' })
          node.client.disconnect()
        }

        node.client.createDevice(device, deviceMeta, suc, err)
      })
    }

    node.on('input', function(msg) {
      if (config.data === 'json') {
        if (!msg.device) {
          node.status({
            fill: 'red',
            shape: 'dot',
            text: 'Input data error'
          })
          node.error('Input error. msg.device is empty')
          return
        }

        createSoxDevice(msg.device)
      } else if (config.data == 'node') {
        var deviceData = {
          device_name: config.device,
          device_type: config.devicetype,
          transducer: config.transducers
        }
        createSoxDevice(deviceData)
      }
    })

    node.on('close', function() {
      node.client.disconnect()
      node.status({})
    })
  }
  RED.nodes.registerType('Create', SoxCreateNode)
}
