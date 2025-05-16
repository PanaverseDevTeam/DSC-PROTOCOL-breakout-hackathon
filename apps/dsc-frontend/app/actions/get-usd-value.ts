"use server";

import axios from "axios";

export default async function getUsdValue(user: string, token: string) {
  try {
    const response = await axios.post(
      "https://e9f2-203-215-167-42.ngrok-free.app/usd-value",
      {
        user,
        token,
      }
    );
    return { value: response.data.usd_value };
  } catch (error) {
    console.error("Failed to fetch USD value:", error);
    throw new Error("Could not fetch USD value");
  }
}
