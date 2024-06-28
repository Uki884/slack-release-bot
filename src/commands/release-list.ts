import { ActionsBlock, ContextBlock, SectionBlock, SlackApp } from "slack-cloudflare-workers";
import { ENV } from "../types";
import { GithubApi } from "../api/githubApi";
import { ACTION_ID_LIST } from "../constants/ACTION_ID_LIST";
import { BLOCK_ID_LIST } from "../constants/BLOCK_ID_LIST";
import { dividerBlock } from "../blocks/dividerBlock";

export const releaseList = (app: SlackApp<ENV>) => {
  return app.command(
    "/release-list-2",
    async (_req) => {
      return "リリースできそうなPRをもってきます！😃";
    },
    async (req) => {
      const api = GithubApi.new(app.env);
      const prList = await api.getMergeablePr();

      const pullRequests = prList.map((pullRequest, index) => {
        const section: ContextBlock = {
          type: "context",
          block_id: `${pullRequest.number}`,
          elements: [
            {
              type: "mrkdwn",
              text: `${index + 1}. <${pullRequest.html_url}|#${pullRequest.number} *${pullRequest.title}*>`,
            },
            {
              type: "image",
              image_url: pullRequest.user.avatar_url,
              alt_text: pullRequest.user.login,
            },
            {
              type: "mrkdwn",
              text: `<${pullRequest.user.html_url}|*${pullRequest.user.login}*>`,
            },
          ],
        };
        return section;
      });

      const header: SectionBlock = {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `<!subteam^S01EKMNQVS9>\nリリースできそうなPRはこちらです！😃\n実行者: <@${req.context.userId}>`,
        },
        accessory: {
          type: "button",
          text: {
            type: "plain_text",
            text: "リスト更新",
          },
          action_id: ACTION_ID_LIST.UPDATE_MERGEABLE_PR_LIST_ACTION,
        },
      };

      const stagingReleaseButtons: ActionsBlock = {
        type: "actions",
        block_id: BLOCK_ID_LIST.DEPLOY_BUTTON_FOR_STAGING_BLOCK,
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Deploy Staging",
            },
            value: "ok",
            action_id: ACTION_ID_LIST.DEPLOY_STAGING_ACTION,
          },
        ],
      };

      await req.context.respond({
        unfurl_links: true,
        text: "リリースできそうなPRはこちらです！😃",
        blocks: [header, dividerBlock, ...pullRequests, stagingReleaseButtons],
      });
    },
  );
};
