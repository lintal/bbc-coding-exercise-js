const MockAWS = require('aws-sdk');
const { handler } = require('../index');
const eventFactory = require('./helpers/eventFactory');
const publishMessage = require('./data/publish-w13xttp5-1600Z.json');

describe('Ignore where no feed', () => {
  beforeAll(async () => {
    await handler(eventFactory.create([ publishMessage ]));
  });

  test('it should ignore programmes where an RSS document does not currently exist', () => {
    expect(MockAWS.__putObjectSpy).not.toHaveBeenCalled();
  });
});