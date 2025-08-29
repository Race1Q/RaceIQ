// src/users/entities/user.entity.ts

export class User {
    id: string; // The user's unique ID from the database (usually a UUID)
    auth0_sub: string;
    username: string | null;
    email: string | null;
    favorite_constructor_id: number | null;
    favorite_driver_id: number | null;
    role: string;
    created_at: Date;
  }