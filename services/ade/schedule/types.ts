import { ADESessionParams } from "../session/types";

export interface ADEGetIcalParams extends ADESessionParams {
  startDate?: string | Date;
  endDate?: string | Date;
}