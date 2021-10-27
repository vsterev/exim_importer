const fetch = require('node-fetch');
const xml2js = require('xml2js');
const parser = new xml2js.Parser();
const checkFlight = require('./checkFlight');
const { bookingModel } = require('../../models');
const service = require('../../config/config').ilUrl;
const connect = require('./connect');
const MissingIdError = require('../error');

const createReservation = (
  checkIn,
  checkOut,
  tourists,
  hotelKey,
  acKey,
  rcKey,
  rtKey,
  pnKey,
  partnerReservKey,
  flightIn,
  flightOut,
  transferTypeId,
  partner
) => {
  function diff_month(dt21, dt11) {
    const dt2 = new Date(dt21);
    const dt1 = new Date(dt11);
    var diff = (dt2.getTime() - dt1.getTime()) / 1000;
    return (diff /= 60 * 60 * 24);
  }
  const ageType = (str) => {
    if (str.toLowerCase() === 'mr') {
      return { type: 'Adult', sex: 'Male' };
    }
    if (str.toLowerCase() === 'mrs') {
      return { type: 'Adult', sex: 'Female' };
    }
    if (str.toLowerCase() === 'chd') {
      return { type: 'Child', sex: 'Child' };
    }
    if (str.toLowerCase() === 'inf') {
      return { type: 'Infant', sex: 'Infant' };
    }
  };

  const touristServiceGenerate = () => {
    let text = '';
    tourists.map((el, i) => {
      text += `\t<TouristService>\n\t\t<ID>0</ID>\n\t\t<TouristID>${i}</TouristID>\n\t\t<ServiceID>1</ServiceID>\n\t</TouristService>\n|`;
    });
    return text;
  };

  const transferGenerate = (tIn, tOut, fInId, fOutID) => {
    let str = '';
    if (flightIn && transferTypeId) {
      str += `           
      <Service xsi:type="TransferService">
      <NMen>${tourists.length}</NMen>
      <StartDate>${checkIn}</StartDate>
      <StartDay>0</StartDay>
      <Duration>1</Duration>
      <TouristCount>${tourists.length}</TouristCount>
      <ID>1</ID>
      <Transfer>
          <ID>${tIn}</ID> //da se promeni
      </Transfer>
      <Transport>
          <ID>${transferTypeId}</ID> //da se promeni
      </Transport>
      <Flight>
      <ID>${fInId}</ID>
      </Flight>
      </Service>`;
    }
    if (flightOut && transferTypeId) {
      str += `           
      <Service xsi:type="TransferService">
        <NMen>${tourists.length}</NMen>
        <StartDate>${checkOut}</StartDate>
        <StartDay>1</StartDay>
        <Duration>1</Duration>
        <TouristCount>${tourists.length}</TouristCount>
        <ID>1</ID>
        <Transfer>
          <ID>${tOut}</ID> //da se promeni
        </Transfer>
        <Transport>
          <ID>${transferTypeId}</ID> //da se promeni
        </Transport>
        <Flight>
        <ID>${fOutID}</ID>
        </Flight>
    </Service>`;
    }
    return str;
  };
  const touristsGenerate = () => {
    let str = '';
    tourists.map((el, i) => {
      let birthDate = '';
      if (el.birthDate) {
        birthDate += `BirthDate="${el.birthDate}"`;
      }
      str += `
      \t<Tourist FirstNameLat="${el.name}" ${birthDate} LastNameLat="" SurNameLat="${el.familyName}" AgeType="${
        ageType(el.gender)['type']
      }" Sex="${ageType(el.gender)['sex']}" IsMain="${i === 0 ? true : false}" ID="${i}" Phone="${
        el.phone ? el.phone : ''
      }" Email="${el.email ? el.email : ''}">\n
        \t\t<LocalPassport IssuedBy="" Serie="111" Number="1111111" IssueDate="0001-01-01" EndDate="0001-01-01" />\n
        \t\t<ForeignPassport IssuedBy="" Serie="111" Number="1111111" IssueDate="0001-01-01" EndDate="0001-01-01T00:00:00" />\n
        \t</Tourist>\n`;
    });
    return str;
  };

  const requestStr = (guid, transferIn, transfereOut, fInID, fOutID) => {
    return `<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
      <CreateReservation xmlns="http://www.megatec.ru/">
        <guid>${guid}</guid>
        <reserv HasInvoices="false">
          <Rate>
        <ID>1</ID>
          </Rate>
          <TouristServices>
          ${touristServiceGenerate()}
          </TouristServices>
          <Services>
            <Service xsi:type="HotelService">
              <NMen>${tourists.length}</NMen>
              <Quota>NotChecked</Quota>
              <PacketKey>0</PacketKey>
              <StartDate>${checkIn}</StartDate>
              <Duration>${diff_month(checkOut, checkIn)}</Duration> //vajno
              <TouristCount>${tourists.length}</TouristCount>
              <ID>1</ID>
              <Hotel>
                <ID>${hotelKey}</ID>
              </Hotel>
              <Room>
                <RoomTypeID>${rtKey}</RoomTypeID>
                <RoomCategoryID>${rcKey}</RoomCategoryID>
                <RoomAccomodationID>${acKey}</RoomAccomodationID>
              </Room>
              <PansionID>${pnKey}</PansionID>
            </Service>
            ${transferIn && transfereOut ? transferGenerate(transferIn, transfereOut, fInID, fOutID) : ''}
          </Services>
          <ID>-1</ID>
          <StartDate>${checkIn}</StartDate>
          <EndDate>${checkOut}</EndDate>
          <Tourists>
         ${touristsGenerate()}
          </Tourists>
                  <TourOperatorCode>${partnerReservKey ? partnerReservKey : ''}</TourOperatorCode>
        </reserv>
      </CreateReservation>
    </soap:Body>
  </soap:Envelope>
`;
  };
  // console.log(requestStr('t'));
  // return fetch(service, {
  //   method: 'post',
  //   body: connectionStr,
  //   headers: { 'Content-Type': 'text/xml' },
  // })
  //   .then((guidRes) => guidRes.text())
  //   .then((guidXml) => parser.parseStringPromise(guidXml))
  return connect(partner)
    .then((guid) => {
      // const guid = guidParsed['soap:Envelope']['soap:Body'][0]['ConnectResponse'][0]['ConnectResult'][0];
      if (flightIn) {
        const transferInfoIn = checkFlight(flightIn, hotelKey, true);
        const transferInfoOut = checkFlight(flightOut, hotelKey, false);
        return Promise.all([guid, transferInfoIn, transferInfoOut]);
      }
      return Promise.all([guid]);
    })
    .then(([guid, transferInfoIn, transferInfoOut]) => {
      // console.log(transferInfoIn);
      // const [transferIn, flightInId] = transferInfoIn;
      const transferInId = transferInfoIn[0]._id;
      const flightInId = transferInfoIn[1];
      const transferOutId = transferInfoOut[0]._id;
      const flightOutId = transferInfoOut[1];
      if (flightIn && !flightInId) {
        throw new MissingIdError(`flight ${flightIn} is not in IL`);
      }
      if (flightIn && !flightOutId) {
        throw new MissingIdError(`flight ${flightOut} is not in IL`);
      }
      // console.log(requestStr(guid, transferIn?._id, transferOut?._id));
      const fetching = fetch(service, {
        method: 'post',
        //   body: requestStr(guid, transferIn?._id, transferOut?._id),
        body: requestStr(guid, transferInId, transferOutId, flightInId, flightOutId),
        headers: {
          'Content-Type': 'text/xml',
        },
      });
      return Promise.all([fetching]);
    })
    .then(([res]) => res.text())
    .then((xml) => {
      return parser.parseStringPromise(xml);
    })
    .then((result) => {
      const response =
        result['soap:Envelope']['soap:Body'][0]['CreateReservationResponse'][0]['CreateReservationResult'][0];
      if (!!response) {
        const el = {};
        el['_id'] = partnerReservKey;
        // el.ilKey = response['ExternalID'][0];
        el.ilKey = response['ID'][0];
        el.ilCode = response['Name'][0];
        el.createdAt = [new Date().toLocaleString('ro')];
        el.partner = partner;
        console.log(el);
        // el.catchExternalID[0], reservName: r.Name[0], status: r.Status[0]
        // ilCode,ilKey, createdAt
        bookingModel.updateOne({ _id: el['_id'] }, el, { upsert: true }).then(console.log).catch(console.log);
      }
      return response;
    })
    .catch((err) => {
      console.log(err);
      if (err instanceof MissingIdError) {
        throw err;
      }
    });
};
module.exports = createReservation;
