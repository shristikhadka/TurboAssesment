const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

async function seed() {
  console.log('🌱 Starting database seed...\n');

  // Hash password
  const hashedPassword = await bcrypt.hash('password123', 10);

  return new Promise((resolve, reject) => {
    // Create organization if it doesn't exist
    db.run(
      `INSERT OR IGNORE INTO organizations (id, name, createdAt, updatedAt) 
       VALUES (1, 'Default Organization', datetime('now'), datetime('now'))`,
      function(err) {
        if (err) {
          console.error('Error creating organization:', err);
          return reject(err);
        }
        console.log('✅ Organization created/verified');
      }
    );

    // Create users
    const users = [
      { email: 'admin@test.com', role: 'ADMIN' },
      { email: 'user@test.com', role: 'USER' },
      { email: 'viewer@test.com', role: 'VIEWER' },
    ];

    let completed = 0;
    users.forEach((userData) => {
      // Check if user exists
      db.get(
        'SELECT id FROM users WHERE email = ?',
        [userData.email],
        (err, row) => {
          if (err) {
            console.error(`Error checking user ${userData.email}:`, err);
            return;
          }

          if (row) {
            // Update existing user
            db.run(
              `UPDATE users SET password = ?, role = ?, updatedAt = datetime('now') WHERE email = ?`,
              [hashedPassword, userData.role, userData.email],
              function(updateErr) {
                if (updateErr) {
                  console.error(`Error updating user ${userData.email}:`, updateErr);
                } else {
                  console.log(`✅ Updated user: ${userData.email} (${userData.role})`);
                }
                completed++;
                if (completed === users.length) {
                  finish();
                }
              }
            );
          } else {
            // Create new user
            db.run(
              `INSERT INTO users (email, password, role, organization_id, createdAt, updatedAt) 
               VALUES (?, ?, ?, 1, datetime('now'), datetime('now'))`,
              [userData.email, hashedPassword, userData.role],
              function(insertErr) {
                if (insertErr) {
                  console.error(`Error creating user ${userData.email}:`, insertErr);
                } else {
                  console.log(`✅ Created user: ${userData.email} (${userData.role})`);
                }
                completed++;
                if (completed === users.length) {
                  finish();
                }
              }
            );
          }
        }
      );
    });

    function finish() {
      console.log('\n🎉 Seeding complete!');
      console.log('\n📋 Test Credentials:');
      console.log('Admin:  admin@test.com / password123');
      console.log('User:   user@test.com / password123');
      console.log('Viewer: viewer@test.com / password123\n');
      db.close();
      resolve();
    }
  });
}

seed().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});

