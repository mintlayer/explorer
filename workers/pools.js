const { closePg, syncCatalogData } = require("./lib/explorer-cache");

async function main() {
  await syncCatalogData();
  console.log("Catalog sync complete");
  await closePg();
}

main().catch(async (error) => {
  console.error(error);
  await closePg();
  process.exit(1);
});
