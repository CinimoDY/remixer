import { useState } from 'react'

function App() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const remixStyles = [
    { id: 'professional', label: 'Professional', color: 'blue' },
    { id: 'casual', label: 'Casual', color: 'green' },
    { id: 'funny', label: 'Funny', color: 'purple' },
  ];

  const handleRemix = async (style) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/remix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
          style: style
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to remix content');
      }

      setOutputText(data.remixedText);
    } catch (error) {
      console.error('Detailed error:', error);
      setError(error.message);
      setOutputText('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Content Remixer</h1>
      
      {/* Input Section */}
      <div className="mb-4">
        <textarea
          className="w-full p-2 border rounded"
          rows="6"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste your content here..."
          disabled={isLoading}
        />
      </div>

      {/* Remix Options */}
      <div className="flex gap-2 mb-4">
        {remixStyles.map((style) => (
          <button
            key={style.id}
            className={`px-4 py-2 bg-${style.color}-500 text-white rounded hover:bg-${style.color}-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            onClick={() => handleRemix(style.id)}
            disabled={isLoading || !inputText.trim()}
          >
            {style.label}
          </button>
        ))}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Output Section */}
      <div className="border p-4 rounded min-h-[200px]">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="whitespace-pre-wrap">{outputText}</div>
        )}
      </div>
    </div>
  )
}

export default App 