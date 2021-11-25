# bbc-coding-exercise-js
A simple coding exercise in javascript.

## Task

You need to create a simple javascript application which will receive messages from an SQS queue
with details of new programmes that have been published. These need to be added to a JSON document
which follows the media-RSS schema, so our partners can consume these to get to the content.

The architecture of this application is as follows:

```
SNS -> SQS -> Handler-Function -> S3
```

This example is architected to be deployed in an AWS Lambda (serverless) environment.

## Prerequisites

* A suitable development environemnt (e.g. VS Code).
* NodeJS installed.
* Github configured.
* Creating a fork of this repository.

Please make sure you share your forked repository with `@lintal` & `@jcable` on GitHub, or just make it
public.

Before you begin, install the required dependencies using:

```bash
npm install
```

## Instructions

### Exercise 1

In the first exercise, we need to handle a single "new programme" event and add this to a single
feed. You can check your progress by running the following command:

```bash
npm run test1
```

You will need to do the following:

1. Find the name of our S3 bucket. This is made available in an environment variable called `BUCKET_NAME`.
2. Retrieve the feed document from AWS S3. The document key is in the following format: `${programme.parentPid}.json`.
3. Add a new item to the `item` array based on the event data.
4. Update the feed `channel.pubDate` field using the `programme.versions[0].availability.dates.start` from the event.
5. Save the updated document back to AWS S3.


### Exercise 2

Now, we want to expand the functionality so we can accept multiple "new programme" notifications in
a single event. This means that `event.Records[]` will contain `>1` events. All programmes should be
stored in the same output "feed".

You can check your progress by running the following command:

```bash
npm run test2
```

You will need to do the following:

1. Add some form of recusive logic to handle multiple events.
2. Set the `channel.pubDate` with the pubDate of the most recently published NEW programme.


### Exercise 3

Next, we want to support the ability to store new programmes in different feeds, based on their
`programme.parent_pid`.

You can check your progress by running the following command:

```bash
npm run test3
```

You will need to do the following:
1. Make sure you call the `s3.getObject` method for each feed that you need.
    * Don't over-fetch! Only call the `s3.getObject` method ONCE for each `programme.parent_pid`.
2. Persist each of the updated "feed" documents.
    * Similarly, be careful not to save the feed documents multiple times - only once for each feed.

### Exercise 4

Finally for some Test-Driven-Development (TDD). In this exercise, you will be writing the test case
and then the code necessary to pass the test. The scenario we are trying to solve can be described
as follows:

* **Given** a new programme notification is received.
* **When** no corresponding feed document exists.
* **Then** we do not want to PUT a new document into AWS S3.

You can check your progress by running the following command:

```bash
npm run test4
```

Please write your test case in the file: `./tests/ignoreOneWithNoFeed.test.js`.

### Done?

Let's make sure nothing broke with your changes. Let's run the whole test suite using the following
command:

```bash
npm test
```

If all tests pass, then congratulations!

Please commit & push your changes, and ensure your forked repository can be accessed by `@lintal` &
`@jcable` on GitHub, or is made public.

## Reference

Your handler function will receive one or more event messages. These events will have originated
from notifications sent to an SNS topic. An SQS queue will be subscribed to these notifications.
Your funciton will then be triggered from these SQS messages.

The resultant JSON documents will then need to be stored in AWS S3.

The above gives the following architecture:

```
SNS -> SQS -> Handler-Function -> S3
```

### Incoming Events

Remember, there will be layers of event data you will need to decode and subsequently process.

```javascript
exports.handler = (event) => {
  // event.Records[] -  will contain a list of SQS messages
}
```

Each SQS message takes the following format:

```json
{
  "messageId": "059f36b4-87a3-44ab-83d2-661975830a7d",
  "receiptHandle": "AQEBwJnKyrHigUMZj6rYigCgxlaS3SLy0a...",
  "body": "{ /* SNS Notification data */ }",
  "attributes": {
    "ApproximateReceiveCount": "1",
    "SentTimestamp": "1545082649183",
    "SenderId": "AIDAIENQZJOLO23YVJ4VO",
    "ApproximateFirstReceiveTimestamp": "1545082649185"
  },
  "messageAttributes": {},
  "md5OfBody": "098f6bcd4621d373cade4e832627b4f6",
  "eventSource": "aws:sqs",
  "eventSourceARN": "arn:aws:sqs:us-east-2:123456789012:my-queue",
  "awsRegion": "us-east-2"
}

// Copied from: https://docs.aws.amazon.com/lambda/latest/dg/with-sqs-example.html#with-sqs-create-test-function
```

As raw SNS message delivery will be switched `off`, the body of the SQS message `body` will contain a JSON
payload in the following format:

```json
{
  "EventVersion": "1.0",
  "EventSubscriptionArn": "arn:aws:sns:us-east-2:123456789012:sns-lambda:21be56ed-a058-49f5-8c98-aedd2564c486",
  "EventSource": "aws:sns",
  "Sns": {
    "SignatureVersion": "1",
    "Timestamp": "2019-01-02T12:45:07.000Z",
    "Signature": "tcc6faL2yUC6dgZdmrwh1Y4cGa/ebXEkAi6RibDsvpi+tE/1+82j...65r==",
    "SigningCertUrl": "https://sns.us-east-2.amazonaws.com/SimpleNotificationService-ac565b8b1a6c5d002d285f9598aa1d9b.pem",
    "MessageId": "95df01b4-ee98-5cb9-9903-4c221d41eb5e",
    "Message": "{ /* New programme event data */ }",
    "MessageAttributes": {},
    "Type": "Notification",
    "UnsubscribeUrl": "https://sns.us-east-2.amazonaws.com/?Action=Unsubscribe&amp;SubscriptionArn=arn:aws:sns:us-east-2:123456789012:test-lambda:21be56ed-a058-49f5-8c98-aedd2564c486",
    "TopicArn":"arn:aws:sns:us-east-2:123456789012:sns-lambda",
    "Subject": "TestInvoke"
  }
}

// Copied from: https://docs.aws.amazon.com/lambda/latest/dg/with-sns.html
```

Finally the new programme event `Sns.Message` will take the following format:

```json
{
  "programme": {
    "pid": "p011gvwj",
    "parentPid": "p03q8kd9",
    "title": "Programme Title",
    "synopses": {
      "long": "Long Synopsis",
      "medium": "Medium Synopsis",
      "short": "Short Synopsis"
    },
    "versions": [ // Will contain only 1 version.
      {
        "pid": "p011gvwl",
        "availability": {
          "dates": {
            "start": "2017-07-18T13:45:42Z"
          }
        }
      }
    ]
  }
}
```

### Output

We want to store JSON documents that contain data in an RSS like schema in AWS S3. These documents
should be stored with an object key in the following format:

```
${programme.parentPid}.json
```

The resultant document should look as follows:

```json
{
  "channel": {
    "title": "BBC Minute",
    "link": "http://www.bbc.co.uk/programmes/p03q8kd9",
    "description": "One minute of the world's most shareable news - updated every half an hour, 24/7. Drop into the conversation of the BBC Minute team for the biggest news, sport, technology, health, science, social media and business stories: all in 60 seconds",
    "language": "en",
    "image": {
      "url": "https://example-images.bbc.co.uk/p09h92pk.jpg",
      "title": "BBC Minute",
      "link": "https://www.bbc.co.uk/programmes/p03q8kd9"
    },
    "copyright": "(C) BBC 2021",
    // Set appropriately, with the most recently published item's pubDate:
    "pubDate": "Mon, 22 Nov 2021 13:26:48 UTC",
    "item": [
      {
        "title": "${programme.title}",
        "description": "${programme.synopses.long}",
        // Set pubDate appropriately based on programme.versions[0].availability.dates.start:
        "pubDate": "Mon, 22 Nov 2021 13:26:48 UTC",
        "guid": "urn:bbc:podcast:${programme.pid}",
        "link": "https://www.bbc.co.uk/programmes/${programme.pid}",
        "enclosure": {
          "url": "https://example-programmes.bbc.co.uk/${programme.versions[0].pid}.mp3",
          "length": 0,          // Assume `0` length file for simplicity.
          "type": "audio/mpeg"  // Assume `audio/mpeg` for simplicity.
        }
      }
    ]
  }
}
```
