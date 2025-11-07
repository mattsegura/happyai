/**
 * Fixed Database Seed Script
 *
 * This version works with your actual schema (UUIDs, university_id, etc.)
 * Usage: npx tsx scripts/seedDatabaseFixed.ts
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔐 Using Supabase key:', supabaseKey.substring(0, 20) + '...\n');

async function seedDatabase() {
  console.log('🌱 Starting database seed...\n');

  try {
    // Step 1: Create or get a university
    console.log('🏫 Setting up university...');
    const { data: existingUniversities } = await supabase
      .from('universities')
      .select('id')
      .limit(1);

    let universityId: string;

    if (existingUniversities && existingUniversities.length > 0) {
      universityId = existingUniversities[0].id;
      console.log('✅ Using existing university:', universityId);
    } else {
      // Create a new university
      const { data: newUni, error: uniError } = await supabase
        .from('universities')
        .insert({
          name: 'Demo University',
          domain: 'demo.edu',
        })
        .select()
        .single();

      if (uniError) {
        console.error('❌ Error creating university:', uniError.message);
        throw uniError;
      }

      universityId = newUni.id;
      console.log('✅ Created university:', universityId);
    }

    // Step 2: Create or get a teacher profile
    console.log('\n👨‍🏫 Setting up teacher profile...');
    const { data: existingProfiles } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'teacher')
      .limit(1);

    let teacherId: string;

    if (existingProfiles && existingProfiles.length > 0) {
      teacherId = existingProfiles[0].id;
      console.log('✅ Using existing teacher:', teacherId);
    } else {
      // For demo, we'll use a placeholder teacher ID
      // In production, you'd create a real auth user first
      teacherId = randomUUID();
      console.log('⚠️  Using placeholder teacher ID:', teacherId);
      console.log('   Note: Teacher profile may not exist in auth.users');
    }

    // Step 3: Get current user (for student)
    console.log('\n👤 Getting current user...');
    const { data: currentUser, error: _userError } = await supabase.auth.getUser();

    let studentId: string;
    if (currentUser?.user) {
      studentId = currentUser.user.id;
      console.log('✅ Using logged-in user:', studentId);
    } else {
      // Use a placeholder
      studentId = randomUUID();
      console.log('⚠️  No logged-in user, using placeholder:', studentId);
    }

    // Step 4: Create classes
    console.log('\n📚 Creating classes...');
    const classData = [
      {
        name: 'Introduction to Psychology',
        description: 'Explore the fundamentals of human behavior and mental processes',
        teacher_name: 'Dr. Sarah Johnson',
        teacher_id: teacherId,
        class_code: 'PSY101',
        university_id: universityId,
        is_active: true,
      },
      {
        name: 'Data Structures & Algorithms',
        description: 'Learn core computer science concepts and problem-solving techniques',
        teacher_name: 'Prof. Michael Chen',
        teacher_id: teacherId,
        class_code: 'CS201',
        university_id: universityId,
        is_active: true,
      },
      {
        name: 'Creative Writing Workshop',
        description: 'Develop your storytelling skills through guided writing exercises',
        teacher_name: 'Prof. Emily Rodriguez',
        teacher_id: teacherId,
        class_code: 'ENG305',
        university_id: universityId,
        is_active: true,
      },
    ];

    const { data: classes, error: classError } = await supabase
      .from('classes')
      .insert(classData)
      .select();

    if (classError) {
      console.error('❌ Error creating classes:', classError.message);
      console.error('   Details:', classError.details);
      console.error('   Hint:', classError.hint);
      throw classError;
    }

    console.log(`✅ Created ${classes?.length || 0} classes`);

    if (!classes || classes.length === 0) {
      console.log('\n⚠️  No classes created. Stopping seed.');
      return;
    }

    // Step 5: Add student to classes
    console.log('\n👥 Adding student to classes...');
    const membershipData = classes.map(cls => ({
      user_id: studentId,
      class_id: cls.id,
      class_points: Math.floor(Math.random() * 500) + 100,
    }));

    const { data: memberships, error: memberError } = await supabase
      .from('class_members')
      .insert(membershipData)
      .select();

    if (memberError) {
      console.error('❌ Error adding memberships:', memberError.message);
    } else {
      console.log(`✅ Added ${memberships?.length || 0} class memberships`);
    }

    // Step 6: Add pulse checks (mood history)
    console.log('\n💓 Creating pulse check history...');
    const emotions = [
      { emotion: 'Happy', sentiment: 6, intensity: 7 },
      { emotion: 'Excited', sentiment: 6, intensity: 8 },
      { emotion: 'Content', sentiment: 5, intensity: 6 },
      { emotion: 'Peaceful', sentiment: 4, intensity: 5 },
      { emotion: 'Tired', sentiment: 3, intensity: 4 },
    ];

    const pulseChecks = [];
    for (let i = 0; i < 14; i++) {
      const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
      pulseChecks.push({
        user_id: studentId,
        emotion: randomEmotion.emotion,
        sentiment: randomEmotion.sentiment,
        intensity: randomEmotion.intensity,
        created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    const { data: pulses, error: pulseError } = await supabase
      .from('pulse_checks')
      .insert(pulseChecks)
      .select();

    if (pulseError) {
      console.error('❌ Error creating pulses:', pulseError.message);
    } else {
      console.log(`✅ Created ${pulses?.length || 0} pulse checks`);
    }

    console.log('\n✅ Database seed completed successfully! 🎉');
    console.log('\n📊 Summary:');
    console.log(`   - University: ${universityId}`);
    console.log(`   - Classes: ${classes?.length || 0}`);
    console.log(`   - Memberships: ${memberships?.length || 0}`);
    console.log(`   - Pulse checks: ${pulses?.length || 0}`);

  } catch (error) {
    console.error('\n❌ Seed failed:', error);
    throw error;
  }
}

seedDatabase()
  .then(() => {
    console.log('\n✅ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
