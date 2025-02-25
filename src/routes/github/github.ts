import express from "express";
import dotenv from "dotenv";

const router = express.Router();

dotenv.config();

router.post("/", async (req, res) => {
  try {
    const { title, body, labels, assignees } = req.body;
    const githubIssueToken = process.env.GITHUB_ISSUE_TOKEN;
    // Vérifier si le token est défini
    if (!githubIssueToken) {
      res.status(500).json({
        message: "Internal server error: Github token is not defined",
      });
      return;
    }
    const response = await fetch(
      "https://api.github.com/repos/appen-isen/isen-orbit/issues",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          Authorization: `Bearer ${githubIssueToken}`,
        },
        body: JSON.stringify({
          title,
          body,
          labels,
          assignees,
        }),
      },
    );
    if (response.status !== 201) {
      res
        .status(500)
        .json({ message: "Internal server error: Unable to create issue" });
      return;
    } else {
      res.status(200).json({ message: "Issue created successfully" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error " + error });
  }
});

export default router;
