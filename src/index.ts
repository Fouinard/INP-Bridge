import dotenv from "dotenv"
dotenv.config()

import { EDT } from "./edt/Edt.js"

const edt = new EDT()
edt.getCurrentWeek().then(edt => {
    console.log(edt)
})