module.exports = {
  mongodbMemoryServerOptions: {
    binary: {
      version: '6.0.4',
      skipMD5: true,
      downloadDir: './node_modules/.cache/mongodb-memory-server',
    },
    instance: {
      dbName: 'jest',
    },
    autoStart: false,
  },
  mongoURLEnvName: 'MONGODB_URI',
  mongoMemoryServerOptions: {
    instance: {
      dbName: 'jest',
    },
    binary: {
      version: '4.0.3',
      skipMD5: true,
    },
    autoStart: false,
  }
}; 