const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { normalizeMobile, isValidIndianMobile } = require("../src/services/authService");

describe("auth helpers", () => {
  it("normalizes indian mobile formats", () => {
    assert.equal(normalizeMobile("9876543210"), "9876543210");
    assert.equal(normalizeMobile("919876543210"), "9876543210");
    assert.equal(normalizeMobile("09876543210"), "9876543210");
  });

  it("validates indian mobile numbers", () => {
    assert.equal(isValidIndianMobile("9876543210"), true);
    assert.equal(isValidIndianMobile("5876543210"), false);
    assert.equal(isValidIndianMobile("98765"), false);
  });
});
