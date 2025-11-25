module.exports = {
    testEnvironment: "node",
    verbose: true,
    coverageDirectory: "coverage",
    collectCoverageFrom: [
      "controllers/**/*.js",
      "routes/**/*.js",
      "middlewares/**/*.js"
    ]
  };
  