const { App, AwsLambdaReceiver } = require('@slack/bolt');
const axiosBase = require("axios");

const axios = axiosBase.create({
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  },
  responseType: "json",
});

const awsLambdaReceiver = new AwsLambdaReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// Initializes your app with your bot token and the AWS Lambda ready receiver
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver: awsLambdaReceiver,
});

app.message('hello', async ({ message, say }) => {
  await say({
    blocks: [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `Hey there <@${message.user}>!`
        },
        "accessory": {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "Click Me"
          },
          "action_id": "button_click"
        }
      }
    ],
    text: `Hey there <@${message.user}>!`
  });
});

app.action('button_click', async ({ body, ack, say }) => {
  await ack();
  await say(`<@${body.user.id}> clicked the button`);
});

app.message('goodbye', async ({ message, say }) => {
  await say(`See ya later, <@${message.user}> :wave:`);
});

app.message("test", async ({ message, say }) => {
  // https://api.github.com/repos/Uki884/test-label-approved-pull-requests/issues
  const result = await axios.get(
    "https://api.github.com/repos/smartcamp/boxil/issues"
  );
  console.log('result', result)
});

module.exports.handler = async (event, context, callback) => {
  const handler = await awsLambdaReceiver.start();
  return handler(event, context, callback);
}
