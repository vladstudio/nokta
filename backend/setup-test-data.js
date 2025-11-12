import 'dotenv/config';
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

const CONFIG = {
  MESSAGE_COUNT: 300,
  MESSAGE_DAYS: 7,
  PROGRESS_STEP: 50
};

if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
  console.error('✗ Missing environment variables\n');
  console.error('Create backend/.env file with:');
  console.error('  ADMIN_EMAIL=your@email.com');
  console.error('  ADMIN_PASSWORD=yourpassword\n');
  console.error('See backend/.env.example for reference');
  process.exit(1);
}

const ADMIN = {
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD
};

const USERS = [
  { email: 'a@test.com', password: '1234567890', name: 'Alice' },
  { email: 'b@test.com', password: '1234567890', name: 'Bob' },
  { email: 'c@test.com', password: '1234567890', name: 'Colin' }
];

const SPACES = [
  { name: 'Team Alpha' },
  { name: 'Team Beta' }
];

async function getOrCreate(collection, filter, data, params = {}) {
  try {
    return await pb.collection(collection).getFirstListItem(pb.filter(filter, params));
  } catch {
    return await pb.collection(collection).create(data);
  }
}

async function ensureAdmin() {
  console.log('\n👑 Checking admin account...');
  try {
    await pb.collection('_superusers').authWithPassword(ADMIN.email, ADMIN.password);
    console.log(`✓ Logged in as admin: ${ADMIN.email}`);
  } catch {
    console.log('⚠️  Admin account not found\n');
    console.log('Create admin at http://127.0.0.1:8090/_/');
    console.log(`Email: ${ADMIN.email}`);
    console.log(`Password: ${ADMIN.password}\n`);
    process.exit(1);
  }
}

async function createUsers() {
  console.log('\n📝 Creating users...');
  const users = [];
  for (const user of USERS) {
    try {
      const record = await getOrCreate(
        'users',
        'email = {:email}',
        { ...user, passwordConfirm: user.password, emailVisibility: true, role: 'Member' },
        { email: user.email }
      );
      console.log(`✓ ${user.name} (${user.email})`);
      users.push({ ...record, password: user.password });
    } catch (error) {
      console.error(`✗ Failed to create ${user.email}:`, error.message);
    }
  }

  // Make Alice an admin
  const alice = users.find(u => u.name === 'Alice');
  if (alice) {
    try {
      await pb.collection('users').update(alice.id, { role: 'Admin' });
      console.log('✓ Alice promoted to Admin');
    } catch (error) {
      console.error('✗ Failed to promote Alice:', error.message);
    }
  }

  return users;
}

async function createSpaces() {
  console.log('\n🏢 Creating spaces...');
  const spaces = [];
  for (const space of SPACES) {
    try {
      const record = await pb.collection('spaces').create(space);
      console.log(`✓ Created ${space.name}`);
      spaces.push(record);
    } catch (error) {
      console.error(`✗ Failed to create ${space.name}:`, error.message);
    }
  }
  return spaces;
}

async function addMembers(spaces, users) {
  console.log('\n👥 Adding members...');
  for (const space of spaces) {
    for (const user of users) {
      try {
        await pb.collection('space_members').create({ space: space.id, user: user.id });
        console.log(`✓ ${user.name} → ${space.name}`);
      } catch (error) {
        console.error(`✗ Failed: ${user.name} → ${space.name}`);
      }
    }
  }
}

async function createTestChat(space, users) {
  console.log('\n💬 Creating test chat...');
  const alice = users.find(u => u.name === 'Alice');
  const bob = users.find(u => u.name === 'Bob');

  if (!alice || !bob) {
    throw new Error('Alice or Bob not found');
  }

  await pb.collection('users').authWithPassword(alice.email, alice.password);

  try {
    const chat = await pb.collection('chats').create({
      space: space.id,
      participants: [alice.id, bob.id],
      created_by: alice.id
    });
    console.log(`✓ Created chat between Alice and Bob in ${space.name}`);
    return chat;
  } catch (error) {
    console.error(`✗ Failed to create chat:`, error.message);
    throw error;
  }
}

async function createMessages(chat, users) {
  console.log(`\n✉️  Creating ${CONFIG.MESSAGE_COUNT} messages...`);

  const now = Date.now();
  const start = now - (CONFIG.MESSAGE_DAYS * 24 * 60 * 60 * 1000);
  const increment = (now - start) / CONFIG.MESSAGE_COUNT;

  let messageNum = 0;

  for (let i = 0; i < CONFIG.MESSAGE_COUNT; i++, messageNum++) {
    const user = users[Math.floor(Math.random() * users.length)];
    await pb.collection('users').authWithPassword(user.email, user.password);

    try {
      await pb.collection('messages').create({
        chat: chat.id,
        sender: user.id,
        content: `Message ${messageNum + 1} from ${user.name}`,
        type: 'text',
        created: new Date(start + increment * messageNum).toISOString()
      });

      if ((messageNum + 1) % CONFIG.PROGRESS_STEP === 0) {
        console.log(`  ${messageNum + 1}/${CONFIG.MESSAGE_COUNT}...`);
      }
    } catch (error) {
      console.error(`  ✗ Failed message ${messageNum + 1}:`, error.message);
    }
  }
  console.log(`✓ Created ${messageNum} messages`);
}

async function main() {
  console.log('🚀 PocketBase Test Data Setup\n');
  console.log('===============================');

  try {
    await pb.health.check();
    console.log('✓ PocketBase is running');
  } catch {
    console.error('✗ PocketBase is not running\n  Run: cd backend && ./pocketbase serve');
    process.exit(1);
  }

  await ensureAdmin();

  const users = await createUsers();
  if (users.length < 2) {
    console.error('\n✗ Failed to create users');
    process.exit(1);
  }

  const spaces = await createSpaces();
  if (spaces.length < 2) {
    console.error('\n✗ Failed to create spaces');
    process.exit(1);
  }

  await addMembers(spaces, users);

  const chat = await createTestChat(spaces[0], users);
  await createMessages(chat, users);

  console.log('\n✅ Setup complete!');
  console.log('\n📊 Summary:');
  console.log(`  - Users: ${users.length}`);
  console.log(`  - Spaces: ${spaces.length}`);
  console.log(`  - Chats: 1 (Alice + Bob)`);
  console.log(`  - Messages: ${CONFIG.MESSAGE_COUNT}`);
  console.log('\n🔑 Credentials:');
  console.log(`  Admin: ${ADMIN.email} / ${ADMIN.password}`);
  console.log('  Users: a@test.com / 1234567890 (Alice)');
  console.log('         b@test.com / 1234567890 (Bob)');
}

main().catch(error => {
  console.error('\n❌ Error:', error);
  process.exit(1);
});
