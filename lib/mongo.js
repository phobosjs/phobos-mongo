'use strict'

const URL = require('url')
const PhobosMongoModel = require('./model')
const DefaultOptions = require('../config/mongo-options')

class PhobosMongo {

  init(options = {}) {

  }

  _connect(pgConfig) {
    return new Promise((resolve, reject) => {

    })
  }

}

module.exports = PhobosMongo
