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

    // Create Users
    const userRepository = dataSource.getRepository('User');
    const bcrypt = require('bcrypt');

    const users = [
      {
        email: 'admin@hotel.com',
        password: await bcrypt.hash('admin123', 10),
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        phone: '+251911234567', // Ethiopian phone number
      },
      {
        email: 'guest1@example.com',
        password: await bcrypt.hash('guest123', 10),
        firstName: 'John',
        lastName: 'Doe',
        role: 'guest',
        phone: '+251922345678', // Ethiopian phone number
      },
      {
        email: 'guest2@example.com',
        password: await bcrypt.hash('guest123', 10),
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'guest',
        phone: '+251933456789', // Ethiopian phone number
      },
      {
        email: 'guest3@example.com',
        password: await bcrypt.hash('guest123', 10),
        firstName: 'Abebe',
        lastName: 'Kebede',
        role: 'guest',
        phone: '+251944567890', // Ethiopian phone number
      },
    ];

    const createdUsers = await userRepository.save(users);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Create Bookings (checked-in status for testing)
    const bookingRepository = dataSource.getRepository('Booking');
    const allRooms = await roomRepository.find({ take: 10 });

    const bookings = [];
    for (let i = 0; i < Math.min(createdUsers.length - 1, allRooms.length); i++) {
      const guest = createdUsers[i + 1]; // Skip admin
      const room = allRooms[i];

      bookings.push({
        userId: guest.id,
        roomId: room.id,
        checkInDate: new Date(),
        checkOutDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        status: 'checked_in',
        totalPrice: room.pricePerNight * 3,
        specialRequests: 'No smoking',
      });
    }

    const createdBookings = await bookingRepository.save(bookings);
    console.log(`✅ Created ${createdBookings.length} bookings`);

    // Reload bookings with relations
    const bookingsWithRelations = await bookingRepository.find({
      relations: ['room'],
    });

    // Create Maintenance Requests
    const maintenanceRepository = dataSource.getRepository('Maintenance');

    const maintenanceRequests = [
      {
        hotelId: allRooms[0].hotelId,
        roomId: createdBookings[0].roomId,
        bookingId: createdBookings[0].id,
        userId: createdBookings[0].userId,
        description: 'Air conditioning not working properly',
        descriptionAmharic: 'የአየር ማቀዝቀዣው በትክክል አይሰራም',
        category: 'hvac',
        priority: 'urgent',
        status: 'pending',
        phoneNumber: createdUsers[1].phone,
        originalMessage: 'The AC in my room is not cooling. It\'s too hot!',
        originalMessageAmharic: 'በክፍሌ ውስጥ ያለው AC አይቀዘቅዝም። በጣም ሞቃት ነው!',
      },
      {
        hotelId: allRooms[0].hotelId,
        roomId: createdBookings[0].roomId,
        bookingId: createdBookings[0].id,
        userId: createdBookings[0].userId,
        description: 'Toilet is leaking water',
        descriptionAmharic: 'መፀዳጃ ቤት ውሃ ይፈስሳል',
        category: 'plumbing',
        priority: 'high',
        status: 'in_progress',
        phoneNumber: createdUsers[1].phone,
        originalMessage: 'There is water leaking from the toilet in my bathroom',
        originalMessageAmharic: 'ከመታጠቢያ ቤቴ መፀዳጃ ቤት ውሃ እየፈሰሰ ነው',
      },
      {
        hotelId: allRooms[1].hotelId,
        roomId: createdBookings[1] ? createdBookings[1].roomId : allRooms[1].id,
        bookingId: createdBookings[1] ? createdBookings[1].id : createdBookings[0].id,
        userId: createdBookings[1] ? createdBookings[1].userId : createdBookings[0].userId,
        description: 'Light bulb in bathroom is burnt out',
        descriptionAmharic: 'በመታጠቢያ ቤት ውስጥ ያለው አምፖል ተቃጥሏል',
        category: 'electrical',
        priority: 'medium',
        status: 'pending',
        phoneNumber: createdUsers[2]?.phone || createdUsers[1].phone,
        originalMessage: 'The bathroom light is not working',
        originalMessageAmharic: 'የመታጠቢያ ቤት መብራት አይሰራም',
      },
      {
        hotelId: allRooms[2].hotelId,
        roomId: allRooms[2].id,
        bookingId: createdBookings[2] ? createdBookings[2].id : createdBookings[0].id,
        userId: createdBookings[2] ? createdBookings[2].userId : createdBookings[0].userId,
        description: 'TV remote control not working',
        descriptionAmharic: 'የቴሌቪዥን ሪሞት ኮንትሮል አይሰራም',
        category: 'appliances',
        priority: 'low',
        status: 'resolved',
        phoneNumber: createdUsers[3]?.phone || createdUsers[1].phone,
        originalMessage: 'The TV remote is dead, needs new batteries',
        originalMessageAmharic: 'የቴሌቪዥን ሪሞት ሞቷል፣ አዲስ ባትሪ ያስፈልገዋል',
      },
      {
        hotelId: allRooms[3].hotelId,
        roomId: allRooms[3].id,
        bookingId: createdBookings[0].id,
        userId: createdBookings[0].userId,
        description: 'Room needs cleaning and fresh towels',
        descriptionAmharic: 'ክፍል ማፅዳትና አዲስ መሃረብ ያስፈልጋል',
        category: 'cleaning',
        priority: 'medium',
        status: 'pending',
        phoneNumber: createdUsers[1].phone,
        originalMessage: 'Can I get housekeeping? Need fresh towels and room cleaning',
        originalMessageAmharic: 'የቤት አስተዳዳሪ ማግኘት እችላለሁ? አዲስ መሃረብና ክፍል ማፅዳት እፈልጋለሁ',
      },
      {
        hotelId: allRooms[4].hotelId,
        roomId: allRooms[4].id,
        bookingId: createdBookings[1] ? createdBookings[1].id : createdBookings[0].id,
        userId: createdBookings[1] ? createdBookings[1].userId : createdBookings[0].userId,
        description: 'Broken chair in the room',
        descriptionAmharic: 'በክፍሉ ውስጥ የተሰበረ ወንበር',
        category: 'furniture',
        priority: 'low',
        status: 'closed',
        phoneNumber: createdUsers[2]?.phone || createdUsers[1].phone,
        originalMessage: 'One of the chairs is wobbly and broken',
        originalMessageAmharic: 'አንዱ ወንበር ይንቀጠቀጣል እና ተሰብሯል',
      },
      {
        hotelId: allRooms[5].hotelId,
        roomId: allRooms[5].id,
        bookingId: createdBookings[0].id,
        userId: createdBookings[0].userId,
        description: 'Need a washer/dryer for laundry',
        descriptionAmharic: 'ለልብስ ማጠቢያ ማጠቢያ/ማድረቂያ እፈልጋለሁ',
        category: 'other',
        priority: 'medium',
        status: 'pending',
        phoneNumber: createdUsers[1].phone,
        originalMessage: 'Is there a washer and dryer I can use?',
        originalMessageAmharic: 'መጠቀም የምችለው ማጠቢያና ማድረቂያ አለ?',
      },
      {
        hotelId: allRooms[6].hotelId,
        roomId: allRooms[6].id,
        bookingId: createdBookings[2] ? createdBookings[2].id : createdBookings[0].id,
        userId: createdBookings[2] ? createdBookings[2].userId : createdBookings[0].userId,
        description: 'Shower head has low water pressure',
        descriptionAmharic: 'የሻወር ራስ ዝቅተኛ የውሃ ግፊት አለው',
        category: 'plumbing',
        priority: 'medium',
        status: 'in_progress',
        phoneNumber: createdUsers[3]?.phone || createdUsers[1].phone,
        originalMessage: 'The shower water pressure is very weak',
        originalMessageAmharic: 'የሻወር ውሃ ግፊት በጣም ደካማ ነው',
      },
      {
        hotelId: allRooms[7].hotelId,
        roomId: allRooms[7].id,
        bookingId: createdBookings[0].id,
        userId: createdBookings[0].userId,
        description: 'Wi-Fi not working in room',
        descriptionAmharic: 'ዋይፋይ በክፍሉ ውስጥ አይሰራም',
        category: 'other',
        priority: 'high',
        status: 'pending',
        phoneNumber: createdUsers[1].phone,
        originalMessage: 'I cannot connect to the WiFi',
        originalMessageAmharic: 'ወደ ዋይፋይ ማገናኘት አልችልም',
      },
      {
        hotelId: allRooms[8].hotelId,
        roomId: allRooms[8].id,
        bookingId: createdBookings[1] ? createdBookings[1].id : createdBookings[0].id,
        userId: createdBookings[1] ? createdBookings[1].userId : createdBookings[0].userId,
        description: 'Fridge making loud noise',
        descriptionAmharic: 'ፍሪጅ ጮክ ያለ ድምፅ እያሰማ ነው',
        category: 'appliances',
        priority: 'low',
        status: 'pending',
        phoneNumber: createdUsers[2]?.phone || createdUsers[1].phone,
        originalMessage: 'The mini fridge is very noisy',
        originalMessageAmharic: 'ትንሹ ፍሪጅ በጣም ጫጫታ ያለው ነው',
      },
    ];

    const createdMaintenance = await maintenanceRepository.save(maintenanceRequests);
    console.log(`✅ Created ${createdMaintenance.length} maintenance requests`);

    console.log(`\n🎉 Seeding completed successfully!`);
    console.log(`   - Hotels: ${createdHotels.length}`);
    console.log(`   - Rooms: ${totalRooms}`);
    console.log(`   - Users: ${createdUsers.length}`);
    console.log(`   - Bookings: ${createdBookings.length}`);
    console.log(`   - Maintenance Requests: ${createdMaintenance.length}`);
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
