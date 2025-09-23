import Quill from "quill";
const BlockEmbed = Quill.import("blots/block/embed");

class PageBreakBlot extends BlockEmbed {
  static blotName = "pageBreak";
  static tagName = "hr";

  static create(value) {
    let node = super.create(1);
    node.classList.add("page-break");
    // The inline style gives a visible dashed line in the editor and instructs converters (e.g., htmlToDocx) to do a page break.
    node.setAttribute(
      "style",
      "page-break-before: always; border-top: 2px dashed #ccc; margin: 20px 0;"
    );
    return node;
  }
}

Quill.register(PageBreakBlot);
