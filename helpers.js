const { v4: uuidv4 } = require("uuid");
const fs = require("fs");

function storeFile({ filename, mimetype, encoding, createReadStream }) {
  const extension = filename.split(".").pop();
  const encryptedName = `${uuidv4()}-${Date.now()}.${extension}`;
  const filePath = `storage/${encryptedName}`;
  const fullPath = `${__dirname}/${filePath}`;

  const stream = createReadStream();

  return new Promise((resolve, reject) => {
    stream
      .on("error", (error) => {
        if (stream.truncated) fs.unlinkSync(fullPath);
        reject(error);
      })
      .pipe(fs.createWriteStream(fullPath))
      .on("error", (error) => reject(error))
      .on("finish", () =>
        resolve({
          extension,
          filename,
          mimetype,
          encoding,
          filePath,
          fullPath,
        })
      );
  });
}

function deleteFile(filePath) {
  try {
    fs.unlinkSync(`${__dirname}/${filePath}`);
  } catch (error) {}
}

function checkfileSize({ createReadStream }, fileMazSize) {
  const stream = createReadStream();

  let filesize = 0;

  return new Promise((resolve, reject) => {
    stream
      .on("data", (chunk) => {
        filesize += chunk.length;
        if (filesize > fileMazSize) {
          reject(false);
        }
      })
      .on("error", (error) => reject(error))
      .on("end", () => resolve(filesize));
  });
}

module.exports = {
  storeFile,
  deleteFile,
  checkfileSize,
};
