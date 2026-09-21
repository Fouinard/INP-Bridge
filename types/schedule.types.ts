export interface ParsedLesson {
  startDate: Date,
  endDate: Date,
  teacher: string,
  subject: string,
  room: string,
  lessonType?: "TD" | "CM" | "TP" | null
}