// Test Gemini 2.5 Flash
const API_KEY = 'AIzaSyAPFfRYhMmLj_-7c_gov2fd_bRKAOtCQO0';

async function testGemini() {
  console.log('Testing Gemini 2.5 Flash...\n');
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
  
  const body = {
    contents: [{
      parts: [{
        text: 'Explain photosynthesis in 2 sentences.'
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
    
    if (data.candidates && data.candidates[0]) {
      console.log('\n✅ SUCCESS! Gemini responded:');
      console.log(data.candidates[0].content.parts[0].text);
      console.log('\nToken usage:', data.usageMetadata);
    } else {
      console.log('\n❌ Error:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testGemini();
