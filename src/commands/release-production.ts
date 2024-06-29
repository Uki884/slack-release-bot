import { AnyMessageBlock, SectionBlock, SlackApp } from "slack-cloudflare-workers";
import { ENV } from "../types";
import { GithubApi } from "../api/githubApi";
import { ACTION_ID_LIST } from "../constants/ACTION_ID_LIST";
import { BLOCK_ID_LIST } from "../constants/BLOCK_ID_LIST";

export const releaseProduction = (app: SlackApp<ENV>) => {
  return app.action(
    ACTION_ID_LIST.DEPLOY_PRODUCTION_ACTION,
    async (_req) => {
      return "";
    },
    async ({ context, body }) => {
      const api = GithubApi.new(app.env);
      const data = await api.updateRelease(body.actions[0].value, {
        draft: false,
      });

      const bodyData = body as { message: { ts: string }, container: { channel_id: string }; blocks: { block_id: string, elements: { action_id: string; url: string }[] }[] };
      console.log('bodyData', bodyData);

      const resultBlocks = bodyData.blocks.map((block) => {
        if (block.block_id == BLOCK_ID_LIST.DEPLOY_PRODUCTION_BLOCK) {
          const element = block.elements.find(
            (block) => block.action_id === ACTION_ID_LIST.RELEASE_NOTE_DETAIL_ACTION
          );
          if (!element) return block;

          element.url = data.html_url;
          block.elements = [element];
          return block as AnyMessageBlock;
        }
        return block as AnyMessageBlock;
      });

      const clientMessageBlocks =  [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `Productionリリースが開始されました。\nデプロイ状況は<#C01KQ6B0Q91>で確認可能です。`,
          },
        } as SectionBlock,
      ];

    const clientMessage = {
      token: context.botToken,
      channel: bodyData.container.channel_id,
      thread_ts: bodyData.message.ts,
      blocks: clientMessageBlocks,
      text: "Productionリリースが開始されました。",
      parse: "full",
      unfurl_links: false,
      as_user: true,
    } as const;
  
    await context.client.chat.postMessage(clientMessage);
    context.respond && await context.respond({
      unfurl_links: true,
      blocks: resultBlocks,
    });
    },
  );
};
