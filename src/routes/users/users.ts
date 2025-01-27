import express from "express";

import {getAllUsers} from "./getUsers";
import {postUsers} from "./postUsers";
import {putUsers} from "./putUsers";
import {deleteUsers} from "./deleteUsers";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const users = await getAllUsers();
        res.status(200).json({ message: users });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error ' + error });
    }
});

router.post("/", async (req, res) => {
    try {
        const user = req.body;
        const newUser = await postUsers(user);
        res.status(200).json({ message: newUser });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error ' + error });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const user = req.body;
        const updatedUser = await putUsers(id, user);
        res.status(200).json({ message: updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error ' + error });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const deletedUser = await deleteUsers(id);
        res.status(200).json({ message: deletedUser });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error ' + error });
    }
});

export default router;