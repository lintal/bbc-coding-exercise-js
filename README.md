# bbc-coding-exercise-js
A simple coding exercise in javascript.

## Task

You need to create a simple javascript application which will receive messages from an SQS queue
with details of new programmes that have been published. These need to be added to a JSON document
which follows the media-RSS schema, so our partners can consume these to get to the content.

This example is architected to be deployed in an AWS Lambda (serverless) environment.

## Prerequisites

* A suitable development environemnt (e.g. VS Code).
* NodeJS installed.
* Github configured.
* Creating a fork of this repository.

Please make sure you share your forked repository with @lintal & @jcable on GitHub, or just make it
public.

Before you begin, install the required dependencies using:

```bash
npm install
```

## Instructions

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

SQS messages take the following format:

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

As raw SNS message delivery will be switched `off`, the body of the SQS message will contain a JSON
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

Finally the new programme event `Message` will take the following format:

```json
{
    "audit": {
        "updateSource": {
            "name": "galileo",
            "activityId": "ef5f562e-0ca0-4af1-934b-299159ebe4e6"
        },
        "publisher": {
            "name": "castaway",
            "activityId": "ef5f562e-0ca0-4af1-934b-299159ebe4e6"
        },
        "user": {
            "id": "example.user@bbc.co.uk",
            "groupId": "News"
        },
        "eventTime": "2017-11-18T17:25:29.798Z"
    },
    "programme": {
        "pid": "p011gvwj",
        "parentPid": "p03q8kd9",
        "embargoed": false,
        "type": "clip",
        "mediaType": "audio_video",
        "languages": [
            "en"
        ],
        "title": "A TITLTE",
        "synopses": {
            "long": "Long Synopsis",
            "medium": "Medium Synopsis",
            "short": "Short Synopsis"
        },
        "formats": [],
        "genres": [],
        "embeddable": false,
        "tags": {
            "category": "Clip",
            "types": {
                "about": []
            }
        },
        "taggings": [],
        "versions": [ // Will contain only 1 version.
            {
                "pid": "p011gvwl",
                "types": [
                    "Original Version"
                ],
                "durationMillis": 60000,
                "editorialAspectRatio": null,
                "warnings": [],
                "taggings": [],
                "assets": [],
                "availability": {
                    "revoked": false,
                    "dates": {
                        "start": "2017-07-18T13:45:42Z",
                        "end": null
                    },
                    "territories": [
                        "uk",
                        "nonuk"
                    ],
                    "platforms": [
                        "nodrm",
                        "pc",
                        "stb",
                        "mobile",
                        "console"
                    ]
                }
            }
        ],
        "images": [ // Will contain only 1 image.
            {
                "pid": "p011gw0v",
                "embargoed": false,
                "type": "standard",
                "author": null,
                "title": "A TITLE",
                "synopses": {
                    "long": "Long Synopsis",
            "medium": "Medium Synopsis",
            "short": "Short Synopsis"
                },
                "asset": {},
                "mimeType": "image/jpeg",
                "relationshipType": "is_image_for"
            }
        ],
        "syndicationDestinations": [],
        "advertistingType": "commercial",
        "masterBrand": null,
        "relatedLinks": []
    },
    "publication": {
        "availability": null,
        "updateType": "publish",
        "taggingStatus": null,
        "syndicationStatus": null
    }
}
```

### Output

We want to store JSON documents that contain data in an RSS like schema in AWS S3. These documents should be stored with an object key
in the following format:

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
    "pubDate": "Mon, 22 Nov 2021 13:26:48 GMT",
    "item": [
      {
        "title": "${programme.title}",
        "description": "${programme.synopses.long}",
        // Set pubDate appropriately based on programme.versions[0].availability.dates.start:
        "pubDate": "Mon, 22 Nov 2021 13:26:48 GMT",
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


### Done?

Think you have completed the task - let's see.
Run:

```bash
npm test
```

If all tests pass, then congratulations!