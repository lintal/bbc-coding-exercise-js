const AWS = require('aws-sdk');
const moment = require('moment');

const s3 = new AWS.S3();
const dateFormat = 'ddd, DD MMM YYYY H:mm:ss z';

const Bucket = process.env.BUCKET_NAME;

exports.handler = async (event) => {
  const { programme } = JSON.parse(
    JSON.parse(
      event.Records[0].body
    ).Sns.Message
  );

  const S3ObjectParams = {
    Bucket,
    Key: `${programme.parentPid}.json`,
  };

  const feed = await s3.getObject(S3ObjectParams)
    .promise()
    .then((s3ObjectResponse) => JSON.parse(s3ObjectResponse.Body));

  const programmeStart = moment(programme.versions[0].availability.dates.start).utc().format(dateFormat);

  feed.channel.item.push({
    title: programme.title,
    description: programme.synopses.long,
    guid: `urn:bbc:podcast:${programme.pid}`,
    link: `https://www.bbc.co.uk/programmes/${programme.pid}`,
    pubDate: programmeStart,
    enclosure: {
      type: 'audio/mpeg',
      length: 0,
      url: `https://example-programmes.bbc.co.uk/${programme.versions[0].pid}.mp3`
    }
  });

  feed.channel.pubDate = programmeStart;

  await s3.putObject({
    ...S3ObjectParams,
    Body: JSON.stringify(feed),
  }).promise();
}