// src/notes/notes.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ForbiddenException,
  Res,
} from '@nestjs/common';
import { StreamableFile } from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';

import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { QueryNotesDto } from './dto/query-notes.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { notesDiskStorage, fileFilter } from './storage';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('notes')
export class NotesController {
  constructor(private readonly notes: NotesService) {}

  // ---------- PUBLIC PREVIEW (approved notes only) ----------
  // Anyone can hit this. The service will allow only approved files.
  @Get(':id/preview')
    async previewPublic(
      @Param('id', ParseIntPipe) id: number
    ): Promise<StreamableFile> {
      const { filename, stream, mime } = await this.notes.getPreviewStream(id);
      return new StreamableFile(stream, {
        type: mime || 'application/octet-stream',
        disposition: `inline; filename="${encodeURIComponent(filename)}"`,
      });
    }


  // ---------- DOWNLOAD (auth required; uploader/admin can download unapproved) ----------
  @UseGuards(AuthGuard('jwt'))
  @Get(':id/download')
  async download(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: { userId: number; role?: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { filename, stream, mime } = await this.notes.getDownloadStream(id, user);
    res.setHeader('Content-Type', mime || 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(filename)}"`,
    );
    return stream;
  }

  // ---------- ADMIN MODERATION ----------
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Post(':id/approve')
  approve(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: { userId: number; role?: string },
  ) {
    return this.notes.approve(id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Post(':id/reject')
  reject(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: { userId: number; role?: string },
  ) {
    return this.notes.reject(id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Get('pending')
  pending(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @GetUser() user: { userId: number; role?: string },
  ) {
    if ((user.role || '').toUpperCase() !== 'ADMIN') {
      throw new ForbiddenException('Admins only');
    }
    return this.notes.findPending(Number(page), Number(limit));
  }

  // ---------- MY UPLOADS / EDIT / DELETE ----------
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  me(
    @GetUser() user: { userId: number },
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.notes.findMine(user.userId, Number(page), Number(limit));
  }

  // Public feed (approved only)
  @Get('public/feed')
  publicFeed(@Query() q: QueryNotesDto) {
    return this.notes.findPublic(q);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  updateMeta(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: { userId: number },
    @Body() dto: UpdateNoteDto,
  ) {
    return this.notes.updateMeta(id, user.userId, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: { userId: number; role?: string },
  ) {
    return this.notes.remove(id, user.userId, user.role);
  }

  // ---------- UPLOAD ----------
  @UseGuards(AuthGuard('jwt'))
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: notesDiskStorage,
      limits: { fileSize: 40 * 1024 * 1024 },
      fileFilter,
    }),
  )
  upload(
    @Body() dto: CreateNoteDto,
    @GetUser() user: { userId: number; email: string },
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.notes.createFromUpload(dto, file, user.userId);
  }

  // ---------- BASIC LIST/GET ----------
  @Get()
  list(@Query() q: QueryNotesDto) {
    return this.notes.findAll(q);
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.notes.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Get('admin/summary')
  adminSummary(@GetUser() user: { userId: number; role?: string }) {
    return this.notes.adminSummary();
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Get('admin/recent')
  adminRecent(
    @GetUser() user: { userId: number; role?: string },
    @Query('limit') limit = 10,
  ) {
    return this.notes.adminRecentUploads(Number(limit));
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Get('admin/top-downloads')
  adminTopDownloads(
    @GetUser() user: { userId: number; role?: string },
    @Query('limit') limit = 10,
    @Query('approvedOnly') approvedOnly: 'true' | 'false' = 'true',
  ) {
    return this.notes.adminTopDownloads(Number(limit), approvedOnly !== 'false');
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Get('admin/downloads-by-day')
  adminDownloadsByDay(
    @GetUser() user: { userId: number; role?: string },
    @Query('days') days = 14,
  ) {
    return this.notes.adminDownloadsByDay(Number(days));
  }


  
}
