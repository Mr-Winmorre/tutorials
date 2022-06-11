import express from "express";
import postController from "../controllers/post.controller";

const routes = express.Router();

routes.get('/posts',postController.getPost);

export = routes;


