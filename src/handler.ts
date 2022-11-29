import { App, AwsLambdaReceiver, directMention } from "@slack/bolt";
import { deployProduction } from "./functions/deployProduction";
import { deployStaging } from "./functions/deployStaging";
import { dontWantRelease } from "./functions/dontWantRelease";
import { hello } from "./functions/hello";
import { mergeablePullRequestList } from "./functions/mergeablePullRequestList";
import { mergePullRequest } from "./functions/mergePullRequst";
import { overflowActions } from "./functions/overflowActions";
import { publishReleaseNote } from "./functions/publishReleaseNote";

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

app.action("deploy_staging", deployStaging);

app.action("deploy_production", deployProduction);

app.action("publish_release_note", publishReleaseNote);

app.message(directMention(), "リリースしたい", mergeablePullRequestList);

app.message(directMention(), "リリースしたくない", dontWantRelease);

app.command("/release-list", mergeablePullRequestList)
app.command("/release-stg", deployStaging);

app.error(async (error) => {
  console.error('app error', error);
});

module.exports.handler = async (event, context, callback) => {
  const handler = await awsLambdaReceiver.start();
  return handler(event, context, callback);
}
