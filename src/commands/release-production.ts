import { ActionsBlock, AnyMessageBlock, SectionBlock, SlackApp } from "slack-cloudflare-workers";
import { ENV } from "../types";
import { GithubApi } from "../api/githubApi";
import { ACTION_ID_LIST } from "../constants/ACTION_ID_LIST";
import { BLOCK_ID_LIST } from "../constants/BLOCK_ID_LIST";
import { formatJST } from "../lib/date-fns";

type Body = {
  actions: { value: string }[];
  container: { channel_id: string };
  message: { ts: string };
  blocks: ActionsBlock[];
};

export const releaseProduction = (app: SlackApp<ENV>) => {
  return app.action(
    ACTION_ID_LIST.DEPLOY_PRODUCTION_ACTION,
    async (_req) => {},
    async ({ context, body }) => {
      const api = GithubApi.new(app.env);
      const latestRelease = await api.getLatestRelease();
      const tagName = `prod-${formatJST(new Date(), "yyyyMMdd-HHmm")}`;

      await api.runRepositoryDispatchEvent({
        event_type: app.env.PROD_RELEASE_EVENT_NAME,
      });

      const generatedReleaseNote = await api.getReleaseNotes({
        tagName: tagName,
        previousTagName: latestRelease ? latestRelease.tag_name : undefined,
      });

      const release = {
        tagName: tagName,
        name: tagName,
        draft: false,
        body: generatedReleaseNote.body,
      };

      const releaseNote = await api.createReleaseNote(release);
      const bodyData = body.message as Body;

      const resultBlocks = bodyData.blocks.map((block) => {
        if (block.block_id == BLOCK_ID_LIST.DEPLOY_PRODUCTION_BLOCK) {
          const element = block.elements.find(
            (block) => block.action_id === ACTION_ID_LIST.RELEASE_NOTE_DETAIL_ACTION,
          );
          if (!element) return block;

          (element as any).url = releaseNote.html_url;
          block.elements = [element];
          return block as AnyMessageBlock;
        }
        return block as AnyMessageBlock;
      });

      const clientMessageBlocks = [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `Productionリリースが開始されました。`,
          },
        } as SectionBlock,
      ];

      const clientMessage = {
        token: context.botToken,
        channel: body.container.channel_id,
        thread_ts: body.message.ts,
        blocks: clientMessageBlocks,
        text: "Productionリリースが開始されました。",
        parse: "full",
        unfurl_links: false,
        as_user: true,
      } as const;

      await context.client.chat.postMessage(clientMessage);
      context.respond &&
        (await context.respond({
          unfurl_links: true,
          text: "Productionリリースが開始されました。",
          blocks: resultBlocks,
        }));
    },
  );
};
