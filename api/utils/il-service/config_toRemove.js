const url = {
  eval: 'https://evaluation.solvex.bg/iservice/integrationservice.asmx',
  prod: 'https://iservice.solvex.bg/IntegrationService.asmx',
  eval2: 'http://192.168.10.50/integrationservice.asmx',
};
const credentials = {
  exim: { user: 's1028', pass: '5ysjSV4b' },
  partner2: { user: 'sol001', pass: 'NfC4nWyU' },
};
const config = {
  service: url['eval'],
  credentials,
  // user: 'sol001',
  // pass: 'NfC4nWyU',
  mongoUrl: 'mongodb://127.0.0.1:27017',
};
module.exports = config;
