const { EventEmitter } = require("events");

class MockStream extends EventEmitter {
  constructor() {
    super();
  }

  data(row) {
    this.emit("data", row);
  }

  end() {
    this.emit("end");
  }

  error(err) {
    this.emit("error", err);
  }
}

module.exports = MockStream;
