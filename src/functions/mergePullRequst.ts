import { githubApiRequest } from "../lib/axios";

export const mergePullRequest = async ({ body, ack, respond }) => {
  await ack();
  const targetAction = (body as any).actions[0];
  const blockId = targetAction.block_id;
  const changedBlocks = (body as any).message.blocks.map((block) => {
    if (block.block_id === blockId) {
      block.fields[0].text += " *(Merged)*";
      delete block.accessory;
      return block;
    }
    return block;
  });
  try {
    await githubApiRequest.put(
      `https://api.github.com/repos/${process.env.GITHUB_USERNAME}/${process.env.GITHUB_REPO}/pulls/${targetAction.value}/merge`
    );
    respond({
      unfurl_links: true,
      blocks: changedBlocks,
    });
  } catch (e) {
    respond({
      unfurl_links: true,
      blocks: (body as any).message.blocks,
    });
  }
};

export const MergeRequestButton = (pullRequest: any) => {
  return {
    type: "button",
    text: {
      type: "plain_text",
      text: "マージ",
    },
    confirm: {
      title: {
        type: "plain_text",
        text: "マージ確認",
      },
      text: {
        type: "mrkdwn",
        text: `<${pullRequest.url}|#${pullRequest.number} ${pullRequest.title}> をマージしますか？`,
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
    style: "primary",
    value: String(pullRequest.number),
    action_id: "merge_pull_request",
  };
};