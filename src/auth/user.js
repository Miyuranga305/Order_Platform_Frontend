
import client from "../api/client";
export async function fetchMe() {
  const { data } = await client.get("/api/users/me");
  return data;
}
