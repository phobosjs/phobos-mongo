'use strict'

const URL = require('url')
const PhobosMongoModel = require('./model')
const DefaultOptions = require('../config/mongo-options')

/** Class initializing and containing the logic to establish a connection to the datastore */
class PhobosMongo {

  /**
   * Run internally by phobos.js to establish a connection to the store.
   * @param {object} options - pass in some connection settings
   * @return {Promise} Returns a Promise that resolves to return a pg.Pool object.
   */
  init(options = {}) {
    this._mongo = options.instance ? options.instance : require('mongodb').MongoClient

    const uri = options.connection.uri
    const mongoConfig = Object.assign({}, DefaultOptions.config, { uri })

    return this._connect(mongoConfig)
  }

  /**
   * Internal method to initiate a Mongo connection
   * @param {object} mongoConfig - A complete connection prefs object used by the client
   * @return {Promise} Returns a promise, eventually a Mongo connection
   */
  _connect(mongoConfig) {
    return new Promise((resolve, reject) => {
      this._mongo.connect(mongoConfig.uri, (error, db) => {
        if (error) return reject(error)
        this._db = db
        return resolve(db)
      })
    })
  }

  /**
   * Internal method to initiate a pg.Pool
   */
  _gracefulExit() {
    this._db.close()
  }

}

module.exports = PhobosMongo
