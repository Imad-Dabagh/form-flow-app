import * as auth from "./auth";
import * as files from "./files";
import * as invitations from "./invitations";
import * as organizations from "./organizations";
import * as profile from "./profile";

const API = {
  auth,
  files,
  invitations,
  organizations,
  profile,
} as const;

export default API;
