import slackifyMarkdown from "slackify-markdown";
import { ActionsBlock, Button, SectionBlock, SlackApp } from "slack-cloudflare-workers";
import { ENV } from "../types";
import { GithubApi } from "../api/githubApi";
import { ACTION_ID_LIST } from "../constants/ACTION_ID_LIST";
import { BLOCK_ID_LIST } from "../constants/BLOCK_ID_LIST";
import { formatJST } from "../lib/date-fns";
import { ProductionDeployButtonBlock } from "../blocks/ProductionDeployButtonBlock";

export const releaseStaging = (app: SlackApp<ENV>) => {
  return app.view(
    ACTION_ID_LIST.DEPLOY_STAGING_ACTION,
    async (_req) => {
      return "";
    },
    async ({ context, payload }) => {
      const { blocks } = await deployStaging(app);

      const metaData = JSON.parse(payload.view.private_metadata);

      const clientMessage = {
        token: context.botToken,
        channel: metaData.channelId,
        thread_ts: metaData.messageTs,
        text: "Stagingリリースが開始されました。",
        blocks: blocks,
        parse: "full",
        unfurl_links: false,
        as_user: true,
      } as const;

      await context.client.chat.postMessage(clientMessage);
    },
  );
};

const deployStaging = async (app: SlackApp<ENV>) => {
  const api = GithubApi.new(app.env);

  await api.runRepositoryDispatchEvent({
    event_type: app.env.STG_RELEASE_EVENT_NAME,
  });

  const latestRelease = await api.getLatestRelease();
  const tagName = `prod-${formatJST(new Date(), "yyyyMMdd-HHmm")}`;

  const generatedReleaseNote = await api.getReleaseNotes({
    tagName: tagName,
    previousTagName: latestRelease ? latestRelease.tag_name : undefined,
  });

  const title: SectionBlock = {
    type: "section",
    text: {
      type: "mrkdwn",
      text: `Stagingリリースが開始されました。`,
    },
  };

  const headBlock: SectionBlock = {
    type: "section",
    text: {
      type: "mrkdwn",
      text: "*リリース内容:*",
    },
  };
  const contentBlock: SectionBlock = {
    type: "section",
    text: {
      type: "mrkdwn",
      text: `${slackifyMarkdown(generatedReleaseNote.body)}`,
    },
  };

  const detailButton: Button = {
    type: "button",
    text: {
      type: "plain_text",
      text: "View Details",
      emoji: true,
    },
    value: "details",
    action_id: ACTION_ID_LIST.RELEASE_NOTE_DETAIL_ACTION,
  };

  const action: ActionsBlock = {
    type: "actions",
    block_id: BLOCK_ID_LIST.DEPLOY_PRODUCTION_BLOCK,
    elements: [detailButton, ProductionDeployButtonBlock()],
  };

  return {
    blocks: [title, headBlock, contentBlock, action],
  };
};
