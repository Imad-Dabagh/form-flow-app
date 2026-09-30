import * as auth from "./auth";
import * as files from "./files";
import * as forms from "./forms";
import * as invitations from "./invitations";
import * as organizations from "./organizations";
import * as profile from "./profile";

const API = {
  auth,
  files,
  forms,
  invitations,
  organizations,
  profile,
} as const;

export default API;
