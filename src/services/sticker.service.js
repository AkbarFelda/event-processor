const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
ffmpeg.setFfmpegPath(ffmpegPath);

const VF = "scale=512:512:force_original_aspect_ratio=increase,crop=512:512,fps=15,setsar=1";

function toSticker({ inputPath, outputPath, isVideo, seconds = 5 }) {
  return new Promise((resolve, reject) => {
    let cmd = ffmpeg(inputPath).outputOptions([
      "-vcodec", "libwebp",
      "-vf", VF,
      "-an",
      "-vsync", "0",
      "-preset", "default",
      "-compression_level", "6",
      "-q:v", "60",            
      "-loop", "0",           
    ]);

    if (isVideo) cmd = cmd.setDuration(seconds);

    cmd.save(outputPath)
      .on("end", resolve)
      .on("error", reject);
  });
}

module.exports = { toSticker };
