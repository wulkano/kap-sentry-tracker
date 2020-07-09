import {NowRequest, NowResponse} from '@vercel/node'
import got from 'got';

export default async (req: NowRequest, res: NowResponse) => {
  console.log(req.headers['x-github-event']);

  if (req.headers['x-github-event'] === 'issue') {
    console.log(req.body);
    res.end();
  } else {
    res.end();
  }
}
