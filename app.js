const { App, AwsLambdaReceiver, directMention } = require("@slack/bolt");
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

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver: awsLambdaReceiver,
});

app.action("approve_button", async ({ body, ack, respond, action }) => {
  const targetAction = body.actions[0]
  const blockId = targetAction.block_id;
  const changedBlocks = body.message.blocks.map(block => {
    if (block.block_id === blockId) {
      block.fields[0].text += " *(Merged)*";
      delete block.accessory;
      return block;
    }
    return block
  })
  await ack();
  try {
    await axios.put(
      `https://api.github.com/repos/${process.env.GITHUB_USERNAME}/${process.env.GITHUB_REPO}/pulls/${targetAction.value}/merge`
    );
    respond({
      unfurl_links: true,
      blocks: changedBlocks,
    });
  } catch (e) {
    respond({
      unfurl_links: true,
      blocks: body.message.blocks,
    });
  }
});

app.message(directMention(), "リリースしたい", async ({ message, say }) => {
  const { data } = await axios.get(
    `https://api.github.com/repos/${process.env.GITHUB_USERNAME}/${process.env.GITHUB_REPO}/issues`,
    { params: { state: "open", labels: "Mergeable", pulls: "true" } }
  );
  const pullRequests = data.map((item) => {
    return {
      id: item.id,
      number: item.number,
      user: item.user,
      title: item.title,
      url: item.html_url,
    };
  });
  if (pullRequests.length) {
    await say({
      unfurl_links: true,
      blocks: buildPrSections(pullRequests),
    });
  } else {
    await say({
      unfurl_links: true,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "リリースできそうなPRが見つかりませんでした。",
          },
        }
      ]
    });
  }
});

const buildPrSections = (pullRequests) => {
  const header = {
    type: "section",
    text: {
      type: "mrkdwn",
      text: "<!subteam^S01EKMNQVS9>\nリリースできそうなPRはこちらです。",
    },
  };
  const result = pullRequests.map((pullRequest, index) => {
    const section = {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `<${pullRequest.url}|#${pullRequest.number} *${pullRequest.title}*> by ${pullRequest.user.login}`,
        },
      ],
      // accessory: {
      //   type: "button",
      //   text: {
      //     type: "plain_text",
      //     text: "マージ",
      //   },
      //   confirm: {
      //     title: {
      //       type: "plain_text",
      //       text: "マージ確認",
      //     },
      //     text: {
      //       type: "mrkdwn",
      //       text: `<${pullRequest.url}|#${pullRequest.number} ${pullRequest.title}> をマージしますか？`,
      //     },
      //     deny: {
      //       type: "plain_text",
      //       text: "やめる",
      //     },
      //     confirm: {
      //       type: "plain_text",
      //       text: "OK",
      //     },
      //   },
      //   style: "primary",
      //   value: String(pullRequest.number),
      //   action_id: "approve_button",
      // },
    };
    return section;
  })

  return [header, ...result];
}

app.error(async (error) => {
  // エラーの詳細をチェックして、メッセージ送信のリトライやアプリの停止などの対処を行う
  console.error(error);
});

module.exports.handler = async (event, context, callback) => {
  const handler = await awsLambdaReceiver.start();
  return handler(event, context, callback);
}
