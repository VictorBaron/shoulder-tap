import { Injectable } from '@nestjs/common';

import type { User, UserRepository } from '@/users/domain';

export class GetAllUsersQuery {}

@Injectable()
export class GetAllUsersHandler {
  constructor(private readonly repository: UserRepository) {}

  async execute(): Promise<User[]> {
    return this.repository.findAll();
  }
}
