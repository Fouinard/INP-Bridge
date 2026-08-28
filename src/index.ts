import dotenv from "dotenv"
dotenv.config()

import { EDT } from "./edt/Edt.js"

const edt = new EDT()
edt.getWeekLessons(new Date(2026,8,15)).then(edt => {
    console.log(edt)
})