import {NowRequest, NowResponse} from '@vercel/node'
import got from 'got';

const checkIssue = (body: string) => {
  return body && (
    body.includes('SENTRY_ISSUE_ID=') ||
    body.includes('https://sentry.io/organizations/wulkano-l0/issues/')
  );
};

export default async (req: NowRequest, res: NowResponse) => {
  if (req.headers['x-github-event'] === 'issues') {
    const {action, issue, repository} = req.body;

    if (['opened', 'edited'].includes(action)) {
      if (!issue.labels.some(label => label.name.toLowerCase() === 'sentry')) {
        if (checkIssue(issue.body)) {
          try {
            const body = await got.post(`https://api.github.com/repos/${repository.full_name}/issues/${issue.number}/labels`, {
              json: {labels: ['sentry']},
              headers: {
                accept: 'application/vnd.github.v3+json',
                authorization: `token ${process.env.GH_TOKEN}`
              }
            }).json();
            res.json(body);
          } catch (error) {
            res.status(400).json({error});
          }
        } else {
          res.end();
        }
      } else {
        res.end();
      }
    } else {
      res.end();
    }
  } else {
    res.end();
  }
};
