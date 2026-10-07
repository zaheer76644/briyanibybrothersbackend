const Product = require("../models/Product");
const { AppError } = require("../utils/AppError");

async function reserveStock(pricedItems, session) {
  for (const item of pricedItems) {
    if (!item.productDoc.trackStock) continue;

    const options = { new: true };
    if (session) options.session = session;

    const updated = await Product.findOneAndUpdate(
      {
        _id: item.product,
        trackStock: true,
        $expr: {
          $gte: [
            { $subtract: ["$dailyStock", "$soldQuantity"] },
            item.quantity,
          ],
        },
      },
      { $inc: { soldQuantity: item.quantity } },
      options
    );

    if (!updated) {
      throw new AppError(`${item.productName} is sold out or has insufficient stock.`, 409);
    }
  }
}

async function releaseStock(orderItems, session) {
  for (const item of orderItems) {
    const options = {};
    if (session) options.session = session;
    await Product.findOneAndUpdate(
      { _id: item.product, trackStock: true },
      { $inc: { soldQuantity: -item.quantity } },
      options
    );
  }
}

module.exports = { reserveStock, releaseStock };
