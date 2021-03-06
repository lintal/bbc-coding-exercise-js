const fs = require('fs');
const TestablePromise = require('../tests/helpers/TestablePromise');

const AWS = jest.createMockFromModule('aws-sdk');

class MockAwsError extends Error {
  constructor(message, meta) {
    super(message);

    this.code = meta.code;
    this.statusCode = meta.statusCode
    this.retryable = false;
  }
}

const getObject = jest.fn(({ Key }) => {
  const path = `./tests/data/bucket/${Key}`;
  let content;

  if (fs.existsSync(path)) {
    content = fs.readFileSync(path);
  }

  return {
    promise: async () => {
      if (content) {
        return {
          Body: content,
          ContentType: 'application/json',
          ContentLength: content.length,
        }
      }

      throw new MockAwsError(
        'NoSuchKey: The specified key does not exist.',
        {
          code: 'NoSuchKey',
          statusCode: 404,
        },
      );
    }
  }
});
AWS.__getObjectSpy = getObject;

// const putObjectPromise = jest.fn(() => ({ resolved: true }));
const putObjectPromise = jest.fn(() => TestablePromise.factory(new Promise((resolve) => {
  process.nextTick(() => {
    resolve({ resolved: true });
  })
})));
AWS.__putObjectPromiseSpy = putObjectPromise;

const putObject = jest.fn(() => ({
  promise: putObjectPromise,
}));
AWS.__putObjectSpy = putObject;

AWS.S3 = function() {
  return {
    getObject,
    putObject,
  }
}

module.exports = AWS;