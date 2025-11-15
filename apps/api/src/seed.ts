import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from './entities/user.entity';
import { Organization } from './entities/organization.entity';

// This script seeds the database with test users
// Run with: npx ts-node apps/api/src/seed.ts

async function seed() {
  const dataSource = new DataSource({
    type: 'sqlite',
    database: 'database.sqlite',
    entities: [User, Organization],
    synchronize: false, // Don't auto-sync, we're just seeding
  });

  await dataSource.initialize();

  const orgRepo = dataSource.getRepository(Organization);
  const userRepo = dataSource.getRepository(User);

  // Create default organization if it doesn't exist
  let organization = await orgRepo.findOne({ where: { id: 1 } });
  if (!organization) {
    organization = orgRepo.create({ id: 1, name: 'Default Organization' });
    await orgRepo.save(organization);
    console.log('✅ Created default organization');
  }

  // Hash passwords
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create test users
  const testUsers = [
    {
      email: 'admin@test.com',
      password: hashedPassword,
      role: UserRole.ADMIN,
      organizationId: 1,
    },
    {
      email: 'user@test.com',
      password: hashedPassword,
      role: UserRole.USER,
      organizationId: 1,
    },
    {
      email: 'viewer@test.com',
      password: hashedPassword,
      role: UserRole.VIEWER,
      organizationId: 1,
    },
  ];

  for (const userData of testUsers) {
    const existingUser = await userRepo.findOne({ where: { email: userData.email } });
    if (!existingUser) {
      const user = userRepo.create(userData);
      await userRepo.save(user);
      console.log(`✅ Created user: ${userData.email} (${userData.role})`);
    } else {
      // Update existing user's role
      existingUser.role = userData.role;
      existingUser.password = hashedPassword;
      await userRepo.save(existingUser);
      console.log(`✅ Updated user: ${userData.email} (${userData.role})`);
    }
  }

  console.log('\n🎉 Seeding complete!');
  console.log('\n📋 Test Credentials:');
  console.log('Admin:  admin@test.com / password123');
  console.log('User:   user@test.com / password123');
  console.log('Viewer: viewer@test.com / password123');

  await dataSource.destroy();
}

seed().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});

