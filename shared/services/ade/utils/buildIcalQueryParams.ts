import { formatNumber } from "@/utils/Numbers";
import { DateRangeParams } from "../types/schedule.types";

export default function buildIcalQueryParams(params: DateRangeParams) {
  return new URLSearchParams({
    clearTree: "false",
    startDay: formatNumber(params.startDate.getDate()),
    startMonth: formatNumber(params.startDate.getMonth() + 1),
    startYear: params.startDate.getFullYear().toString(),
    endDay: formatNumber(params.endDate.getDate()),
    endMonth: formatNumber(params.endDate.getMonth() + 1),
    endYear: params.endDate.getFullYear().toString(),
    calType: "ical",
    x:"34",
    y:"5"
  }).toString();
}