const { asyncHandler } = require("../utils/asyncHandler");
const { ok } = require("../utils/apiResponse");
const { AppError } = require("../utils/AppError");
const { normalizeMobile, isValidIndianMobile } = require("../services/authService");

function findOwnedAddress(customer, addressId) {
  const address = customer.addresses.id(addressId);
  if (!address) throw new AppError("Address not found.", 404);
  return address;
}

const listAddresses = asyncHandler(async (req, res) => {
  return ok(res, { addresses: req.user.addresses });
});

const createAddress = asyncHandler(async (req, res) => {
  const mobile = normalizeMobile(req.body.mobile);
  if (!isValidIndianMobile(mobile)) throw new AppError("Enter a valid Indian mobile number.", 400);

  const address = {
    label: req.body.label || "HOME",
    fullName: req.body.fullName.trim(),
    mobile,
    flatHouse: req.body.flatHouse.trim(),
    buildingSociety: req.body.buildingSociety.trim(),
    area: req.body.area.trim(),
    landmark: req.body.landmark || "",
    pincode: req.body.pincode.trim(),
    isDefault: Boolean(req.body.isDefault) || req.user.addresses.length === 0,
  };

  if (address.isDefault) {
    req.user.addresses.forEach((a) => {
      a.isDefault = false;
    });
  }

  req.user.addresses.push(address);
  await req.user.save();
  return ok(res, { addresses: req.user.addresses }, "Address saved.", 201);
});

const updateAddress = asyncHandler(async (req, res) => {
  const address = findOwnedAddress(req.user, req.params.id);
  const fields = ["label", "fullName", "flatHouse", "buildingSociety", "area", "landmark", "pincode"];
  for (const field of fields) {
    if (req.body[field] !== undefined) address[field] = req.body[field];
  }
  if (req.body.mobile) {
    const mobile = normalizeMobile(req.body.mobile);
    if (!isValidIndianMobile(mobile)) throw new AppError("Enter a valid Indian mobile number.", 400);
    address.mobile = mobile;
  }
  if (req.body.isDefault) {
    req.user.addresses.forEach((a) => {
      a.isDefault = false;
    });
    address.isDefault = true;
  }
  await req.user.save();
  return ok(res, { addresses: req.user.addresses }, "Address updated.");
});

const deleteAddress = asyncHandler(async (req, res) => {
  const address = findOwnedAddress(req.user, req.params.id);
  const wasDefault = address.isDefault;
  address.deleteOne();
  if (wasDefault && req.user.addresses.length) {
    req.user.addresses[0].isDefault = true;
  }
  await req.user.save();
  return ok(res, { addresses: req.user.addresses }, "Address deleted.");
});

const setDefaultAddress = asyncHandler(async (req, res) => {
  const address = findOwnedAddress(req.user, req.params.id);
  req.user.addresses.forEach((a) => {
    a.isDefault = false;
  });
  address.isDefault = true;
  await req.user.save();
  return ok(res, { addresses: req.user.addresses }, "Default address updated.");
});

module.exports = {
  listAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
