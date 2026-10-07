const OrderCounter = require("../models/OrderCounter");

async function generateOrderId(session) {
  const options = { new: true, upsert: true, setDefaultsOnInsert: true };
  if (session) options.session = session;

  const counter = await OrderCounter.findOneAndUpdate(
    { key: "order" },
    { $inc: { seq: 1 } },
    options
  );

  if (counter.seq < 1001) {
    const fixOptions = { new: true };
    if (session) fixOptions.session = session;
    const fixed = await OrderCounter.findOneAndUpdate(
      { key: "order" },
      { $set: { seq: 1001 } },
      fixOptions
    );
    return `BBB-${fixed.seq}`;
  }

  return `BBB-${counter.seq}`;
}

module.exports = { generateOrderId };
