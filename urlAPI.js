const { exec } = require("child_process");
const {
  DELETETIME,
  createFolder,
  executeCommands,
  createCommands,
  mainCommand,
  createDownloadableList,
  createFormats,
} = require("./utility");

const fs = require("fs");

const download = (URL) => {
  const folderName = process.env.DOWNLOAD_FOLDER + Date.now().toString();
  return new Promise((resolve, reject) => {
    exec(mainCommand(URL), (error, stdout, stdrerr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        return;
      }

      if (stdrerr) {
        console.log(`stderr: ${stdrerr}`);
        return;
      }

      const { videoOnly, downloadableList } = createDownloadableList(stdout);

      const formats = createFormats(videoOnly);

      // create a unique folder
      createFolder(folderName);

      // prepare commands
      const commands = createCommands(
        downloadableList,
        folderName,
        formats,
        URL
      );

      executeCommands(commands)
        .then((_) => {
          resolve({
            isDownloaded: true,
            folderName: folderName.split("/")[1],
            formats,
          });
          setTimeout(() => {
            exec("rm -r " + folderName);
          }, DELETETIME);
        })
        .catch((error) => {
          console.error("Error executing commands:", error);
          reject({ isDownloaded: false });
        });
    });
  });
};

module.exports = { download };
