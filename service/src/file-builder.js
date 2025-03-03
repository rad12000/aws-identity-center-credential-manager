import fs from "fs";

export class FileBuilder {
  #fileParts = [];

  writeLine(str) {
    this.#fileParts.push(str);
    this.lineBreak();

    return this;
  }

  write(str) {
    this.#fileParts.push(str);

    return this;
  }

  lineBreak() {
    this.#fileParts.push("\n");
    return this;
  }

  /**
   * @param {string} filePath
   */
  build(filePath) {
    fs.writeFileSync(filePath, this.#fileParts.join(""));
  }
}
