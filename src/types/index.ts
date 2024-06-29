import { SlackEdgeAppEnv } from "slack-cloudflare-workers";

export type ENV = {
  GITHUB_PRIVATE_KEY: string;
  GITHUB_APP_ID: string;
  GITHUB_APP_NAME: string;
  GITHUB_USERNAME: string;
  GITHUB_REPO: string;
} & SlackEdgeAppEnv;
