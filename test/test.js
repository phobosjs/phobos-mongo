'use strict'

require('dotenv').config()

const expect = require('chai').expect
const mongo = require('mongodb')
const _Module = require('../index')

const TEST_MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost/mongotest'

describe('phobos.js mongodb', () => {
  const DB = new _Module.Store()
  let store = null
  let billyId = null

  class Model extends _Module.Model { }

  function attachListener(func) {
    _Module.Model.prototype.queryLog = func
  }

  before(done => {
    DB.init({ connection: { uri: TEST_MONGO_URI } }).then(client => {
      store = client

      Model.attribute('username', { type: String })

      _Module.Model.queryLog = (query) => {}

      Model.init(store).then(() => {
        const Billy = new Model({ username: 'Billy' })

        Billy.save().then(result => {
          billyId = result._id
          done()
        }).catch(console.log)
      })
    })
  })

  after(done => {
    Model.runQuery({ type: 'drop' }).then(() => {
      done()
    })
  })

  it('initializes a Mongo.Db object', () => {
    expect(store).to.be.instanceof(mongo.Db)
  })

  it('model extends PhobosMongoModel', () => {
    const inst = new Model()

    expect(inst).to.be.instanceof(_Module.Model)
    expect(inst.collection).to.equal('models')
  })

  it('properly serializes into an object via toObject() and stores changes in _dirty', () => {
    const inst = new Model()

    inst.username = 'wutwut'

    expect(inst.toObject()).to.deep.equal({ username: 'wutwut' })
    expect(inst._dirty).to.deep.equal({ username: 'wutwut' })
  })

  it('static#all()', done => {
    _Module.Model.queryLog = query => {
      expect(query).to.deep.equal({
        limit: 11,
        sort: { username: -1 },
        skip: 0,
        where: {},
        type: 'find'
      })

      done()
    }

    expect(Model.all({ limit: 11, order: 'DESC', sort: 'username' })).to.be.instanceof(Promise)
  })

  it('static#one()', done => {
    _Module.Model.queryLog = query => {
      expect(query).to.deep.equal({
        where: { _id: 111 },
        type: 'findOne'
      })

      done()
    }

    expect(Model.one(111)).to.be.instanceof(Promise)
  })

  it('static#find()', done => {
    _Module.Model.queryLog = query => {
      expect(query).to.deep.equal({
        limit: 20,
        sort: { _id: 1 },
        skip: 0,
        where: { username: 'phobosman' },
        type: 'find'
      })

      done()
    }

    expect(Model.find({
      where: { username: 'phobosman' }
    })).to.be.instanceof(Promise)
  })

  it('static#count()', done => {
    _Module.Model.queryLog = query => {
      expect(query).to.deep.equal({
        where: { username: 'phobosman' },
        type: 'count'
      })

      done()
    }

    expect(Model.count({ username: 'phobosman' })).to.be.instanceof(Promise)
  })

  it('static#runQuery()', done => {
    _Module.Model.queryLog = query => {}

    const query = {
      limit: 20,
      sort: { _id: 1 },
      skip: 0,
      where: { username: 'phobosman' },
      type: 'find'
    }

    Model.runQuery(query, { lean: true }).then(result => {
      expect(result.length).to.equal(0)
      done()
    })
  })

  it('instance#save() with new model', done => {
    _Module.Model.queryLog = query => {}

    const newModel = new Model({ username: 'bill' })

    newModel.save().then(result => {
      expect(result.username).to.equal('bill')
      expect(result._id).to.be.instanceof(mongo.ObjectID)

      done()
    })
  })

  it('instance#save() with existing model', done => {
    _Module.Model.queryLog = (query) => {}

    Model.one(billyId).then(result => {
      result.username = 'helen'

      result.save().then(saved => {
        expect(result.username).to.equal('helen')
        expect(result._id.toString()).to.equal(billyId.toString())

        done()
      })
    })
  })

  it('instance#delete() with existing model', done => {
    _Module.Model.queryLog = (query) => {}

    Model.one(billyId).then(billy => {
      billy.delete(billyId).then(wasDeleted => {
        expect(wasDeleted).to.equal(true)

        Model.one(billyId).then(result => {
          expect(result).to.deep.equal(null)
          done()
        })
      })
    })
  })
})
