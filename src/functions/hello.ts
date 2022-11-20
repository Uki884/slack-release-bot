export const hello = async ({ say }) => {
  await say({
    unfurl_links: true,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "hello developer!",
        },
      },
    ],
  });
};