const Product = require("../models/Product");
const { AppError } = require("../utils/AppError");

async function buildPricedItems(rawItems = []) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new AppError("Cart is empty.", 400);
  }

  const pricedItems = [];
  let subtotal = 0;

  for (const line of rawItems) {
    const productId = line.productId || line.product;
    const quantity = Number(line.quantity) || 0;
    if (!productId) throw new AppError("Each item needs a productId.", 400);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      throw new AppError("Quantity must be between 1 and 20.", 400);
    }

    const product = await Product.findById(productId);
    if (!product) throw new AppError("One or more products are unavailable.", 400);
    if (!product.isAvailable) throw new AppError(`${product.name} is currently sold out.`, 400);

    if (product.trackStock) {
      const remaining = product.dailyStock - product.soldQuantity;
      if (remaining < quantity) {
        throw new AppError(
          remaining <= 0
            ? `${product.name} is sold out.`
            : `Only ${remaining} left of ${product.name}.`,
          400
        );
      }
    }

    const selectedAddOns = Array.isArray(line.selectedAddOns)
      ? line.selectedAddOns
      : Array.isArray(line.addOns)
        ? line.addOns
        : [];

    const resolvedAddOns = [];
    for (const selected of selectedAddOns) {
      const key = selected.id || selected._id || selected.name;
      const addon = product.addOns.id(key)
        || product.addOns.find((a) => a.name === selected.name || a._id.toString() === String(key));
      if (!addon || !addon.isAvailable) {
        throw new AppError(`Add-on unavailable for ${product.name}.`, 400);
      }
      resolvedAddOns.push({ name: addon.name, price: addon.price, _id: addon._id });
    }

    const addOnTotal = resolvedAddOns.reduce((sum, a) => sum + a.price, 0);
    const unitPrice = product.price + addOnTotal;
    const itemTotal = unitPrice * quantity;
    subtotal += itemTotal;

    pricedItems.push({
      product: product._id,
      productDoc: product,
      productName: product.name,
      productImage: product.image || "",
      price: product.price,
      quantity,
      addOns: resolvedAddOns.map(({ name, price }) => ({ name, price })),
      itemTotal,
    });
  }

  return { pricedItems, subtotal };
}

function calculateDeliveryFee(subtotal, settings, areaConfig) {
  const fee = areaConfig?.deliveryFee ?? settings.deliveryFee;
  const freeAbove = settings.freeDeliveryAbove;
  if (freeAbove > 0 && subtotal >= freeAbove) return 0;
  return fee;
}

function resolveDeliveryArea(settings, pincode) {
  const pin = String(pincode || "").trim();
  const areas = settings.deliveryAreas || [];
  if (areas.length === 0) {
    return { name: "Mira Road", pincodes: [], deliveryFee: settings.deliveryFee, minimumOrder: settings.minimumOrder, enabled: true };
  }
  const match = areas.find(
    (a) => a.enabled && (a.pincodes.length === 0 || a.pincodes.includes(pin))
  );
  return match || null;
}

module.exports = {
  buildPricedItems,
  calculateDeliveryFee,
  resolveDeliveryArea,
};
