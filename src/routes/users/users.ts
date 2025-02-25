import express from "express";

import { getAllUsers, getUserByEmail } from "./getUsers";
import { postUsers } from "./postUsers";
import { putUsers } from "./putUsers";
import { deleteUsers } from "./deleteUsers";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const users = await getAllUsers();
    res.status(200).json({ message: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error " + error });
  }
});

router.get("/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const user = await getUserByEmail(email);
    res.status(200).json({ message: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error " + error });
  }
});

router.post("/:email", async (req, res) => {
  console.log(req.params.email);
  try {
    const user = req.params.email;
    const newUser = await postUsers(user);
    res.status(200).json({ message: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error " + error });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const user = req.body;
    const updatedUser = await putUsers(id, user);
    res.status(200).json({ message: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error " + error });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const deletedUser = await deleteUsers(id);
    res.status(200).json({ message: deletedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error " + error });
  }
});

export default router;
