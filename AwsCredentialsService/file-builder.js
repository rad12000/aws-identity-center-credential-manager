const fs = require("fs");

class FileBuilder {
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

  build(filePath) {
    fs.writeFileSync(filePath, this.#fileParts.join(""));
  }
}

module.exports = { FileBuilder };
