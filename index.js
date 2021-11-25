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

  const S3ObjectParams = {
    Bucket,
    Key: `${programmes[0].parentPid}.json`,
  };

  const feed = await s3.getObject(S3ObjectParams)
    .promise()
    .then((s3ObjectResponse) => JSON.parse(s3ObjectResponse.Body));

  programmes.forEach((programme) => {
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
  });

  const latest = programmes.sort((current, next) => {
    const currentStart = moment(current.versions[0].availability.dates.start).utc();
    const nextStart = moment(next.versions[0].availability.dates.start).utc();

    if (currentStart.isBefore(nextStart)) {
      return 1;
    } else if (currentStart.isAfter(nextStart)) {
      return -1;
    }

    return 0;
  })[0];

  feed.channel.pubDate = moment(latest.versions[0].availability.dates.start).utc().format(dateFormat);

  await s3.putObject({
    ...S3ObjectParams,
    Body: JSON.stringify(feed),
  }).promise();
}