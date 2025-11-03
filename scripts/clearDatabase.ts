/**
 * Clear Database Script
 *
 * Removes all mock data from Supabase.
 * Use this to reset your database before re-seeding.
 *
 * Usage: npx tsx scripts/clearDatabase.ts
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

const MOCK_STUDENT_ID = 'mock-student-1';
const MOCK_TEACHER_ID = 'mock-teacher-1';

async function clearDatabase() {
  console.log('🗑️  Clearing database...\n');

  try {
    // Delete in reverse order of dependencies
    console.log('Deleting user achievements...');
    await supabase.from('user_achievements').delete().eq('user_id', MOCK_STUDENT_ID);

    console.log('Deleting achievements...');
    await supabase.from('achievements').delete().like('id', 'achievement-%');

    console.log('Deleting hapi moments...');
    await supabase.from('hapi_moments').delete().like('id', 'moment-%');

    console.log('Deleting class pulses...');
    await supabase.from('class_pulses').delete().like('id', 'pulse-%');

    console.log('Deleting sentiment history...');
    await supabase.from('sentiment_history').delete().eq('user_id', MOCK_STUDENT_ID);

    console.log('Deleting pulse checks...');
    await supabase.from('pulse_checks').delete().eq('user_id', MOCK_STUDENT_ID);

    console.log('Deleting office hours...');
    await supabase.from('office_hours').delete().like('id', 'office-%');

    console.log('Deleting class members...');
    await supabase.from('class_members').delete().eq('user_id', MOCK_STUDENT_ID);

    console.log('Deleting classes...');
    await supabase.from('classes').delete().like('id', 'class-%');

    console.log('\n✅ Database cleared successfully!');

  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
}

clearDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
