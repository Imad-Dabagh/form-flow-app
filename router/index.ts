import * as auth from "./auth";
import * as invitations from "./invitations";
import * as me from "./me";
import * as orgs from "./orgs";
import * as publicRouter from "./public";
import * as upload from "./upload";

const API = {
  auth,
  invitations,
  me,
  orgs,
  public: publicRouter,
  upload,
} as const;

export default API;
