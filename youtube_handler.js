const express = require("express");
const router = express.Router();
const { download } = require("./urlAPI");
const fs = require("fs");

router
  .post("/url", async (req, res) => {
    const url = req.body.URL;
    console.log(url);
    const { isDownloaded, folderName, formats } = await download(url);
    if (isDownloaded) res.json({ foldername: folderName, formats: formats });
    else res.status(500).send("could not download it");
  })
  .get("/download", async (req, res) => {
    const { folderName, file } = req.query;
    getFile({ folderName, file }, res);
  });

const getFile = ({ folderName, file }, res) => {
  const path = __dirname + "/" + process.env.DOWNLOAD_FOLDER + folderName;
  fs.readdir(path, (err, files) => {
    const f = files.filter((f) => {
      return f.includes(file);
    })[0];
    const filePath = path + "/" + f;
    const reader = fs.createReadStream(filePath, {});
    res.setHeader("Content-disposition", `attachment; filename=${f}`);
    reader.pipe(res);
  });
};
module.exports = router;
