import {NowRequest, NowResponse} from '@vercel/node'
import got from 'got';

const checkIssue = body => {
  return body && (
    body.includes('SENTRY_ISSUE_ID=') ||
    body.includes('https://sentry.io/organizations/wulkano-l0/issues/')
  );
};

export default async (req: NowRequest, res: NowResponse) => {
  console.log(req.headers['x-github-event']);

  if (req.headers['x-github-event'] === 'issues') {
    const {action, issue, repository} = req.body;

    console.log(action);

    if (['opened', 'edited'].includes(action)) {
      if (!issue.labels.some(label => label.name.toLowerCase() === 'sentry')) {

        console.log('No label');

        console.log(issue.body);
        if (checkIssue(issue.body)) {
          console.log('ADD LABEL PLZ');
          try {
            console.log('Posting on', `https://api.github.com/repos/${repository.full_name}/issues/${issue.number}/labels`);
            const body = await got.post(`https://api.github.com/repos/${repository.full_name}/issues/${issue.number}/labels`, {
              json: {labels: ['sentry']},
              headers: {
                accept: 'application/vnd.github.v3+json',
                authorization: `token ${process.env.GH_TOKEN}`
              },
            }).json();
            console.log('Label added');
            res.json(body);
          } catch (error) {
            console.log('Error', error);
            res.status(400).json({error});
          }
        } else {
          console.log('I guess not');
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
