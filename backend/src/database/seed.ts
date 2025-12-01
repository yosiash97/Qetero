import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';

async function seed() {
  const app = await NestFactory.create(AppModule);
  const dataSource = app.get(DataSource);

  console.log('🌱 Starting database seeding...');

  try {
    // Create Hotels
    const hotelRepository = dataSource.getRepository('Hotel');

    const hotels = [
      {
        name: 'Grand Plaza Hotel',
        address: '123 Main Street',
        city: 'New York',
        country: 'USA',
        description: 'Luxury hotel in the heart of Manhattan',
        phone: '+1-212-555-0100',
        email: 'info@grandplaza.com',
        rating: 4.5,
      },
      {
        name: 'Sunset Beach Resort',
        address: '456 Ocean Drive',
        city: 'Miami',
        country: 'USA',
        description: 'Beautiful beachfront resort with stunning ocean views',
        phone: '+1-305-555-0200',
        email: 'info@sunsetbeach.com',
        rating: 4.8,
      },
      {
        name: 'Mountain View Lodge',
        address: '789 Mountain Road',
        city: 'Denver',
        country: 'USA',
        description: 'Cozy lodge with breathtaking mountain scenery',
        phone: '+1-303-555-0300',
        email: 'info@mountainview.com',
        rating: 4.3,
      },
    ];

    const createdHotels = await hotelRepository.save(hotels);
    console.log(`✅ Created ${createdHotels.length} hotels`);

    // Create Rooms for each hotel
    const roomRepository = dataSource.getRepository('Room');
    const roomTypes = ['standard', 'deluxe', 'suite', 'presidential'];
    let totalRooms = 0;

    for (const hotel of createdHotels) {
      const rooms = [];

      // Create 5 rooms of each type for each hotel
      for (const type of roomTypes) {
        for (let i = 1; i <= 5; i++) {
          const roomNumber = `${type.charAt(0).toUpperCase()}${String(i).padStart(2, '0')}`;
          const basePrice = {
            standard: 100,
            deluxe: 250,
            suite: 400,
            presidential: 800,
          }[type];

          rooms.push({
            hotelId: hotel.id,
            roomNumber,
            type,
            status: 'available',
            floor: Math.floor(i / 2) + 1,
            capacity: type === 'standard' ? 2 : type === 'deluxe' ? 3 : type === 'suite' ? 4 : 6,
            pricePerNight: basePrice + (Math.random() * 50),
            description: `Comfortable ${type} room with modern amenities`,
          });
        }
      }

      await roomRepository.save(rooms);
      totalRooms += rooms.length;
      console.log(`✅ Created ${rooms.length} rooms for ${hotel.name}`);
    }

    console.log(`\n🎉 Seeding completed successfully!`);
    console.log(`   - Hotels: ${createdHotels.length}`);
    console.log(`   - Rooms: ${totalRooms}`);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await app.close();
  }
}

seed()
  .then(() => {
    console.log('✨ Seed script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
