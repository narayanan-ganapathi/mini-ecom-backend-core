const CircuitBreaker = require('opossum');

const options = {
  timeout: 3000, // If the function takes longer than 3 seconds, trigger a failure
  errorThresholdPercentage: 50, // When 50% of requests fail, open the circuit
  resetTimeout: 5000 // After 5 seconds, try again.
};

const circuitBreakerMiddleware = (req, res, next) => {
  const breaker = new CircuitBreaker(async () => {
    // Simulate the API call or service logic
    return await someServiceCall();
  }, options);

  breaker.fire()
    .then(result => {
      res.send(result);
    })
    .catch(err => {
      res.status(503).send('Service Unavailable');
    });

  next();
};

module.exports = circuitBreakerMiddleware;