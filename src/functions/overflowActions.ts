export const overflowActions = async ({ body, ack, respond }) => {
  await ack();
  try {
    const targetActions = (body as any).actions[0];
    const blockId = targetActions.block_id;
    if (targetActions.selected_option.value == 'action_1') {
      const changedBlocks = (body as any).message.blocks.filter(
        (block) => block.block_id !== blockId
      );
      respond({
        unfurl_links: true,
        blocks: changedBlocks,
      });
    }
  } catch (e) {
    respond({
      unfurl_links: true,
      blocks: (body as any).message.blocks,
    });
  }
};
