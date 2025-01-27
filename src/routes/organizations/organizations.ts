import express from "express";
import { getAllOrganizations, getOrganizationById } from "./getOrganizations";
import {addOrganizations, addUsersToOrganization} from "./postOrganizations";
import { updateOrganizations } from "./putOrganizations";
import { deleteOrganizations } from "./deleteOrganizations";
import {uploadImageToCDN} from "@/utils/cdn";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const organizations = await getAllOrganizations();
        res.status(200).json({ message: organizations });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error ' + error });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const organization = await getOrganizationById(id);
        res.status(200).json({ message: organization });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error ' + error });
    }
});

router.post("/", async (req, res) => {
    try {
        const { organizationName, organizationDesc, organizationCampus } = req.body;
        const file = req.file;

        if (!file) {
            res.status(400).json({ message: "No file uploaded" });
            return;
        }

        const imageUrl = await uploadImageToCDN(file);

        const newOrganization = await addOrganizations(organizationName, organizationDesc, organizationCampus, imageUrl);
        res.status(200).json({ message: newOrganization });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error ' + error });
    }
});

router.post("/:id/users", async (req, res) => {
    try {
        const organizationId = parseInt(req.params.id);
        const userId = req.body.userId;
        const userOrganization = await addUsersToOrganization(userId, organizationId);
        res.status(200).json({ message: userOrganization });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error ' + error });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { organizationName, organizationDesc } = req.body;
        const file = req.file;

        if (!file) {
            res.status(400).json({ message: "No file uploaded" });
            return;
        }

        const imageUrl = await uploadImageToCDN(file);
        const updatedOrganization = await updateOrganizations(id, organizationName, organizationDesc, imageUrl);
        res.status(200).json({ message: updatedOrganization });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error ' + error });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const deletedOrganization = await deleteOrganizations(id);
        res.status(200).json({ message: deletedOrganization });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error ' + error });
    }
});

export default router;