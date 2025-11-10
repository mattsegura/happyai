import { useState } from 'react';
import { Upload, Image as ImageIcon, Loader } from 'lucide-react';

export function ImageAnalysisTab() {
  const [analysis, setAnalysis] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setIsProcessing(true);
    
    setTimeout(() => {
      setAnalysis(`# Image Analysis Results\n\n## Detected Elements\n\n• **Main Subject**: Cellular diagram showing mitochondrial structure\n• **Labels Identified**: Inner membrane, Outer membrane, Cristae, Matrix, Intermembrane space\n• **Diagram Type**: Cross-sectional anatomical illustration\n\n## Key Concepts\n\n1. **Mitochondrial Structure**: The image shows the double-membrane structure characteristic of mitochondria\n2. **Cristae Formation**: Inner membrane folds are clearly visible, increasing surface area\n3. **Functional Zones**: Different compartments are labeled for ATP synthesis\n\n## Study Notes\n\n• The cristae contain the electron transport chain\n• The matrix is where the Krebs cycle occurs\n• The intermembrane space is crucial for proton gradient formation\n\n## Related Topics to Review\n\n- Cellular respiration\n- ATP synthesis\n- Oxidative phosphorylation`);
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ImageIcon className="w-6 h-6 text-violet-600" />
          Image & Diagram Analysis
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Upload diagrams, charts, or visual study materials for AI analysis
        </p>
      </div>

      {!analysis ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 flex items-center justify-center">
              <Upload className="w-10 h-10 text-violet-600 dark:text-violet-400" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Upload Image</h3>
            <p className="text-sm text-muted-foreground mb-6">
              AI will analyze diagrams, charts, and visual materials
            </p>
            <label className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white rounded-xl font-semibold cursor-pointer hover:shadow-lg transition-all">
              {isProcessing ? <Loader className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
              {isProcessing ? 'Analyzing...' : 'Upload Image'}
              <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isProcessing} />
            </label>
            <p className="text-xs text-muted-foreground mt-4">Supports JPG, PNG, GIF, WebP</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-6">
          {imageUrl && (
            <div className="rounded-2xl overflow-hidden border-2 border-violet-200 dark:border-violet-800">
              <img src={imageUrl} alt="Uploaded" className="w-full h-auto" />
            </div>
          )}
          
          <div className="prose prose-violet dark:prose-invert max-w-none">
            {analysis.split('\n').map((line, i) => {
              if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-bold mb-4">{line.slice(2)}</h1>;
              if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-bold mt-6 mb-3">{line.slice(3)}</h2>;
              if (line.startsWith('• ')) return <li key={i} className="ml-6">{line.slice(2)}</li>;
              if (line.match(/^\d+\./)) return <li key={i} className="ml-6">{line}</li>;
              if (line.startsWith('- ')) return <li key={i} className="ml-6">{line.slice(2)}</li>;
              if (line.trim()) return <p key={i} className="mb-4">{line}</p>;
              return null;
            })}
          </div>

          <button onClick={() => { setAnalysis(''); setImageUrl(''); }} className="w-full px-6 py-3 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
            Analyze Another Image
          </button>
        </div>
      )}
    </div>
  );
}
