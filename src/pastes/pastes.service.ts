import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Paste,
  PasteOrderByInput,
  PasteWhereInput,
  PasteWhereUniqueInput,
} from '@prisma/client';
import moment from 'moment';
import shortid from 'shortid';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePasteDto } from './dto/create-paste.dto';
import { UpdatePasteDto } from './dto/update-paste.dto';

@Injectable()
export class PastesService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(where: PasteWhereUniqueInput): Promise<Paste | null> {
    return this.prisma.paste.findOne({
      where,
      include: { author: { select: { name: true, id: true } } },
    });
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    cursor?: PasteWhereUniqueInput;
    where?: PasteWhereInput;
    orderBy?: PasteOrderByInput;
  }) {
    return this.prisma.paste.findMany({
      ...params,
      include: { author: { select: { name: true, id: true } } },
    });
  }

  async createPaste(data: CreatePasteDto, userId?: number) {
    return this.prisma.paste.create({
      data: {
        ...data,
        author: data.asUser && userId ? { connect: { id: userId } } : undefined,
        date: new Date(),
        shortId: shortid.generate(),
        expiresIn: data.expiresIn
          ? moment().add(data.expiresIn, 'm').toDate()
          : null,
      },
      include: { author: { select: { name: true, id: true } } },
    });
  }

  async updatePaste(
    where: PasteWhereUniqueInput,
    data: UpdatePasteDto,
    userId: number,
  ) {
    await this.checkIfAuthor(where, userId);

    return this.prisma.paste.update({
      where,
      data: {
        ...data,
        expiresIn: data.expiresIn
          ? moment().add(data.expiresIn, 'm').toDate()
          : null,
      },
      include: { author: { select: { name: true, id: true } } },
    });
  }

  async deletePaste(where: PasteWhereUniqueInput, userId: number) {
    await this.checkIfAuthor(where, userId);

    return this.prisma.paste.delete({
      where,
    });
  }

  async removeExpired() {
    this.prisma.paste.deleteMany({
      where: {
        AND: [{ expiresIn: { not: null } }, { expiresIn: { lte: new Date() } }],
      },
    });
  }

  private async checkIfAuthor(where: PasteWhereUniqueInput, userId: number) {
    const paste = await this.prisma.paste.findOne({
      where,
      include: { author: true },
    });
    if (!paste) {
      throw new NotFoundException('Paste not found');
    }
    if (paste.authorId !== userId) {
      throw new ForbiddenException('You are not the owner of this paste');
    }
  }
}
