import { ADERequestParams } from "@/services/ade/session/types";

export const ADE_DEFAULTS = {
  endpoint: "edt.grenoble-inp.fr",
  year: "2026-2027",
  location: "prepaINPGrenoble",
  type: "etudiant",
  referer: `https://edt.grenoble-inp.fr/`,
};

export const buildBaseUrl = (config: ADERequestParams = {}) => {
  const endpoint = config.endpoint ?? ADE_DEFAULTS.endpoint;
  const year = config.year ?? ADE_DEFAULTS.year;
  const location = config.location ?? ADE_DEFAULTS.location;
  const type = config.type ?? ADE_DEFAULTS.type;

  return `https://${endpoint}/${year}/${location}/${type}`;
};