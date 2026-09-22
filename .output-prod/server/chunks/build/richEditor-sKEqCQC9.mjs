import { Node } from '@tiptap/core';

var EmojiImage = Node.create({
  name: "emojiImage",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,
  addAttributes() {
    return {
      name: { default: "" },
      src: { default: "" }
    };
  },
  parseHTML() {
    return [{ tag: "img[data-emoji-name]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["img", {
      src: HTMLAttributes.src,
      "data-emoji-name": HTMLAttributes.name,
      class: "sycs-emoji",
      alt: ":" + HTMLAttributes.name + ":",
      title: ":" + HTMLAttributes.name + ":",
      draggable: "false"
    }];
  }
});
function serializeDoc(doc) {
  return doc.content.content.map((block) => {
    let s = "";
    block.descendants((n) => {
      if (n.isText) s += n.text;
      else if (n.type.name === "emojiImage") s += ":" + n.attrs.name + ":";
      else if (n.type.name === "hardBreak") s += "\n";
    });
    return s;
  }).join("\n");
}
function textToDoc(text, custom) {
  return {
    type: "doc",
    content: String(text != null ? text : "").split("\n").map((line) => {
      const content = [];
      const re = /:([a-z0-9_+-]+):/gi;
      let last = 0;
      let m;
      while (m = re.exec(line)) {
        const name = m[1].toLowerCase();
        const url = custom && custom[name];
        if (!url) continue;
        if (m.index > last) content.push({
          type: "text",
          text: line.slice(last, m.index)
        });
        content.push({
          type: "emojiImage",
          attrs: {
            name,
            src: url
          }
        });
        last = m.index + m[0].length;
      }
      if (last < line.length) content.push({
        type: "text",
        text: line.slice(last)
      });
      return content.length ? {
        type: "paragraph",
        content
      } : { type: "paragraph" };
    })
  };
}

export { EmojiImage as E, serializeDoc as s, textToDoc as t };
//# sourceMappingURL=richEditor-sKEqCQC9.mjs.map
