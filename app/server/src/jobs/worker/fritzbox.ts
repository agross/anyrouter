import { Job } from 'bull';
import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import { LoggerFactory } from '../logger-factory';
import { parseNumbers } from 'xml2js/lib/processors';

const logger = LoggerFactory.createLogger(__filename);

const soap = `<?xml version="1.0" encoding="utf-8"?>
  <s:Envelope s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"
              xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
    <s:Body>
      <u:GetAddonInfos xmlns:u="urn:schemas-upnp-org:service:WANCommonInterfaceConfig:1" />
    </s:Body>
  </s:Envelope>`;

export default async function(job: Job) {
  logger.debug(`${job.data.host} job ${job.id}`);

  try {
    const result = await axios.post(
      `http://${job.data.host}:49000/igdupnp/control/WANCommonIFC1`,
      soap,
      {
        headers: {
          Host: job.data.host,
          'Content-Type': 'text/xml; charset="utf-8"',
          SoapAction:
            'urn:schemas-upnp-org:service:WANCommonInterfaceConfig:1#GetAddonInfos',
        },
        timeout: 5000,
        responseType: 'text',
        transformResponse: async r => {
          r = await parseStringPromise(r, {
            explicitArray: false,
            valueProcessors: [parseNumbers],
          });

          return r['s:Envelope']['s:Body']['u:GetAddonInfosResponse'];
        },
      },
    );

    const data = await result.data;

    logger.debug(`${job.data.host} ${JSON.stringify(data, null, 2)}`);

    return data;
  } catch (error) {
    logger.error(`${job.data.host} ${error.message}`);
    throw error;
  }
}
