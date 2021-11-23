const MockAWS = require('aws-sdk');
const { handler } = require('../index');

beforeEach(() => {
  jest.clearAllMocks();
});

test('it should add programme to our RSS document', async () => {
  MockAWS.__setS3GetObjectReturnData({
    Bucket: 'my-bucket',
    Key: 'object-key.mp3',
  });

  await handler();

  expect(MockAWS.__getObjectSpy).toHaveBeenCalled();
  expect(MockAWS.__getObjectSpy).toHaveBeenCalledWith({
    Bucket: 'my-bucket',
    Key: 'object-key.mp3',
  });

  expect(MockAWS.__putObjectSpy).toHaveBeenCalled();
  expect(MockAWS.__putObjectPromiseSpy).toHaveBeenCalled();
});

test.todo('it should add multiple programmes to our RSS document');

test.todo('it should add different programmes to different RSS documents');

test.todo('it should ignore programmes where an RSS document does not currently exist');