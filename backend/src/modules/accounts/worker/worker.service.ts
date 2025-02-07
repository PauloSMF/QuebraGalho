import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from '../../auth/auth.service';
import { CreateWorkerDto } from './dto/request/createWorker.dto';
import { GetAllFilters } from './dto/request/getAllFilters.dto';
import { CreateWorkerResponseDto } from './dto/response/createResponse.dto';
import { GetAllWorkerResponseDto } from './dto/response/getAllResponse.dto';
import { Worker } from './worker.entity';

@Injectable()
export class WorkerService {
  constructor(
    @InjectRepository(Worker)
    private readonly repository: Repository<Worker>,
    private readonly authService: AuthService,
  ) {}

  async create(req: CreateWorkerDto): Promise<CreateWorkerResponseDto> {
    if (await this.checkCpfAndEmail(req.document, req.email)) {
      throw new ConflictException('Trabalhador já existe');
    }
    const hashPassword = await this.authService.encrypt(req.password);
    req.password = hashPassword;
    req.status = true;

    const savedWorker = await this.repository.save(req);
    delete savedWorker.password;
    return savedWorker as CreateWorkerResponseDto;
  }

  private async checkCpfAndEmail(
    document: string,
    email: string,
  ): Promise<boolean> {
    try {
      await this.repository.findOneOrFail({ document, status: true });
      await this.repository.findOneOrFail({ email, status: true });
      return true;
    } catch (error) {
      return false;
    }
  }

  async getAll(filters: GetAllFilters): Promise<GetAllWorkerResponseDto> {
    let query = this.repository
      .createQueryBuilder('worker')
      .select('worker.id', 'id')
      .addSelect('worker.fullName', 'name')
      .addSelect('worker.gender', 'gender')
      .addSelect('worker.cellPhone', 'cellPhone')
      .addSelect('worker.email', 'email')
      .addSelect('worker.status', 'status')
      .addSelect('worker.document', 'document')
      .addSelect('worker.available', 'available')
      .addSelect('worker.birth_date', 'birth_date')
      .take(filters.take)
      .skip(filters.skip);

    if (filters.status) {
      query.where('status = :status', { status: filters.status });
    } else {
      query.where('status = :status', { status: true });
    }

    if (filters.name) {
      query.andWhere(`"fullName" ILIKE :name`, { name: `%${filters.name}%` });
    }

    const [data, count] = await Promise.all([
      query.clone().getRawMany(),
      query.clone().getCount(),
    ]);

    return {
      data,
      count,
    };
  }

  async getOne(id: string): Promise<Worker> {
    try {
      const worker = await this.repository.findOneOrFail(id, {
        relations: ['services'],
      });
      delete worker.password;
      return worker;
    } catch (error) {
      throw new NotFoundException('Trabalhador não existe');
    }
  }

  //async update(id: string, req: UpdateWorkerDto): Promise<Worker> {}

  async delete(id: string): Promise<void> {
    const worker = await this.getOne(id);
    if (!worker.status) {
      throw new BadRequestException('Trabalhador já está inativo');
    }
    worker.status = false;
    await this.repository.save(worker);
  }
}
