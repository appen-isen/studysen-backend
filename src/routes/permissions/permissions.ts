import express from "express";

import {
  getAllPermissions,
  getPermissionById,
  getPermissionForUser,
  getUsersForPermission,
} from "./getPermissions";
import { postPermissions } from "./postPermissions";
import { putPermissions } from "./putPermissions";
import { deletePermissions } from "./deletePermissions";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const permissions = await getAllPermissions();
    res.status(200).json({ message: permissions });
  } catch (error) {
    res.status(500).json({ message: "Internal server error " + error });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const permission = await getPermissionById(id);
    res.status(200).json({ message: permission });
  } catch (error) {
    res.status(500).json({ message: "Internal server error " + error });
  }
});

router.get("/user/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const permissions = await getPermissionForUser(email);
    res.status(200).json({ message: permissions });
  } catch (error) {
    res.status(500).json({ message: "Internal server error " + error });
  }
});

router.get("/permission/:permission", async (req, res) => {
  try {
    const permission = req.params.permission;
    const users = await getUsersForPermission(permission);
    res.status(200).json({ message: users });
  } catch (error) {
    res.status(500).json({ message: "Internal server error " + error });
  }
});

router.post("/", async (req, res) => {
  try {
    const permission = req.body.permission;
    const permissions = await postPermissions(permission);
    res.status(200).json({ message: permissions });
  } catch (error) {
    res.status(500).json({ message: "Internal server error " + error });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const permission = req.body.permission;
    const permissions = await putPermissions(id, permission);
    res.status(200).json({ message: permissions });
  } catch (error) {
    res.status(500).json({ message: "Internal server error " + error });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await deletePermissions(id);
    res.status(200).json({ message: "Permission deleted" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error " + error });
  }
});

export default router;
