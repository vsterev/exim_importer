const syncCities = require('./synCities');
const syncHotels = require('./syncHotels.js');
const syncFlyghts = require('./synFlights');
const syncBoards = require('./syncBoards');
const syncTransferTypes = require('./syncTransferTypes');
syncCities && syncHotels && syncFlyghts && syncBoards && syncTransferTypes;
