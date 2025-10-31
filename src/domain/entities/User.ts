import { Email } from '../value-objects/Email.js';
import { Password } from '../value-objects/Password.js';

/**
 * User Role Enum
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  MEMBER = 'MEMBER',
}

/**
 * User Entity (Aggregate Root)
 *
 * Represents a user in the system with authentication and profile information
 */
export class User {
  private constructor(
    private readonly _id: string,
    private _email: Email,
    private _password: Password,
    private _name: string,
    private _role: UserRole,
    private _isActive: boolean,
    private readonly _createdAt: Date,
    private _updatedAt: Date
  ) {}

  /**
   * Create a new User instance
   *
   * @param props - User properties
   * @returns User instance
   */
  static create(props: {
    id: string;
    email: Email;
    password: Password;
    name: string;
    role?: UserRole;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }): User {
    if (!props.id?.trim()) {
      throw new TypeError('User ID is required');
    }

    if (!props.name?.trim()) {
      throw new TypeError('User name is required');
    }

    if (props.name.length < 2) {
      throw new Error('User name must be at least 2 characters');
    }

    if (props.name.length > 100) {
      throw new Error('User name must not exceed 100 characters');
    }

    const now = new Date();
    return new User(
      props.id.trim(),
      props.email,
      props.password,
      props.name.trim(),
      props.role ?? UserRole.MEMBER,
      props.isActive ?? true,
      props.createdAt ?? now,
      props.updatedAt ?? now
    );
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get email(): Email {
    return this._email;
  }

  get password(): Password {
    return this._password;
  }

  get name(): string {
    return this._name;
  }

  get role(): UserRole {
    return this._role;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get createdAt(): Date {
    return new Date(this._createdAt);
  }

  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  /**
   * Update user name
   */
  updateName(name: string): void {
    if (!name?.trim()) {
      throw new TypeError('User name is required');
    }

    if (name.length < 2) {
      throw new Error('User name must be at least 2 characters');
    }

    if (name.length > 100) {
      throw new Error('User name must not exceed 100 characters');
    }

    this._name = name.trim();
    this._updatedAt = new Date();
  }

  /**
   * Update user email
   */
  updateEmail(email: Email): void {
    this._email = email;
    this._updatedAt = new Date();
  }

  /**
   * Update user password
   */
  updatePassword(password: Password): void {
    this._password = password;
    this._updatedAt = new Date();
  }

  /**
   * Update user role
   */
  updateRole(role: UserRole): void {
    this._role = role;
    this._updatedAt = new Date();
  }

  /**
   * Activate user
   */
  activate(): void {
    if (this._isActive) {
      throw new Error('User is already active');
    }
    this._isActive = true;
    this._updatedAt = new Date();
  }

  /**
   * Deactivate user
   */
  deactivate(): void {
    if (!this._isActive) {
      throw new Error('User is already inactive');
    }
    this._isActive = false;
    this._updatedAt = new Date();
  }

  /**
   * Check if user has admin role
   */
  isAdmin(): boolean {
    return this._role === UserRole.ADMIN;
  }

  /**
   * Check if user has manager role
   */
  isManager(): boolean {
    return this._role === UserRole.MANAGER;
  }

  /**
   * Check if user can manage tasks
   */
  canManageTasks(): boolean {
    return this._role === UserRole.ADMIN || this._role === UserRole.MANAGER;
  }

  /**
   * Verify password
   */
  async verifyPassword(plainPassword: string): Promise<boolean> {
    return this._password.compare(plainPassword);
  }

  /**
   * Convert to plain object for persistence
   */
  toPlainObject(): {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    role: UserRole;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this._id,
      email: this._email.value,
      passwordHash: this._password.value,
      name: this._name,
      role: this._role,
      isActive: this._isActive,
      createdAt: new Date(this._createdAt),
      updatedAt: new Date(this._updatedAt),
    };
  }
}
