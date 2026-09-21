import * as auth from "./auth";
import * as organizations from "./organizations";
import * as profile from "./profile";

const API = {
  auth,
  organizations,
  profile,
} as const;

export default API;
