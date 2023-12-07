import { resolve } from "path";
import svgtofont from "svgtofont";

svgtofont({
  src: resolve(process.cwd(), "src/assets/icons"), // svg path
  dist: resolve(process.cwd(), "src/public/font"), // output path
  fontName: "uicon", // font name
  css: {
    // Create CSS files.
    cssPath: "/font/",
    fontSize: "18px",
  },
  log: false,
}).then(() => {
  console.log("\x1b[32m✔\x1b[0m", "Icon font generated successfully");
});
