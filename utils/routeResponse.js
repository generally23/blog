class ApplicationResponse {
  constructor(payload = {}, statusCode = 200) {
    this.status = 'success';
    this.statusCode = statusCode;
    for (let key in payload) {
      this[key] = payload[key];
    }
  }
}

module.exports = ApplicationResponse;
