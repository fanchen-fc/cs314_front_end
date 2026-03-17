import axios from "axios";
export const SERVER_URL = "https://pretorial-portliest-vertie.ngrok-free.dev";
export const apiClient = axios.create({
  baseURL: SERVER_URL,
  withCredentials: true,
  headers: { "ngrok-skip-browser-warning": "true" },
});