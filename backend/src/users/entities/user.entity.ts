// src/users/entities/user.entity.ts

export class User {
    auth0_sub: string; // Primary key
    username: string | null;
    email: string | null;
    favorite_constructor_id: number | null;
    favorite_driver_id: number | null;
    role: string;
    created_at: Date;
  }