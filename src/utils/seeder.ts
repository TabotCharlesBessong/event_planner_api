// src/utils/seeder.ts
import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";
import User, { UserRole } from "../models/user.model";
import Event from "../models/event.model";
import Booking from "../models/booking.model";
import sequelize from "../config/database";

const seedUsers = async () => {
  const users = [
    {
      name: "Admin One",
      email: "admin1@example.com",
      password: await bcrypt.hash("password123", 10),
      role: UserRole.ADMIN,
      isVerified: true,
    },
    {
      name: "Admin Two",
      email: "admin2@example.com",
      password: await bcrypt.hash("password123", 10),
      role: UserRole.ADMIN,
      isVerified: true,
    },
    {
      name: "Client One",
      email: "client1@example.com",
      password: await bcrypt.hash("password123", 10),
      role: UserRole.CLIENT,
      isVerified: true,
    },
    {
      name: "Client Two",
      email: "client2@example.com",
      password: await bcrypt.hash("password123", 10),
      role: UserRole.CLIENT,
      isVerified: true,
    },
    {
      name: "Client Three",
      email: "client3@example.com",
      password: await bcrypt.hash("password123", 10),
      role: UserRole.CLIENT,
      isVerified: true,
    },
  ];

  await User.bulkCreate(users);
  console.log("Users seeded successfully");
};

const seedEvents = async () => {
  const events = [];
  const categories = ["Conference", "Workshop", "Seminar", "Networking", "Exhibition"];
  const locations = ["New York", "London", "Paris", "Tokyo", "Sydney", "Berlin", "Dubai"];

  for (let i = 0; i < 10; i++) {
    const event = {
      title: faker.lorem.words(3),
      description: faker.lorem.paragraphs(2),
      date: faker.date.future(),
      time: faker.date.future().toLocaleTimeString(),
      location: faker.helpers.arrayElement(locations),
      capacity: faker.number.int({ min: 50, max: 500 }),
      availableSlots: faker.number.int({ min: 10, max: 500 }),
      category: faker.helpers.arrayElement(categories),
      image: faker.image.urlLoremFlickr({ category: "business" }),
      creatorId: faker.number.int({ min: 1, max: 2 }), // Assign to admin users
    };
    events.push(event);
  }

  await Event.bulkCreate(events);
  console.log("Events seeded successfully");
};

const seedBookings = async () => {
  const bookings = [];
  const totalBookings = faker.number.int({ min: 15, max: 35 });
  const clientIds = [3, 4, 5]; // Client user IDs
  const eventIds = Array.from({ length: 10 }, (_, i) => i + 1); // Event IDs

  for (let i = 0; i < totalBookings; i++) {
    const booking = {
      userId: faker.helpers.arrayElement(clientIds),
      eventId: faker.helpers.arrayElement(eventIds),
      status: faker.helpers.arrayElement(["confirmed", "cancelled"]),
    };
    bookings.push(booking);
  }

  await Booking.bulkCreate(bookings);
  console.log("Bookings seeded successfully");
};

const seedDatabase = async () => {
  try {
    // Clear existing data
    await sequelize.sync({ force: true });
    console.log("Database tables recreated");

    // Seed data
    await seedUsers();
    await seedEvents();
    await seedBookings();

    console.log("Database seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
