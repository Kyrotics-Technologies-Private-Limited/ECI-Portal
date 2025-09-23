// This configuration extends Quill's image format to preserve inline styles for resizing and repositioning.
import Quill from "quill";

// Get the built‐in image format.
const ImageFormat = Quill.import("formats/image");

// Override the formats method to include inline styles like width, height, and positioning.
ImageFormat.formats = function (domNode) {
  let format = {};
  if (domNode.hasAttribute("alt")) {
    format.alt = domNode.getAttribute("alt");
  }
  if (domNode.style.left) {
    // Capture direct left positioning
    format.left = domNode.style.left;
  }
  if (domNode.style.transform) {
    // Capture transform values if repositioning uses translation
    format.transform = domNode.style.transform;
  }
  if (domNode.style.width) {
    format.width = domNode.style.width;
  }
  if (domNode.style.height) {
    format.height = domNode.style.height;
  }
  // You can also capture other style properties if needed.
  return format;
};

Quill.register(ImageFormat, true);
