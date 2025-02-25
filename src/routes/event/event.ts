import express from "express";
import mutler from "multer";

import { uploadImageToCDN } from "@/utils/cdn";
import { updateEventImageUrl } from "./eventService";
import {
  getAllEvents,
  getEventByDate,
  getEventById,
  getEventByLocation,
  getEventByOrganizer,
  getEventByTitle,
} from "./getEvent";
import { postEvent } from "./postEvent";
import { putEvent } from "./putEvent";
import { deleteEvent } from "./deleteEvent";

const router = express.Router();
const upload = mutler({ dest: "uploads/" });

router.get("/", async (req, res) => {
  try {
    const events = await getAllEvents();
    res.status(200).json({ message: events });
  } catch (error) {
    res.status(500).json({ message: "Internal server error " + error });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const event = await getEventById(id);
    res.status(200).json({ message: event });
  } catch (error) {
    res.status(500).json({ message: "Internal server error " + error });
  }
});

router.get("/title/:title", async (req, res) => {
  try {
    const title = req.params.title;
    const event = await getEventByTitle(title);
    res.status(200).json({ message: event });
  } catch (error) {
    res.status(500).json({ message: "Internal server error " + error });
  }
});

router.get("/date/:date", async (req, res) => {
  try {
    const date = req.params.date;
    const events = await getEventByDate(date);
    res.status(200).json({ message: events });
  } catch (error) {
    res.status(500).json({ message: "Internal server error " + error });
  }
});

router.get("/location/:location", async (req, res) => {
  try {
    const location = req.params.location;
    const events = await getEventByLocation(location);
    res.status(200).json({ message: events });
  } catch (error) {
    res.status(500).json({ message: "Internal server error " + error });
  }
});

router.get("/organizer/:organizer", async (req, res) => {
  try {
    const organizer = req.params.organizer;
    const events = await getEventByOrganizer(organizer);
    res.status(200).json({ message: events });
  } catch (error) {
    res.status(500).json({ message: "Internal server error " + error });
  }
});

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { title, description, date, location, organizer } = req.body;
    const file = req.file;
    if (!title || !description || !date || !location || !organizer) {
      res.status(400).json({ message: "Missing required information" });
      return;
    }
    const imageUrl = file ? await uploadImageToCDN(file) : null;
    const event = await postEvent(
      title,
      description,
      date,
      location,
      organizer,
      imageUrl,
    );
    res.status(201).json({ message: "Event created", event });
  } catch (error) {
    res.status(500).json({ message: "Internal server error " + error });
  }
});

router.post(
  "/:event_id/image",
  upload.single("image"),
  async (req, res): Promise<void> => {
    try {
      const event_id = parseInt(req.params.event_id);
      const file = req.file;

      if (!file) {
        res.status(400).json({ message: "No file uploaded" });
        return;
      }

      const imageUrl = await uploadImageToCDN(file);
      await updateEventImageUrl(event_id, imageUrl);

      res
        .status(200)
        .json({ message: "Image uploaded successfully", imageUrl });
    } catch (error) {
      res.status(500).json({ message: "Internal server error " + error });
    }
  },
);

router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { title, description, date, location, organizer } = req.body;
  try {
    const event = await putEvent(
      id,
      title,
      description,
      date,
      location,
      organizer,
    );
    res.status(200).json({ message: "Event updated", event });
  } catch (error) {
    res.status(500).json({ message: "Internal server error " + error });
  }
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const event = await deleteEvent(id);
    res.status(200).json({ message: "Event deleted", event });
  } catch (error) {
    res.status(500).json({ message: "Internal server error " + error });
  }
});

export default router;
