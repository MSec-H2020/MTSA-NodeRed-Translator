// TODO: translate comments into English when complete
const DEFAULT_BOSH = 'http://sox.ht.sfc.keio.ac.jp:5280/http-bind/'
const DEFAULT_XMPP = 'sox.ht.sfc.keio.ac.jp'
const SoxConnection = require('soxjs2').SoxConnection

module.exports = function (RED) {
  'use strict'
  function SoxSubscribeNode(config) {
    RED.nodes.createNode(this, config)

    if (!config.device) {
      this.error('No device specified')
      return
    }
    this.login = RED.nodes.getNode(config.login) // Retrieve the config node
    if (!this.login) {
      console.log('not login ??')
      node.status({
        fill: 'red',
        shape: 'dot',
        text: 'Credential error'
      })
      node.error('No credentials specified')
      return
    }

    this.action = config.action
    this.devices = config.device.replace(/\s/g, '').split(',')

    this.transducer = config.transducer

    this.bosh = this.login.bosh || DEFAULT_BOSH
    this.xmpp = this.login.xmpp || DEFAULT_XMPP
    this.jid = this.login.jid
    this.password = this.login.password

    var node = this

    console.log(node.devices)

    var soxEventListener = function (data) {
      console.log('@@@@ sub data retrieved')

      var deviceName = data.getDevice().getName()
      var values = data.getTransducerValues()
      var deviceMatch = false
      console.log('node.devices', node.devices)
      // console.log('-------- Sensor data received from ' + soxEvent.device.name)
      for (var i = 0; i < node.devices.length; i++) {
        if (node.devices[i] === deviceName) {
          deviceMatch = true
          break
        }
      }
      if (!deviceMatch) {
        return
      }
      console.log('device matched')

      if (values.length === 0) {
        return
      }
      console.log('values presented')

      if (!node.transducer) {
        node.send({ payload: values, topic: deviceName })
        return
      }
      console.log('node transducer presented')

      for (var i = 0; i < values.length; i++) {
        // console.log(values[i].getTransducerId())
        // console.log(node.transducer)
        if (values[i].getTransducerId() === node.transducer) {
          // console.log(values[i].getRawValue())
          // data output
          node.send({
            payload: ':' + values[i].getRawValue(),
            topic: deviceName
          })
          break
        }
      }
    }

    function subscribe() {
      node.status({ fill: 'yellow', shape: 'dot', text: 'connecting...' })
      node.client = new SoxConnection(node.bosh, node.xmpp)
      node.client.connect(() => {
        node.status({ fill: 'green', shape: 'dot', text: 'connected' })

        node.devices.forEach(function (deviceName) {
          var device = node.client.bind(deviceName)
          node.client.addListener(device, soxEventListener)
          node.client.subscribe(device)
        })
      })
    }

    if (this.action == 'deploy') {
      subscribe()
    }

    // if action = wait input
    node.on('input', function (msg) {
      // get device from msg
      this.devices = msg.device.replace(/\s/g, '').split(',')
      subscribe()
    })

    // if this node is deleted
    node.on('close', function () {
      console.log('CLOSE!!')
      node.status({})
      node.client.unsubscribeAll()
      node.client.disconnect()
    })
  }
  RED.nodes.registerType('Subscribe', SoxSubscribeNode)
}
