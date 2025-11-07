/**
 * Database Seed Script
 *
 * Populates Supabase with mock data for development/testing.
 * Run this script to have realistic data in your database.
 *
 * Usage: npx tsx scripts/seedDatabase.ts
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

// Initialize Supabase client
// Use service key if available, otherwise fall back to anon key (with limited permissions)
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env');
  console.error('   Make sure you have VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔐 Using Supabase key:', supabaseKey.substring(0, 20) + '...');
if (!process.env.SUPABASE_SERVICE_KEY) {
  console.warn('⚠️  Warning: Using anon key instead of service key');
  console.warn('   Some operations may fail due to RLS policies');
  console.warn('   To fix: Add SUPABASE_SERVICE_KEY to your .env file');
  console.warn('   Get it from: Supabase Dashboard > Settings > API > service_role key\n');
}

// Mock user IDs (these should match actual user IDs in your auth.users table)
const MOCK_STUDENT_ID = 'mock-student-1';
const MOCK_TEACHER_ID = 'mock-teacher-1';

async function seedDatabase() {
  console.log('🌱 Starting database seed...\n');

  try {
    // 1. Seed Classes
    console.log('📚 Seeding classes...');
    const { data: classes, error: _classError } = await supabase
      .from('classes')
      .upsert([
        {
          id: 'class-1',
          name: 'Introduction to Psychology',
          description: 'Explore the fundamentals of human behavior and mental processes',
          teacher_id: MOCK_TEACHER_ID,
          class_code: 'PSY101',
          is_active: true,
        },
        {
          id: 'class-2',
          name: 'Data Structures & Algorithms',
          description: 'Learn core computer science concepts and problem-solving techniques',
          teacher_id: MOCK_TEACHER_ID,
          class_code: 'CS201',
          is_active: true,
        },
        {
          id: 'class-3',
          name: 'Creative Writing Workshop',
          description: 'Develop your storytelling skills through guided writing exercises',
          teacher_id: MOCK_TEACHER_ID,
          class_code: 'ENG305',
          is_active: true,
        },
        {
          id: 'class-4',
          name: 'Environmental Science',
          description: 'Study ecosystems, climate change, and sustainability',
          teacher_id: MOCK_TEACHER_ID,
          class_code: 'ENV150',
          is_active: true,
        },
      ], { onConflict: 'id' })
      .select();

    console.log(`✅ Seeded ${classes?.length || 0} classes\n`);

    // 2. Seed Class Members
    console.log('👥 Seeding class members...');
    const { data: members, error: _memberError } = await supabase
      .from('class_members')
      .upsert([
        {
          user_id: MOCK_STUDENT_ID,
          class_id: 'class-1',
          class_points: 450,
          joined_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          user_id: MOCK_STUDENT_ID,
          class_id: 'class-2',
          class_points: 380,
          joined_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          user_id: MOCK_STUDENT_ID,
          class_id: 'class-3',
          class_points: 520,
          joined_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ], { onConflict: 'user_id,class_id' })
      .select();

    console.log(`✅ Seeded ${members?.length || 0} class memberships\n`);

    // 3. Seed Pulse Checks (Morning emotional check-ins)
    console.log('💓 Seeding pulse checks...');
    const emotions = [
      { emotion: 'Happy', sentiment: 6, intensity: 7 },
      { emotion: 'Excited', sentiment: 6, intensity: 8 },
      { emotion: 'Content', sentiment: 5, intensity: 6 },
      { emotion: 'Hopeful', sentiment: 5, intensity: 6 },
      { emotion: 'Peaceful', sentiment: 4, intensity: 5 },
      { emotion: 'Tired', sentiment: 3, intensity: 4 },
      { emotion: 'Worried', sentiment: 2, intensity: 5 },
      { emotion: 'Frustrated', sentiment: 2, intensity: 6 },
    ];

    const pulseChecks = [];
    for (let i = 0; i < 30; i++) {
      const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
      pulseChecks.push({
        user_id: MOCK_STUDENT_ID,
        emotion: randomEmotion.emotion,
        sentiment: randomEmotion.sentiment,
        intensity: randomEmotion.intensity,
        notes: i === 0 ? 'Feeling great today!' : null,
        created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    const { data: pulses, error: _pulseError } = await supabase
      .from('pulse_checks')
      .upsert(pulseChecks)
      .select();

    console.log(`✅ Seeded ${pulses?.length || 0} pulse checks\n`);

    // 4. Seed Sentiment History
    console.log('📈 Seeding sentiment history...');
    const sentimentHistory = pulseChecks.map((pc, i) => ({
      user_id: MOCK_STUDENT_ID,
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      emotion: pc.emotion,
      sentiment: pc.sentiment,
      intensity: pc.intensity,
    }));

    const { data: sentiment, error: _sentimentError } = await supabase
      .from('sentiment_history')
      .upsert(sentimentHistory, { onConflict: 'user_id,date' })
      .select();

    console.log(`✅ Seeded ${sentiment?.length || 0} sentiment history records\n`);

    // 5. Seed Class Pulses (Teacher questions)
    console.log('❓ Seeding class pulses...');
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const { data: classPulses, error: _classPulseError } = await supabase
      .from('class_pulses')
      .upsert([
        {
          id: 'pulse-1',
          class_id: 'class-1',
          question: 'What concept from this week\'s lecture resonated with you most?',
          question_type: 'open_ended',
          is_active: true,
          expires_at: tomorrow.toISOString(),
        },
        {
          id: 'pulse-2',
          class_id: 'class-2',
          question: 'How confident do you feel about the upcoming midterm?',
          question_type: 'slider',
          is_active: true,
          expires_at: tomorrow.toISOString(),
        },
      ], { onConflict: 'id' })
      .select();

    console.log(`✅ Seeded ${classPulses?.length || 0} class pulses\n`);

    // 6. Seed Hapi Moments
    console.log('💝 Seeding hapi moments...');
    const { data: moments, error: _momentsError } = await supabase
      .from('hapi_moments')
      .upsert([
        {
          id: 'moment-1',
          sender_id: MOCK_STUDENT_ID,
          recipient_id: 'mock-student-2',
          message: 'Thanks for helping me understand that difficult concept!',
          category: 'academic',
          is_anonymous: false,
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'moment-2',
          sender_id: 'mock-student-3',
          recipient_id: MOCK_STUDENT_ID,
          message: 'Your presentation was really inspiring!',
          category: 'recognition',
          is_anonymous: false,
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ], { onConflict: 'id' })
      .select();

    console.log(`✅ Seeded ${moments?.length || 0} hapi moments\n`);

    // 7. Seed Achievements
    console.log('🏆 Seeding achievements...');
    const { data: achievements, error: _achievementsError } = await supabase
      .from('achievements')
      .upsert([
        {
          id: 'achievement-1',
          name: 'First Steps',
          description: 'Complete your first morning pulse check',
          icon: '🌅',
          category: 'engagement',
          rarity: 'common',
          points: 10,
          requirement_type: 'pulse_checks',
          requirement_count: 1,
        },
        {
          id: 'achievement-2',
          name: 'Consistent Spirit',
          description: 'Maintain a 7-day check-in streak',
          icon: '🔥',
          category: 'engagement',
          rarity: 'rare',
          points: 50,
          requirement_type: 'streak',
          requirement_count: 7,
        },
        {
          id: 'achievement-3',
          name: 'Kindness Ambassador',
          description: 'Send 10 Hapi Moments',
          icon: '💝',
          category: 'wellness',
          rarity: 'epic',
          points: 100,
          requirement_type: 'hapi_moments_sent',
          requirement_count: 10,
        },
      ], { onConflict: 'id' })
      .select();

    console.log(`✅ Seeded ${achievements?.length || 0} achievements\n`);

    // 8. Seed User Achievements
    console.log('🎖️ Seeding user achievements...');
    const { data: userAchievements, error: _userAchievementsError } = await supabase
      .from('user_achievements')
      .upsert([
        {
          user_id: MOCK_STUDENT_ID,
          badge_id: 'achievement-1',
          earned_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ], { onConflict: 'user_id,badge_id' })
      .select();

    console.log(`✅ Seeded ${userAchievements?.length || 0} user achievements\n`);

    // 9. Seed Office Hours
    console.log('🕐 Seeding office hours...');
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const { data: officeHours, error: _officeHoursError } = await supabase
      .from('office_hours')
      .upsert([
        {
          id: 'office-1',
          teacher_id: MOCK_TEACHER_ID,
          class_id: 'class-1',
          date: nextWeek.toISOString().split('T')[0],
          start_time: '14:00',
          end_time: '16:00',
          meeting_link: 'https://zoom.us/j/mock123456',
          max_queue_size: 10,
          is_active: true,
          notes: 'Drop-in for midterm review',
        },
      ], { onConflict: 'id' })
      .select();

    console.log(`✅ Seeded ${officeHours?.length || 0} office hours\n`);

    console.log('✅ Database seed completed successfully! 🎉');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run the seed
seedDatabase()
  .then(() => {
    console.log('\n✅ All done! Your database is now populated with mock data.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  });
