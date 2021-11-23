const MockAWS = require('aws-sdk');
const { handler } = require('../index');
const eventFactory = require('./helpers/eventFactory');
const programme1 = require('./data/publish-p03q8kd9-2030Z.json');
const programme2 = require('./data/publish-p03q8kd9-2100Z.json');

describe('Add many programmes to single feed', () => {
  let putObjectCallParams;
  let putObjectData;

  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('it should add both programmes to our RSS document', async () => {  
    await handler(
      eventFactory.create([ programme1, programme2 ])
    );

    putObjectCallParams = MockAWS.__putObjectSpy.mock.calls[0][0];
    putObjectData = JSON.parse(putObjectCallParams.Body);

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

    expect(putObjectData.channel.item).toEqual(expect.arrayContaining([{
      title: '21:00 GMT',
      description: 'The latest shareable news from BBC Minute, published at 21:00GMT on Tuesday 23rd November 2021.',
      pubDate: 'Tue, 23 Nov 2021 20:56:57 GMT',
      guid: 'urn:bbc:podcast:p0b5znhz',
      link: 'https://www.bbc.co.uk/programmes/p0b5znhz',
      enclosure: {
        url: 'https://example-programmes.bbc.co.uk/p0b5znd3.mp3',
        length: 0,
        type: 'audio/mpeg',
      },
    }]));
  });

  test('it should set the RSS document\'s pubDate to match the latest episode', async () => {
    await handler(
      eventFactory.create([ programme1, programme2 ])
    );

    putObjectCallParams = MockAWS.__putObjectSpy.mock.calls[0][0];
    putObjectData = JSON.parse(putObjectCallParams.Body);

    expect(putObjectData.channel.pubDate).toBe('Tue, 23 Nov 2021 20:56:57 GMT');
  });

  test('it should set the RSS document\'s pubDate to match the latest episode - reversed', async () => {
    await handler(
      eventFactory.create([ programme2, programme1 ])
    );

    putObjectCallParams = MockAWS.__putObjectSpy.mock.calls[0][0];
    putObjectData = JSON.parse(putObjectCallParams.Body);

    expect(putObjectData.channel.pubDate).toBe('Tue, 23 Nov 2021 20:56:57 GMT');
  });
});
