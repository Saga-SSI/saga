import { promptLocal } from "../src/lib/cursor/agent-service";

async function main() {
  const message = process.argv.slice(2).join(" ").trim();

  if (!message) {
    console.error("Usage: npm run cursor:ask -- \"Your prompt here\"");
    process.exit(1);
  }

  const result = await promptLocal(message);
  console.log(`\nStatus: ${result.status}`);
  if (result.result) {
    console.log(`\n${result.result}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
