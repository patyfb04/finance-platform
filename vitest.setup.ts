import { beforeAll } from "vitest";
import "@testing-library/jest-dom";

beforeAll(() => {
  // Ensure DOM is available
  if (typeof global.document === "undefined") {
    const { JSDOM } = require("jsdom");
    const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>");
    global.document = dom.window.document;
    global.window = dom.window as any;
    global.navigator = dom.window.navigator;
  }
});
