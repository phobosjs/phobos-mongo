'use strict'

class PhobosMongoModel {

  constructor(data = {}) {

  }

  save() {
    return this.query()
  }

  delete() {
    return this.query()
  }

  static query(query) {
    return new Promise((resolve, reject) => {

    })
  }

  static all({ order = 'ASC', limit = 20, orderBy = 'id' }) {
    return this.query()
  }

  static find(query) {
    return this.query()
  }

  static one(id) {
    return this.query()
  }

  static first(query) {
    return this.query()
  }

  static count(query) {
    return this.query()
  }

}

module.exports = PhobosMongoModel
