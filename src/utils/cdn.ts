import { Upload } from "@aws-sdk/lib-storage";
import { S3, S3ClientConfig } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const s3Config: S3ClientConfig = {
	endpoint: process.env.R2_ENDPOINT,
	credentials: {
		accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
		secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
	},
	region: process.env.R2_REGION,
	forcePathStyle: true,
};

const s3 = new S3(s3Config);

async function checkBucketExists(bucketName: string): Promise<boolean> {
	try {
		await s3.headBucket({ Bucket: bucketName });
		return true;
	} catch (error: any) {
		if (error && error.name === "NotFound") {
			return false;
		}
		throw error;
	}
}

// Envoie une image vers le CDN
export async function uploadImageToCDN(
	file: Express.Multer.File
): Promise<string> {
	const fileContent = fs.readFileSync(file.path);
	const bucketName = process.env.R2_BUCKET_NAME;
	if (!bucketName) {
		throw new Error("Bucket name is not defined in environment variables");
	}

	const bucketExists = await checkBucketExists(bucketName);
	if (!bucketExists) {
		throw new Error(`Bucket "${bucketName}" does not exist`);
	}

	const params = {
		Bucket: bucketName,
		Key: `images/${path.basename(file.path)}`,
		Body: fileContent,
		ContentType: file.mimetype,
	};

	const data = await new Upload({
		client: s3,
		params,
	}).done();
	fs.unlinkSync(file.path);
	console.log("Image uploaded to CDN:", data.Location);
	return data.Location || "";
}

// Supprime une image du CDN
export async function deleteImageFromCDN(imageUrl: string): Promise<void> {
	const bucketName = process.env.R2_BUCKET_NAME;
	if (!bucketName) {
		throw new Error("Bucket name is not defined in environment variables");
	}

	const bucketExists = await checkBucketExists(bucketName);
	if (!bucketExists) {
		throw new Error(`Bucket "${bucketName}" does not exist`);
	}

	const params = {
		Bucket: bucketName,
		Key: imageUrl.split("/").pop() || "",
	};

	await s3.deleteObject(params);
	console.log("Image deleted from CDN:", imageUrl);
}
