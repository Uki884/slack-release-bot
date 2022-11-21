import { App, AwsLambdaReceiver, directMention } from "@slack/bolt";
import { dontWantRelease } from "./functions/dontWantRelease";
import { hello } from "./functions/hello";
import { mergeablePullRequestList } from "./functions/mergeablePullRequestList";
import { mergePullRequest } from "./functions/mergePullRequst";
import { overflowActions } from "./functions/overflowActions";

const awsLambdaReceiver = new AwsLambdaReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET as string,
});

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver: awsLambdaReceiver,
});

app.message('hello', hello);

app.action("merge_pull_request", mergePullRequest);

app.action("overflow_actions", overflowActions);

app.message(directMention(), "リリースしたい", mergeablePullRequestList);

app.message(directMention(), "リリースしたくない", dontWantRelease);

app.error(async (error) => {
  console.error('app error', error);
});

module.exports.handler = async (event, context, callback) => {
  const handler = await awsLambdaReceiver.start();
  return handler(event, context, callback);
}
