-- Demo Seed Data for Nokta Chat App
-- Run this after starting with a fresh database that has Jack (Admin) as user

-- First, let's get Jack's ID (assuming he's the first user)
-- We'll use placeholder IDs that PocketBase generates (15 char alphanumeric)

-- ============================================
-- USERS (6 new users + Jack already exists)
-- ============================================

-- Jack (Admin) - ID: 2z5t69695735ah0 - Tech enthusiast, busy professional
-- Already exists, but let's make sure he has proper data
UPDATE users SET
    name = 'Jack',
    birthday = '1992-03-15 00:00:00.000Z',
    last_seen = datetime('now'),
    role = 'Admin',
    banned = 0
WHERE name = 'Jack' OR role = 'Admin';

-- Emma (ID: emma00000000001) - Jack's sister, art teacher, warm personality
INSERT INTO users (id, email, name, password, tokenKey, birthday, last_seen, role, banned, created, updated) VALUES
('emma00000000001', 'emma@demo.local', 'Emma', '$2a$10$JvZ0fN8W6JkwKjXhNz0R0Ox.LkGhS0XhNz0R0Ox.LkGhS0XhNz0', 'token_emma_001', '1995-07-22 00:00:00.000Z', datetime('now', '-2 minutes'), 'Member', 0, datetime('now', '-30 days'), datetime('now'));

-- Mike (ID: mike00000000001) - College buddy, software dev, sarcastic humor
INSERT INTO users (id, email, name, password, tokenKey, birthday, last_seen, role, banned, created, updated) VALUES
('mike00000000001', 'mike@demo.local', 'Mike', '$2a$10$JvZ0fN8W6JkwKjXhNz0R0Ox.LkGhS0XhNz0R0Ox.LkGhS0XhNz0', 'token_mike_001', '1991-11-08 00:00:00.000Z', datetime('now', '-15 minutes'), 'Member', 0, datetime('now', '-30 days'), datetime('now'));

-- Sarah (ID: sarah0000000001) - Work colleague, project manager, organized
INSERT INTO users (id, email, name, password, tokenKey, birthday, last_seen, role, banned, created, updated) VALUES
('sarah0000000001', 'sarah@demo.local', 'Sarah', '$2a$10$JvZ0fN8W6JkwKjXhNz0R0Ox.LkGhS0XhNz0R0Ox.LkGhS0XhNz0', 'token_sarah_01', '1989-04-30 00:00:00.000Z', datetime('now', '-1 hour'), 'Member', 0, datetime('now', '-30 days'), datetime('now'));

-- Dad (ID: dad000000000001) - Jack's father, retired engineer, sends long messages
INSERT INTO users (id, email, name, password, tokenKey, birthday, last_seen, role, banned, created, updated) VALUES
('dad000000000001', 'dad@demo.local', 'Dad', '$2a$10$JvZ0fN8W6JkwKjXhNz0R0Ox.LkGhS0XhNz0R0Ox.LkGhS0XhNz0', 'token_dad_0001', '1958-12-03 00:00:00.000Z', datetime('now', '-3 hours'), 'Member', 0, datetime('now', '-30 days'), datetime('now'));

-- Mom (ID: mom000000000001) - Jack's mother, loves sharing recipes, caring
INSERT INTO users (id, email, name, password, tokenKey, birthday, last_seen, role, banned, created, updated) VALUES
('mom000000000001', 'mom@demo.local', 'Mom', '$2a$10$JvZ0fN8W6JkwKjXhNz0R0Ox.LkGhS0XhNz0R0Ox.LkGhS0XhNz0', 'token_mom_0001', '1961-05-18 00:00:00.000Z', datetime('now', '-45 minutes'), 'Member', 0, datetime('now', '-30 days'), datetime('now'));

-- Alex (ID: alex00000000001) - Neighbor, casual acquaintance, gym buddy
INSERT INTO users (id, email, name, password, tokenKey, birthday, last_seen, role, banned, created, updated) VALUES
('alex00000000001', 'alex@demo.local', 'Alex', '$2a$10$JvZ0fN8W6JkwKjXhNz0R0Ox.LkGhS0XhNz0R0Ox.LkGhS0XhNz0', 'token_alex_001', '1994-09-12 00:00:00.000Z', datetime('now', '-5 hours'), 'Member', 0, datetime('now', '-30 days'), datetime('now'));

-- ============================================
-- CHATS
-- ============================================

-- Get Jack's actual ID first (we'll reference it)
-- For now using placeholder, you may need to update this

-- Chat 1: Jack + Emma (siblings chat)
INSERT INTO chats (id, name, participants, last_message_at, last_message_content, last_message_sender, created_by, is_active_call, created, updated) VALUES
('chat_emma_jack01', '', '["2z5t69695735ah0","emma00000000001"]', datetime('now', '-5 minutes'), 'Can''t wait! See you Saturday 💕', 'emma00000000001', '2z5t69695735ah0', 0, datetime('now', '-25 days'), datetime('now'));

-- Chat 2: Jack + Mike (best friends)
INSERT INTO chats (id, name, participants, last_message_at, last_message_content, last_message_sender, created_by, is_active_call, created, updated) VALUES
('chat_mike_jack01', '', '["2z5t69695735ah0","mike00000000001"]', datetime('now', '-20 minutes'), 'lol yeah that''s exactly what happened', 'mike00000000001', 'mike00000000001', 0, datetime('now', '-28 days'), datetime('now'));

-- Chat 3: Jack + Sarah (work colleague)
INSERT INTO chats (id, name, participants, last_message_at, last_message_content, last_message_sender, created_by, is_active_call, created, updated) VALUES
('chat_sarah_jack1', '', '["2z5t69695735ah0","sarah0000000001"]', datetime('now', '-2 hours'), 'Perfect, I''ll send the updated specs by EOD', 'sarah0000000001', 'sarah0000000001', 0, datetime('now', '-20 days'), datetime('now'));

-- Chat 4: Jack + Dad
INSERT INTO chats (id, name, participants, last_message_at, last_message_content, last_message_sender, created_by, is_active_call, created, updated) VALUES
('chat_dad_jack001', '', '["2z5t69695735ah0","dad000000000001"]', datetime('now', '-4 hours'), 'Love you son. Talk soon.', 'dad000000000001', '2z5t69695735ah0', 0, datetime('now', '-30 days'), datetime('now'));

-- Chat 5: Jack + Mom
INSERT INTO chats (id, name, participants, last_message_at, last_message_content, last_message_sender, created_by, is_active_call, created, updated) VALUES
('chat_mom_jack001', '', '["2z5t69695735ah0","mom000000000001"]', datetime('now', '-1 hour'), 'Don''t forget to eat properly! 🍎', 'mom000000000001', '2z5t69695735ah0', 0, datetime('now', '-30 days'), datetime('now'));

-- Chat 6: Jack + Alex (gym buddy)
INSERT INTO chats (id, name, participants, last_message_at, last_message_content, last_message_sender, created_by, is_active_call, created, updated) VALUES
('chat_alex_jack01', '', '["2z5t69695735ah0","alex00000000001"]', datetime('now', '-6 hours'), 'See you at 7am then 💪', 'alex00000000001', 'alex00000000001', 0, datetime('now', '-15 days'), datetime('now'));

-- Chat 7: Jack's Quick Notes (self-chat)
INSERT INTO chats (id, name, participants, last_message_at, last_message_content, last_message_sender, created_by, is_active_call, created, updated) VALUES
('chat_notes_jack1', 'Quick Notes', '["2z5t69695735ah0"]', datetime('now', '-30 minutes'), 'API endpoint: /api/v2/users - need to test', '2z5t69695735ah0', '2z5t69695735ah0', 0, datetime('now', '-20 days'), datetime('now'));

-- Chat 8: Jack's Todos (self-chat)
INSERT INTO chats (id, name, participants, last_message_at, last_message_content, last_message_sender, created_by, is_active_call, created, updated) VALUES
('chat_todos_jack1', 'Todos', '["2z5t69695735ah0"]', datetime('now', '-1 hour'), '✅ Completed: Submit quarterly report', '2z5t69695735ah0', '2z5t69695735ah0', 0, datetime('now', '-18 days'), datetime('now'));

-- Chat 9: Family Group (Jack, Emma, Mom, Dad)
INSERT INTO chats (id, name, participants, last_message_at, last_message_content, last_message_sender, created_by, is_active_call, created, updated) VALUES
('chat_family_grp1', 'Family ❤️', '["2z5t69695735ah0","emma00000000001","mom000000000001","dad000000000001"]', datetime('now', '-3 hours'), 'See everyone Sunday!', 'mom000000000001', 'mom000000000001', 0, datetime('now', '-30 days'), datetime('now'));

-- ============================================
-- MESSAGES
-- ============================================

-- ============ CHAT: Jack + Emma (Siblings) - 25 messages ============
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_emja_0000001', 'chat_emma_jack01', '2z5t69695735ah0', 'text', 'Hey Em! How was the art class today?', datetime('now', '-2 days'), datetime('now', '-2 days'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_emja_0000002', 'chat_emma_jack01', 'emma00000000001', 'text', 'It was amazing! The kids painted sunflowers today 🌻', datetime('now', '-2 days', '+5 minutes'), datetime('now', '-2 days', '+5 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_emja_0000003', 'chat_emma_jack01', 'emma00000000001', 'text', 'One of them made a purple sunflower and said "because normal is boring" 😂', datetime('now', '-2 days', '+6 minutes'), datetime('now', '-2 days', '+6 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_emja_0000004', 'chat_emma_jack01', '2z5t69695735ah0', 'text', 'That kid gets it! Purple sunflowers are valid', datetime('now', '-2 days', '+10 minutes'), datetime('now', '-2 days', '+10 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_emja_0000005', 'chat_emma_jack01', 'emma00000000001', 'text', 'How''s work? Still doing that big project?', datetime('now', '-2 days', '+15 minutes'), datetime('now', '-2 days', '+15 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_emja_0000006', 'chat_emma_jack01', '2z5t69695735ah0', 'text', 'Yeah, deadline is next week. Stressful but manageable', datetime('now', '-2 days', '+20 minutes'), datetime('now', '-2 days', '+20 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_emja_0000007', 'chat_emma_jack01', 'emma00000000001', 'text', 'You got this! Remember to take breaks', datetime('now', '-2 days', '+22 minutes'), datetime('now', '-2 days', '+22 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_emja_0000008', 'chat_emma_jack01', '2z5t69695735ah0', 'text', 'Thanks sis ❤️', datetime('now', '-2 days', '+25 minutes'), datetime('now', '-2 days', '+25 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_emja_0000009', 'chat_emma_jack01', 'emma00000000001', 'text', 'Oh btw, are you coming to mom''s birthday dinner Saturday?', datetime('now', '-1 day'), datetime('now', '-1 day'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_emja_0000010', 'chat_emma_jack01', '2z5t69695735ah0', 'text', 'Of course! Wouldn''t miss it', datetime('now', '-1 day', '+2 minutes'), datetime('now', '-1 day', '+2 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_emja_0000011', 'chat_emma_jack01', '2z5t69695735ah0', 'text', 'What are we getting her?', datetime('now', '-1 day', '+3 minutes'), datetime('now', '-1 day', '+3 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_emja_0000012', 'chat_emma_jack01', 'emma00000000001', 'text', 'I was thinking we could split on that fancy tea set she''s been eyeing', datetime('now', '-1 day', '+10 minutes'), datetime('now', '-1 day', '+10 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_emja_0000013', 'chat_emma_jack01', '2z5t69695735ah0', 'text', 'The ceramic one from that artisan shop?', datetime('now', '-1 day', '+12 minutes'), datetime('now', '-1 day', '+12 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_emja_0000014', 'chat_emma_jack01', 'emma00000000001', 'text', 'Yes! That one. It''s $120 so $60 each?', datetime('now', '-1 day', '+15 minutes'), datetime('now', '-1 day', '+15 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_emja_0000015', 'chat_emma_jack01', '2z5t69695735ah0', 'text', 'Perfect. I''ll Venmo you my half', datetime('now', '-1 day', '+18 minutes'), datetime('now', '-1 day', '+18 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_emja_0000016', 'chat_emma_jack01', 'emma00000000001', 'text', 'Great! I''ll pick it up tomorrow', datetime('now', '-1 day', '+20 minutes'), datetime('now', '-1 day', '+20 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_emja_0000017', 'chat_emma_jack01', '2z5t69695735ah0', 'text', 'You''re the best organizer in the family', datetime('now', '-1 day', '+22 minutes'), datetime('now', '-1 day', '+22 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_emja_0000018', 'chat_emma_jack01', 'emma00000000001', 'text', 'Someone has to be 😄', datetime('now', '-1 day', '+25 minutes'), datetime('now', '-1 day', '+25 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_emja_0000019', 'chat_emma_jack01', '2z5t69695735ah0', 'text', 'Just sent the $60', datetime('now', '-5 hours'), datetime('now', '-5 hours'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_emja_0000020', 'chat_emma_jack01', 'emma00000000001', 'text', 'Got it, thanks!', datetime('now', '-5 hours', '+5 minutes'), datetime('now', '-5 hours', '+5 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_emja_0000021', 'chat_emma_jack01', 'emma00000000001', 'text', 'The shop had it gift wrapped too!', datetime('now', '-4 hours'), datetime('now', '-4 hours'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_emja_0000022', 'chat_emma_jack01', '2z5t69695735ah0', 'text', 'Awesome! Mom is going to love it', datetime('now', '-3 hours'), datetime('now', '-3 hours'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_emja_0000023', 'chat_emma_jack01', 'emma00000000001', 'text', 'I know right? I''m so excited to see her face', datetime('now', '-2 hours'), datetime('now', '-2 hours'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_emja_0000024', 'chat_emma_jack01', '2z5t69695735ah0', 'text', 'What time should I arrive Saturday?', datetime('now', '-10 minutes'), datetime('now', '-10 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_emja_0000025', 'chat_emma_jack01', 'emma00000000001', 'text', 'Can''t wait! See you Saturday 💕', datetime('now', '-5 minutes'), datetime('now', '-5 minutes'));

-- ============ CHAT: Jack + Mike (Best Friends) - 30 messages ============
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_mija_0000001', 'chat_mike_jack01', 'mike00000000001', 'text', 'Dude you see the new React 19 features?', datetime('now', '-3 days'), datetime('now', '-3 days'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_mija_0000002', 'chat_mike_jack01', '2z5t69695735ah0', 'text', 'Yeah! The compiler is insane', datetime('now', '-3 days', '+2 minutes'), datetime('now', '-3 days', '+2 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_mija_0000003', 'chat_mike_jack01', 'mike00000000001', 'text', 'No more memo() everywhere, finally', datetime('now', '-3 days', '+5 minutes'), datetime('now', '-3 days', '+5 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_mija_0000004', 'chat_mike_jack01', '2z5t69695735ah0', 'text', 'Already migrated my side project to it', datetime('now', '-3 days', '+8 minutes'), datetime('now', '-3 days', '+8 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_mija_0000005', 'chat_mike_jack01', 'mike00000000001', 'text', 'Of course you did 😂 Always first', datetime('now', '-3 days', '+10 minutes'), datetime('now', '-3 days', '+10 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_mija_0000006', 'chat_mike_jack01', '2z5t69695735ah0', 'text', 'You know me', datetime('now', '-3 days', '+12 minutes'), datetime('now', '-3 days', '+12 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_mija_0000007', 'chat_mike_jack01', 'mike00000000001', 'text', 'Hey wanna grab lunch tomorrow?', datetime('now', '-2 days'), datetime('now', '-2 days'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_mija_0000008', 'chat_mike_jack01', '2z5t69695735ah0', 'text', 'Can''t, got meetings all day', datetime('now', '-2 days', '+5 minutes'), datetime('now', '-2 days', '+5 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_mija_0000009', 'chat_mike_jack01', 'mike00000000001', 'text', 'F', datetime('now', '-2 days', '+6 minutes'), datetime('now', '-2 days', '+6 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_mija_0000010', 'chat_mike_jack01', '2z5t69695735ah0', 'text', 'Friday?', datetime('now', '-2 days', '+8 minutes'), datetime('now', '-2 days', '+8 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_mija_0000011', 'chat_mike_jack01', 'mike00000000001', 'text', 'Friday works. That new ramen place?', datetime('now', '-2 days', '+10 minutes'), datetime('now', '-2 days', '+10 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_mija_0000012', 'chat_mike_jack01', '2z5t69695735ah0', 'text', 'Yes! I''ve been wanting to try it', datetime('now', '-2 days', '+12 minutes'), datetime('now', '-2 days', '+12 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_mija_0000013', 'chat_mike_jack01', 'mike00000000001', 'text', 'The reviews look amazing', datetime('now', '-2 days', '+15 minutes'), datetime('now', '-2 days', '+15 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_mija_0000014', 'chat_mike_jack01', '2z5t69695735ah0', 'text', '12:30?', datetime('now', '-2 days', '+18 minutes'), datetime('now', '-2 days', '+18 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_mija_0000015', 'chat_mike_jack01', 'mike00000000001', 'text', 'Perfect', datetime('now', '-2 days', '+20 minutes'), datetime('now', '-2 days', '+20 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_mija_0000016', 'chat_mike_jack01', 'mike00000000001', 'text', 'Oh man, you won''t believe what happened in standup today', datetime('now', '-1 day'), datetime('now', '-1 day'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_mija_0000017', 'chat_mike_jack01', '2z5t69695735ah0', 'text', 'What?', datetime('now', '-1 day', '+2 minutes'), datetime('now', '-1 day', '+2 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_mija_0000018', 'chat_mike_jack01', 'mike00000000001', 'text', 'PM asked if we could "add AI" to literally everything', datetime('now', '-1 day', '+5 minutes'), datetime('now', '-1 day', '+5 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_mija_0000019', 'chat_mike_jack01', '2z5t69695735ah0', 'text', 'Oh no 😂', datetime('now', '-1 day', '+6 minutes'), datetime('now', '-1 day', '+6 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_mija_0000020', 'chat_mike_jack01', 'mike00000000001', 'text', '"Can the login button use AI?"', datetime('now', '-1 day', '+8 minutes'), datetime('now', '-1 day', '+8 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_mija_0000021', 'chat_mike_jack01', '2z5t69695735ah0', 'text', 'STOP 💀', datetime('now', '-1 day', '+9 minutes'), datetime('now', '-1 day', '+9 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_mija_0000022', 'chat_mike_jack01', 'mike00000000001', 'text', 'I wish I was joking', datetime('now', '-1 day', '+10 minutes'), datetime('now', '-1 day', '+10 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_mija_0000023', 'chat_mike_jack01', '2z5t69695735ah0', 'text', 'Classic PM moment', datetime('now', '-1 day', '+12 minutes'), datetime('now', '-1 day', '+12 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_mija_0000024', 'chat_mike_jack01', 'mike00000000001', 'text', 'At least the paycheck is good', datetime('now', '-1 day', '+15 minutes'), datetime('now', '-1 day', '+15 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_mija_0000025', 'chat_mike_jack01', '2z5t69695735ah0', 'text', 'That''s the spirit', datetime('now', '-1 day', '+18 minutes'), datetime('now', '-1 day', '+18 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_mija_0000026', 'chat_mike_jack01', 'mike00000000001', 'text', 'Still on for Friday?', datetime('now', '-3 hours'), datetime('now', '-3 hours'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_mija_0000027', 'chat_mike_jack01', '2z5t69695735ah0', 'text', 'Yeah! See you at the ramen place', datetime('now', '-2 hours'), datetime('now', '-2 hours'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_mija_0000028', 'chat_mike_jack01', 'mike00000000001', 'text', 'Great. Btw I tried their spicy tonkotsu yesterday', datetime('now', '-1 hour'), datetime('now', '-1 hour'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_mija_0000029', 'chat_mike_jack01', '2z5t69695735ah0', 'text', 'Wait you went without me??', datetime('now', '-45 minutes'), datetime('now', '-45 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_mija_0000030', 'chat_mike_jack01', 'mike00000000001', 'text', 'lol yeah that''s exactly what happened', datetime('now', '-20 minutes'), datetime('now', '-20 minutes'));

-- ============ CHAT: Jack + Sarah (Work Colleague) - 20 messages ============
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_saja_0000001', 'chat_sarah_jack1', 'sarah0000000001', 'text', 'Hi Jack, do you have the latest designs?', datetime('now', '-5 days'), datetime('now', '-5 days'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_saja_0000002', 'chat_sarah_jack1', '2z5t69695735ah0', 'text', 'Yes, sending them over now', datetime('now', '-5 days', '+5 minutes'), datetime('now', '-5 days', '+5 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_saja_0000003', 'chat_sarah_jack1', 'sarah0000000001', 'text', 'Thanks! The client wants to review them tomorrow', datetime('now', '-5 days', '+10 minutes'), datetime('now', '-5 days', '+10 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_saja_0000004', 'chat_sarah_jack1', '2z5t69695735ah0', 'text', 'All good, they''re ready for presentation', datetime('now', '-5 days', '+15 minutes'), datetime('now', '-5 days', '+15 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_saja_0000005', 'chat_sarah_jack1', 'sarah0000000001', 'text', 'Perfect! You''re a lifesaver', datetime('now', '-5 days', '+20 minutes'), datetime('now', '-5 days', '+20 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_saja_0000006', 'chat_sarah_jack1', 'sarah0000000001', 'text', 'Quick question - can you join the 3pm call?', datetime('now', '-3 days'), datetime('now', '-3 days'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_saja_0000007', 'chat_sarah_jack1', '2z5t69695735ah0', 'text', 'Which one? The stakeholder sync?', datetime('now', '-3 days', '+3 minutes'), datetime('now', '-3 days', '+3 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_saja_0000008', 'chat_sarah_jack1', 'sarah0000000001', 'text', 'Yes, they want to discuss the new feature scope', datetime('now', '-3 days', '+5 minutes'), datetime('now', '-3 days', '+5 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_saja_0000009', 'chat_sarah_jack1', '2z5t69695735ah0', 'text', 'I''ll be there', datetime('now', '-3 days', '+8 minutes'), datetime('now', '-3 days', '+8 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_saja_0000010', 'chat_sarah_jack1', 'sarah0000000001', 'text', 'Great, thanks Jack', datetime('now', '-3 days', '+10 minutes'), datetime('now', '-3 days', '+10 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_saja_0000011', 'chat_sarah_jack1', '2z5t69695735ah0', 'text', 'That call went better than expected!', datetime('now', '-2 days'), datetime('now', '-2 days'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_saja_0000012', 'chat_sarah_jack1', 'sarah0000000001', 'text', 'Right? They actually approved everything', datetime('now', '-2 days', '+5 minutes'), datetime('now', '-2 days', '+5 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_saja_0000013', 'chat_sarah_jack1', '2z5t69695735ah0', 'text', 'Your presentation skills are getting even better', datetime('now', '-2 days', '+8 minutes'), datetime('now', '-2 days', '+8 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_saja_0000014', 'chat_sarah_jack1', 'sarah0000000001', 'text', 'That means a lot, thanks! Team effort though', datetime('now', '-2 days', '+12 minutes'), datetime('now', '-2 days', '+12 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_saja_0000015', 'chat_sarah_jack1', '2z5t69695735ah0', 'text', 'Hey, any updates on the Q2 timeline?', datetime('now', '-4 hours'), datetime('now', '-4 hours'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_saja_0000016', 'chat_sarah_jack1', 'sarah0000000001', 'text', 'Still finalizing with leadership. Should know by tomorrow', datetime('now', '-3 hours'), datetime('now', '-3 hours'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_saja_0000017', 'chat_sarah_jack1', '2z5t69695735ah0', 'text', 'Sounds good. Just planning my sprint', datetime('now', '-3 hours', '+5 minutes'), datetime('now', '-3 hours', '+5 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_saja_0000018', 'chat_sarah_jack1', 'sarah0000000001', 'text', 'I''ll ping you as soon as I know', datetime('now', '-2 hours', '+30 minutes'), datetime('now', '-2 hours', '+30 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_saja_0000019', 'chat_sarah_jack1', '2z5t69695735ah0', 'text', 'Appreciate it!', datetime('now', '-2 hours', '+15 minutes'), datetime('now', '-2 hours', '+15 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_saja_0000020', 'chat_sarah_jack1', 'sarah0000000001', 'text', 'Perfect, I''ll send the updated specs by EOD', datetime('now', '-2 hours'), datetime('now', '-2 hours'));

-- ============ CHAT: Jack + Dad - 18 messages ============
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_daja_0000001', 'chat_dad_jack001', 'dad000000000001', 'text', 'Hello son! How are you doing? Your mother and I were just talking about you. We hope work isn''t too stressful. Remember when you used to build those little programs on the old computer? Look at you now!', datetime('now', '-4 days'), datetime('now', '-4 days'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_daja_0000002', 'chat_dad_jack001', '2z5t69695735ah0', 'text', 'Hi Dad! I''m doing great. Work is busy but I enjoy it', datetime('now', '-4 days', '+30 minutes'), datetime('now', '-4 days', '+30 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_daja_0000003', 'chat_dad_jack001', 'dad000000000001', 'text', 'That''s wonderful to hear. I was reading an article about artificial intelligence today. Fascinating stuff! Is that what you work on?', datetime('now', '-4 days', '+45 minutes'), datetime('now', '-4 days', '+45 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_daja_0000004', 'chat_dad_jack001', '2z5t69695735ah0', 'text', 'Sort of! We use some AI tools in our workflow', datetime('now', '-4 days', '+50 minutes'), datetime('now', '-4 days', '+50 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_daja_0000005', 'chat_dad_jack001', 'dad000000000001', 'text', 'The future is now! When I was your age, we thought video calls were science fiction. Now I''m texting you on my phone from the garden.', datetime('now', '-4 days', '+55 minutes'), datetime('now', '-4 days', '+55 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_daja_0000006', 'chat_dad_jack001', '2z5t69695735ah0', 'text', 'How''s the garden coming along?', datetime('now', '-4 days', '+60 minutes'), datetime('now', '-4 days', '+60 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_daja_0000007', 'chat_dad_jack001', 'dad000000000001', 'text', 'The tomatoes are doing wonderfully this year! I''ll save some for you. Nothing beats homegrown tomatoes, I always say. Your mother is making her famous sauce this weekend.', datetime('now', '-4 days', '+65 minutes'), datetime('now', '-4 days', '+65 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_daja_0000008', 'chat_dad_jack001', '2z5t69695735ah0', 'text', 'I can''t wait! Her sauce is the best', datetime('now', '-4 days', '+70 minutes'), datetime('now', '-4 days', '+70 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_daja_0000009', 'chat_dad_jack001', 'dad000000000001', 'text', 'Are you coming for your mother''s birthday? She''s been hinting about it all week.', datetime('now', '-2 days'), datetime('now', '-2 days'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_daja_0000010', 'chat_dad_jack001', '2z5t69695735ah0', 'text', 'Of course! Already have it in my calendar', datetime('now', '-2 days', '+20 minutes'), datetime('now', '-2 days', '+20 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_daja_0000011', 'chat_dad_jack001', 'dad000000000001', 'text', 'Excellent! She''ll be so happy. Between you and me, I got her that gardening book she wanted. Don''t tell her!', datetime('now', '-2 days', '+25 minutes'), datetime('now', '-2 days', '+25 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_daja_0000012', 'chat_dad_jack001', '2z5t69695735ah0', 'text', 'My lips are sealed 🤐', datetime('now', '-2 days', '+30 minutes'), datetime('now', '-2 days', '+30 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_daja_0000013', 'chat_dad_jack001', 'dad000000000001', 'text', 'Good man. How do I add those little pictures you just sent? Your mother wants to learn too.', datetime('now', '-2 days', '+35 minutes'), datetime('now', '-2 days', '+35 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_daja_0000014', 'chat_dad_jack001', '2z5t69695735ah0', 'text', 'They''re called emojis! I''ll show you when I visit', datetime('now', '-2 days', '+40 minutes'), datetime('now', '-2 days', '+40 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_daja_0000015', 'chat_dad_jack001', 'dad000000000001', 'text', 'Emojis! Yes, that''s the word. Thank you son.', datetime('now', '-2 days', '+45 minutes'), datetime('now', '-2 days', '+45 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_daja_0000016', 'chat_dad_jack001', '2z5t69695735ah0', 'text', 'Anytime Dad!', datetime('now', '-6 hours'), datetime('now', '-6 hours'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_daja_0000017', 'chat_dad_jack001', 'dad000000000001', 'text', 'Take care of yourself. Don''t work too hard. I remember when I was in engineering, I used to burn the midnight oil too. But health comes first!', datetime('now', '-5 hours'), datetime('now', '-5 hours'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_daja_0000018', 'chat_dad_jack001', 'dad000000000001', 'text', 'Love you son. Talk soon.', datetime('now', '-4 hours'), datetime('now', '-4 hours'));

-- ============ CHAT: Jack + Mom - 22 messages ============
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_moja_0000001', 'chat_mom_jack001', 'mom000000000001', 'text', 'Sweetie! Are you eating properly?', datetime('now', '-3 days'), datetime('now', '-3 days'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_moja_0000002', 'chat_mom_jack001', '2z5t69695735ah0', 'text', 'Yes mom, don''t worry! I cooked yesterday', datetime('now', '-3 days', '+10 minutes'), datetime('now', '-3 days', '+10 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_moja_0000003', 'chat_mom_jack001', 'mom000000000001', 'text', 'What did you make? I hope not just pasta again 😄', datetime('now', '-3 days', '+15 minutes'), datetime('now', '-3 days', '+15 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_moja_0000004', 'chat_mom_jack001', '2z5t69695735ah0', 'text', 'Actually made that chicken recipe you taught me!', datetime('now', '-3 days', '+20 minutes'), datetime('now', '-3 days', '+20 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_moja_0000005', 'chat_mom_jack001', 'mom000000000001', 'text', 'The one with lemon and herbs? I''m so proud! 👩‍🍳', datetime('now', '-3 days', '+25 minutes'), datetime('now', '-3 days', '+25 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_moja_0000006', 'chat_mom_jack001', '2z5t69695735ah0', 'text', 'Turned out pretty good if I say so myself', datetime('now', '-3 days', '+30 minutes'), datetime('now', '-3 days', '+30 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_moja_0000007', 'chat_mom_jack001', 'mom000000000001', 'text', 'I knew my cooking lessons would pay off someday!', datetime('now', '-3 days', '+35 minutes'), datetime('now', '-3 days', '+35 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_moja_0000008', 'chat_mom_jack001', 'mom000000000001', 'text', 'Oh! I found a new recipe I want to try this weekend. A Mediterranean salad with feta', datetime('now', '-2 days'), datetime('now', '-2 days'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_moja_0000009', 'chat_mom_jack001', '2z5t69695735ah0', 'text', 'Sounds delicious! Can''t wait to try it', datetime('now', '-2 days', '+15 minutes'), datetime('now', '-2 days', '+15 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_moja_0000010', 'chat_mom_jack001', 'mom000000000001', 'text', 'You''re coming Saturday right? 🥳', datetime('now', '-2 days', '+20 minutes'), datetime('now', '-2 days', '+20 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_moja_0000011', 'chat_mom_jack001', '2z5t69695735ah0', 'text', 'Wouldn''t miss your birthday for anything!', datetime('now', '-2 days', '+25 minutes'), datetime('now', '-2 days', '+25 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_moja_0000012', 'chat_mom_jack001', 'mom000000000001', 'text', 'You don''t have to get me anything, your presence is the best gift', datetime('now', '-2 days', '+30 minutes'), datetime('now', '-2 days', '+30 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_moja_0000013', 'chat_mom_jack001', '2z5t69695735ah0', 'text', 'Too late, already got you something 😊', datetime('now', '-2 days', '+35 minutes'), datetime('now', '-2 days', '+35 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_moja_0000014', 'chat_mom_jack001', 'mom000000000001', 'text', 'Oh you! Always so thoughtful', datetime('now', '-2 days', '+40 minutes'), datetime('now', '-2 days', '+40 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_moja_0000015', 'chat_mom_jack001', '2z5t69695735ah0', 'text', 'I learned from the best', datetime('now', '-2 days', '+45 minutes'), datetime('now', '-2 days', '+45 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_moja_0000016', 'chat_mom_jack001', 'mom000000000001', 'text', 'How''s work going honey?', datetime('now', '-5 hours'), datetime('now', '-5 hours'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_moja_0000017', 'chat_mom_jack001', '2z5t69695735ah0', 'text', 'Busy but good! Big project wrapping up next week', datetime('now', '-4 hours'), datetime('now', '-4 hours'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_moja_0000018', 'chat_mom_jack001', 'mom000000000001', 'text', 'I know you''ll do great. You always do', datetime('now', '-3 hours'), datetime('now', '-3 hours'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_moja_0000019', 'chat_mom_jack001', '2z5t69695735ah0', 'text', 'Thanks mom ❤️', datetime('now', '-2 hours'), datetime('now', '-2 hours'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_moja_0000020', 'chat_mom_jack001', 'mom000000000001', 'text', 'Are you getting enough sleep? You sounded tired on the phone yesterday', datetime('now', '-1 hour', '+30 minutes'), datetime('now', '-1 hour', '+30 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_moja_0000021', 'chat_mom_jack001', '2z5t69695735ah0', 'text', 'Getting my 7 hours, promise!', datetime('now', '-1 hour', '+15 minutes'), datetime('now', '-1 hour', '+15 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_moja_0000022', 'chat_mom_jack001', 'mom000000000001', 'text', 'Don''t forget to eat properly! 🍎', datetime('now', '-1 hour'), datetime('now', '-1 hour'));

-- ============ CHAT: Jack + Alex (Gym Buddy) - 15 messages ============
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_alja_0000001', 'chat_alex_jack01', 'alex00000000001', 'text', 'Yo Jack! Gym tomorrow?', datetime('now', '-3 days'), datetime('now', '-3 days'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_alja_0000002', 'chat_alex_jack01', '2z5t69695735ah0', 'text', 'Definitely! What time works?', datetime('now', '-3 days', '+5 minutes'), datetime('now', '-3 days', '+5 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_alja_0000003', 'chat_alex_jack01', 'alex00000000001', 'text', '6am like usual? Or too early?', datetime('now', '-3 days', '+10 minutes'), datetime('now', '-3 days', '+10 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_alja_0000004', 'chat_alex_jack01', '2z5t69695735ah0', 'text', '6am is fine, I''m an early bird', datetime('now', '-3 days', '+15 minutes'), datetime('now', '-3 days', '+15 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_alja_0000005', 'chat_alex_jack01', 'alex00000000001', 'text', 'Perfect! Leg day btw', datetime('now', '-3 days', '+20 minutes'), datetime('now', '-3 days', '+20 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_alja_0000006', 'chat_alex_jack01', '2z5t69695735ah0', 'text', 'RIP my legs', datetime('now', '-3 days', '+25 minutes'), datetime('now', '-3 days', '+25 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_alja_0000007', 'chat_alex_jack01', 'alex00000000001', 'text', 'No pain no gain 💪', datetime('now', '-3 days', '+30 minutes'), datetime('now', '-3 days', '+30 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_alja_0000008', 'chat_alex_jack01', '2z5t69695735ah0', 'text', 'Great workout today! Those squats were brutal', datetime('now', '-2 days'), datetime('now', '-2 days'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_alja_0000009', 'chat_alex_jack01', 'alex00000000001', 'text', 'You crushed it though! New PR?', datetime('now', '-2 days', '+10 minutes'), datetime('now', '-2 days', '+10 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_alja_0000010', 'chat_alex_jack01', '2z5t69695735ah0', 'text', 'Almost! 5 lbs away', datetime('now', '-2 days', '+15 minutes'), datetime('now', '-2 days', '+15 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_alja_0000011', 'chat_alex_jack01', 'alex00000000001', 'text', 'Next week for sure', datetime('now', '-2 days', '+20 minutes'), datetime('now', '-2 days', '+20 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_alja_0000012', 'chat_alex_jack01', '2z5t69695735ah0', 'text', 'Hey, up for gym again this week?', datetime('now', '-8 hours'), datetime('now', '-8 hours'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_alja_0000013', 'chat_alex_jack01', 'alex00000000001', 'text', 'Always! Thursday work?', datetime('now', '-7 hours'), datetime('now', '-7 hours'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_alja_0000014', 'chat_alex_jack01', '2z5t69695735ah0', 'text', 'Thursday 7am?', datetime('now', '-6 hours', '+30 minutes'), datetime('now', '-6 hours', '+30 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_alja_0000015', 'chat_alex_jack01', 'alex00000000001', 'text', 'See you at 7am then 💪', datetime('now', '-6 hours'), datetime('now', '-6 hours'));

-- ============ CHAT: Quick Notes (Self) - 12 messages ============
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_note_0000001', 'chat_notes_jack1', '2z5t69695735ah0', 'text', 'Remember to check the new PocketBase docs', datetime('now', '-10 days'), datetime('now', '-10 days'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_note_0000002', 'chat_notes_jack1', '2z5t69695735ah0', 'text', 'Ideas for the weekend project: real-time dashboard, maybe use WebSockets', datetime('now', '-8 days'), datetime('now', '-8 days'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_note_0000003', 'chat_notes_jack1', '2z5t69695735ah0', 'text', 'Meeting notes: Client wants mobile-first design, deadline Q2', datetime('now', '-6 days'), datetime('now', '-6 days'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_note_0000004', 'chat_notes_jack1', '2z5t69695735ah0', 'text', 'Book recommendation from Mike: "Clean Code" - add to reading list', datetime('now', '-5 days'), datetime('now', '-5 days'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_note_0000005', 'chat_notes_jack1', '2z5t69695735ah0', 'text', 'Password reset flow might have a bug - investigate Monday', datetime('now', '-4 days'), datetime('now', '-4 days'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_note_0000006', 'chat_notes_jack1', '2z5t69695735ah0', 'text', 'Potential tech stack for next project: Bun + Hono + React', datetime('now', '-3 days'), datetime('now', '-3 days'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_note_0000007', 'chat_notes_jack1', '2z5t69695735ah0', 'text', 'Blog post idea: "Why I switched from Redux to Jotai"', datetime('now', '-2 days'), datetime('now', '-2 days'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_note_0000008', 'chat_notes_jack1', '2z5t69695735ah0', 'text', 'Conference talk abstracts due March 15', datetime('now', '-1 day'), datetime('now', '-1 day'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_note_0000009', 'chat_notes_jack1', '2z5t69695735ah0', 'text', 'Dentist appointment: March 22 @ 2pm', datetime('now', '-12 hours'), datetime('now', '-12 hours'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_note_0000010', 'chat_notes_jack1', '2z5t69695735ah0', 'text', 'Gift for mom: tea set (split with Emma ✓)', datetime('now', '-6 hours'), datetime('now', '-6 hours'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_note_0000011', 'chat_notes_jack1', '2z5t69695735ah0', 'text', 'Car registration expires end of month - renew online', datetime('now', '-2 hours'), datetime('now', '-2 hours'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_note_0000012', 'chat_notes_jack1', '2z5t69695735ah0', 'text', 'API endpoint: /api/v2/users - need to test', datetime('now', '-30 minutes'), datetime('now', '-30 minutes'));

-- ============ CHAT: Todos (Self) - 15 messages ============
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_todo_0000001', 'chat_todos_jack1', '2z5t69695735ah0', 'text', '📋 Weekly Goals:', datetime('now', '-7 days'), datetime('now', '-7 days'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_todo_0000002', 'chat_todos_jack1', '2z5t69695735ah0', 'text', '☐ Finish API documentation', datetime('now', '-7 days', '+1 minute'), datetime('now', '-7 days', '+1 minute'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_todo_0000003', 'chat_todos_jack1', '2z5t69695735ah0', 'text', '☐ Review PRs from team', datetime('now', '-7 days', '+2 minutes'), datetime('now', '-7 days', '+2 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_todo_0000004', 'chat_todos_jack1', '2z5t69695735ah0', 'text', '☐ Fix the auth bug', datetime('now', '-7 days', '+3 minutes'), datetime('now', '-7 days', '+3 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_todo_0000005', 'chat_todos_jack1', '2z5t69695735ah0', 'text', '✅ Completed: Finish API documentation', datetime('now', '-5 days'), datetime('now', '-5 days'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_todo_0000006', 'chat_todos_jack1', '2z5t69695735ah0', 'text', '✅ Completed: Review PRs from team', datetime('now', '-4 days'), datetime('now', '-4 days'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_todo_0000007', 'chat_todos_jack1', '2z5t69695735ah0', 'text', '✅ Completed: Fix the auth bug', datetime('now', '-3 days'), datetime('now', '-3 days'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_todo_0000008', 'chat_todos_jack1', '2z5t69695735ah0', 'text', '📋 This Week:', datetime('now', '-2 days'), datetime('now', '-2 days'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_todo_0000009', 'chat_todos_jack1', '2z5t69695735ah0', 'text', '☐ Prepare demo for client', datetime('now', '-2 days', '+1 minute'), datetime('now', '-2 days', '+1 minute'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_todo_0000010', 'chat_todos_jack1', '2z5t69695735ah0', 'text', '☐ Mom''s birthday gift (tea set)', datetime('now', '-2 days', '+2 minutes'), datetime('now', '-2 days', '+2 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_todo_0000011', 'chat_todos_jack1', '2z5t69695735ah0', 'text', '☐ Book dentist appointment', datetime('now', '-2 days', '+3 minutes'), datetime('now', '-2 days', '+3 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_todo_0000012', 'chat_todos_jack1', '2z5t69695735ah0', 'text', '☐ Submit quarterly report', datetime('now', '-2 days', '+4 minutes'), datetime('now', '-2 days', '+4 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_todo_0000013', 'chat_todos_jack1', '2z5t69695735ah0', 'text', '✅ Completed: Mom''s birthday gift (paid Emma)', datetime('now', '-5 hours'), datetime('now', '-5 hours'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_todo_0000014', 'chat_todos_jack1', '2z5t69695735ah0', 'text', '✅ Completed: Book dentist appointment', datetime('now', '-3 hours'), datetime('now', '-3 hours'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_todo_0000015', 'chat_todos_jack1', '2z5t69695735ah0', 'text', '✅ Completed: Submit quarterly report', datetime('now', '-1 hour'), datetime('now', '-1 hour'));

-- ============ CHAT: Family Group - 40 messages ============
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_fam_00000001', 'chat_family_grp1', 'mom000000000001', 'text', 'Good morning family! ☀️', datetime('now', '-5 days'), datetime('now', '-5 days'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_fam_00000002', 'chat_family_grp1', 'emma00000000001', 'text', 'Morning mom! 💕', datetime('now', '-5 days', '+5 minutes'), datetime('now', '-5 days', '+5 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_fam_00000003', 'chat_family_grp1', '2z5t69695735ah0', 'text', 'Hey everyone!', datetime('now', '-5 days', '+10 minutes'), datetime('now', '-5 days', '+10 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_fam_00000004', 'chat_family_grp1', 'dad000000000001', 'text', 'Good morning! Beautiful day outside. Your mother has me working in the garden already!', datetime('now', '-5 days', '+15 minutes'), datetime('now', '-5 days', '+15 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_fam_00000005', 'chat_family_grp1', 'emma00000000001', 'text', 'Haha classic! What are you planting?', datetime('now', '-5 days', '+20 minutes'), datetime('now', '-5 days', '+20 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_fam_00000006', 'chat_family_grp1', 'dad000000000001', 'text', 'Tomatoes, peppers, and some herbs. Your mother wants fresh basil for her cooking.', datetime('now', '-5 days', '+25 minutes'), datetime('now', '-5 days', '+25 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_fam_00000007', 'chat_family_grp1', 'mom000000000001', 'text', 'Nothing beats fresh basil! I''ll make pesto when they''re ready', datetime('now', '-5 days', '+30 minutes'), datetime('now', '-5 days', '+30 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_fam_00000008', 'chat_family_grp1', '2z5t69695735ah0', 'text', 'Save some for me! 🍝', datetime('now', '-5 days', '+35 minutes'), datetime('now', '-5 days', '+35 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_fam_00000009', 'chat_family_grp1', 'mom000000000001', 'text', 'Always, sweetie!', datetime('now', '-5 days', '+40 minutes'), datetime('now', '-5 days', '+40 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_fam_00000010', 'chat_family_grp1', 'emma00000000001', 'text', 'So excited for Saturday! 🎂', datetime('now', '-4 days'), datetime('now', '-4 days'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_fam_00000011', 'chat_family_grp1', '2z5t69695735ah0', 'text', 'Same! It''s going to be great', datetime('now', '-4 days', '+5 minutes'), datetime('now', '-4 days', '+5 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_fam_00000012', 'chat_family_grp1', 'mom000000000001', 'text', 'You kids don''t have to make a fuss!', datetime('now', '-4 days', '+10 minutes'), datetime('now', '-4 days', '+10 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_fam_00000013', 'chat_family_grp1', 'dad000000000001', 'text', 'Too late! I''ve already started planning the menu. Your favorite: roast chicken with all the trimmings.', datetime('now', '-4 days', '+15 minutes'), datetime('now', '-4 days', '+15 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_fam_00000014', 'chat_family_grp1', 'mom000000000001', 'text', 'Oh you 💕 I''m so lucky', datetime('now', '-4 days', '+20 minutes'), datetime('now', '-4 days', '+20 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_fam_00000015', 'chat_family_grp1', 'emma00000000001', 'text', 'Can I bring dessert? I found this amazing chocolate cake recipe', datetime('now', '-4 days', '+25 minutes'), datetime('now', '-4 days', '+25 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_fam_00000016', 'chat_family_grp1', 'mom000000000001', 'text', 'That sounds wonderful Emma!', datetime('now', '-4 days', '+30 minutes'), datetime('now', '-4 days', '+30 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_fam_00000017', 'chat_family_grp1', '2z5t69695735ah0', 'text', 'I''ll bring wine', datetime('now', '-4 days', '+35 minutes'), datetime('now', '-4 days', '+35 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_fam_00000018', 'chat_family_grp1', 'dad000000000001', 'text', 'Good man! Get that Pinot Noir your mother likes.', datetime('now', '-4 days', '+40 minutes'), datetime('now', '-4 days', '+40 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_fam_00000019', 'chat_family_grp1', '2z5t69695735ah0', 'text', 'Already on my list 👍', datetime('now', '-4 days', '+45 minutes'), datetime('now', '-4 days', '+45 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_fam_00000020', 'chat_family_grp1', 'mom000000000001', 'text', 'I love this family ❤️', datetime('now', '-4 days', '+50 minutes'), datetime('now', '-4 days', '+50 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_fam_00000021', 'chat_family_grp1', 'emma00000000001', 'text', 'What time should we arrive?', datetime('now', '-2 days'), datetime('now', '-2 days'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_fam_00000022', 'chat_family_grp1', 'dad000000000001', 'text', 'How about 5pm? That gives us time to relax before dinner.', datetime('now', '-2 days', '+10 minutes'), datetime('now', '-2 days', '+10 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_fam_00000023', 'chat_family_grp1', 'emma00000000001', 'text', 'Perfect!', datetime('now', '-2 days', '+15 minutes'), datetime('now', '-2 days', '+15 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_fam_00000024', 'chat_family_grp1', '2z5t69695735ah0', 'text', '5pm works for me too', datetime('now', '-2 days', '+20 minutes'), datetime('now', '-2 days', '+20 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_fam_00000025', 'chat_family_grp1', 'mom000000000001', 'text', 'Can''t wait to see you both!', datetime('now', '-2 days', '+25 minutes'), datetime('now', '-2 days', '+25 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_fam_00000026', 'chat_family_grp1', 'emma00000000001', 'text', 'Just finished the cake! It looks amazing if I say so myself 🎂', datetime('now', '-1 day'), datetime('now', '-1 day'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_fam_00000027', 'chat_family_grp1', '2z5t69695735ah0', 'text', 'Ooh share a pic!', datetime('now', '-1 day', '+5 minutes'), datetime('now', '-1 day', '+5 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_fam_00000028', 'chat_family_grp1', 'emma00000000001', 'text', 'No spoilers! You''ll see it tomorrow 😄', datetime('now', '-1 day', '+10 minutes'), datetime('now', '-1 day', '+10 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_fam_00000029', 'chat_family_grp1', 'dad000000000001', 'text', 'The suspense is killing me! Your mother is already excited.', datetime('now', '-1 day', '+15 minutes'), datetime('now', '-1 day', '+15 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_fam_00000030', 'chat_family_grp1', 'mom000000000001', 'text', 'I bet it''s beautiful Emma!', datetime('now', '-1 day', '+20 minutes'), datetime('now', '-1 day', '+20 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_fam_00000031', 'chat_family_grp1', '2z5t69695735ah0', 'text', 'Got the wine! Found a really nice 2019 vintage', datetime('now', '-8 hours'), datetime('now', '-8 hours'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_fam_00000032', 'chat_family_grp1', 'dad000000000001', 'text', 'Excellent choice! 2019 was a great year for Pinot.', datetime('now', '-7 hours'), datetime('now', '-7 hours'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_fam_00000033', 'chat_family_grp1', 'emma00000000001', 'text', 'Nice Jack!', datetime('now', '-6 hours'), datetime('now', '-6 hours'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_fam_00000034', 'chat_family_grp1', 'mom000000000001', 'text', 'You kids spoil me 🥰', datetime('now', '-5 hours'), datetime('now', '-5 hours'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_fam_00000035', 'chat_family_grp1', 'emma00000000001', 'text', 'You deserve it mom!', datetime('now', '-5 hours', '+5 minutes'), datetime('now', '-5 hours', '+5 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_fam_00000036', 'chat_family_grp1', '2z5t69695735ah0', 'text', '100%!', datetime('now', '-5 hours', '+10 minutes'), datetime('now', '-5 hours', '+10 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_fam_00000037', 'chat_family_grp1', 'dad000000000001', 'text', 'Roast is marinating. House smells incredible already!', datetime('now', '-4 hours'), datetime('now', '-4 hours'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_fam_00000038', 'chat_family_grp1', 'emma00000000001', 'text', 'My stomach is already growling 😋', datetime('now', '-4 hours', '+5 minutes'), datetime('now', '-4 hours', '+5 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_fam_00000039', 'chat_family_grp1', '2z5t69695735ah0', 'text', 'Same! Can''t wait', datetime('now', '-3 hours', '+30 minutes'), datetime('now', '-3 hours', '+30 minutes'));
INSERT INTO messages (id, chat, sender, type, content, created, updated) VALUES
('msg_fam_00000040', 'chat_family_grp1', 'mom000000000001', 'text', 'See everyone Sunday!', datetime('now', '-3 hours'), datetime('now', '-3 hours'));

-- ============================================
-- Add some reactions to messages (JSON format)
-- ============================================
UPDATE messages SET reactions = '{"❤️":["emma00000000001"]}' WHERE id = 'msg_emja_0000008';
UPDATE messages SET reactions = '{"😂":["2z5t69695735ah0","emma00000000001"]}' WHERE id = 'msg_emja_0000003';
UPDATE messages SET reactions = '{"💀":["mike00000000001"]}' WHERE id = 'msg_mija_0000021';
UPDATE messages SET reactions = '{"😂":["2z5t69695735ah0"]}' WHERE id = 'msg_mija_0000020';
UPDATE messages SET reactions = '{"👍":["sarah0000000001"]}' WHERE id = 'msg_saja_0000004';
UPDATE messages SET reactions = '{"❤️":["2z5t69695735ah0"]}' WHERE id = 'msg_moja_0000005';
UPDATE messages SET reactions = '{"💪":["2z5t69695735ah0"]}' WHERE id = 'msg_alja_0000007';
UPDATE messages SET reactions = '{"❤️":["2z5t69695735ah0","emma00000000001","dad000000000001"]}' WHERE id = 'msg_fam_00000020';
UPDATE messages SET reactions = '{"🎂":["2z5t69695735ah0","mom000000000001","dad000000000001"]}' WHERE id = 'msg_fam_00000026';

-- ============================================
-- Mark some messages as favorites
-- ============================================
UPDATE messages SET favs = '["2z5t69695735ah0"]' WHERE id = 'msg_note_0000003';
UPDATE messages SET favs = '["2z5t69695735ah0"]' WHERE id = 'msg_note_0000006';
UPDATE messages SET favs = '["2z5t69695735ah0"]' WHERE id = 'msg_saja_0000004';
