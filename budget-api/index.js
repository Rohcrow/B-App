const https = require("https");
const crypto = require("crypto");

module.exports = async function (context, req) {
  context.res = {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  };

  try {
    const uri = process.env.COSMOS_URI;
    const key = process.env.COSMOS_KEY;

    context.res.status = 200;
    context.res.body = JSON.stringify({
      message: "Debug info",
      hasUri: !!uri,
      hasKey: !!key,
      uriStart: uri ? uri.substring(0, 40) : "missing",
    });
  } catch (err) {
    context.res.status = 500;
    context.res.body = JSON.stringify({ error: err.message });
  }
};
