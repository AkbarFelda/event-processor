const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
ffmpeg.setFfmpegPath(ffmpegPath);

function toSticker({ inputPath, outputPath, isVideo, seconds }) {
  return new Promise((resolve, reject) => {
    let cmd = ffmpeg(inputPath).outputOptions([
      "-vcodec", "libwebp",
      "-vf", "scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:-1:-1:color=white@0,crop=512:512",
      "-loop", "0",
      "-preset", "default",
      "-an",
      "-vsync", "0",
    ]);

    if (isVideo) cmd = cmd.setStartTime(0).setDuration(seconds);

    cmd
      .save(outputPath)
      .on("end", resolve)
      .on("error", reject);
  });
}

module.exports = { toSticker };
