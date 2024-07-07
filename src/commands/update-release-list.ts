import { SlackApp } from "slack-cloudflare-workers";
import { ENV } from "../types";
import { GithubApi } from "../api/githubApi";
import { ACTION_ID_LIST } from "../constants/ACTION_ID_LIST";
import { DividerBlock } from "../blocks/DividerBlock";
import { PullRequestBlock } from "../blocks/PullRequestBlock";
import { ReleaseListBlock } from "../blocks/ReleaseListBlock";

export const updateReleaseList = (app: SlackApp<ENV>) => {
  return app.action(
    ACTION_ID_LIST.UPDATE_PR_LIST_ACTION,
    async (_req) => {
      return "リリースリストを更新します！😃";
    },
    async (req) => {
      const api = GithubApi.new(app.env);
      const approvedPrList = await api.getApprovedPrList();

      const pullRequests = PullRequestBlock(approvedPrList);
      const { header, stagingReleaseButtons } = ReleaseListBlock({ userId: req.context.userId });

      if (req.context.respond) {
        await req.context.respond({
          unfurl_links: true,
          text: "リリースできそうなPRはこちらです！😃",
          blocks: [header, DividerBlock, ...pullRequests, stagingReleaseButtons],
        });
      }
    },
  );
};
