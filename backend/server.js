import express from "express"
import 'dotenv/config'
import userRoute from "./routes/userRoute.js"
import facebookRoute from "./routes/facebookRoute.js";
import instagramRoute from "./routes/instagramRoute.js";
import {
  uploadSingleFile,
  uploadMultiple,
} from "./controllers/utilsController.js";
import { upload } from "./middleware/multer.js"
import cors from 'cors'
const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use('/user', userRoute)
app.use('/facebook', facebookRoute)
app.use('/instagram', instagramRoute)
app.post("/upload", upload.single("file"), uploadSingleFile);
app.post("/upload-multiple", upload.array("files", 10), uploadMultiple);
app.get("/", (req, res) => {
    res.send("Welcome to the User Authentication API")
})

app.listen(PORT,()=>{
    console.log(`Server is listening at port ${PORT}`);  
})