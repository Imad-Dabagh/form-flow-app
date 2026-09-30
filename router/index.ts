import * as auth from "./auth";
import * as invitations from "./invitations";
import * as me from "./me";
import * as orgs from "./orgs";
import * as upload from "./upload";

const API = {
  auth,
  invitations,
  me,
  orgs,
  upload,
} as const;

export default API;
