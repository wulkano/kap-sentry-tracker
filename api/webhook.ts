import {NowRequest, NowResponse} from '@vercel/node'
import got from 'got';

const checkIssue = body => {
  return body && (
    body.includes(`SENTRY_ID=`) ||
    body.includes(`https://sentry.io/organizations/wulkano-l0/issues/`)
  );
};

export default async (req: NowRequest, res: NowResponse) => {
  console.log(req.headers['x-github-event']);

  if (req.headers['x-github-event'] === 'issues') {
    const {action, issue} = req.body;

    console.log(action);

    if (['opened', 'edited'].includes(action)) {
      if (!issue.labels.some(label => label.name.toLowerCase() === 'sentry')) {
        console.log('No label');

        if (checkIssue(issue.body)) {
          console.log('ADD LABEL PLZ');
        }
      } else {
        console.log('Label');
      }
    }

    res.json({action, issue});
  } else {
    res.end();
  }
}
