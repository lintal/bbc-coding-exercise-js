const AWS = require('aws-sdk');
const moment = require('moment');

const s3 = new AWS.S3();
const dateFormat = 'ddd, DD MMM YYYY H:mm:ss z';

const Bucket = process.env.BUCKET_NAME;

exports.handler = async (event) => {
  // Parse event data
  const programmes = event.Records
    .map((record) => JSON.parse(
        JSON.parse(record.body).Sns.Message,
      ).programme
    );

  const getObjectPromises = programmes.reduce((promises, programme) => {
    if (!promises[programme.parentPid]) {
      promises[programme.parentPid] = s3.getObject({
        Bucket,
        Key: `${programme.parentPid}.json`,
      })
        .promise()
        .then((s3ObjectResponse) => {
          const result = {};
          result[programme.parentPid] = JSON.parse(s3ObjectResponse.Body);

          return result;
        });
    }

    return promises;
  }, {});

  const feeds = await Promise.all(
    Object.values(getObjectPromises)
  ).then((feedsList) => {
    return feedsList.reduce((feedsObject, feedListItem) => {
      Object.keys(feedListItem).forEach((key) => {
        feedsObject[key] = feedListItem[key];
      });

      return feedsObject;
    }, {});
  });

  programmes.forEach((programme) => {
    const feedPubDate = moment(feeds[programme.parentPid].channel.pubDate, dateFormat).utc();
    const programmePubDate = moment(programme.versions[0].availability.dates.start).utc();
    const pubDate = programmePubDate.format(dateFormat);

    if(programmePubDate.isAfter(feedPubDate)) {
      feeds[programme.parentPid].channel.pubDate = pubDate;
    }

    feeds[programme.parentPid].channel.item.push({
      title: programme.title,
      description: programme.synopses.long,
      guid: `urn:bbc:podcast:${programme.pid}`,
      link: `https://www.bbc.co.uk/programmes/${programme.pid}`,
      pubDate: programmePubDate.format(dateFormat),
      enclosure: {
        type: 'audio/mpeg',
        length: 0,
        url: `https://example-programmes.bbc.co.uk/${programme.versions[0].pid}.mp3`
      }
    });
  });

  await Promise.all(
    Object.keys(feeds).map((parentPid) => {
      return s3.putObject({
        Bucket,
        Key: `${parentPid}.json`,
        Body: JSON.stringify(feeds[parentPid]),
      }).promise();
    }),
  );
}