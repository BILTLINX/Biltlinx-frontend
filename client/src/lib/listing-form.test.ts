import { describe, expect, it } from "vitest";
import { defaultsForPurpose, EMPTY_LISTING_FORM, fromDraftData, toDraftData, type ListingForm } from "@/lib/listing-form";

function form(overrides: Partial<ListingForm>): ListingForm {
  return { ...EMPTY_LISTING_FORM, ...overrides };
}

describe("toDraftData", () => {
  it("drops empty fields and parses numbers", () => {
    const data = toDraftData(form({ name: " Flat ", price: "2,800", bedrooms: "2", bathrooms: "", deposit: "5600", leaseTermMonths: "12" }));
    expect(data).toMatchObject({
      purpose: "ForRent",
      name: "Flat",
      price: 2800,
      pricePeriod: "PerMonth",
      bedrooms: 2,
      deposit: 5600,
      leaseTermMonths: 12,
      addressVisibility: "Hidden",
    });
    expect(data).not.toHaveProperty("bathrooms");
    expect(data).not.toHaveProperty("description");
  });

  it("omits rental terms for a sale and home fields for land", () => {
    const sale = toDraftData(form({ ...defaultsForPurpose("LandForSale"), price: "120000", deposit: "10", bedrooms: "3", landSizeSqm: "700", paymentPlanNote: "50% down" }));
    expect(sale).toMatchObject({ purpose: "LandForSale", propertyType: "Land", pricePeriod: "Total", landSizeSqm: 700, paymentPlanNote: "50% down" });
    expect(sale).not.toHaveProperty("deposit");
    expect(sale).not.toHaveProperty("bedrooms");
  });

  it("sends photo references only", () => {
    const data = toDraftData(form({ media: [{ path: "p/1.jpg", contentType: "image/jpeg", name: "1.jpg", url: "blob:x" }] }));
    expect(data.media).toEqual([{ path: "p/1.jpg", contentType: "image/jpeg", name: "1.jpg" }]);
  });
});

describe("fromDraftData", () => {
  it("round-trips a draft", () => {
    const original = form({ ...defaultsForPurpose("ForSale"), name: "House", price: "900000", city: "Accra", hideAddress: false, bedrooms: "4" });
    const restored = fromDraftData(toDraftData(original));
    expect(restored).toMatchObject({ purpose: "ForSale", propertyType: "House", name: "House", price: "900000", city: "Accra", hideAddress: false, bedrooms: "4" });
  });

  it("falls back to defaults for an empty draft", () => {
    expect(fromDraftData(null)).toEqual(EMPTY_LISTING_FORM);
  });
});
