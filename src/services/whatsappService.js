function buildOrderWhatsAppMessage(order, settings) {
  const lines = [
    "New Order 🍗",
    "",
    `Order: ${order.orderId}`,
    "",
    `Customer: ${order.customerSnapshot?.name || order.deliveryAddress.fullName}`,
    `Mobile: ${order.deliveryAddress.mobile}`,
    "",
    "Items:",
    ...order.items.map((item) => {
      const addOns = item.addOns?.length
        ? ` (+ ${item.addOns.map((a) => a.name).join(", ")})`
        : "";
      return `${item.quantity} × ${item.productName}${addOns}`;
    }),
    "",
    `Subtotal: ₹${order.subtotal}`,
    `Delivery: ₹${order.deliveryFee}`,
    order.discount ? `Discount: -₹${order.discount}` : null,
    `Total: ₹${order.total}`,
    "",
    `Payment: ${order.paymentMethod === "COD" ? "Cash on Delivery" : "UPI on Delivery"}`,
    "",
    "Address:",
    `${order.deliveryAddress.flatHouse}, ${order.deliveryAddress.buildingSociety}`,
    `${order.deliveryAddress.area}${order.deliveryAddress.landmark ? `, ${order.deliveryAddress.landmark}` : ""}`,
    `Pincode: ${order.deliveryAddress.pincode}`,
    order.deliveryAddress.instructions ? `Note: ${order.deliveryAddress.instructions}` : null,
  ].filter(Boolean);

  const text = lines.join("\n");
  const number = String(settings.whatsappNumber || "").replace(/\D/g, "");
  const url = number ? `https://wa.me/${number}?text=${encodeURIComponent(text)}` : null;
  return { text, url };
}

module.exports = { buildOrderWhatsAppMessage };
