import express from "express";
import {
  getAllParticipants,
  getParticipantsByEventId,
  getParticipantsByEmail,
  getParticipantsByEventIdAndEmail,
} from "./getParticipants";
import { postParticipants } from "./postParticipants";
import {
  putParticipantsEmail,
  putParticipantsEventId,
} from "./putParticipants";
import { deleteParticipants } from "./deleteParticipants";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const participants = await getAllParticipants();
    res.status(200).json({ message: participants });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error });
  }
});

router.get("/event/:event_id", async (req, res) => {
  try {
    const event_id = parseInt(req.params.event_id);
    const participants = await getParticipantsByEventId(event_id);
    res.status(200).json({ message: participants });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error });
  }
});

router.get("/email/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const participants = await getParticipantsByEmail(email);
    res.status(200).json({ message: participants });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error });
  }
});

router.get("/event/:event_id/email/:email", async (req, res) => {
  try {
    const event_id = parseInt(req.params.event_id);
    const email = req.params.email;
    const participants = await getParticipantsByEventIdAndEmail(
      event_id,
      email,
    );
    res.status(200).json({ message: participants });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error });
  }
});

router.post("/", async (req, res) => {
  try {
    const event_id = parseInt(req.body.event_id);
    const email = req.body.email;
    const participants = await postParticipants(event_id, email);
    res.status(200).json({ message: participants });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error });
  }
});

router.put("/:event_id/:email", async (req, res) => {
  try {
    const event_id = parseInt(req.params.event_id);
    const email = req.params.email;
    const participants = await putParticipantsEmail(event_id, email);
    res.status(200).json({ message: participants });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error });
  }
});

router.put("/:email/:event_id", async (req, res) => {
  try {
    const email = req.params.email;
    const event_id = parseInt(req.params.event_id);
    const participants = await putParticipantsEventId(event_id, email);
    res.status(200).json({ message: participants });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error });
  }
});

router.delete("/:event_id/:email", async (req, res) => {
  try {
    const event_id = parseInt(req.params.event_id);
    const email = req.params.email;
    const participants = await deleteParticipants(event_id, email);
    res.status(200).json({ message: participants });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error });
  }
});

export default router;
