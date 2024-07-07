import { SlackApp } from "slack-cloudflare-workers";
import { ENV } from "../types";
import { GithubApi } from "../api/githubApi";
import { DividerBlock } from "../blocks/DividerBlock";
import { COMMAND_LIST } from "../constants/COMMAND_LIST";
import { PullRequestBlock } from "../blocks/PullRequestBlock";
import { ReleaseListBlock } from "../blocks/ReleaseListBlock";

export const releaseList = (app: SlackApp<ENV>) => {
  return app.command(
    COMMAND_LIST.RELEASE_LIST_ACTION,
    async (_req) => {
      return "リリースできそうなPRをもってきます！😃";
    },
    async (req) => {
      const api = GithubApi.new(app.env);
      const approvedPrList = await api.getApprovedPrList();

      const pullRequests = PullRequestBlock(approvedPrList);
      const { header, stagingReleaseButtons } = ReleaseListBlock({ userId: req.context.userId });

      await req.context.respond({
        unfurl_links: false,
        text: "リリースできそうなPRはこちらです！😃",
        blocks: [header, DividerBlock, ...pullRequests, stagingReleaseButtons],
        response_type: "in_channel",
      });
    },
  );
};
