import { useState } from 'react'

function App() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleRemix = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/remix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText
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
    <div className="min-h-screen bg-dos-black text-dos-amber font-dos p-4">
      <div className="container mx-auto max-w-4xl">
        {/* DOS-style Header */}
        <div className="mb-8 border-2 border-dos-border p-4">
          <h1 className="text-4xl font-bold text-center">
            ╔═══════════════════╗
            <br />
            ║  Content Remixer  ║
            <br />
            ╚═══════════════════╝
          </h1>
          <p className="text-center mt-2 cursor">
            C:\APPS\REMIXER&gt; Transform your text with AI magic
          </p>
        </div>
        
        {/* Main Terminal Window */}
        <div className="border-2 border-dos-border p-4">
          {/* Input Section */}
          <div className="mb-6">
            <label className="block mb-2 text-dos-bright-amber">
              C:\INPUT&gt; Enter your text:
            </label>
            <textarea
              className="w-full p-2 bg-dos-black border-2 border-dos-border text-dos-amber 
                        font-dos resize-none focus:outline-none focus:border-dos-bright-amber
                        min-h-[120px]"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type or paste your content here..."
              disabled={isLoading}
            />
          </div>

          {/* Remix Button */}
          <div className="flex justify-center mb-6">
            <button
              className="px-6 py-2 border-2 border-dos-border 
                        hover:bg-dos-amber hover:text-dos-black
                        transition-colors disabled:opacity-50 
                        disabled:cursor-not-allowed"
              onClick={handleRemix}
              disabled={isLoading || !inputText.trim()}
            >
              [Remix Content]
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-2 border-2 border-dos-red text-dos-red">
              ERROR: {error}
            </div>
          )}

          {/* Output Section */}
          <div>
            <label className="block mb-2 text-dos-bright-amber">
              C:\OUTPUT&gt; Remixed result:
            </label>
            <div className="border-2 border-dos-border p-2 min-h-[120px]">
              {isLoading ? (
                <div className="flex justify-center items-center h-[120px]">
                  <div className="animate-pulse">
                    Processing request...
                    <br />
                    Please wait...
                  </div>
                </div>
              ) : (
                <div className="whitespace-pre-wrap">{outputText}</div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center text-dos-dim-amber">
          Press any key to continue...
        </div>
      </div>
    </div>
  )
}

export default App 