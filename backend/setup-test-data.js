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

const RANDOM_MESSAGES = [
  "Hey there!", "How's it going?", "Great!", "Sounds good", "Let me check",
  "I agree", "Not sure about that", "Makes sense", "Can you clarify?", "Perfect!",
  "Thanks!", "You're welcome", "No problem", "Sure thing", "Absolutely",
  "I think so", "Maybe", "Good point", "Interesting", "Tell me more",
  "Got it", "Okay", "Cool", "Nice", "Awesome", "Exactly", "Right",
  "I see", "Indeed", "For sure", "Definitely", "Perhaps", "Probably",
  "Let's do it", "Sounds like a plan", "I'm on it", "Working on it",
  "Done", "Almost there", "In progress", "Give me a sec", "One moment",
  "Be right back", "Here now", "Ready when you are", "All set",
  "What do you think?", "Any thoughts?", "How about this?", "Good idea?",
  "Should we?", "Want to?", "Ready?", "Now?", "Later?", "Today?",
  "Tomorrow?", "This week?", "Next week?", "Soon?", "Eventually?",
  "Quick question", "Just wondering", "By the way", "Oh and",
  "Also", "Plus", "Additionally", "Furthermore", "Moreover",
  "On another note", "Speaking of which", "That reminds me",
  "Good morning!", "Good afternoon!", "Good evening!", "Good night!",
  "See you!", "Talk soon!", "Catch you later!", "Take care!",
  "Have a good one!", "Cheers!", "Best!", "Regards!",
  "lol", "haha", "hehe", "😊", "👍", "👌", "🎉", "🚀",
  "Agreed", "Noted", "Confirmed", "Acknowledged", "Understood",
  "Will do", "On my way", "Almost done", "Just finished"
];

function getRandomMessage() {
  return RANDOM_MESSAGES[Math.floor(Math.random() * RANDOM_MESSAGES.length)];
}

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
      console.error(`✗ Failed to create user ${user.email}:`, error.message);
    }
  }

  return createdUsers;
}

async function createSpaces(adminUser) {
  console.log('\n🏢 Creating spaces...');
  const createdSpaces = [];

  // Login as admin user to create spaces
  await pb.collection('users').authWithPassword(adminUser.email, '1234567890');

  for (const space of SPACES) {
    try {
      const record = await pb.collection('spaces').create({
        name: space.name,
        created_by: adminUser.id
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

  for (const space of spaces) {
    for (const user of users) {
      try {
        await pb.collection('space_members').create({
          space: space.id,
          user: user.id,
          role: 'member'
        });
        console.log(`✓ Added ${user.name} to ${space.name}`);
      } catch (error) {
        console.error(`✗ Failed to add ${user.name} to ${space.name}:`, error.message);
      }
    }
  }
}

async function getPublicChats(spaces) {
  console.log('\n💬 Finding public chats...');
  const chats = [];

  for (const space of spaces) {
    try {
      const chatList = await pb.collection('chats').getFullList({
        filter: `space = "${space.id}" && type = "public"`,
        sort: '-created'
      });

      if (chatList.length > 0) {
        console.log(`✓ Found public chat in ${space.name}: ${chatList[0].name}`);
        chats.push({ chat: chatList[0], space });
      } else {
        console.log(`⚠ No public chat found in ${space.name}`);
      }
    } catch (error) {
      console.error(`✗ Failed to get chats for ${space.name}:`, error.message);
    }
  }

  return chats;
}

async function createMessages(chatData, users) {
  console.log('\n✉️  Creating messages...');
  const { chat, space } = chatData;

  console.log(`Adding 300 messages to ${chat.name} in ${space.name}...`);
  let successCount = 0;

  for (let i = 0; i < 300; i++) {
    // Randomly pick a user
    const user = users[Math.floor(Math.random() * users.length)];

    // Login as that user
    await pb.collection('users').authWithPassword(user.email, '1234567890');

    try {
      await pb.collection('messages').create({
        chat: chat.id,
        sender: user.id,
        content: getRandomMessage(),
        type: 'text'
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

    // Create spaces
    const spaces = await createSpaces(users[0]);
    if (spaces.length < 2) {
      console.error('\n✗ Failed to create required spaces. Exiting.');
      process.exit(1);
    }

    // Add members to spaces
    await addMembersToSpaces(spaces, users);

    // Wait a bit for auto-chat creation hook to complete
    console.log('\n⏳ Waiting for auto-chat creation hook...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get public chats
    const chats = await getPublicChats(spaces);

    // Create messages in each chat
    for (const chatData of chats) {
      await createMessages(chatData, users);
    }

    console.log('\n✅ Setup complete!');
    console.log('\n📊 Summary:');
    console.log(`  - Users created: ${users.length}`);
    console.log(`  - Spaces created: ${spaces.length}`);
    console.log(`  - Public chats found: ${chats.length}`);
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
