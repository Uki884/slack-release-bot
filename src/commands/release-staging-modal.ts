import { ModalView, SectionBlock, SlackApp } from "slack-cloudflare-workers";
import { ENV } from "../types";
import { GithubApi } from "../api/githubApi";
import { ACTION_ID_LIST } from "../constants/ACTION_ID_LIST";
import { COMMAND_LIST } from "../constants/COMMAND_LIST";
import { formatJST } from "../lib/date-fns";
import slackifyMarkdown from "slackify-markdown";

export const releaseStagingModal = (app: SlackApp<ENV>) => {
  return app.action(
    COMMAND_LIST.SHOW_STAGING_MODAL_ACTION,
    async () => {},
    async ({ context, body }) => {
      const api = GithubApi.new(app.env);
      const latestRelease = await api.getLatestRelease();
      const tagName = `prod-${formatJST(new Date(), "yyyyMMdd-HHmm")}`;

      const generatedReleaseNote = await api.getReleaseNotes({
        tagName: tagName,
        previousTagName: latestRelease ? latestRelease.tag_name : undefined,
      });

      const head: SectionBlock = {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*リリース内容:*",
        },
      };
      const content: SectionBlock = {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `${limitTextLength(
            slackifyMarkdown(generatedReleaseNote.body.replace(/<!--[\s\S]*?-->/g, "")),
          )}`,
        },
      };

      const metadata = {
        channelId: body.container.channel_id,
        messageTs: body.container.message_ts,
      };
      const view: ModalView = {
        type: "modal" as "modal",
        private_metadata: JSON.stringify(metadata),
        callback_id: ACTION_ID_LIST.DEPLOY_STAGING_ACTION,
        title: {
          type: "plain_text" as "plain_text",
          text: "リリース情報",
        },
        close: {
          type: "plain_text" as "plain_text",
          text: "閉じる",
        },
        blocks: [head, content],
        submit: {
          type: "plain_text" as "plain_text",
          text: "Staging環境にデプロイする",
        },
      };

      await context.client.views.open({
        trigger_id: body.trigger_id,
        view: view,
      });
    },
  );
};

const limitTextLength = (text: string) => {
  if (!text) return "";

  const maxLength = 3000;
  let processedText = text;

  if (processedText.length > maxLength) {
    processedText = processedText.substring(0, maxLength);
  }

  return processedText;
};
