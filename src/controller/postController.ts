import { Request, Response } from "express"
import { Post } from "../model/post"
import {AuthRequest} from "../middleware/auth";
import cloudinary from "../config/cloudinary";


export const create = async (req: AuthRequest, res: Response) => {
    // req.file?.buffer ->
    try {
        const {title,content,tags} = req.body

        if (!req.user){
            res.send(401).json({
                message: "User not found"
            })
        }

        let imageURL = ""
        if(req.file){
            const result: any =await new Promise((resolve,reject) => {
                const upload_stream = cloudinary.uploader.upload_stream(
                    {folder: "posts"},
                    (error,result) => {
                        if(error) return reject(error)
                            resolve(result)
                    }
                )
                upload_stream.end(req.file?.buffer)
            })
            imageURL = result.secure_url
        }

        const newPost = new Post({
            title,
            content,
            tags: tags.split(","),//"mobile,smartphone"
            imageURL,
            author: req.user.sub //userId from authmiddleware
        })
        await newPost.save()

        res.status(201).json({
            message: "Post Created",
            data: newPost
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({message: "Failed to save post"})
    } 
}
//ap1/v1/post?page=1&limit=10
export const viewAll = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 10

        const skip = (page - 1 )* limit

        const posts = await Post.find().
        populate("author","email").  //related model data
        sort({craeteAt: -1}).   // desc order
        skip(skip).       //ignore data for pagination
        limit(limit)    //data count for currently need

        const total = await Post.countDocuments()

        res.status(201).json({
            message: "Post Data",
            data: posts,
            totalpages: Math.ceil(total / limit),
            totalCount: total,
            page
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({message: "Failed to fetch post"})
    }
}

export const myPost= async (req: AuthRequest, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 10

        const skip = (page - 1 )* limit

        const posts = await Post.find({author: req.user.sub}).
        sort({craeteAt: -1}).   // desc order
        skip(skip).       //ignore data for pagination
        limit(limit)    //data count for currently need

        const total = await Post.countDocuments()

        res.status(201).json({
            message: "Post Data",
            data: posts,
            totalpages: Math.ceil(total / limit),
            totalCount: total,
            page
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({message: "Failed to fetch post"})
    }
}