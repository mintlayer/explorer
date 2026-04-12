const { closePg, syncRecentChainData } = require("./lib/explorer-cache");

async function main() {
  await syncRecentChainData();
  console.log("Recent chain sync complete");
  await closePg();
}

main().catch(async (error) => {
  console.error(error);
  await closePg();
  process.exit(1);
});
