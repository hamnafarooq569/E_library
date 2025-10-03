// src/notes/notes.service.ts
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { promises as fs } from 'fs';
import { ILike, Repository } from 'typeorm';
import { Note } from './entities/note.entity';
import { CreateNoteDto } from './dto/create-note.dto';
import { QueryNotesDto } from './dto/query-notes.dto';
import { User } from '../users/entities/user.entity';
import { createReadStream, existsSync } from 'fs'; // ⬅️ removed unlink
import { join } from 'path';
import { UpdateNoteDto } from './dto/update-note.dto';

// ❌ remove: import { StreamableFile } from '@nestjs/common'; // not used in service

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note) private readonly notes: Repository<Note>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async findMine(userId: number, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [items, total] = await this.notes.findAndCount({
      where: { uploader: { id: userId } },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });
    return { page, limit, total, items };
  }

  async findPublic(q: { q?: string; page?: number; limit?: number }) {
    const page = q.page ?? 1;
    const limit = q.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = q.q
      ? [
          { approved: true, title: ILike(`%${q.q}%`) },
          { approved: true, description: ILike(`%${q.q}%`) },
          { approved: true, tags: ILike(`%${q.q}%`) },
        ]
      : { approved: true as const };

    const [items, total] = await this.notes.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { page, limit, total, items };
  }

  async updateMeta(id: number, userId: number, dto: UpdateNoteDto) {
    const note = await this.notes.findOne({ where: { id } });
    if (!note) throw new NotFoundException('Note not found');
    if (note.uploader.id !== userId)
      throw new ForbiddenException('Not your note');

    Object.assign(note, dto);
    note.approved = false;
    return this.notes.save(note);
  }

  async remove(id: number, userId: number, requesterRole?: string) {
    const note = await this.notes.findOne({ where: { id } });
    if (!note) throw new NotFoundException('Note not found');

    const isOwner = note.uploader.id === userId;
    const isAdmin = (requesterRole || '').toUpperCase() === 'ADMIN';
    if (!isOwner && !isAdmin) throw new ForbiddenException('Not allowed');

    try {
      await fs.unlink(join(UPLOAD_DIR, note.fileName));
    } catch {}
    await this.notes.remove(note);
    return { success: true };
  }

  async createFromUpload(
    dto: CreateNoteDto,
    file: Express.Multer.File,
    uploaderId: number,
  ) {
    const uploader = await this.users.findOne({ where: { id: uploaderId } });
    if (!uploader) throw new NotFoundException('Uploader not found');

    const note = this.notes.create({
      title: dto.title,
      description: dto.description,
      tags: dto.tags,
      fileName: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: Number(file.size),
      uploader,
      approved: false,
    });

    const saved = await this.notes.save(note);

    return {
      id: saved.id,
      title: saved.title,
      description: saved.description,
      tags: saved.tags,
      originalName: saved.originalName,
      createdAt: saved.createdAt,
      approved: saved.approved,
      uploader: {
        id: uploader.id,
        email: uploader.email,
        name: uploader.name,
      },
    };
  }

  async findAll(q: QueryNotesDto) {
    const where = q.q
      ? [
          { title: ILike(`%${q.q}%`) },
          { description: ILike(`%${q.q}%`) },
          { tags: ILike(`%${q.q}%`) },
        ]
      : undefined;

    const page = q.page ?? 1;
    const limit = q.limit ?? 10;
    const skip = (page - 1) * limit;

    const [items, total] = await this.notes.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { page, limit, total, items };
  }

  async findOne(id: number) {
    const note = await this.notes.findOne({ where: { id } });
    if (!note) throw new NotFoundException('Note not found');
    return note;
  }

  async approve(id: number) {
    const note = await this.notes.findOne({ where: { id } });
    if (!note) throw new NotFoundException('Note not found');
    note.approved = true;
    return this.notes.save(note);
  }

  async reject(id: number) {
    const note = await this.notes.findOne({ where: { id } });
    if (!note) throw new NotFoundException('Note not found');
    note.approved = false;
    return this.notes.save(note);
  }

  async findPending(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [items, total] = await this.notes.findAndCount({
      where: { approved: false },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });
    return { page, limit, total, items };
  }

  async getDownloadStream(
    id: number,
    requester: { userId: number; role?: string },
  ) {
    const note = await this.notes.findOne({ where: { id } });
    if (!note) throw new NotFoundException('Note not found');

    const isUploader = note.uploader.id === requester.userId;
    const isAdmin = (requester.role || '').toUpperCase() === 'ADMIN';

    if (!note.approved && !isUploader && !isAdmin) {
      throw new ForbiddenException('Not approved yet');
    }

    const filePath = join(UPLOAD_DIR, note.fileName);
    if (!existsSync(filePath)) {
      throw new BadRequestException('File missing on server');
    }

    note.downloads = (note.downloads || 0) + 1;
    this.notes.save(note).catch(() => {});

    return {
      filename: note.originalName,
      stream: createReadStream(filePath),
      mime: note.mimeType,
    };
  }

  async getPreviewStream(
    id: number,
    requester?: { userId?: number; role?: string },
  ) {
    const note = await this.notes.findOne({ where: { id } });
    if (!note) throw new NotFoundException('Note not found');

    const isUploader = requester && note.uploader.id === requester.userId;
    const isAdmin =
      requester && (requester.role || '').toUpperCase() === 'ADMIN';

    if (!note.approved && !isUploader && !isAdmin) {
      throw new ForbiddenException('Not approved yet');
    }

    const filePath = join(UPLOAD_DIR, note.fileName);
    if (!existsSync(filePath)) {
      throw new BadRequestException('File missing on server');
    }

    return {
      filename: note.originalName,
      stream: createReadStream(filePath),
      mime: note.mimeType,
    };
  }

  // Simple summary counts + storage usage
  async adminSummary() {
    const [total, approved, pending] = await Promise.all([
      this.notes.count(),
      this.notes.count({ where: { approved: true } }),
      this.notes.count({ where: { approved: false } }),
    ]);

    const raw = await this.notes
      .createQueryBuilder('n')
      .select('COALESCE(SUM(n.size), 0)', 'totalSize')
      .addSelect('COALESCE(SUM(n.downloads), 0)', 'totalDownloads')
      .getRawOne<{ totalSize: string; totalDownloads: string }>();

    const totalSize = Number(raw?.totalSize ?? 0);
    const totalDownloads = Number(raw?.totalDownloads ?? 0);

    return {
      total,
      approved,
      pending,
      totalSize,
      totalDownloads,
    };
  }

  // Recently uploaded notes (latest first)
  async adminRecentUploads(limit = 10) {
    const items = await this.notes.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
    return { items };
  }

  // Top downloads (approved only by default)
  async adminTopDownloads(limit = 10, approvedOnly = true) {
    const where = approvedOnly ? { approved: true } : {};
    const items = await this.notes.find({
      where,
      order: { downloads: 'DESC' },
      take: limit,
    });
    return { items };
  }

  // Downloads per day for last N days (for chart)
  async adminDownloadsByDay(days = 14) {
    // start of today minus (days-1)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const since = new Date(today);
    since.setDate(today.getDate() - (days - 1));

    const rows = await this.notes
      .createQueryBuilder('n')
      .select("TO_CHAR(n.createdAt, 'YYYY-MM-DD')", 'day')
      .addSelect('SUM(n.downloads)', 'downloads')
      .where('n.createdAt >= :since', { since })
      .groupBy("TO_CHAR(n.createdAt, 'YYYY-MM-DD')")
      .orderBy("TO_CHAR(n.createdAt, 'YYYY-MM-DD')", 'ASC') // ← fixed quote
      .getRawMany<{ day: string; downloads: string }>();

    // build a continuous series of days with zeros filled in
    const series: Array<{ day: string; downloads: number }> = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      // format YYYY-MM-DD (UTC-safe)
      const day = d.toISOString().slice(0, 10);
      const row = rows.find((r) => r.day === day);
      series.push({ day, downloads: row ? Number(row.downloads) : 0 });
    }

    return { since: since.toISOString(), days, series };
  }
}
