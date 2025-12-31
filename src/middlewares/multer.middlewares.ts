import multer from "multer";
import { Request } from "express";

const storage = multer.diskStorage({
  destination: (
    _req: Request,
    _file: Express.Multer.File,
    cb
  ) => {
    cb(null, "./public/temp");
  },

  filename: (
    _req: Request,
    file: Express.Multer.File,
    cb
  ) => {
    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

export const upload = multer({ storage });
