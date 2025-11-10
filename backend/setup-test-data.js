import 'dotenv/config';
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

const CONFIG = {
  MESSAGE_COUNT: 300,
  MESSAGE_DAYS: 7,
  MEMBER_DELAY: 100,
  HOOK_WAIT: 1000,
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
        { ...user, passwordConfirm: user.password, emailVisibility: true },
        { email: user.email }
      );
      console.log(`✓ ${user.name} (${user.email})`);
      users.push({ ...record, password: user.password });
    } catch (error) {
      console.error(`✗ Failed to create ${user.email}:`, error.message);
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
        await pb.collection('space_members').create({ space: space.id, user: user.id, role: 'member' });
        console.log(`✓ ${user.name} → ${space.name}`);
        await new Promise(resolve => setTimeout(resolve, CONFIG.MEMBER_DELAY));
      } catch (error) {
        console.error(`✗ Failed: ${user.name} → ${space.name}`);
      }
    }
  }
}

async function createDMChats(spaces, users) {
  console.log('\n💬 Creating DM chats...');
  await pb.collection('users').authWithPassword(users[0].email, users[0].password);

  let created = 0, skipped = 0;
  for (const space of spaces) {
    for (let i = 0; i < users.length; i++) {
      for (let j = i + 1; j < users.length; j++) {
        const [id1, id2] = [users[i].id, users[j].id].sort();
        try {
          await pb.collection('chats').getFirstListItem(
            pb.filter('space = {:space} && type = "private" && participants.id ?= {:id1} && participants.id ?= {:id2}',
              { space: space.id, id1, id2 })
          );
          skipped++;
        } catch {
          try {
            await pb.collection('chats').create({ space: space.id, type: 'private', participants: [id1, id2] });
            console.log(`  ✓ ${users[i].name} ↔ ${users[j].name} in ${space.name}`);
            created++;
          } catch (error) {
            console.error(`  ✗ Failed DM: ${users[i].name} ↔ ${users[j].name}`);
          }
        }
      }
    }
  }
  console.log(`\n📊 DM chats: ${created} created, ${skipped} skipped`);
  return { created, skipped };
}

async function setupPublicChats(spaces, users) {
  console.log('\n💬 Setting up public chats...');
  const chats = [];
  const alice = users.find(u => u.name === 'Alice');

  // Re-auth as admin to access and update chats
  await pb.collection('_superusers').authWithPassword(ADMIN.email, ADMIN.password);

  for (const space of spaces) {
    try {
      const chatList = await pb.collection('chats').getFullList({
        filter: pb.filter('space = {:space} && type = "public"', { space: space.id })
      });

      if (chatList.length > 0) {
        const chat = chatList[0];
        if (alice) {
          await pb.collection('chats').update(chat.id, { created_by: alice.id });
        }
        console.log(`✓ ${space.name}: ${chat.name}${alice ? ' (created_by: Alice)' : ''}`);
        chats.push({ chat, space });
      } else {
        console.log(`⚠ No public chat in ${space.name}`);
      }
    } catch (error) {
      console.error(`✗ Failed to get chats for ${space.name}:`, error.message);
    }
  }
  return chats;
}

async function createMessages(chatData, users) {
  const { chat } = chatData;
  console.log(`\n✉️  Creating ${CONFIG.MESSAGE_COUNT} messages in ${chat.name}...`);

  const now = Date.now();
  const start = now - (CONFIG.MESSAGE_DAYS * 24 * 60 * 60 * 1000);
  const increment = (now - start) / CONFIG.MESSAGE_COUNT;

  const messagesPerUser = Math.ceil(CONFIG.MESSAGE_COUNT / users.length);
  let messageNum = 0;

  for (let userIdx = 0; userIdx < users.length && messageNum < CONFIG.MESSAGE_COUNT; userIdx++) {
    const user = users[userIdx];
    await pb.collection('users').authWithPassword(user.email, user.password);

    const userMessages = Math.min(messagesPerUser, CONFIG.MESSAGE_COUNT - messageNum);
    for (let i = 0; i < userMessages; i++, messageNum++) {
      try {
        await pb.collection('messages').create({
          chat: chat.id,
          sender: user.id,
          content: `Message ${messageNum + 1}`,
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

  console.log(`\n⏳ Waiting ${CONFIG.HOOK_WAIT}ms for auto-chat hook...`);
  await new Promise(resolve => setTimeout(resolve, CONFIG.HOOK_WAIT));

  const dmStats = await createDMChats(spaces, users);
  const chats = await setupPublicChats(spaces, users);

  for (const chatData of chats) {
    await createMessages(chatData, users);
  }

  console.log('\n✅ Setup complete!');
  console.log('\n📊 Summary:');
  console.log(`  - Users: ${users.length}`);
  console.log(`  - Spaces: ${spaces.length}`);
  console.log(`  - Public chats: ${chats.length}`);
  console.log(`  - DM chats: ${dmStats.created + dmStats.skipped}`);
  console.log(`  - Messages: ${chats.length * CONFIG.MESSAGE_COUNT}`);
  console.log('\n🔑 Credentials:');
  console.log(`  Admin: ${ADMIN.email} / ${ADMIN.password}`);
  console.log('  Users: a@test.com / 1234567890 (Alice)');
  console.log('         b@test.com / 1234567890 (Bob)');
}

main().catch(error => {
  console.error('\n❌ Error:', error);
  process.exit(1);
});
