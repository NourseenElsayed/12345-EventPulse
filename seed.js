require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = require('./config/db');

const User = require('./models/user.model');
const Category = require('./models/category.model');
const Event = require('./models/event.model');
const Registration = require('./models/registration.model');
const Message = require('./models/message.model');

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('Clearing existing data...');

    // Delete in the correct order because of model references
    await Message.deleteMany({});
    await Registration.deleteMany({});
    await Event.deleteMany({});
    await Category.deleteMany({});
    await User.deleteMany({});

    console.log('Old data cleared.');

    // Create admin user
    const hashedPassword = await bcrypt.hash('Admin12345', 10);

    const admin = await User.create({
      name: 'EventPulse Admin',
      email: 'admin@eventpulse.com',
      password: hashedPassword,
      role: 'admin'
    });

    // Create attendee users
    const attendee1 = await User.create({
      name: 'Ahmed Ali',
      email: 'ahmed@eventpulse.com',
      password: await bcrypt.hash('Ahmed12345', 10),
      role: 'attendee'
    });

    const attendee2 = await User.create({
      name: 'Sara Mohamed',
      email: 'sara@eventpulse.com',
      password: await bcrypt.hash('Sara12345', 10),
      role: 'attendee'
    });

    // Create categories
    const categories = await Category.insertMany([
      {
        name: 'Technology',
        description: 'Technology and software events'
      },
      {
        name: 'Business',
        description: 'Business, entrepreneurship and startup events'
      },
      {
        name: 'Education',
        description: 'Educational and learning events'
      }
    ]);

    // Create events
    const events = await Event.insertMany([
      {
        title: 'Web Development Workshop',
        description: 'A practical workshop about modern web development.',
        category: categories[0]._id,
        date: new Date('2026-09-15T10:00:00'),
        city: 'Cairo',
        venue: 'Cairo Technology Hub',
        capacity: 100,
        organizer: admin._id
      },
      {
        title: 'Startup Meetup',
        description: 'A meetup for entrepreneurs and startup enthusiasts.',
        category: categories[1]._id,
        date: new Date('2026-09-20T18:00:00'),
        city: 'Giza',
        venue: 'Innovation Center',
        capacity: 80,
        organizer: admin._id
      },
      {
        title: 'Future of Education',
        description: 'A discussion about technology and the future of education.',
        category: categories[2]._id,
        date: new Date('2026-10-05T11:00:00'),
        city: 'Alexandria',
        venue: 'Alexandria Conference Hall',
        capacity: 150,
        organizer: admin._id
      },
      {
        title: 'JavaScript Developers Conference',
        description: 'A conference for JavaScript developers and programmers.',
        category: categories[0]._id,
        date: new Date('2026-10-15T09:00:00'),
        city: 'Cairo',
        venue: 'Egypt International Exhibition Center',
        capacity: 200,
        organizer: admin._id
      }
    ]);

    // Create sample registrations
    await Registration.create([
      {
        event: events[0]._id,
        attendee: attendee1._id
      },
      {
        event: events[1]._id,
        attendee: attendee2._id
      }
    ]);

    // Create a sample message
    await Message.create({
      event: events[0]._id,
      sender: admin._id,
      text: 'Welcome to the Web Development Workshop!'
    });

    console.log('Database seeded successfully!');
    console.log(`Created ${categories.length} categories.`);
    console.log(`Created ${events.length} events.`);
    console.log('Created 1 admin and 2 attendees.');
    console.log('Created sample registrations and message.');

    await mongoose.connection.close();
    console.log('MongoDB connection closed.');

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedDatabase();