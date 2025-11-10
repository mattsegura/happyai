// Quick test script to verify Gemini API
const API_KEY = 'AIzaSyAPFfRYhMmLj_-7c_gov2fd_bRKAOtCQO0';

async function testGemini() {
  console.log('Testing Gemini API...\n');
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;
  
  const body = {
    contents: [{
      parts: [{
        text: 'Say hello in one sentence.'
      }]
    }]
  };
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });
    
    console.log('Status:', response.status);
    
    const data = await response.json();
    console.log('\nResponse:', JSON.stringify(data, null, 2));
    
    if (data.candidates && data.candidates[0]) {
      console.log('\n✅ SUCCESS! Gemini responded:');
      console.log(data.candidates[0].content.parts[0].text);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testGemini();
