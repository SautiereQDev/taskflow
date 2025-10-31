import { z } from 'zod';
import type { ICommand } from '../ICommand.js';
import { UserRole } from '../../../domain/entities/User.js';

/**
 * Create User Command Schema (Zod)
 *
 * Runtime validation schema for user creation.
 * Validates input before reaching the handler.
 */
export const CreateUserCommandSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .trim(),

  email: z.string().email('Invalid email format').toLowerCase().trim(),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number'),

  role: z
    .nativeEnum(UserRole)
    .optional()
    .default('MEMBER' as UserRole),

  locale: z.enum(['fr', 'en']).optional().default('fr'),
});

export type CreateUserCommandInput = z.infer<typeof CreateUserCommandSchema>;

/**
 * Create User Command
 *
 * Command to create a new user in the system.
 * Validated with Zod schema before execution.
 *
 * @example
 * ```typescript
 * const command = new CreateUserCommand({
 *   name: 'Alice Martin',
 *   email: 'alice@example.com',
 *   password: 'SecurePass123!',
 *   role: UserRole.MEMBER,
 *   locale: 'fr'
 * });
 *
 * const user = await commandBus.execute(CreateUserCommand, command);
 * ```
 */
export class CreateUserCommand implements ICommand {
  public readonly name: string;
  public readonly email: string;
  public readonly password: string;
  public readonly role: UserRole;
  public readonly locale: string;

  constructor(input: CreateUserCommandInput) {
    // Validate with Zod schema
    const validated = CreateUserCommandSchema.parse(input);

    this.name = validated.name;
    this.email = validated.email;
    this.password = validated.password;
    this.role = validated.role;
    this.locale = validated.locale;
  }
}
