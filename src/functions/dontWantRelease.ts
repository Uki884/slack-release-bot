export const dontWantRelease = async ({ say }) => {
  await say({
    unfurl_links: true,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "奇遇ですね。私も同じこと言おうと思ってました。",
        },
      },
    ],
  });
};