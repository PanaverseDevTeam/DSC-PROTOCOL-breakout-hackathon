"use server";

import axios from "axios";

export default async function getAccountInfo(user: string) {
  try {
    const response = await axios.post(
      "https://e9f2-203-215-167-42.ngrok-free.app/account-information",
      {
        user,
      }
    );
    return {
      totalDscMinted: response.data.total_dsc_minted,
      collateralValueUSD: response.data.collateral_value_in_usd,
    };
  } catch (error) {
    console.error("Failed to fetch account information:", error);
    throw new Error("Could not fetch account information");
  }
}
