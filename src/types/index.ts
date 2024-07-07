import { KV, SlackOAuthAndOIDCEnv } from "slack-cloudflare-workers";

export type ENV = {
  GITHUB_PRIVATE_KEY: string;
  GITHUB_APP_ID: string;
  GITHUB_APP_NAME: string;
  GITHUB_USERNAME: string;
  GITHUB_REPO: string;
  STG_RELEASE_EVENT_NAME: string;
  PROD_RELEASE_EVENT_NAME: string;
} & SlackOAuthAndOIDCEnv & {
  SLACK_INSTALLATIONS: KV;
  SLACK_OAUTH_STATES: KV;
}
