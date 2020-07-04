import {NowRequest, NowResponse} from '@vercel/node'
import got from 'got';


export default async (req: NowRequest, res: NowResponse) => {
  const {eventId} = req.query;

  try {
    const {groupId} = await got.get(`https://sentry.io/api/0/organizations/wulkano-l0/eventids/${eventId}/`, {
      headers: {authorization: `Bearer ${process.env.SENTRY_TOKEN}`}
    }).json();

    res.writeHead(301, {
      'Location': `/api/issue/${groupId}`
    });
    res.end();
  } catch (error) {
    if (error.response) {
      if (error.response.statusCode === 404) {
        res.json({pending: true});
      } else {
        res.status(400);
        res.json({error: error.response.body});
      }
    } else {
      res.json({error});
    }
  }
}
