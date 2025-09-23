const axios = require("axios");
const ErrorHandler = require("../utils/errorHandler");
const { db } = require("../firebaseAdmin");
const htmlToDocx = require("html-to-docx");
const { Storage } = require("@google-cloud/storage");
const storage = new Storage();
const bucketName = "bhasantar";
const JSZip = require("jszip");
const { JSDOM } = require("jsdom"); // Add this at the top of your file

const fetchDocumentAndCreateZip = async (
  projectId,
  documentId
) => {
  const documentRef = db
    .collection("projects")
    .doc(projectId)
    .collection("files")
    .doc(documentId);
  const doc = await documentRef.get();

  if (!doc.exists) {
    throw new ErrorHandler("Document Not Found", 404);
  }

  const { name } = doc.data();
  const csvFileName = name.replace(/\.[^/.]+$/, ".csv");
  const csvFilePath = `projects/${projectId}/${csvFileName}`;

  const bucket = storage.bucket(bucketName);

  // Generate a signed URL for the CSV file
  const [csvSignedUrl] = await bucket.file(csvFilePath).getSignedUrl({
    version: "v4",
    action: "read",
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes expiration
  });

  // Fetch CSV content using the signed URL
  const csvResponse = await axios.get(csvSignedUrl);
  const csvContent = csvResponse.data;

  if (!csvContent) {
    throw new ErrorHandler("CSV content is empty or undefined", 500);
  }

  // Return the CSV content and file information
  return { 
    convertedFileBuffer: Buffer.from(csvContent),
    convertedFileName: csvFileName,
    originalFileName: name
  };
};

const htmlToPdf = async (htmlContent) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    await page.setContent(
      `
      <html>
        <head>
          <style>
            body { line-height: 1.5; }
            p { line-height: 1.5; margin: 0; }
            h1, h2, h3, h4, h5, h6 { font-weight: bold; margin: 0 0 10px 0; }
          </style>
        </head>
        <body>${htmlContent}</body>
      </html>
    `,
      { waitUntil: "networkidle0" }
    );

    const pdfBuffer = await page.pdf({
      format: "Legal",
      margin: {
        top: "25mm",
        right: "25mm",
        bottom: "25mm",
        left: "25mm",
      },
    });

    // Log the generated buffer size
    // console.log("Generated PDF Buffer size:", pdfBuffer.length);

    // Explicitly convert to a Buffer instance
    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

/**
 * Applies legal page size and hardcodes line-height to 1.5 for a DOCX file buffer.
 *
 * For legal page size, it modifies the <w:pgSz> element in word/document.xml by
 * replacing w:h="15840" with w:h="20160" (when w:w="12240").
 *
 * To enforce a line-height of 1.5, it updates all <w:spacing> tags in document.xml,
 * forcing w:line="360" and w:lineRule="auto", and also adjusts the "Normal" style in styles.xml.
 *
 * @param {Buffer} docxBuffer - The generated DOCX file buffer.
 * @returns {Promise<Buffer>} - The updated DOCX file buffer.
 */
async function applyLegalPageSizeAndLineHeight(docxBuffer) {
  const zip = await JSZip.loadAsync(docxBuffer);

  // --- Update page size in word/document.xml ---
  const documentXmlPath = "word/document.xml";
  let documentXml = await zip.file(documentXmlPath).async("string");

  // Replace the page height from 15840 (US Letter) to 20160 (US Legal) if the width is 12240
  documentXml = documentXml.replace(
    /(<w:pgSz\s+[^>]*w:w="12240"[^>]*w:h=")15840(")/,
    "$1" + "20160" + "$2"
  );

  // Enforce a line-height of 1.5 (assuming single line is 240, so 240*1.5 = 360) in all spacing tags.
  // We remove any existing w:line and w:lineRule attributes so we can add our own.
  documentXml = documentXml.replace(
    /<w:spacing([^>]*)\/>/g,
    (_match, attrs) => {
      let newAttrs = attrs.replace(/\bw:line="[^"]*"/g, "");
      newAttrs = newAttrs.replace(/\bw:lineRule="[^"]*"/g, "");
      // Append the desired line spacing attributes (360 for 1.5 line spacing)
      return `<w:spacing${newAttrs} w:line="360" w:lineRule="auto"/>`;
    }
  );

  // Write back the modified document.xml
  zip.file(documentXmlPath, documentXml);

  // --- Update line spacing in styles.xml (for the standard "Normal" paragraph style) ---
  const stylesXmlPath = "word/styles.xml";
  if (zip.file(stylesXmlPath)) {
    let stylesXml = await zip.file(stylesXmlPath).async("string");

    // Modify the "Normal" style, which is commonly used for paragraphs.
    // This regex searches for the Normal style and replaces any existing <w:spacing .../> tag.
    stylesXml = stylesXml.replace(
      /(<w:style\s+[^>]*w:styleId="Normal"[^>]*>[\s\S]*?<w:pPr>)([\s\S]*?)(<\/w:pPr>)/,
      (match, start, inner, end) => {
        // Remove any existing spacing tag
        inner = inner.replace(/<w:spacing[^>]*\/>/g, "");
        // Insert a spacing tag that forces 1.5 line spacing
        const spacingTag = '<w:spacing w:line="360" w:lineRule="auto"/>';
        return start + spacingTag + end;
      }
    );

    // Write back the modified styles.xml
    zip.file(stylesXmlPath, stylesXml);
  }

  // Generate the updated DOCX file buffer and return it
  return await zip.generateAsync({ type: "nodebuffer" });
}

module.exports = { fetchDocumentAndCreateZip, htmlToPdf };
