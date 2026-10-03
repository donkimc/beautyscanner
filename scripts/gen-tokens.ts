import { writeFileSync } from "node:fs";
import { toCss } from "../design/css";

writeFileSync(new URL("../app/tokens.css", import.meta.url), toCss());
console.log("wrote app/tokens.css");
