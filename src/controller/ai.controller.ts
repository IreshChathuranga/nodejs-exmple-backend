import axios from "axios"
import { Request, Response } from "express"
export const genrateContent = async (req: Request, res: Response) => {
    try {
        const { text, maxtoken } = req.body
        const aiResponse = await axios.post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
            {
                contents: [
                    {
                        parts: [{ text }]
                    }
                ],
                generationConfig: {
                    maxOutputTokens: maxtoken || 150
                }
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-goog-api-key": "AIzaSyBwL_-ci7P9vHe087DpU2eqG6mWX0Fclqw"
                }
            }
        )
        const genratedContent =
            aiResponse.data?.candidates?.[0]?.content?.[0]?.text ||
            aiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
            "No data"

        console.log(res)

        res.status(200).json({
            data: genratedContent
        })

    } catch (error) {
        res.status(500).json({ message: "AI generate failed" })
    }
}