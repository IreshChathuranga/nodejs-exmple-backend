import multer from "multer";

//didsk or memeoy stor data
const storage=multer.memoryStorage()

export const upload = multer({storage}) // storage: storage