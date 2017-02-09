'use strict'

require('dotenv').config()

const chai = require('chai')
const _Module = require('../index')

const TEST_MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost/mongotest'

const expect = chai.expect

describe('phobos.js mongodb', () => {
  const DB = new _Module.Store()
  let store = null
  let billyId = null

  class Model extends _Module.Model { }

  function attachListener(func) {
    _Module.Model.prototype.queryLog = func
  }

  before(done => {
    DB.init({ connection: { uri: TEST_PG_URI } }).then(client => {
      store = client
      done()
    })
    // Model.attribute('username', { type: 'varchar(30)' })
    //
    // attachListener(() => {})
    //
    // Model.init(store).then(() => {
    //   const Billy = new Model({ username: 'Billy' })
    //
    //   Billy.save().then(result => {
    //     billyId = result.id
    //     done()
    //   })
    // })
  })

  // after(done => {
  //   const queryObject = Model.queryObject({
  //     type: 'drop-table',
  //     table: 'models'
  //   })
  //
  //   Model.runQuery(queryObject.query, queryObject.values).then(() => {
  //     done()
  //   })
  // })
  //
  // it('initializes a pg.Pool object', () => {
  //   expect(store).to.be.instanceof(pg.Pool)
  // })
  //
  // it('model extends PhobosPostgresModel', done => {
  //   const inst = new Model()
  //
  //   expect(inst).to.be.instanceof(_Module.Model)
  //   expect(inst.table).to.equal('models')
  //
  //   done()
  // })
  //
  // it('properly serializes into an object via toObject() and stores changes in _dirty', () => {
  //   const inst = new Model()
  //
  //   inst.username = 'wutwut'
  //
  //   expect(inst.toObject()).to.deep.equal({ username: 'wutwut' })
  //   expect(inst._dirty).to.deep.equal({ username: 'wutwut' })
  // })
  //
  // it('static#all()', done => {
  //   _Module.Model.queryLog = (query, params) => {
  //     expect(query).to.equal('select "models".* from "models" order by username DESC limit $1')
  //     expect(params).to.deep.equal([ 11 ])
  //
  //     done()
  //   }
  //
  //   expect(Model.all({ limit: 11, order: 'DESC', sort: 'username' })).to.be.instanceof(Promise)
  // })
  //
  // it('static#one()', done => {
  //   _Module.Model.queryLog = (query, params) => {
  //     expect(query).to.equal('select "models".* from "models" where "models"."id" = $1 limit $2')
  //     expect(params).to.deep.equal([ 111, 1 ])
  //
  //     done()
  //   }
  //
  //   expect(Model.one(111)).to.be.instanceof(Promise)
  // })
  //
  // it('static#find()', done => {
  //   _Module.Model.queryLog = (query, params) => {
  //     expect(query).to.equal('select "models".* from "models" where "models"."username" = $1 order by id ASC limit $2')
  //     expect(params).to.deep.equal([ 'phobosman', 20 ])
  //
  //     done()
  //   }
  //
  //   expect(Model.find({
  //     where: { username: 'phobosman' }
  //   })).to.be.instanceof(Promise)
  // })
  //
  // it('static#count()', done => {
  //   _Module.Model.queryLog = (query, params) => {
  //     expect(query).to.equal('select count(*) from "models" where "models"."username" = $1')
  //     expect(params).to.deep.equal([ 'phobosman' ])
  //
  //     done()
  //   }
  //
  //   expect(Model.count({ username: 'phobosman' })).to.be.instanceof(Promise)
  // })
  //
  // it('static#runQuery()', done => {
  //   _Module.Model.queryLog = (query, params) => {}
  //
  //   const query = "select * from models WHERE models.username = 'BAM'"
  //   const params = []
  //
  //   Model.runQuery(query, params, { lean: true }).then(result => {
  //     expect(result).to.deep.equal({ result: [], count: 0 })
  //     done()
  //   })
  // })
  //
  // it('instance#save() with new model', done => {
  //   _Module.Model.queryLog = (query, params) => {}
  //
  //   const newModel = new Model({ username: 'bill' })
  //
  //   newModel.save().then(result => {
  //     expect(result.username).to.equal('bill')
  //     expect(result.id).to.be.a('number')
  //
  //     done()
  //   })
  // })
  //
  // it('instance#save() with existing model', done => {
  //   _Module.Model.queryLog = (query, params) => {}
  //
  //   Model.one(billyId).then(result => {
  //     result.username = 'helen'
  //
  //     result.save().then(saved => {
  //       expect(result.username).to.equal('helen')
  //       expect(result.id).to.equal(billyId)
  //
  //       done()
  //     })
  //   })
  // })
  //
  // it('instance#delete() with existing model', done => {
  //   _Module.Model.queryLog = (query, params) => {}
  //
  //   Model.one(billyId).then(billy => {
  //     billy.delete(billyId).then(() => {
  //       Model.one(billyId).then(result => {
  //         expect(result).to.deep.equal([])
  //         done()
  //       })
  //     })
  //   })
  // })
})
