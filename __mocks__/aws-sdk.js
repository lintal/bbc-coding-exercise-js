const AWS = jest.createMockFromModule('aws-sdk');

let returnData = {};
AWS.__setS3GetObjectReturnData = (data) => {
  returnData = data;
}

const getObject = jest.fn(({ Bucket, Key }) => {
  const content = Buffer.from(
    JSON.stringify(returnData),
    'utf8',
  );
  
  return { promise: async () => ({
    Body: content,
    ContentType: 'application/json',
    ContentLength: content.length,
  })}
});
AWS.__getObjectSpy = getObject;

const putObjectPromise = jest.fn();
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