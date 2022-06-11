import axios, { AxiosResponse } from "axios";
import { NextFunction,Request,Response } from "express";

const getPost =  async (req:Request,res:Response, next:NextFunction)=>{
    // get some posts
    let result:AxiosResponse = await axios.get(`https://jsonplaceholder.typicode.com/posts`);
    let posts:Post = result.data;
    
    return res.status(200).json({
        status:true,
        data:posts,
    })
}

export default {getPost}