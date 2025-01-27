import express from "express";
import dotenv from "dotenv";

const router = express.Router();

dotenv.config();

router.get("/", async (req, res) => {
    try {
        const githubIssueToken = process.env.GITHUB_ISSUE_TOKEN;
        res.status(200).json({ token: githubIssueToken });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error ' + error });
    }
});

export default router;