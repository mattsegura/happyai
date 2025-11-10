// List available Gemini models
const API_KEY = 'AIzaSyAPFfRYhMmLj_-7c_gov2fd_bRKAOtCQO0';

async function listModels() {
  console.log('Listing available Gemini models...\n');
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.models) {
      console.log('Available models:');
      data.models.forEach(model => {
        console.log(`\n- ${model.name}`);
        console.log(`  Display Name: ${model.displayName}`);
        console.log(`  Supported methods: ${model.supportedGenerationMethods?.join(', ')}`);
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

listModels();
