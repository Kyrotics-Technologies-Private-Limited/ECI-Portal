const express = require("express");
const { db } = require("../firebaseAdmin");
const router = express.Router();
const ErrorHandler = require("../utils/errorHandler");
const axios = require("axios");
const archiver = require("archiver");
const { fetchDocumentAndCreateZip } = require("../middleware/createZip");
const { Storage } = require("@google-cloud/storage");
const admin = require("firebase-admin");

// Initialize GCS client using environment-based credentials (consistent with server/index.js)
const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: {
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  },
});

// Use the configured bucket name from environment
const bucketName = process.env.GCS_BUCKET_NAME;
const bucket = storage.bucket(bucketName);

//  get all documents for a specific project (company)
exports.getDocuments = async (req, res) => {
  const { projectId } = req.params;

  try {
    // Access the 'files' subcollection inside the specific 'project' document
    const documentsRef = db
      .collection("projects")
      .doc(projectId)
      .collection("files");
    const snapshot = await documentsRef.get();

    if (snapshot.empty) {
      return next(
        new ErrorHandler("No documents found for this project.", 404)
      );
    }

    // Extract document data
    const documents = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({ documents });
  } catch (error) {
    console.error("Error fetching documents:", error);
    ErrorHandler.handleError(res, error);
  }
};

//get a specific document by its ID
exports.documentInfo = async (req, res) => {
  const { projectId, documentId } = req.params;

  try {
    // Access the specific document in the 'files' subcollection inside the specific 'project' document
    const documentRef = db
      .collection("projects")
      .doc(projectId)
      .collection("files")
      .doc(documentId);
    const doc = await documentRef.get();

    if (!doc.exists) {
      return next(new ErrorHandler("Document Not found ", 404));
    }

    const document = { id: doc.id, ...doc.data() };

    res.status(200).json({ document });
  } catch (error) {
    console.error("Error fetching document:", error);
    ErrorHandler.handleError(res, error);
  }
};

exports.updateDocument = async (req, res) => {
  const { projectId, fileId } = req.body;

  try {
    // Fetch the file metadata from Firestore
    const fileDocRef = db
      .collection("projects")
      .doc(projectId)
      .collection("files")
      .doc(fileId); // Get the specific file by fileId
    const fileDoc = await fileDocRef.get();

    // Check if the document exists
    if (!fileDoc.exists) {
      return res.status(404).json({ error: "File does not exist" });
    }

    // Get the file data
    const fileData = fileDoc.data();
    const csvFileName = fileData.name.replace(/\.pdf$/i, ".csv");
    const gcsFilePath = `projects/${projectId}/${csvFileName}`;

    const bucket = storage.bucket(bucketName);
    const file = bucket.file(gcsFilePath);

    // Generate a signed URL for the CSV file with "write" permission
    const [signedUrl] = await file.getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes expiration
      contentType: "text/csv",
    });

    res.json({ signedUrl, gcsFilePath });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    res
      .status(500)
      .json({ error: "Failed to generate signed URL for CSV update" });
  }
};

exports.deleteFile = async (req, res, next) => {
  const { projectId, fileName } = req.body;
  if (!projectId || !fileName) {
    return next(new ErrorHandler("No documents found for this project.", 404));
  }
  // console.log(projectId, fileName);

  try {
    const fileRef = storage
      .bucket(bucketName)
      .file(`projects/${projectId}/${fileName}`);
    await fileRef.delete();

    return res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    return res.status(500).json({ error: "Error deleting file" });
  }
};

// backend/deleteFiles.js

/**
 * Express endpoint to delete a list of files (both pdf and csv) from Cloud Storage
 * and delete their metadata from Firestore.
 *
 * Expected JSON payload:
 * {
 *   "projectId": "25UF5iaiu1JzuwBFsSYI",
 *   "fileNames": ["1991_2_51_66.pdf", "anotherFile.pdf", ...]
 * }
 */
exports.deleteBulkFiles = async (req, res) => {
  try {
    const { projectId, fileNames } = req.body;
    if (!projectId || !fileNames || !Array.isArray(fileNames)) {
      return res.status(400).json({ error: "Missing projectId or fileNames" });
    }

    // *** 1. Delete Files from Google Cloud Storage ***
    //
    // For each file name (assumed to be a PDF file name) we compute the full paths for
    // both the PDF and the corresponding CSV file. If a deletion fails because the file
    // doesn't exist (error code 404), a warning is logged.
    const deleteGcsPromises = fileNames.flatMap((fileName) => {
      let pdfFileName, csvFileName;

      // Determine file names based on extension (case-insensitive)
      if (/\.pdf$/i.test(fileName)) {
        pdfFileName = fileName;
        csvFileName = fileName.replace(/\.pdf$/i, ".csv");
      } else if (/\.csv$/i.test(fileName)) {
        csvFileName = fileName;
        pdfFileName = fileName.replace(/\.csv$/i, ".pdf");
      } else {
        // If no extension is provided, assume it's the base name.
        pdfFileName = `${fileName}.pdf`;
        csvFileName = `${fileName}.csv`;
      }

      // Build the full paths inside your bucket.
      const pdfPath = `projects/${projectId}/${pdfFileName}`;
      const csvPath = `projects/${projectId}/${csvFileName}`;

      return [
        bucket
          .file(pdfPath)
          .delete()
          .catch((err) => {
            if (err.code === 404) {
              console.warn(`Warning: File not found in GCS: ${pdfPath}`);
              return;
            }
            throw err;
          }),
        bucket
          .file(csvPath)
          .delete()
          .catch((err) => {
            if (err.code === 404) {
              console.warn(`Warning: File not found in GCS: ${csvPath}`);
              return;
            }
            throw err;
          }),
      ];
    });

    // Wait until all GCS deletion promises have completed.
    await Promise.all(deleteGcsPromises.flat());

    // *** 2. Delete Metadata from Firestore ***
    //
    // The metadata documents are stored under the collection path:
    // "projects/{projectId}/files". Since Firestore's "in" query accepts at most 10 values,
    // we break the fileNames array into chunks.
    const fileCollectionRef = admin
      .firestore()
      .collection("projects")
      .doc(projectId)
      .collection("files");

    const chunkSize = 10;
    const chunks = [];
    for (let i = 0; i < fileNames.length; i += chunkSize) {
      chunks.push(fileNames.slice(i, i + chunkSize));
    }

    // For each chunk, query for documents whose "name" field is in the current chunk.
    // For any file name that does not have a matching Firestore document, a warning is logged.
    const deleteFirestorePromises = chunks.map(async (chunk) => {
      const snapshot = await fileCollectionRef.where("name", "in", chunk).get();
      if (snapshot.empty) {
        chunk.forEach((fileName) => {
          console.warn(
            `Warning: No Firestore metadata document found for ${fileName}`
          );
        });
        return;
      } else {
        const foundNames = snapshot.docs.map((doc) => doc.get("name"));
        // Log a warning for any fileName in this chunk that wasn't found.
        chunk.forEach((fileName) => {
          if (!foundNames.includes(fileName)) {
            console.warn(
              `Warning: No Firestore metadata document found for ${fileName}`
            );
          }
        });
        const batch = admin.firestore().batch();
        snapshot.docs.forEach((doc) => batch.delete(doc.ref));
        return batch.commit().catch((err) => {
          console.warn(`Warning: Error deleting Firestore metadata: ${err}`);
          return;
        });
      }
    });

    await Promise.all(deleteFirestorePromises);

    // Respond with success.
    return res
      .status(200)
      .json({ message: "Files and metadata deleted successfully." });
  } catch (error) {
    console.error("Error deleting files and metadata:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Download DOCX with original PDF included in the ZIP
exports.downloadCsv = async (req, res, next) => {
  const { projectId, documentId } = req.params;

  try {
    // Fetch CSV buffer and names
    const { convertedFileBuffer, convertedFileName, originalFileName } =
      await fetchDocumentAndCreateZip(projectId, documentId);

    // Compute PDF path and signed URL
    const pdfFilePath = `projects/${projectId}/${originalFileName}`;
    const bucket = storage.bucket(bucketName);
    const [pdfSignedUrl] = await bucket.file(pdfFilePath).getSignedUrl({
      version: "v4",
      action: "read",
      expires: Date.now() + 15 * 60 * 1000,
    });

    // Prepare ZIP response containing both CSV and original PDF
    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${originalFileName.replace(/\.pdf$/i, '')}.zip"`
    );

    const archive = archiver("zip", { zlib: { level: 2 } });
    archive.on("error", (err) => {
      console.error("Error creating archive:", err);
      next(new ErrorHandler("Error creating ZIP archive.", 500));
    });
    archive.pipe(res);

    // Add CSV
    archive.append(convertedFileBuffer, { name: convertedFileName });

    // Fetch and add original PDF
    const pdfResponse = await axios.get(pdfSignedUrl, { responseType: "stream" });
    archive.append(pdfResponse.data, { name: originalFileName });

    await archive.finalize();
  } catch (error) {
    console.error("Error downloading CSV+PDF zip:", error);
    next(error);
  }
};

// Download ZIP containing both CSV and original PDF
exports.downloadPdf = async (req, res, next) => {
  const { projectId, documentId } = req.params;

  try {
    // Get CSV buffer/name and original PDF name
    const { convertedFileBuffer, convertedFileName, originalFileName } =
      await fetchDocumentAndCreateZip(projectId, documentId);

    const bucket = storage.bucket(bucketName);
    const pdfFilePath = `projects/${projectId}/${originalFileName}`;

    // Generate signed URL for original PDF
    const [pdfSignedUrl] = await bucket.file(pdfFilePath).getSignedUrl({
      version: "v4",
      action: "read",
      expires: Date.now() + 15 * 60 * 1000,
    });

    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${originalFileName.replace(/\.pdf$/i, "")}.zip"`
    );

    const archive = archiver("zip", { zlib: { level: 2 } });
    archive.on("error", (err) => {
      console.error("Archive creation failed:", err);
      return next(new ErrorHandler("Archive creation failed.", 500));
    });
    archive.pipe(res);

    // Add CSV
    archive.append(convertedFileBuffer, { name: convertedFileName });

    // Fetch and add original PDF
    const pdfResponse = await axios.get(pdfSignedUrl, { responseType: "stream" });
    archive.append(pdfResponse.data, { name: originalFileName });

    await archive.finalize();
  } catch (error) {
    console.error("Error exporting ZIP (PDF+CSV):", error);
    return next(new ErrorHandler(error));
  }
};

// Multi-file download and zip handler
exports.downloadSelectedFiles = async (req, res, next) => {
  const { projectId, documentIds } = req.body; // Expecting an array of documentIds

  try {
    // Set up response for zip download
    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="selected_files.zip"`
    );

    // Create a ZIP archive
    const archive = archiver("zip", { zlib: { level: 2 } });
    archive.on("error", (err) => {
      console.error("Error creating archive:", err);
      next(new ErrorHandler("Error creating ZIP archive.", 500));
    });

    archive.pipe(res);

    // Loop through document IDs and add their PDF and CSV to individual folders
    for (const documentId of documentIds) {
      // Fetch CSV buffer and names for this document
      const { convertedFileBuffer, convertedFileName, originalFileName } =
        await fetchDocumentAndCreateZip(projectId, documentId);

      const bucket = storage.bucket(bucketName);

      // Generate a signed URL for the original PDF
      const pdfPath = `projects/${projectId}/${originalFileName}`;
      const [pdfSignedUrl] = await bucket.file(pdfPath).getSignedUrl({
        version: "v4",
        action: "read",
        expires: Date.now() + 15 * 60 * 1000,
      });

      // Create a folder in the ZIP for this file
      const folderName = originalFileName.replace(/\.pdf$/i, "");
      archive.append(convertedFileBuffer, { name: `${folderName}/${convertedFileName}` });

      // Fetch and add original PDF to the same folder
      const pdfResponse = await axios.get(pdfSignedUrl, { responseType: "stream" });
      archive.append(pdfResponse.data, { name: `${folderName}/${originalFileName}` });
    }

    // Finalize the zip
    await archive.finalize();
  } catch (error) {
    console.error("Error downloading selected files:", error);
    next(new ErrorHandler("Error downloading selected files.", 500));
  }
};
