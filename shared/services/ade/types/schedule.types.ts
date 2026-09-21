import { ADESessionParams } from "./session.types";

export interface ADEGetIcalParams extends ADESessionParams {
  startDate?: string | Date;
  endDate?: string | Date;
}

export interface DateRangeParams {
  startDate: Date;
  endDate: Date;
}

export interface Lesson {
  title: string;
  start: Date;
  end: Date;
  location: string;
  description: string;
}
