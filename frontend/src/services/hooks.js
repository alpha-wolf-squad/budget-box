import axios from "axios";
import { useAuth } from "@clerk/clerk-react";

// Single custom hook that returns authenticated axios instance.  See usage example in BudgetForm.jsx
export const useAuthenticatedApi = (template = "BudgetBox") => {
  const { getToken, isSignedIn } = useAuth({ template }); //The template is where our user's auth tokens are stored on the Clerk dashboard.

  //By creating a custom axios instance, we can intercept requests and add the auth header to our different requests to the backend
  //See https://axios-http.com/docs/instance
  const api = axios.create();

  api.interceptors.request.use(
    async (config) => {
      try {
        const token = await getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      } catch (error) {
        console.error("Failed to get auth token:", error);
      }
    },
    (error) => Promise.reject(error),
  );

  return { api, isSignedIn };
};
