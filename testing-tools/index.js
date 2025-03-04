const express = require('express');
const app = express();

const port = process.env.PORT || 3000;
const errorMessage = process.env.ERROR_MESSAGE || 'Internal Server Error';

app.use((req, res, next) => {
  // Simulate random delay
  if (Math.random() < 0.3) {
    const delay = Math.floor(Math.random() * 31) * 1000; // 0 to 30 seconds
    setTimeout(next, delay);
  } else {
    next();
  }
});

app.use((req, res, next) => {
  // Simulate random errors
  if (Math.random() < 0.3) {
    const errorCodes = [400, 500, 502, 503];
    const errorCode = errorCodes[Math.floor(Math.random() * errorCodes.length)];
    if (errorCode === 500) {
      return res.status(errorCode).send(errorMessage);
    }
    return res.status(errorCode).send();
  } else {
    next();
  }
});

app.get('/', (req, res) => {
  res.status(200).send();
});

app.listen(port, () => {
  console.log(`Mock service listening on port ${port}`);
});
