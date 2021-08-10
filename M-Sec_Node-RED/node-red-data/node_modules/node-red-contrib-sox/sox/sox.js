module.exports = function(RED) {
  'use strict'

  function SoxCredentialsNode(config) {
    RED.nodes.createNode(this, config)
    this.bosh = config.bosh
    this.xmpp = config.xmpp
    if (this.credentials) {
      this.jid = this.credentials.jid
      this.password = this.credentials.password
    }
  }
  RED.nodes.registerType('sox-credentials', SoxCredentialsNode, {
    credentials: {
      jid: { type: 'text' },
      password: { type: 'password' }
    }
  })
}
