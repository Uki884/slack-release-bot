import { filterPullRequests, GithubApi } from "../api/githubApi";
import { DeployButtonForProduction } from "./deployProduction";
const isIncludes = (arr, target) => arr.some((el) => target.includes(el.url));

export const deployStaging = async ({ body, ack, respond }) => {
  await ack();
  try {
    const api = new GithubApi()
    // リリース実行

    await api.runRepositoryDispatchEvent({
      event_type: process.env.STG_RELEASE_EVENT_NAME as string,
    });
    const result = await api.getMergeablePr().then(response => filterPullRequests(response.data));

    const changedBlock = (body as any).message.blocks.find(
      (block) => block.block_id == "pull_request_list"
    );

    const deployButtonIndex = (body as any).message.blocks.findIndex(
      (block) => block.block_id == "deploy_button_for_staging"
    );

    const newFields = changedBlock.fields.map((field) => {
      const isExist = isIncludes(result, field.text);
      if (isExist) {
        field.text = `~${field.text}~ (Not Released)`;
      }
      return field;
    });

    changedBlock.fields = newFields;
    const resultBlocks = (body as any).message.blocks.map((block) => {
      if (block.block_id == "pull_request_list") {
        return changedBlock;
      }
      return block;
    });

    resultBlocks.splice(deployButtonIndex, 1, DeployButtonForProduction);

    respond({
      unfurl_links: true,
      blocks: resultBlocks,
    });
  } catch (e) {
    respond({
      unfurl_links: true,
      blocks: (body as any).message.blocks,
    });
  }
};

export const DeployButtonForStaging = {
  type: "actions",
  block_id: "deploy_button_for_staging",
  elements: [
    {
      type: "button",
      text: {
        type: "plain_text",
        text: "Stagingデプロイ",
      },
      confirm: {
        title: {
          type: "plain_text",
          text: "確認",
        },
        text: {
          type: "mrkdwn",
          text: `Stagingリリースを開始しますか？`,
        },
        deny: {
          type: "plain_text",
          text: "やめる",
        },
        confirm: {
          type: "plain_text",
          text: "OK",
        },
      },
      value: "ok",
      action_id: "deploy_staging",
    },
  ],
};