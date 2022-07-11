const crypto = require("crypto");
const fs = require("fs");

function getRandomString(randomDigits = 20) {
  return crypto.randomBytes(randomDigits).toString("hex");
}

function storeFS({ stream, encryptedName }) {
  const uploadPath = `storage/${encryptedName}`;
  const full_path = `${__dirname}/${uploadPath}`;
  return new Promise((resolve, reject) =>
    stream
      .on("error", (error) => {
        if (stream.truncated) fs.unlinkSync(full_path);
        reject(error);
      })
      .pipe(fs.createWriteStream(full_path))
      .on("error", (error) => reject(error))
      .on("finish", () => resolve({ uploadPath }))
  );
}

async function uploadFile(args, key = "file") {
  const { createReadStream, filename, mimetype, encoding } = await args[key];

  const extension = filename.split(".").pop();

  const encryptedName = getRandomString() + "." + extension;

  const stream = createReadStream();

  const pathObj = await storeFS({ stream, encryptedName });
  const fileLocation = pathObj.uploadPath;

  return { encryptedName, mimetype, encoding, filename, fileLocation };
}

async function deleteFile(full_path) {
  fs.unlinkSync(full_path);
}

const checkFileSize = (createReadStream, maxSize) =>
  new Promise((resolve, reject) => {
    let filesize = 0;
    let stream = createReadStream();
    stream.on("data", (chunk) => {
      filesize += chunk.length;
      if (filesize > maxSize) {
        reject(filesize);
      }
    });
    stream.on("end", () => {
      resolve(filesize);
    });
    stream.on("error", reject);
  });

const validatePromise = (obj) =>
  !!obj &&
  (typeof obj === "object" || typeof obj === "function") &&
  typeof obj.then === "function";

module.exports = {
  getRandomString,
  storeFS,
  uploadFile,
  deleteFile,
  checkFileSize,
  validatePromise,
};
