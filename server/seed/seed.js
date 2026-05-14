import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import { ROLES } from '../utils/constants.js';

async function seed() {
  await connectDB();

  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin123!';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: 'Admin User',
      email: adminEmail,
      password: adminPassword,
      role: ROLES.ADMIN,
    });
    console.log('Created admin:', adminEmail);
  } else if (admin.role !== ROLES.ADMIN) {
    admin.role = ROLES.ADMIN;
    await admin.save();
    console.log('Promoted existing user to admin:', adminEmail);
  }

  const memberEmail = process.env.SEED_MEMBER_EMAIL || 'member@example.com';
  const memberPassword = process.env.SEED_MEMBER_PASSWORD || 'Member123!';
  let member = await User.findOne({ email: memberEmail });
  if (!member) {
    member = await User.create({
      name: 'Demo Member',
      email: memberEmail,
      password: memberPassword,
      role: ROLES.MEMBER,
    });
    console.log('Created member:', memberEmail);
  }

  const existingDemoProject = await Project.findOne({ title: 'Website Redesign' });
  if (!existingDemoProject) {
    const project = await Project.create({
      title: 'Website Redesign',
      description: 'Refresh marketing site and onboarding flow.',
      status: 'Active',
      members: [member._id],
      createdBy: admin._id,
    });

    await Task.create([
      {
        title: 'Draft information architecture',
        description: 'Outline main sections and navigation.',
        priority: 'High',
        status: 'In Progress',
        dueDate: new Date(Date.now() + 3 * 86400000),
        assignedTo: member._id,
        project: project._id,
        createdBy: admin._id,
      },
      {
        title: 'Collect brand assets',
        description: 'Logos, colors, typography from design team.',
        priority: 'Medium',
        status: 'Todo',
        dueDate: new Date(Date.now() + 7 * 86400000),
        assignedTo: member._id,
        project: project._id,
        createdBy: admin._id,
      },
    ]);
    console.log('Seeded demo project and tasks');
  }

  console.log('Seed complete.');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
