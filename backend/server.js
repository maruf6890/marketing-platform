import express from "express"
import 'dotenv/config'
import userRoute from "./routes/userRoute.js"
import { uploadFile } from "./controllers/utilsController.js"
import { upload } from "./middleware/multer.js"
import cors from 'cors'
const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(cors({
    origin:'*',
}))
app.use('/user', userRoute)
app.post("/upload", upload.single("file"), uploadFile);
app.get("/", (req, res) => {
    res.send("Welcome to the User Authentication API")
})

app.listen(PORT,()=>{
    console.log(`Server is listening at port ${PORT}`);  
})