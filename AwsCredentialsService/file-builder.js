const fs = require("fs");
const path = require("path");

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

  /**
   * @param {string} filePath
   */
  build(filePath) {
    // const lastFolderSepIndex = filePath.lastIndexOf("/");

    // if (lastFolderSepIndex) {
    //   const filePathDirs = filePath.slice(0, lastFolderSepIndex) + "/";
    //   console.log(filePathDirs);
    //   if (fs.existsSync(filePathDirs)) return;
    //   fs.mkdirSync(filePathDirs, { recursive: true });
    // }

    fs.writeFileSync(filePath, this.#fileParts.join(""));
  }
}

module.exports = { FileBuilder };
