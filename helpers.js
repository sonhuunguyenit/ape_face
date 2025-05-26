import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const saveImageFromURL = async (url, filename) => {
  const urlPath = new URL(url).pathname;
  const ext = path.extname(urlPath) || ".jpg";

  const outputDir = path.join(__dirname, "/ZKCropServer/images/download");
  const fullFilename = filename + ext;
  const outputPath = path.join(outputDir, fullFilename);

  fs.mkdirSync(outputDir, { recursive: true });

  const response = await axios.get(url, {
    responseType: "arraybuffer",
  });

  fs.writeFileSync(outputPath, Buffer.from(response.data));

  return {
    urlPath: outputPath,
    filename: fullFilename,
  };
};

export const cropImageService = async (srcFileName, filename) => {
  try {
    const convertPath = `${__dirname}/ZKCropServer/images/convert/${filename}`;

    const result = await axios.get(
      `http://localhost:16001/ZKCropFace/CropFace`,
      {
        params: {
          SrcFileName: srcFileName,
          DestFileName: convertPath,
        },
      }
    );

    return result.data;
  } catch (err) {
    console.error("Crop service is unavailable:", err);
  }
};
