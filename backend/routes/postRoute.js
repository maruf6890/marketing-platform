import express from "express"
import { isAuthenticated } from "../middleware/isAuthenticated.js"
import {
deletePost,
getPostById,
getPosts
} from "../controllers/postController.js";


const router = express.Router()
router.delete("/:postId", isAuthenticated, deletePost);
router.get("/:postId", isAuthenticated, getPostById);
router.get("/", isAuthenticated, getPosts);
export default router


