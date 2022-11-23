import { githubApiRequest } from "../lib/axios";
import { DeployButtonForStaging } from "./deployStaging";

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

  return [
    header,
    divider,
    ...buildPrList(pullRequests),
    divider,
    DeployButtonForStaging,
  ];
};

export const buildPrList = (pullRequests) => {
  const result = pullRequests.map((pullRequest, index) => {
    const section = {
      type: "section",
      block_id: 'pull_request_list',
      fields: [
        {
          type: "mrkdwn",
          text: `${index + 1}. <${pullRequest.url}|#${pullRequest.number} *${
            pullRequest.title
          }*> by ${pullRequest.user.login}`,
        },
      ],
      accessory: PullRequestOverflowMenu,
    };
    return section;
  });
  return result;
};

const divider = {
  type: "divider",
};

const PullRequestOverflowMenu = {
  type: "overflow",
  "action_id": "overflow_actions",
  options: [
    {
      text: {
        type: "plain_text",
        text: "非表示",
        emoji: true,
      },
      value: `action_1`,
    },
  ],
}