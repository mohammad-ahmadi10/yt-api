const fs = require("fs");
const { exec } = require("child_process");
const DELETETIME = 600000; // after 10 minute  downloaded folder should be removed 60 * 10 * 1000

const executeCommands = async function (commands) {
  for await (const c of commands) {
    await executeCommand(c);
  }
};

function executeCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${command}`, error);
        reject();
        return;
      }
      resolve();
    });
  });
}

const createFolder = (folderName) => {
  fs.mkdir(__dirname + folderName, { recursive: true }, (error) => {
    if (error) console.error("Error Creating folder: ", error);
    console.log("Folder created successfully");
  });
};

const createCommands = (downloadableList, folderName, formats, URL) => {
  const commands = downloadableList.map(
    (id, i) =>
      "yt-dlp -o " +
      folderName +
      "/" +
      '"%(title)s_' +
      formats[i] +
      '.%(ext)s" -f ' +
      id +
      " " +
      URL
    //  +
    // `${i !== 0 ? " --recode-video mp4" : ""}`
  );

  return commands;
};

const mainCommand = (URL) => {
  return ` yt-dlp --get-title --list-formats -o "%(format_id)s %(title)s.%(ext)s" ${URL} 
    `;
};

const createDownloadableList = (stdout) => {
  const list = stdout.toString().split("\n");
  const title = list[list.length - 2].split(" ").join("_");
  const audioOnly = list.filter(
    (el) => el.includes("audio only") && el.includes("medium")
  );
  const videoOnly = list
    .filter((el) => el.includes("video only") && el.includes("webm"))
    .filter(
      (el) =>
        el.includes("360p") || (el.includes("720p") && !el.includes("1080p"))
    );

  const audio = audioOnly[0];
  const audioID = audio.slice(0, 3);
  const videoIDs = videoOnly.map((el) => el.slice(0, 3) + "+" + audioID);
  const downloadableList = [audioID, ...videoIDs];

  return {
    list,
    title,
    audio,
    audioID,
    audioOnly,
    videoOnly,
    videoIDs,
    downloadableList,
  };
};

const createFormats = (videoOnly) => {
  const formats = videoOnly.map((el) => {
    return el.split(" ")[3];
  });
  formats.unshift("audio");
  return formats;
};

module.exports = {
  DELETETIME,
  createFolder,
  executeCommands,
  createCommands,
  mainCommand,
  createDownloadableList,
  createFormats,
};
