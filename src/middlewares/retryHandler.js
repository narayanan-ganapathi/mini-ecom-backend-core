const axios = require('axios');
const retry = require('async-retry');

const retryHandlerMiddleware = async (req, res, next) => {
  try {
    const response = await retry(async () => {
      // Simulate an API call
      const result = await axios.get('https://example.com/api');
      if (result.status !== 200) {
        throw new Error('Request failed');
      }
      return result.data;
    }, {
      retries: 3, // Retry up to 3 times
      factor: 2, // Exponential backoff
      minTimeout: 1000, // Minimum wait time between retries
      maxTimeout: 5000 // Maximum wait time between retries
    });

    res.send(response);
  } catch (error) {
    res.status(500).send('Failed after retries');
  }

  next();
};

module.exports = retryHandlerMiddleware;