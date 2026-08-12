// backend/src/users/dto/create-user.dto.ts
export class CreateUserDto {
  auth0_sub: string;
  // Optional: Auth0 access tokens only carry the email claim when the API is
  // configured to add it, and ensureExists already falls back to auth0_sub.
  email?: string;
}
