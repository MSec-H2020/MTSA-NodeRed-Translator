const DEFAULT_BOSH = 'http://sox.ht.sfc.keio.ac.jp:5280/http-bind/'
const SoxConnection = require('soxjs2').SoxConnection

module.exports = function(RED) {
  'use strict'
  function SoxAccsessPermissionNode(config) {
    RED.nodes.createNode(this, config)

    if (!config.device) {
      this.error('No device specified')
      return
    }

    this.login = RED.nodes.getNode(config.login)
    if (!this.login) {
      node.status({
        fill: 'red',
        shape: 'dot',
        text: 'Credential error'
      })
      node.error('No credentials specified')
      return
    }

    this.devices = config.device

    this.bosh = this.login.bosh || DEFAULT_BOSH
    this.jid = this.login.jid
    this.password = this.login.password
    var node = this

    if (!this.jid || !this.password) {
      node.error('require ID/PASS')
      node.status({
        fill: 'red',
        shape: 'dot',
        text: 'require ID/PASS'
      })
      return
    }

    function setAccessPermission() {
      node.client = new SoxConnection(node.bosh, node.jid, node.password)
      node.client.connect(() => {
        node.status({ fill: 'green', shape: 'dot', text: 'request...' })
        var dn = config.device
        var domain = node.client.getDomain()
        var accessModel = config.accessmodel

        var affaliate = []
        for (var i = 0; i < config.affaliations.length; i++) {
          var aff = config.affaliations[i].user
          if (aff) {
            affaliate.push(config.affaliations[i].user)
          }
        }

        if (accessModel == 'whitelist' && affaliate.length == 0) {
          node.error('affaliate is empty')
          node.status({ fill: 'red', shape: 'dot', text: 'error' })
          return
        }

        // affaliate callback
        var sucAf = function() {
          console.log('affaliate success')
          node.send({ payload: 'Success' })
          node.client.disconnect()
          node.status({})
        }
        var errAf = function() {
          console.log('set affaliate error')
          console.log(result.outerHTML)
          node.error(result.outerHTML)
          node.send({ payload: 'Error' })
          node.client.disconnect()
          node.status({ fill: 'red', shape: 'dot', text: 'error' })
        }

        // accessModel callback
        var sucAm = function() {
          console.log('accessModel succsess')
          if (accessModel == 'whitelist') {
            node.client.setAffaliation(dn, domain, affaliate, sucAf, errAf)
          }
          node.send({ payload: 'Success' })
          node.client.disconnect()
          node.status({})
        }
        var errAm = function(result) {
          console.log('set accessModel error')
          console.log(result.outerHTML)
          node.error(result.outerHTML)
          node.send({ payload: 'Error' })
          node.client.disconnect()
          node.status({ fill: 'red', shape: 'dot', text: 'error' })
        }

        node.client.setAccessPermission(dn, domain, accessModel, sucAm, errAm)
      })
    }

    node.on('input', function() {
      setAccessPermission()
    })

    node.on('close', function() {
      node.client.disconnect()
      node.status({})
    })
  }
  RED.nodes.registerType('AccsessPermission', SoxAccsessPermissionNode)
}
