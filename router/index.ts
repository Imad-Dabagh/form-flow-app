import * as organizations from "./organizations";
import * as profile from "./profile";

const API = {
  organizations,
  profile,
} as const;

export default API;
