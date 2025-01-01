import { createVoyagerGeoJSON } from "./extractByCountry.ts";

// 実行
createVoyagerGeoJSON().catch((error) => {
  console.error("Error in createVoyagerGeoJSON:", error);
});
