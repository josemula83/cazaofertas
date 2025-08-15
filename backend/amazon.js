const axios = require("axios");
require("dotenv").config();

const endpoint = "webservices.amazon.es";
const uri = "/paapi5/searchitems";
const getUri = "/paapi5/getitems";

function signRequest() {
  const amzTarget = "com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems";
  const headers = {
    "Content-Encoding": "amz-1.0",
    "Content-Type": "application/json; charset=UTF-8",
    Host: endpoint,
    "X-Amz-Target": amzTarget,
    "X-Amz-Date": new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z",
  };
  return { headers };
}

async function searchAmazonProducts(filters) {
  const payload = {
    Keywords: filters.keyword || "",
    Resources: [
      "ItemInfo.Title",
      "ItemInfo.Features",
      "Offers.Listings.Price",
      "Offers.Listings.DeliveryInfo.IsAmazonFulfilled",
      "Images.Primary.Small"
    ],
    PartnerTag: process.env.ASSOCIATE_TAG,
    PartnerType: "Associates",
    Marketplace: "www.amazon.es",
    ItemCount: 10,
    SearchIndex: filters.category || "All"
  };

  const { headers } = signRequest();

  try {
    const response = await axios.post(`https://${endpoint}${uri}`, payload, { headers });
    const items = response.data.SearchResult?.Items || [];

    return items
      .map((item) => {
        const asin = item.ASIN;
        const isPrime = item.Offers?.Listings?.[0]?.DeliveryInfo?.IsAmazonFulfilled;
        const price = item.Offers?.Listings?.[0]?.Price?.Amount || 0;
        const discount = Math.floor(Math.random() * 50) + 10; // Simulado

        return {
          asin,
          title: item.ItemInfo?.Title?.DisplayValue || "(Sin título)",
          url: item.DetailPageURL,
          category: filters.category || "general",
          discount,
          prime: isPrime || false,
          price,
          image: item.Images?.Primary?.Small?.URL || null
        };
      })
      .filter((product) => {
        if (filters.discount && product.discount < parseInt(filters.discount)) return false;
        if (filters.primeOnly === "true" && !product.prime) return false;
        return true;
      });
  } catch (error) {
    console.error("Error al buscar en Amazon API:", error.message);
    return [];
  }
}

async function validateProducts(asinList) {
  const payload = {
    ItemIds: asinList,
    Resources: [
      "ItemInfo.Title",
      "Offers.Listings.Price",
      "Images.Primary.Small"
    ],
    PartnerTag: process.env.ASSOCIATE_TAG,
    PartnerType: "Associates",
    Marketplace: "www.amazon.es"
  };

  const headers = {
    "Content-Encoding": "amz-1.0",
    "Content-Type": "application/json; charset=UTF-8",
    Host: endpoint,
    "X-Amz-Target": "com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems",
    "X-Amz-Date": new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
  };

  try {
    const response = await axios.post(`https://${endpoint}${getUri}`, payload, { headers });
    const items = response.data.ItemsResult?.Items || [];
    const valid = items.map((item) => ({
      asin: item.ASIN,
      price: item.Offers?.Listings?.[0]?.Price?.Amount || 0,
    }));
    return valid;
  } catch (error) {
    console.error("Error al validar productos:", error.message);
    return [];
  }
}

module.exports = { searchAmazonProducts, validateProducts };