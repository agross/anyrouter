let gateways = (process.env.GATEWAYS || '').split(',')
                                          .filter(gw => gw.length > 0);
if (gateways.length === 0) {
  throw 'No gateways defined as GATEWAYS environment variable.';
}

module.exports.GATEWAYS = gateways
