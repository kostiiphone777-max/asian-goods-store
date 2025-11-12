const pg = require('./postgres');

class Database {
  async init() {
    return pg.init();
  }
  run(sql, params = []) {
    return pg.run(sql, params);
  }
  get(sql, params = []) {
    return pg.get(sql, params);
  }
  all(sql, params = []) {
    return pg.all(sql, params);
  }
  close() {
    return pg.close();
  }
}

module.exports = new Database();
 
