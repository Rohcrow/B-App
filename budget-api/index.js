const { CosmosClient } = require("@azure/cosmos");

const client = new CosmosClient({
  endpoint: process.env.COSMOS_URI,
  key: process.env.COSMOS_KEY,
});

const DATABASE_ID = "my-apps-db";
const CONTAINER_ID = "budget";

async function getContainer() {
  const { database } = await client.databases.createIfNotExists({ id: DATABASE_ID });
  const { container } = await database.containers.createIfNotExists({
    id: CONTAINER_ID,
    partitionKey: { paths: ["/userId"] },
  });
  return container;
}

module.exports = async function (context, req) {
  context.res = {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  };

  if (req.method === "OPTIONS") {
    context.res.status = 200;
    context.res.body = "";
    return;
  }

  try {
    const container = await getContainer();
    const userId = "default-user";

    if (req.method === "GET") {
      const { resources } = await container.items
        .query({ query: "SELECT * FROM c WHERE c.userId = @userId", parameters: [{ name: "@userId", value: userId }] })
        .fetchAll();
      context.res.status = 200;
      context.res.body = JSON.stringify(resources[0] || { userId, transactions: [], goals: [], bills: [] });

    } else if (req.method === "POST") {
      const data = { ...req.body, userId, id: userId };
      await container.items.upsert(data);
      context.res.status = 200;
      context.res.body = JSON.stringify({ success: true });

    } else {
      context.res.status = 405;
      context.res.body = JSON.stringify({ error: "Method not allowed" });
    }
  } catch (err) {
    context.res.status = 500;
    context.res.body = JSON.stringify({ error: err.message });
  }
};
