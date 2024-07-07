import { ActionsBlock, SectionBlock } from "slack-cloudflare-workers";
import { ACTION_ID_LIST } from "../constants/ACTION_ID_LIST";
import { BLOCK_ID_LIST } from "../constants/BLOCK_ID_LIST";
import { COMMAND_LIST } from "../constants/COMMAND_LIST";

export const ReleaseListBlock = ({ userId }: { userId: string | undefined }) => {
  const header: SectionBlock = {
    type: "section",
    text: {
      type: "mrkdwn",
      text: `リリースできそうなPRはこちらです！😃\n実行者: <@${userId}>`,
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

  return {
    header,
    stagingReleaseButtons,
  };
};
