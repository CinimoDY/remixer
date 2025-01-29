import { useState } from 'react'

function App() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [parsedTweets, setParsedTweets] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Function to parse numbered tweets
  const parseTweets = (text) => {
    if (!text) return [];
    // Match lines that start with a number followed by a dot and space
    const tweets = text.split('\n')
      .map(line => line.trim())
      .filter(line => /^\d+\.\s/.test(line))
      .map(line => line.replace(/^\d+\.\s/, ''));
    return tweets;
  };

  const handleTweetClick = (tweet) => {
    const tweetText = encodeURIComponent(tweet);
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
  };

  const handleRemix = async () => {
    setIsLoading(true);
    setError(null);
    setParsedTweets([]);
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
      setParsedTweets(parseTweets(data.remixedText));
    } catch (error) {
      console.error('Detailed error:', error);
      setError(error.message);
      setOutputText('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-theme-background text-theme-text-primary font-dos p-4">
      <div className="container mx-auto max-w-4xl">
        {/* DOS-style Header */}
        <div className="mb-8 border-2 border-theme-border-default p-4">
          <h1 className="text-4xl font-bold text-center text-theme-text-highlight">
            ╔═══════════════════╗
            <br />
            ║  Content Remixer  ║
            <br />
            ╚═══════════════════╝
          </h1>
          <p className="text-center mt-2 cursor text-theme-text-secondary">
            C:\APPS\REMIXER&gt; Transform your text with AI magic
          </p>
        </div>
        
        {/* Main Terminal Window */}
        <div className="border-2 border-theme-border-default p-4">
          {/* Input Section */}
          <div className="mb-6">
            <label className="block mb-2 text-theme-text-highlight">
              C:\INPUT&gt; Enter your text:
            </label>
            <textarea
              className="w-full p-2 bg-theme-background border-2 border-theme-border-default text-theme-text-primary 
                        font-dos resize-none focus:outline-none focus:border-theme-border-focus
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
              className="px-6 py-2 border-2 border-theme-border-default 
                        text-theme-text-highlight
                        hover:bg-theme-text-primary hover:text-theme-background
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
            <div className="mb-6 p-2 border-2 border-theme-error text-theme-error">
              ERROR: {error}
            </div>
          )}

          {/* Output Section */}
          <div>
            <label className="block mb-2 text-theme-text-highlight">
              C:\OUTPUT&gt; Generated tweets:
            </label>
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center items-center h-[120px]">
                  <div className="animate-pulse text-theme-text-secondary">
                    Processing request...
                    <br />
                    Please wait...
                  </div>
                </div>
              ) : parsedTweets.length > 0 ? (
                parsedTweets.map((tweet, index) => (
                  <div 
                    key={index}
                    className="p-3 border-2 border-theme-border-default hover:border-theme-border-focus
                             transition-colors bg-theme-background"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start flex-1">
                        <span className="text-theme-text-secondary mr-2">{index + 1}.</span>
                        <p className="text-theme-text-primary">{tweet}</p>
                      </div>
                      <button
                        onClick={() => handleTweetClick(tweet)}
                        className="ml-4 px-3 py-1 border-2 border-theme-border-default
                                 text-theme-text-highlight text-sm
                                 hover:bg-theme-text-primary hover:text-theme-background
                                 transition-colors whitespace-nowrap"
                      >
                        [Tweet This]
                      </button>
                    </div>
                  </div>
                ))
              ) : outputText ? (
                <div className="whitespace-pre-wrap">{outputText}</div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center text-theme-text-secondary">
          Press any key to continue...
        </div>
      </div>
    </div>
  )
}

export default App 