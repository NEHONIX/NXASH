/**Ce espace est utilisé pour la visualisation
 * des logs des codes JS
 **/

const fs = require("fs");
const crypto = require("crypto");
require("dotenv").config();

let encryptionKey = process.env.ENC_SECRET_KEY; // initializing my encryption key inside .env file
const iv = Buffer.alloc(16, 0); // defining my initializing vector

// function to read cached data
const readCache = (filepath) => {
  try {
    // read encrypted data from file
    const encryptedData = fs.readFileSync(filepath, "utf8");
    // decrypt data
    const decipher = crypto.createDecipher("aes-256-cbc", encryptionKey, iv);
    let decryptedData = decipher.update(encryptedData, "hex", "utf8");
    decryptedData += decipher.final("utf8");
    return JSON.parse(decryptedData);
  } catch (error) {
    console.error("Error while reading cache:", error);
    return {};
  }
};
// function to write data to cache
const writeCache = (data, filepath) => {
  try {
    // encrypt data
    const cipher = crypto.createCipher("aes-256-cbc", encryptionKey);
    let encryptedData = cipher.update(JSON.stringify(data), "utf8", "hex");
    encryptedData += cipher.final("hex");
    // write encrypted data to file
    fs.writeFileSync(filepath, encryptedData);
  } catch (error) {
    console.error("Error writing to cache:", error);
  }
};

// function to rotate encryption keys
const rotateKeys = () => {
  // fenerate new encryption key
  const newEncryptionKey = crypto.randomBytes(32).toString("hex");
  // re-encrypt cached data with the new key
  const cachedData = readCache();
  writeCache(cachedData);
  // update encryption key
  encryptionKey = newEncryptionKey;
};

// function to expire cache after a certain time interval
const expireCache = () => {
  try {
    // clear cache (here I am not deleting the cache file to avoid no such a file error)
    fs.truncateSync("cache/cacheData.txt", 0);
    console.log("cache is expired:", new Date());
  } catch (err) {
    console.error("Error expiring cache:", err);
  }
};

// schedule cache expiration after 10 mins and key rotation after 10 days
setInterval(expireCache, 10 * 60 * 60 * 1000);
// here I am using this key rotation to prevent third party attacks
setInterval(rotateKeys, 10 * 24 * 60 * 60 * 1000);

module.exports = { readCache, writeCache };
