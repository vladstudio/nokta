import 'dotenv/config';
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

const CONFIG = {
  USER_COUNT: 30,
  CHAT_COUNT: 30,
  MESSAGE_DAYS: 12,
  PROGRESS_STEP: 100
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

const SPACES = [
  { name: 'Team Alpha' },
  { name: 'Team Beta' }
];

// Sample names for random user generation
const FIRST_NAMES = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack', 'Kate', 'Liam', 'Mia', 'Noah', 'Olivia', 'Peter', 'Quinn', 'Rachel', 'Sam', 'Tina', 'Uma', 'Victor', 'Wendy', 'Xavier', 'Yara', 'Zara', 'Adam', 'Belle', 'Chloe', 'David'];

const SAMPLE_MESSAGES = [
  'Hey, how are you?',
  'Just finished the project',
  'Let me know when you are free',
  'That sounds great!',
  'Can you review this?',
  'Meeting tomorrow at 10am',
  'Done with the initial design',
  'What do you think about this approach?',
  'Thanks for the feedback',
  'I agree with that',
  'Let me check and get back to you',
  'This is looking good',
  'Need your input on this',
  'All set for the demo',
  'Great work everyone!',
  'Just merged the PR',
  'Anyone free for a quick sync?',
  'Updated the documentation',
  'Tests are passing now',
  'Ready for deployment'
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
  console.log(`\n📝 Creating ${CONFIG.USER_COUNT} users...`);
  const users = [];
  
  for (let i = 0; i < CONFIG.USER_COUNT; i++) {
    const name = FIRST_NAMES[i % FIRST_NAMES.length];
    const email = `user${i + 1}@test.com`;
    const password = '1234567890';
    
    try {
      const record = await getOrCreate(
        'users',
        'email = {:email}',
        { 
          email, 
          name: `${name} ${i + 1}`,
          password, 
          passwordConfirm: password, 
          emailVisibility: true, 
          role: 'Member' 
        },
        { email }
      );
      users.push({ ...record, password });
      
      if ((i + 1) % 10 === 0) {
        console.log(`✓ Created ${i + 1}/${CONFIG.USER_COUNT} users`);
      }
    } catch (error) {
      console.error(`✗ Failed to create ${email}:`, error.message);
    }
  }
  
  console.log(`✓ Total users created: ${users.length}`);
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
  console.log('\n👥 Adding members to spaces...');
  let count = 0;
  
  for (const space of spaces) {
    for (const user of users) {
      try {
        await pb.collection('space_members').create({ space: space.id, user: user.id });
        count++;
        
        if (count % 30 === 0) {
          console.log(`✓ Added ${count} members to spaces`);
        }
      } catch (error) {
        // Silently skip duplicates
      }
    }
  }
  
  console.log(`✓ Total members added: ${count}`);
}

function getRandomParticipants(users, count = 2) {
  const shuffled = [...users].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.max(count, Math.floor(Math.random() * users.length) + 2)).map(u => u.id);
}

async function createChats(spaces, users) {
  console.log(`\n💬 Creating ${CONFIG.CHAT_COUNT} chats...`);
  const chats = [];
  
  // Use first user as creator for all chats
  const creator = users[0];
  await pb.collection('users').authWithPassword(creator.email, creator.password);
  
  for (let i = 0; i < CONFIG.CHAT_COUNT; i++) {
    try {
      const space = spaces[i % spaces.length];
      const participants = getRandomParticipants(users);
      
      const chat = await pb.collection('chats').create({
        space: space.id,
        participants,
        created_by: creator.id
      });
      
      chats.push(chat);
      
      if ((i + 1) % 10 === 0) {
        console.log(`✓ Created ${i + 1}/${CONFIG.CHAT_COUNT} chats`);
      }
    } catch (error) {
      console.error(`✗ Failed to create chat ${i + 1}:`, error.message);
    }
  }
  
  console.log(`✓ Total chats created: ${chats.length}`);
  return chats;
}

async function createMessages(chats, users) {
  console.log(`\n✉️  Creating messages for ${chats.length} chats...`);
  
  let totalMessages = 0;
  
  for (let chatIdx = 0; chatIdx < chats.length; chatIdx++) {
    const chat = chats[chatIdx];
    const messageCount = Math.floor(Math.random() * 291) + 10; // 10 to 300
    
    const startDate = new Date('2025-01-01');
    
    for (let msgIdx = 0; msgIdx < messageCount; msgIdx++) {
      try {
        const user = users[Math.floor(Math.random() * users.length)];
        await pb.collection('users').authWithPassword(user.email, user.password);
        
        // Random offset in hours (1-12)
        const hourOffset = Math.floor(Math.random() * 12) + 1;
        const messageDate = new Date(startDate);
        messageDate.setHours(messageDate.getHours() + (chatIdx * CONFIG.MESSAGE_DAYS * 24) + (msgIdx * 0.5) + (Math.random() * hourOffset));
        
        const message = SAMPLE_MESSAGES[Math.floor(Math.random() * SAMPLE_MESSAGES.length)];
        
        await pb.collection('messages').create({
          chat: chat.id,
          sender: user.id,
          content: message,
          type: 'text',
          created: messageDate.toISOString()
        });
        
        totalMessages++;
      } catch (error) {
        // Log but continue
        console.error(`  ✗ Failed to create message in chat ${chatIdx + 1}:`, error.message);
      }
    }
    
    if ((chatIdx + 1) % 5 === 0) {
      console.log(`✓ Processed ${chatIdx + 1}/${chats.length} chats (${totalMessages} messages so far)`);
    }
  }
  
  console.log(`✓ Total messages created: ${totalMessages}`);
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

  const chats = await createChats(spaces, users);
  if (chats.length === 0) {
    console.error('\n✗ Failed to create chats');
    process.exit(1);
  }

  await createMessages(chats, users);

  console.log('\n✅ Setup complete!');
  console.log('\n📊 Summary:');
  console.log(`  - Users: ${users.length}`);
  console.log(`  - Spaces: ${spaces.length}`);
  console.log(`  - Chats: ${chats.length}`);
  console.log(`\n🔑 Credentials:`);
  console.log(`  Admin: ${ADMIN.email} / ${ADMIN.password}`);
  console.log('  Test users: user1@test.com through user30@test.com / 1234567890');
}

main().catch(error => {
  console.error('\n❌ Error:', error);
  process.exit(1);
});
