import express from "express";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    res.status(200).json({ ping: "pong" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error " + error });
  }
});

export default router;
