import { ExecutionContext, SlackApp } from "slack-cloudflare-workers";
import { releaseList } from "./commands/release-list";
import { ENV } from "./types";
import { updateReleaseList } from "./commands/update-release-list";
import { releaseStagingModal } from "./commands/release-staging-modal";

export default {
  async fetch(request: Request, env: ENV, ctx: ExecutionContext): Promise<Response> {
    const app = new SlackApp({ env });
    releaseList(app);
    updateReleaseList(app);
    releaseStagingModal(app);

    return await app.run(request, ctx);
  },
};
