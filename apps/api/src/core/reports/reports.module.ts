import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { ReportRepository } from './domain/repositories/report.repository';
import { ReportMikroOrm } from './infrastructure/persistence/mikro-orm/models/report.mikroORM';
import { ReportRepositoryMikroOrm } from './infrastructure/persistence/mikro-orm/report.repository.mikroORM';

@Module({
  imports: [CqrsModule, MikroOrmModule.forFeature([ReportMikroOrm])],
  providers: [{ provide: ReportRepository, useClass: ReportRepositoryMikroOrm }],
  exports: [ReportRepository],
})
export class ReportsModule {}
