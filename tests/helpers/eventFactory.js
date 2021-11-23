module.exports.create = (publicationMessages) => {
  const Records = publicationMessages
    .map((publicationMessage) => ({
      EventSource: "aws:sns",
      Sns: {
        Message: JSON.stringify(publicationMessage),
      }
    }))
    .map((snsNotification) => ({
      eventSource: "aws:sqs",
      body: JSON.stringify(snsNotification),
    }));

  return { Records };
}