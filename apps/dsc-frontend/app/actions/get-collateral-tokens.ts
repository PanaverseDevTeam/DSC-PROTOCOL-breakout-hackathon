"use server";

import axios from "axios";

export default async function getCollateralTokens() {
  try {
    const response = await axios.get(
      "https://e9f2-203-215-167-42.ngrok-free.app/collateral-tokens"
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch collateral tokens:", error);
    throw new Error("Could not fetch collateral tokens");
  }
}
