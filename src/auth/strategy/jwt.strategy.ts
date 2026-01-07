  import { Injectable } from '@nestjs/common';
  import { PassportStrategy } from '@nestjs/passport';
  import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';

  @Injectable()
  export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET environment variable is not set');
      }

      const options: StrategyOptions = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        ignoreExpiration: false,
        secretOrKey: jwtSecret,
      };

      super(options);
    }

    async validate(payload: any) {
      return {
        _id: payload.id,
        email: payload.email,
        role: payload.role,
        name: payload.name,
        region: payload.region,
        phone:payload.phone,
        isBlocked:payload.isBlocked
      };
    }
  }
