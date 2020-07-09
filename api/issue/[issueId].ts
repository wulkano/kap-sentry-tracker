import {NowRequest, NowResponse} from '@vercel/node'
import got from 'got';

const sentryIssueChecker = (id, shortId) => ({body, pull_request}) => {
  return !pull_request && body && (
    body.includes(`SENTRY_ISSUE_ID=${id}`) ||
    body.includes(`https://sentry.io/organizations/wulkano-l0/issues/${id}/`) ||
    body.includes(shortId)
  );
};

export default async (req: NowRequest, res: NowResponse) => {
  const {issueId} = req.query;

  try {
    const {shortId, permalink} = await got.get(`https://sentry.io/api/0/issues/${issueId}/`, {
      headers: {authorization: `Bearer ${process.env.SENTRY_TOKEN}`}
    }).json();

    const checkSentryIssue = sentryIssueChecker(issueId, shortId);

    const [issue] = await got.paginate.all(`https://api.github.com/repos/wulkano/kap/issues?state=all&labels=sentry`, {
      headers: {
        accept: 'application/vnd.github.v3+json',
        authorization: `token ${process.env.GH_TOKEN}`
      },
      responseType: 'json',
      pagination: {
        filter: checkSentryIssue,
        countLimit: 1,
        stackAllItems: false
      }
    }) as any;

    if (issue) {
      res.setHeader('Cache-Control', 'public, max-age=604800, immutable, s-maxage=604800')
      res.json({
        issueId,
        shortId,
        permalink,
        ghUrl: issue.html_url
      });
    } else {
      res.json({
        issueId,
        shortId,
        permalink,
        ghIssueTemplate: `<!---SENTRY_ISSUE_ID=${issueId}--->\n\n**Sentry Issue:** [${shortId}](${permalink})\n\n`
      });
    }
  } catch (error) {
    res.json({error});
  }
}
