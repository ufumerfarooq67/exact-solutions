// src/auth/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '@users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(() => 'mock-jwt-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should throw if email already exists', async () => {
      mockUsersService.findByEmail.mockResolvedValue({ id: 1 });
      await expect(
        service.register({ email: 'test@test.com', password: '123' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should register new user', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue({
        id: 1,
        email: 'new@test.com',
        name: 'New User',
      });

      const result = await service.register({
        email: 'new@test.com',
        password: 'password123',
      });

      expect(result).toHaveProperty('access_token');
      expect(mockJwtService.sign).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should throw if user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      await expect(
        service.login({ email: 'nope@test.com', password: '123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw if password invalid', async () => {
      mockUsersService.findByEmail.mockResolvedValue({
        validatePassword: jest.fn().mockResolvedValue(false),
      });

      await expect(
        service.login({ email: 'test@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return JWT on success', async () => {
      mockUsersService.findByEmail.mockResolvedValue({
        id: 1,
        email: 'test@test.com',
        validatePassword: jest.fn().mockResolvedValue(true),
      });

      const result = await service.login({
        email: 'test@test.com',
        password: 'correct',
      });

      expect(result).toHaveProperty('access_token');
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ sub: 1, email: 'test@test.com' }),
      );
    });
  });
});