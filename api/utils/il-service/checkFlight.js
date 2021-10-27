const { hotelModel, flightModel, transferModel } = require('../../models');
const checkFlight = (flight, hotelId, isArrival) => {
  return flightModel
    .findOne({ name: { $regex: flight, $options: 'i' } })
    .then((res) => {
      // console.log(res);
      const { airportFromId, airportToId, _id } = res;
      const hotelCity = hotelModel.findById(hotelId);
      return Promise.all([airportToId, airportFromId, _id, hotelCity]);
    })
    .then(([airportToId, airportFromId, _id, hotelCity]) => {
      const hotelCityId = hotelCity.resortId;
      if (isArrival) {
        // return transferModel.findOne({ pointFromId: airportFromId, cityToId: hotelCityId });
        const transferInfoIn = transferModel.findOne({ pointFromId: airportFromId, cityToId: hotelCityId });
        return Promise.all([transferInfoIn, _id]);
      }
      // return transferModel.findOne({ pointToId: airportToId, cityFromId: hotelCityId });
      const transferInfoOut = transferModel.findOne({ pointToId: airportToId, cityFromId: hotelCityId });
      return Promise.all([transferInfoOut, _id]);
    })
    .catch(console.log);
};
module.exports = checkFlight;
