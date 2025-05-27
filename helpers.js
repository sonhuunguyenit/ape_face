import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import axios from "axios";

const URL_CONVERT = "http://localhost:16001/ZKCropFace/CropFace";

const PATH_DOWNLOAD = "/ZKCropServer/images/download/";

const PATH_CONVERT = "/ZKCropServer/images/convert/";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const saveImageFromURL = async (url, filename) => {
  const urlPath = new URL(url).pathname;
  const ext = path.extname(urlPath) || ".jpg";

  const outputDir = path.join(__dirname, PATH_DOWNLOAD);
  const fullFilename = filename + ext;
  const outputPath = path.join(outputDir, fullFilename);

  fs.mkdirSync(outputDir, { recursive: true });

  const response = await axios.get(url, {
    responseType: "arraybuffer",
  });

  fs.writeFileSync(outputPath, Buffer.from(response.data));

  console.log("saveImageFromURL", {
    urlPath: outputPath,
    filename: fullFilename,
  });

  return {
    urlPath: outputPath,
    filename: fullFilename,
  };
};

export const cropImageService = async (srcFileName, filename) => {
  try {
    let convertPath = `${__dirname}${PATH_CONVERT}${filename}`;

    // Temporary
    srcFileName = srcFileName.replace(
      "/Users/mac/Desktop/Code/Apetech/ape_face/",
      "/app/"
    );

    convertPath = convertPath.replace(
      "/Users/mac/Desktop/Code/Apetech/ape_face/",
      "/app/"
    );
    // end Temporary

    console.log("cropImageService", {
      srcFileName,
      filename,
    });

    const result = await axios.get(`${URL_CONVERT}`, {
      params: {
        SrcFileName: srcFileName,
        DestFileName: convertPath,
      },
    });

    return {
      ...result.data,
      SrcFileName: srcFileName,
      DestFileName: convertPath,
    };
  } catch (err) {
    console.error("Crop service is unavailable:", err);
  }
};

export const convertImageToBase64 = (imagePath) => {
  try {
    // Temporary
    imagePath = imagePath.replace(
      "/app/",
      "/Users/mac/Desktop/Code/Apetech/ape_face/"
    );
    // end Temporary

    const resolvedPath = path.resolve(imagePath);

    const imageBuffer = fs.readFileSync(resolvedPath);

    return imageBuffer.toString("base64");
  } catch (error) {
    console.log("convertImageToBase64", error);
  }
};
