const MockAWS = require('aws-sdk');
const { Console } = require('console');
const fs = require('fs');
const { handler } = require('../index');
const eventFactory = require('./helpers/eventFactory');

describe('Add single programme to single feed', () => {
  let putObjectCallParams;
  let putObjectData;

  beforeAll(async () => {
    jest.clearAllMocks();
  
    const publishMessage = require('./data/publish-p03q8kd9-2030Z.json');
  
    await handler(
      eventFactory.create([ publishMessage ])
    );

    putObjectCallParams = MockAWS.__putObjectSpy.mock.calls[0][0];
    putObjectData = JSON.parse(putObjectCallParams.Body);
  });

  test('it should fetch programme document from our bucket', () => {
    expect(MockAWS.__getObjectSpy).toHaveBeenCalled();
    expect(MockAWS.__getObjectSpy).toHaveBeenCalledWith({
      Bucket: 'mock-bucket-name',
      Key: 'p03q8kd9.json',
    });
  
    expect(MockAWS.__putObjectSpy).toHaveBeenCalled();
  });

  test('it should put a document back to our bucket', () => {
    expect(putObjectCallParams.Bucket).toBe('mock-bucket-name');
    expect(putObjectCallParams.Key).toBe('p03q8kd9.json');

    expect(MockAWS.__putObjectPromiseSpy).toHaveBeenCalled();
    expect(MockAWS.__putObjectPromiseSpy.mock.results[0].value.isResolved).toBe(true);
  });
  
  test('it should add a programme to our RSS document', async () => {  
    expect(putObjectData.channel.item).toEqual(expect.arrayContaining([{
      title: '20:30 GMT',
      description: 'The latest shareable news from BBC Minute, published at 20:30GMT on Tuesday 23rd November 2021.',
      pubDate: 'Tue, 23 Nov 2021 20:26:55 GMT',
      guid: 'urn:bbc:podcast:p0b5zk7c',
      link: 'https://www.bbc.co.uk/programmes/p0b5zk7c',
      enclosure: {
        url: 'https://example-programmes.bbc.co.uk/p0b5zk53.mp3',
        length: 0,
        type: 'audio/mpeg',
      },
    }]));
  });

  test('it should have updated the RSS document\'s pubDate', () => {
    expect(putObjectData.channel.pubDate).toBe('Tue, 23 Nov 2021 20:26:55 GMT');
  })
});

test.todo('it should add multiple programmes to our RSS document');

test.todo('it should add different programmes to different RSS documents');

test.todo('it should ignore programmes where an RSS document does not currently exist');