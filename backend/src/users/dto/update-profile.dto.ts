import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class UpdateProfileDto {
  @ApiProperty({
    example: 'John Updated',
    description: 'Only name can be updated by user',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ enum: UserRole, default: UserRole.USER })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
