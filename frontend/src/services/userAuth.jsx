import axios from "axios";
import { useAuth } from "@clerk/clerk-react";

export const callApi = async () => {
  const { getToken } = useAuth({ template: "BudgetBox" });
  try {
    const token = await getToken();
    const res = await axios.get("api/entries/", {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(res);
    return res;
  } catch (err) {
    console.log(err);
  }
};
