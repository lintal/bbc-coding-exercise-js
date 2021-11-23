class TestablePromise {
  static factory(promise) {
    promise.isPending = true;
    promise.isRejected = false;
    promise.isResolved = false;

    promise.then(
      (res) => {
        promise.isPending = false;
        promise.isResolved = true;

        return res;
      },
      (err) => {
        promise.isPending = false;
        promise.isRejected = true;

        throw err;
      }
    );

    return promise;
  }
}

module.exports = TestablePromise;