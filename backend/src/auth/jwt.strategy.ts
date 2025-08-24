import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as jwksRsa from 'jwks-rsa';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const issuerUrl = config.get<string>('AUTH0_ISSUER_URL');
    const audience = config.get<string>('AUTH0_AUDIENCE');

    if (!issuerUrl || !audience) {
      throw new Error('AUTH0_ISSUER_URL or AUTH0_AUDIENCE is not set');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      issuer: issuerUrl,
      audience,
      algorithms: ['RS256'],
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${issuerUrl}.well-known/jwks.json`,
      }),
    });
  }

  async validate(payload: any) {
    try {
      // Extract the Auth0 sub (user ID) from the JWT payload
      const auth0Sub = payload.sub;
      
      this.logger.log(`Validating JWT for auth0_sub: ${auth0Sub}`);
      
      if (!auth0Sub) {
        throw new Error('No sub claim found in JWT payload');
      }

      // Find or create user in our database
      this.logger.log(`Attempting to find or create user for auth0_sub: ${auth0Sub}`);
      const user = await this.usersService.findOrCreateUser(auth0Sub);
      
      this.logger.log(`User operation completed for auth0_sub: ${auth0Sub}, user ID: ${user.id}`);

      // Return the user data along with the original JWT payload
      return {
        ...payload,
        user, // Add our database user record
      };
    } catch (error) {
      this.logger.error(`Error in JWT validation: ${error.message}`, error.stack);
      throw error;
    }
  }
}
