const cron = require('node-cron');
const express = require('express');
const syncBoardsCron = require('../utils/il-service/cronJobs/syncBoards');
const syncTransferTypesCron = require('../utils/il-service/cronJobs/syncTransferTypes');
const syncHotelsCron = require('../utils/il-service/cronJobs/syncHotels');
app = express();
const port = 3300;

// Schedule tasks to be run on the server.
cron.schedule('0 0 1 * * *', function () {
  const current = new Date();
  console.log(`${current.toString().substr(0, 24)} Cron job - sync Boards`);
  syncBoardsCron();
});
cron.schedule('0 2 1 * * *', function () {
  const current = new Date();
  console.log(`${current.toString().substr(0, 24)} Cron job - sync Transfer Types`);
  syncTransferTypesCron();
});
cron.schedule('0 3 1 * * *', function () {
  const current = new Date();
  console.log(`${current.toString().substr(0, 24)} Cron job - sync Hotels`);
  syncHotelsCron();
});

app.listen(port, console.log(`Cron is listening on port ${port}!`));
