import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

function App() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [parsedTweets, setParsedTweets] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [savedTweets, setSavedTweets] = useState([])
  const [isSaving, setIsSaving] = useState(false)

  // Fetch saved tweets on component mount
  useEffect(() => {
    fetchSavedTweets()
  }, [])

  const fetchSavedTweets = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_tweets')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setSavedTweets(data || [])
    } catch (error) {
      console.error('Error fetching saved tweets:', error)
    }
  }

  const handleSaveTweet = async (tweet) => {
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('saved_tweets')
        .insert([{ content: tweet }])

      if (error) throw error
      
      // Refresh the saved tweets list
      await fetchSavedTweets()
    } catch (error) {
      console.error('Error saving tweet:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteSavedTweet = async (id) => {
    try {
      const { error } = await supabase
        .from('saved_tweets')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      // Refresh the saved tweets list
      await fetchSavedTweets()
    } catch (error) {
      console.error('Error deleting tweet:', error)
    }
  }

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

  const getTweetCharCount = (tweet) => {
    return tweet.length;
  };

  return (
    <div className="min-h-screen bg-theme-background text-theme-text-primary font-dos p-4">
      <div className="container mx-auto max-w-6xl flex gap-4">
        {/* Main Content */}
        <div className="flex-1">
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

            {/* Modified Output Section with Save Button and Character Count */}
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
                      <div className="flex flex-col gap-2">
                        <div className="flex items-start gap-2">
                          <span className="text-theme-text-secondary shrink-0">{index + 1}.</span>
                          <p className="text-theme-text-primary flex-1">{tweet}</p>
                        </div>
                        <div className="flex items-center justify-between border-t border-theme-border-default pt-2 mt-1">
                          <span className="text-theme-text-secondary text-sm">
                            {getTweetCharCount(tweet)} chars
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveTweet(tweet)}
                              className="px-3 py-1 border-2 border-theme-border-default
                                       text-theme-text-highlight text-sm
                                       hover:bg-theme-text-primary hover:text-theme-background
                                       transition-colors whitespace-nowrap"
                              disabled={isSaving}
                            >
                              [Save]
                            </button>
                            <button
                              onClick={() => handleTweetClick(tweet)}
                              className="px-3 py-1 border-2 border-theme-border-default
                                       text-theme-text-highlight text-sm
                                       hover:bg-theme-text-primary hover:text-theme-background
                                       transition-colors whitespace-nowrap"
                            >
                              [Tweet]
                            </button>
                          </div>
                        </div>
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

        {/* Modified Saved Tweets Side Panel */}
        <div className="w-80 border-2 border-theme-border-default p-4 flex flex-col">
          <h2 className="text-xl text-theme-text-highlight mb-4 border-b-2 border-theme-border-default pb-2">
            C:\SAVED&gt; Saved Tweets
          </h2>
          <div className="space-y-4 flex-1 overflow-y-auto">
            {savedTweets.map((tweet) => (
              <div 
                key={tweet.id}
                className="p-3 border-2 border-theme-border-default hover:border-theme-border-focus
                         transition-colors bg-theme-background"
              >
                <div className="flex flex-col gap-2">
                  <p className="text-theme-text-primary break-words">{tweet.content}</p>
                  <div className="flex items-center justify-between border-t border-theme-border-default pt-2 mt-1">
                    <span className="text-theme-text-secondary text-sm">
                      {getTweetCharCount(tweet.content)} chars
                    </span>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleTweetClick(tweet.content)}
                        className="px-2 py-1 border-2 border-theme-border-default
                                 text-theme-text-highlight text-sm
                                 hover:bg-theme-text-primary hover:text-theme-background
                                 transition-colors"
                      >
                        [Tweet]
                      </button>
                      <button
                        onClick={() => handleDeleteSavedTweet(tweet.id)}
                        className="px-2 py-1 border-2 border-theme-border-default
                                 text-theme-error text-sm
                                 hover:bg-theme-error hover:text-theme-background
                                 transition-colors"
                      >
                        [Del]
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {savedTweets.length === 0 && (
              <div className="text-theme-text-secondary text-center p-4">
                No saved tweets yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App 