import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as jwksRsa from 'jwks-rsa';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly config: ConfigService,
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
      const email = payload.email; // Extract email from Auth0 payload
      
      this.logger.log(`Validating JWT for auth0_sub: ${auth0Sub}, email: ${email}`);
      this.logger.log(`JWT payload: ${JSON.stringify(payload, null, 2)}`);
      
      if (!auth0Sub) {
        this.logger.error('No sub claim found in JWT payload');
        throw new Error('No sub claim found in JWT payload');
      }

      // Return the JWT payload - don't create users here
      // User creation will happen in the specific endpoints that need it
      this.logger.log(`JWT validation successful for auth0_sub: ${auth0Sub}`);
      return payload;
    } catch (error) {
      this.logger.error(`Error in JWT validation: ${error.message}`, error.stack);
      this.logger.error(`JWT validation failed for payload: ${JSON.stringify(payload, null, 2)}`);
      throw error;
    }
  }
}
