import { SlackApp } from "slack-cloudflare-workers";
import { releaseList } from "./commands/release-list";
import { ENV } from "./types";

export default {
  async fetch(
    request: Request,
    env: ENV,
    ctx: ExecutionContext
  ): Promise<Response> {
    const app = new SlackApp({ env });
    releaseList(app);

    return await app.run(request, ctx);
  },
};
