const AWS = require('aws-sdk');
const moment = require('moment');

const s3 = new AWS.S3();
const dateFormat = 'ddd, DD MMM YYYY H:mm:ss z';

const Bucket = ''; // How will you get the bucket name?

exports.handler = async (event) => {
  // event.Records[]; // Will contain a list of events from SQS that you need to process.

  // You will need to get the current media-RSS document(s) from S3:
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getObject-property
  // e.g.: s3.getObject({/* Parameters go here */}).promise();

  // When manipulating dates, you can use the `moment` library which installed. The correct output
  // format is also specified:
  // e.g. moment('// DATE STRING GOES HERE //').utc().format(dateFormat);

  // You will need to store the resultant document(s) using:
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
  // e.g.: s3.putObject({/* Parameters go here */}).promise();
}