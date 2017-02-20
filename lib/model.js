'use strict'

const Inflected = require('inflected')
const ObjectId = require('mongodb').ObjectID
const ModelProxy = require('phobosjs-model')

/** Class representing a single model instance. This class is meant to be
 * extended by actual model classes by the user's application */
class PhobosMongoModel {

  /**
   * Create an instance of the model.
   * @param {object} data - Attributes for the new model.
   */
  constructor(data = {}) {
    this.collection = Inflected.pluralize(this.constructor.name.toLowerCase())

    this._dirty = {}
    this._canonical = {}

    // If we have an id in the payload, then this is a result and not a new model
    this[data._id ? '_canonical' : '_dirty'] = data

    return new ModelProxy(this)
  }

  /**
   * Saves an instance of the model to the store.
   * @return {Promise} Returns a Promise for the query to save.
   */
  save() {
    // Don't run a save if there is no changes!
    if (Object.keys(this._dirty) < 1) return PhobosMongoModel.query()

    const queryObject = {
      type: 'insert',
      where: Object.assign({}, this._canonical, this._dirty)
    }

    return this.constructor.runQuery(queryObject)
  }

  /**
   * Deletes the row from the store.
   * @return {Promise} Returns a Promise for the query to delete.
   */
  delete() {
    // We cannot delete something that hasn't yet been saved!
    if (!this._canonical.id) return PhobosMongoModel.query()

    const queryObject = PhobosMongoModel.queryObject({
      type: 'delete',
      table: this.collection,
      where: { id: this._canonical.id }
    })

    return this.constructor.runQuery(queryObject.query, queryObject.values)
  }

  /**
   * Bootstraps and migrates the table as needed - done internally in phobos.js
   */
  set(prop, value) {
    return this._dirty[prop] = value
  }

  get(prop) {
    if (prop === 'id') prop = '_id'
    return this._dirty[prop] || this._canonical[prop]
  }

  toObject() {
    return Object.assign({}, this._canonical, this._dirty)
  }

  /**
   * Runs a mango query on the store.
   * @param {string} query - A raw SQL query, but with $1 tokens instead of parameters.
   * @param {array} params - An array of values to use for the query.
   * @return {Promise} Returns a Promise for the query to save.
   */
  static runQuery(query, { stream = false, lean = false, first = false, last = true } = {}) {
    PhobosMongoModel.queryLog(query)

    return new Promise((resolve, reject) => {
      if (!query) return resolve([])

      const arrayResponse = query.type && query.type === 'find'

      let run = this.store.collection(this.collection)
      run = run[query.type || 'find'](query.where)

      if (query.skip) run = run.skip(query.skip)
      if (query.limit) run = run.limit(query.limit)
      if (query.sort) run = run.sort(query.sort)
      if (arrayResponse) run = run.toArray()
      if (stream) return run

      run.then(result => {
        if (result && result.result && result.ops) {
          result = result.ops.length === 1 ? result.ops[0] : result.ops
        }

        if (arrayResponse && first && result.length > 0) {
          const firstRow = result[0]
          return resolve(lean ? firstRow : new (this)(firstRow))
        }

        if (arrayResponse && last && result.length > 0) {
          const lastRow = result[result.length - 1]
          return resolve(lean ? lastRow : new (this)(lastRow))
        }

        if (lean || result === null) return resolve(result)

        const instanced = arrayResponse ? [] : new (this)(result)

        if (arrayResponse) {
          for (const row of result) instanced.push(new (this)(row))
        }

        return resolve(instanced)
      }).catch(reject)
    })
  }

  /**
   * Runs an SQL query on the store.
   * @param {string} query - A raw SQL query, but with $1 tokens instead of parameters.
   * @param {array} params - An array of values to use for the query.
   * @return {Promise} Returns a Promise for the query to save.
   */
  static query(rawQuery) {
    const queryObject = this.queryObject(rawQuery)

    return this.runQuery(queryObject.query, queryObject.values)
  }

  /**
   * Returns all of a given resource.
   * @param {number} limit - Limit the query to a certain amount of records.
   * @param {string} order - ASC (ascending) or DESC (descending).
   * @param {string} sort - The field you want to use to sort the values.
   * @return {Promise} Returns a Promise for the query to save.
   */
  static all({ limit = 20, skip = 0, order = 'ASC', sort = '_id' } = {}) {
    const queryObject = {
      limit, skip,
      sort: { [sort]: order === 'ASC' ? 1 : -1 },
      where: {},
      type: 'find'
    }

    return this.runQuery(queryObject)
  }

  /**
   * Runs a constrained query on the datastore.
   * @param {number} limit - Limit the query to a certain amount of records.
   * @param {string} order - ASC (ascending) or DESC (descending).
   * @param {string} sort - The field you want to use to sort the values.
   * @param {object} where - This holds all the clauses corresponding to the WHERE
   * @return {Promise} Returns a Promise for the query to save.
   */
  static find({ limit = 20, skip = 0, order = 'ASC', sort = '_id', where = {} } = {}) {
    const queryObject = {
      limit, skip, where,
      sort: { [sort]: order === 'ASC' ? 1 : -1 },
      type: 'find'
    }

    return this.runQuery(queryObject)
  }

  /**
   * Returns a single record, fetched by _id.
   * @param {string} _id - The _id of the record you want to return.
   * @return {Promise} Returns a Promise for the query to save.
   */
  static one(_id) {
    if (!_id) throw new Error('Model#one() requires an ID parameter')

    const queryObject = {
      where: { _id },
      type: 'findOne'
    }

    return this.runQuery(queryObject)
  }

  /**
   * Counts records based on the where param
   * @param {object} where - This holds all the clauses corresponding to the WHERE
   * @return {Promise} Returns a Promise for the query to save.
   */
  static count(where) {
    const queryObject = {
      where,
      type: 'count'
    }

    return this.runQuery(queryObject)
  }

  /**
   * Logs the currently executing query for the benefit of debugging.
   * @param {object} query - the current query that will be run
   */
  static queryLog(query) {
    console.info('[QUERY]', query)
  }

  /**
   * Returns the collection name of this model
   */
  static get collection() { return Inflected.pluralize(this.name.toLowerCase()) }

  /**
   * A wrapper around ObjectId so that schemas are easier to put together
   */
  static get ObjectId() { return ObjectId }

  /**
   * Sets a attribute on the resource (collection)
   * @param {string} name - The name for the field
   * @param {object} properties - An object containing some settings for the field such as type, default, etc
   */
  static attribute(name, properties) {
    if (!name) throw new Error('Model.attribute() must provide an attribute name')

    this.attributes = this.attributes || {}
    this.attributes[name] = properties
  }

  /**
   * Bootstraps the model so it holds the schema - done internally in phobos.js
   * @return {Promise} Returns a Promise with the client being returned
   */
  static init(db) {
    this.fields = {
      _id: { type: this.ObjectId, required: true }
    }

    for (const attr in this.attributes) {
      this.fields[attr] = this.attributes[attr]
    }

    this.fields.updatedAt = { type: Date, default: new Date() }

    this.store = db

    // We return a promise to make it conform with APIs where this is async
    return new Promise((resolve, reject) => resolve(this.store))
  }

}

module.exports = PhobosMongoModel
