import { GithubApi } from "../api/githubApi";

export const deployProduction = async ({ body, ack, respond }) => {
  await ack();
  try {
    const api = new GithubApi();
    // リリース実行
    await api.runRepositoryDispatchEvent({
      event_type: process.env.PROD_RELEASE_EVENT_NAME as string,
    });

    respond({
      unfurl_links: true,
      blocks: (body as any).message.blocks,
    });
  } catch (e) {
    respond({
      unfurl_links: true,
      blocks: (body as any).message.blocks,
    });
  }
};

export const ProductionReleaseButton = {
  type: "button",
  text: {
    type: "plain_text",
    text: "Create Release Note",
  },
  confirm: {
    title: {
      type: "plain_text",
      text: "確認",
    },
    text: {
      type: "mrkdwn",
      text: `リリースノート作成を作成しますか？`,
    },
    deny: {
      type: "plain_text",
      text: "キャンセル",
    },
    confirm: {
      type: "plain_text",
      text: "OK",
    },
  },
  style: "primary",
  value: "ok",
  action_id: "deploy_production",
};

export const DeployButtonForProduction = {
  type: "actions",
  block_id: "deploy_button_for_production",
  elements: [ProductionReleaseButton],
};
