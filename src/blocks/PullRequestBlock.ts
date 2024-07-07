import { ContextBlock } from "slack-cloudflare-workers";
import { PullRequest } from "../api/types/graphqlApiTypes";

export const PullRequestBlock = (pullRequests: PullRequest[]) => {
  return pullRequests.map((pullRequest, index) => {
    const context: ContextBlock = {
      type: "context",
      block_id: `${pullRequest.number}`,
      elements: [
        {
          type: "mrkdwn",
          text: `${index + 1}. <${pullRequest.url}|#${pullRequest.number} *${pullRequest.title}*> (${pullRequest.mergeable})`,
        },
        {
          type: "image",
          image_url: pullRequest.author.avatarUrl,
          alt_text: pullRequest.author.login,
        },
        {
          type: "mrkdwn",
          text: `<${pullRequest.author.url}|*${pullRequest.author.login}*>`,
        },
        {
          type: "mrkdwn",
          text: `(${pullRequest.baseRef.name} <- ${pullRequest.headRef.name})`,
        },
      ],
    };
    return context;
  });
};
