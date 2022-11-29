import { GithubApi } from "../api/githubApi";

export const publishReleaseNote = async ({ body, ack, respond }) => {
  await ack();
  try {
    const action = body.actions[0];
    const api = new GithubApi();

    const { data } = await api.updateRelease(action.value, { draft: false });

    (body as any).message.blocks = (body as any).message.blocks.map((block) => {
      if (block.block_id == "publish_button_for_production") {
        const element = block.elements.find(
          (block) => block.action_id === "release_note_detail"
        );
        element.url = data.html_url;
        block.elements = [element];
        return block;
      }
      return block;
    });

    respond({
      unfurl_links: true,
      blocks: (body as any).message.blocks,
    });
  } catch (e) {
    respond({
      unfurl_links: true,
      blocks: (body as any).message.blocks,
    });
  }
};