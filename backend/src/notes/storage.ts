import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { v4 as uuid } from 'uuid';
import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';

export function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const notesDiskStorage = diskStorage({
  destination: (_req, _file, cb) => {
    ensureUploadDir();
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const id = uuid();
    cb(null, `${id}${extname(file.originalname)}`);
  },
});

const allowed = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
]);

export function fileFilter(_req: any, file: Express.Multer.File, cb: Function) {
  if (!allowed.has(file.mimetype)) {
    return cb(new BadRequestException('Only PDF/DOC/DOCX/PPT/PPTX/TXT allowed'), false);
  }
  cb(null, true);
}
