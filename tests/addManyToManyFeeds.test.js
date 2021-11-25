const MockAWS = require('aws-sdk');
const { handler } = require('../index');
const eventFactory = require('./helpers/eventFactory');
const programme1 = require('./data/publish-p03q8kd9-2030Z.json');
const programme2 = require('./data/publish-w13xttlc-1830Z.json');
const programme3 = require('./data/publish-p03q8kd9-2100Z.json')
const p03q8kd9 = require('./data/bucket/p03q8kd9.json');
const w13xttlc = require('./data/bucket/w13xttlc.json');

describe('Add single programme to multiple corresponding feeds', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Read/write of programmes', () => {
    beforeAll(async () => {
      await handler(
        eventFactory.create([ programme1, programme2 ])
      );
    });
  
    test('it should fetch both programme document from our bucket', () => {
      expect(MockAWS.__getObjectSpy).toHaveBeenCalled();
      expect(MockAWS.__getObjectSpy).toHaveBeenCalledTimes(2);
  
      expect(MockAWS.__getObjectSpy).toHaveBeenCalledWith({
        Bucket: 'mock-bucket-name',
        Key: 'p03q8kd9.json',
      });
      
      expect(MockAWS.__getObjectSpy).toHaveBeenCalledWith({
        Bucket: 'mock-bucket-name',
        Key: 'w13xttlc.json',
      });
    });
  
    test('it should put our first programme in it\'s corresponding feed', () => {
      p03q8kd9.channel.pubDate = 'Tue, 23 Nov 2021 20:26:55 UTC';
      p03q8kd9.channel.item.push({
        title: '20:30 GMT',
        description: 'The latest shareable news from BBC Minute, published at 20:30GMT on Tuesday 23rd November 2021.',
        pubDate: 'Tue, 23 Nov 2021 20:26:55 UTC',
        guid: 'urn:bbc:podcast:p0b5zk7c',
        link: 'https://www.bbc.co.uk/programmes/p0b5zk7c',
        enclosure: {
          url: 'https://example-programmes.bbc.co.uk/p0b5zk53.mp3',
          length: 0,
          type: 'audio/mpeg',
        },
      });
  
      expect(MockAWS.__putObjectSpy).toHaveBeenCalledWith({
        Bucket: 'mock-bucket-name',
        Key: 'p03q8kd9.json',
        Body: JSON.stringify(p03q8kd9),
      });
    });
  
    test('it should put our second programme in it\'s corresponding feed', () => {
      w13xttlc.channel.pubDate = 'Tue, 23 Nov 2021 18:21:24 UTC';
      w13xttlc.channel.item.push({
        title: '18:30 GMT',
        description: 'BBC Pidgin Minute - 23rd Nov at 18:30 GMT',
        pubDate: 'Tue, 23 Nov 2021 18:21:24 UTC',
        guid: 'urn:bbc:podcast:p0b5yycb',
        link: 'https://www.bbc.co.uk/programmes/p0b5yycb',
        enclosure: {
          url: 'https://example-programmes.bbc.co.uk/p0b5yycj.mp3',
          length: 0,
          type: 'audio/mpeg',
        },
      });
  
      expect(MockAWS.__putObjectSpy).toHaveBeenCalledWith({
        Bucket: 'mock-bucket-name',
        Key: 'w13xttlc.json',
        Body: JSON.stringify(w13xttlc),
      });
    });
  });

  describe('Don\'t repeat S3 calls', () => {
    beforeAll(async () => {
      await handler(
        eventFactory.create([ programme1, programme2, programme3 ])
      );
    });

    test('should not over-fetch documents unnecessarily', () => {
      expect(MockAWS.__getObjectSpy).toHaveBeenCalledTimes(2);
    });

    test('don\'t over-save documents unnecessarily', () => {
      expect(MockAWS.__putObjectSpy).toHaveBeenCalledTimes(2);
    });
  });
});