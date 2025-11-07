/**
 * Setup script to populate PocketBase with test data
 * Run with: node setup-test-data.js
 */

import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

const ADMIN = {
  email: 'vlad@vlad.studio',
  password: '1234567890'
};

const USERS = [
  { email: 'a@test.com', password: '1234567890', name: 'Alice' },
  { email: 'b@test.com', password: '1234567890', name: 'Bob' }
];

const SPACES = [
  { name: 'Team Alpha' },
  { name: 'Team Beta' }
];

async function ensureAdmin() {
  console.log('\n👑 Checking admin account...');

  try {
    // Try to login with the expected admin credentials
    await pb.admins.authWithPassword(ADMIN.email, ADMIN.password);
    console.log(`✓ Logged in as admin: ${ADMIN.email}`);
    return true;
  } catch (loginError) {
    console.log('⚠️  Admin account not found or wrong credentials');
    console.log('');
    console.log('Please create an admin account manually:');
    console.log(`  1. Visit: http://127.0.0.1:8090/_/`);
    console.log(`  2. Create admin with:`);
    console.log(`     Email: ${ADMIN.email}`);
    console.log(`     Password: ${ADMIN.password}`);
    console.log('  3. Run this script again');
    console.log('');
    process.exit(1);
  }
}

async function createUsers() {
  console.log('\n📝 Creating users...');
  const createdUsers = [];

  for (const user of USERS) {
    try {
      const record = await pb.collection('users').create({
        email: user.email,
        password: user.password,
        passwordConfirm: user.password,
        name: user.name,
        emailVisibility: true
      });
      console.log(`✓ Created user: ${user.name} (${user.email})`);
      createdUsers.push(record);
    } catch (error) {
      // If user already exists, fetch it instead
      if (error.response?.data?.email?.code === 'validation_not_unique') {
        try {
          const existing = await pb.collection('users').getFirstListItem(`email="${user.email}"`);
          console.log(`ℹ️  User already exists: ${user.name} (${user.email})`);
          createdUsers.push(existing);
        } catch (fetchError) {
          console.error(`✗ Failed to fetch existing user ${user.email}:`, fetchError.message);
        }
      } else {
        console.error(`✗ Failed to create user ${user.email}:`, error.message);
      }
    }
  }

  return createdUsers;
}

async function createSpaces() {
  console.log('\n🏢 Creating spaces...');
  const createdSpaces = [];

  // Stay authenticated as admin (already authenticated in ensureAdmin)
  for (const space of SPACES) {
    try {
      const record = await pb.collection('spaces').create({
        name: space.name
      });
      console.log(`✓ Created space: ${space.name}`);
      createdSpaces.push(record);
    } catch (error) {
      console.error(`✗ Failed to create space ${space.name}:`, error.message);
    }
  }

  return createdSpaces;
}

async function addMembersToSpaces(spaces, users) {
  console.log('\n👥 Adding members to spaces...');

  // Already authenticated as admin from ensureAdmin()
  for (const space of spaces) {
    for (const user of users) {
      try {
        await pb.collection('space_members').create({
          space: space.id,
          user: user.id,
          role: 'member'
        });
        console.log(`✓ Added ${user.name} to ${space.name}`);
        // Small delay to avoid race condition with hook
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`✗ Failed to add ${user.name} to ${space.name}:`, error.message);
      }
    }
  }
}

async function createDMChats(spaces, users) {
  console.log('\n💬 Creating DM chats between members...');

  // Login as first user to create chats
  await pb.collection('users').authWithPassword(users[0].email, '1234567890');

  let totalCreated = 0;
  let totalSkipped = 0;

  for (const space of spaces) {
    // Create DM between every pair of users in this space
    for (let i = 0; i < users.length; i++) {
      for (let j = i + 1; j < users.length; j++) {
        const user1 = users[i];
        const user2 = users[j];
        const sortedIds = [user1.id, user2.id].sort();

        try {
          // Check if DM already exists
          const existing = await pb.collection('chats').getFirstListItem(
            `space = "${space.id}" && type = "private" && participants.id ?= "${sortedIds[0]}" && participants.id ?= "${sortedIds[1]}"`
          );
          console.log(`  ℹ️  DM already exists: ${user1.name} ↔ ${user2.name} in ${space.name}`);
          totalSkipped++;
        } catch (notFoundError) {
          // DM doesn't exist, create it
          try {
            await pb.collection('chats').create({
              space: space.id,
              type: 'private',
              participants: sortedIds
            });
            console.log(`  ✓ Created DM: ${user1.name} ↔ ${user2.name} in ${space.name}`);
            totalCreated++;
          } catch (createError) {
            console.error(`  ✗ Failed to create DM: ${user1.name} ↔ ${user2.name}:`, createError.message);
          }
        }
      }
    }
  }

  console.log(`\n📊 DM chats: ${totalCreated} created, ${totalSkipped} already existed`);
  return { created: totalCreated, skipped: totalSkipped };
}

async function getPublicChats(spaces, users) {
  console.log('\n💬 Finding public chats...');
  const chats = [];

  // Login as first user to access chats
  await pb.collection('users').authWithPassword(users[0].email, '1234567890');

  for (const space of spaces) {
    try {
      const chatList = await pb.collection('chats').getFullList({
        filter: `space = "${space.id}" && type = "public"`
      });

      if (chatList.length > 0) {
        console.log(`✓ Found public chat in ${space.name}: ${chatList[0].name}`);
        chats.push({ chat: chatList[0], space });
      } else {
        console.log(`⚠ No public chat found in ${space.name}`);
      }
    } catch (error) {
      console.error(`✗ Failed to get chats for ${space.name}:`, error.message);
      if (error.response) {
        console.error('Response data:', JSON.stringify(error.response.data, null, 2));
      }
    }
  }

  return chats;
}

async function createMessages(chatData, users) {
  console.log('\n✉️  Creating messages...');
  const { chat, space } = chatData;

  console.log(`Adding 300 messages to ${chat.name} in ${space.name}...`);
  let successCount = 0;

  // Spread messages over the past 7 days
  const now = Date.now();
  const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
  const timeIncrement = (now - sevenDaysAgo) / 300; // Evenly space messages

  for (let i = 0; i < 300; i++) {
    // Randomly pick a user
    const user = users[Math.floor(Math.random() * users.length)];

    // Login as that user
    await pb.collection('users').authWithPassword(user.email, '1234567890');

    // Calculate timestamp for this message (spread chronologically)
    const messageTime = new Date(sevenDaysAgo + (timeIncrement * i));

    try {
      await pb.collection('messages').create({
        chat: chat.id,
        sender: user.id,
        content: `Message ${i + 1}`,
        type: 'text',
        created: messageTime.toISOString()
      });
      successCount++;

      if ((i + 1) % 50 === 0) {
        console.log(`  ${i + 1}/300 messages created...`);
      }
    } catch (error) {
      console.error(`  ✗ Failed to create message ${i + 1}:`, error.message);
    }
  }

  console.log(`✓ Created ${successCount}/300 messages in ${chat.name}`);
}

async function main() {
  console.log('🚀 PocketBase Test Data Setup\n');
  console.log('===============================');

  try {
    // Check if PocketBase is running
    try {
      await pb.health.check();
      console.log('✓ PocketBase is running');
    } catch (error) {
      console.error('✗ PocketBase is not running. Please start it first.');
      console.error('  Run: cd backend && ./pocketbase serve');
      process.exit(1);
    }

    // Ensure admin account exists
    await ensureAdmin();

    // Create users
    const users = await createUsers();
    if (users.length < 2) {
      console.error('\n✗ Failed to create required users. Exiting.');
      process.exit(1);
    }

    // Create spaces (stays authenticated as admin)
    const spaces = await createSpaces();
    if (spaces.length < 2) {
      console.error('\n✗ Failed to create required spaces. Exiting.');
      process.exit(1);
    }

    // Add members to spaces (already authenticated as admin)
    await addMembersToSpaces(spaces, users);

    // Wait a bit for auto-chat creation hook to complete
    console.log('\n⏳ Waiting for auto-chat creation hook...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create DM chats between all members (in case hook missed any due to race conditions)
    const dmStats = await createDMChats(spaces, users);

    // Get public chats
    const chats = await getPublicChats(spaces, users);

    // Create messages in each chat
    for (const chatData of chats) {
      await createMessages(chatData, users);
    }

    console.log('\n✅ Setup complete!');
    console.log('\n📊 Summary:');
    console.log(`  - Users created: ${users.length}`);
    console.log(`  - Spaces created: ${spaces.length}`);
    console.log(`  - Public chats: ${chats.length}`);
    console.log(`  - DM chats: ${dmStats.created + dmStats.skipped} (${dmStats.created} created, ${dmStats.skipped} from hook)`);
    console.log(`  - Messages created: ${chats.length * 300}`);
    console.log('\n🔑 Credentials:');
    console.log('  Admin (PocketBase Dashboard):');
    console.log(`    - ${ADMIN.email} / ${ADMIN.password}`);
    console.log('  Test Users (Frontend App):');
    console.log('    - a@test.com / 1234567890 (Alice)');
    console.log('    - b@test.com / 1234567890 (Bob)');

  } catch (error) {
    console.error('\n❌ Error during setup:', error);
    process.exit(1);
  }
}

main();
