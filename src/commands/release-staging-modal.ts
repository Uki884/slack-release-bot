import { ActionsBlock, ContextBlock, ModalView, SectionBlock, SlackApp, ViewAckResponse } from "slack-cloudflare-workers";
import { ENV } from "../types";
import { GithubApi } from "../api/githubApi";
import { ACTION_ID_LIST } from "../constants/ACTION_ID_LIST";

export const releaseStagingModal = (app: SlackApp<ENV>) => {
  return app.action(
    ACTION_ID_LIST.SHOW_STAGING_MODAL_ACTION,
    async () => { },
    async ({ context, body }) => {
      const api = GithubApi.new(app.env);
      const latestRelease = await api.getLatestRelease();
      // const tagName = `prod-${dayjs().tz().format("YYYYMMDD-HHmm")}`;

      console.log("latestRelease", latestRelease ? latestRelease.tag_name : "");

      // const { data: generatedReleaseNote } = await this.githubApi.getReleaseNotes(
      //   {
      //     tag_name: tagName,
      //     previous_tag_name: latestRelease ? latestRelease.tag_name : undefined,
      //   }
      // );

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
          text: `テスト`,
        },
      };

      const metadata = {
        channelId: body.container.channel_id,
        messageTs: body.container.message_ts,
      }
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
      }

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