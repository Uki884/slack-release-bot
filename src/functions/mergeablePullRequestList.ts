import { githubApiRequest } from "../lib/axios";

export const mergeablePullRequestList = async ({ say }) => {
  const { data } = await githubApiRequest.get(
    `https://api.github.com/repos/${process.env.GITHUB_USERNAME}/${process.env.GITHUB_REPO}/issues`,
    { params: { state: "open", labels: "Mergeable", pulls: "true" } }
  );
  const pullRequests = data.map((item) => {
    return {
      id: item.id,
      number: item.number,
      user: item.user,
      title: item.title,
      url: item.html_url,
    };
  });
  if (pullRequests.length) {
    await say({
      unfurl_links: true,
      blocks: buildPrSections(pullRequests),
    });
  } else {
    await say({
      unfurl_links: true,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "リリースできそうなPRが見つかりませんでした。",
          },
        }
      ]
    });
  }
}

const buildPrSections = (pullRequests) => {
  const header = {
    type: "section",
    text: {
      type: "mrkdwn",
      text: "<!subteam^S01EKMNQVS9>\nリリースできそうなPRはこちらです。",
    },
  };
  const result = pullRequests.map((pullRequest) => {
    const section = {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `<${pullRequest.url}|#${pullRequest.number} *${pullRequest.title}*> by ${pullRequest.user.login}`,
        },
      ],
      // accessory: {}
    };
    return section;
  });

  return [header, ...result];
};