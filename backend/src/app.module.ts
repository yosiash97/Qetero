import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { HotelsModule } from './hotels/hotels.module';
import { RoomsModule } from './rooms/rooms.module';
import { BookingsModule } from './bookings/bookings.module';
import { OrdersModule } from './orders/orders.module';
import { AuthModule } from './auth/auth.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { InquiriesModule } from './inquiries/inquiries.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = process.env.DATABASE_URL;
        
        if (databaseUrl) {
          return {
            type: 'postgres',
            url: databaseUrl,
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: false,
            logging: configService.get('NODE_ENV') === 'development',
            ssl: { rejectUnauthorized: false },
          };
        }
        
        return {
          type: 'postgres',
          host: process.env.PGHOST || configService.get('DB_HOST'),
          port: parseInt(process.env.PGPORT || configService.get('DB_PORT') || '5432'),
          username: process.env.PGUSER || configService.get('DB_USERNAME'),
          password: process.env.PGPASSWORD || configService.get('DB_PASSWORD'),
          database: process.env.PGDATABASE || configService.get('DB_DATABASE'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: configService.get('NODE_ENV') === 'development',
          logging: configService.get('NODE_ENV') === 'development',
          ssl: { rejectUnauthorized: false },
        };
      },
      inject: [ConfigService],
    }),

    // Feature modules
    UsersModule,
    HotelsModule,
    RoomsModule,
    BookingsModule,
    OrdersModule,
    AuthModule,
    MaintenanceModule,
    InquiriesModule,
  ],
})
export class AppModule {}
