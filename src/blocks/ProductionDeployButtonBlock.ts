import { Button } from "slack-cloudflare-workers";
import { ACTION_ID_LIST } from "../constants/ACTION_ID_LIST";

export const ProductionDeployButtonBlock = (releaseNoteId: number): Button => {
  return {
    type: "button",
    text: {
      type: "plain_text",
      text: "Deploy Production",
    },
    confirm: {
      title: {
        type: "plain_text",
        text: "確認",
      },
      text: {
        type: "plain_text",
        text: "Productionリリースを開始しますか？",
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
    value: String(releaseNoteId),
    action_id: ACTION_ID_LIST.DEPLOY_PRODUCTION_ACTION,
  };
};
