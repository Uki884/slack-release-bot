import { ActionsBlock, ContextBlock, SectionBlock, SlackApp } from "slack-cloudflare-workers";
import { ENV } from "../types";
import { GithubApi } from "../api/githubApi";
import { ACTION_ID_LIST } from "../constants/ACTION_ID_LIST";
import { BLOCK_ID_LIST } from "../constants/BLOCK_ID_LIST";
import { DividerBlock } from "../blocks/DividerBlock";
import { COMMAND_LIST } from "../constants/COMMAND_LIST";

export const releaseList = (app: SlackApp<ENV>) => {
  return app.command(
    COMMAND_LIST.RELEASE_LIST_ACTION,
    async (_req) => {
      return "リリースできそうなPRをもってきます！😃";
    },
    async (req) => {
      const api = GithubApi.new(app.env);
      const approvedPrList = await api.getApprovedPrList();

      const pullRequests = approvedPrList.map((pullRequest, index) => {
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
          action_id: ACTION_ID_LIST.UPDATE_PR_LIST_ACTION,
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
            action_id: COMMAND_LIST.SHOW_STAGING_MODAL_ACTION,
          },
        ],
      };

      await req.context.respond({
        unfurl_links: true,
        text: "リリースできそうなPRはこちらです！😃",
        blocks: [header, DividerBlock, ...pullRequests, stagingReleaseButtons],
        response_type: 'in_channel',
      });
    },
  );
};
