import { useState, useEffect } from 'react'
import { supabase, checkSupabaseConnection, CONTENT_TYPES } from './supabaseClient'
import { playGenerateSound, playSaveSound, playEditCompleteSound, playDeleteSound } from './sounds'
import { Button, Alert, Card, Section } from 'eidotter'

// ContentCard component for displaying and editing tweets/posts
function ContentCard({
  content,
  isEditing,
  editText,
  showHints,
  onEditTextChange,
  onSaveEdit,
  onCancelEdit,
  onStartEdit,
  onTweet,
  onDelete,
  onToggleHints,
  getCharCount,
  getTextareaHeight
}) {
  const handleEditKeyDown = (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      onSaveEdit()
    } else if (e.key === 'Escape') {
      onCancelEdit()
    } else if (e.key === '?') {
      e.preventDefault()
      onToggleHints()
    }
  }

  if (isEditing) {
    return (
      <Card variant="bordered" className="bg-theme-background">
        <div className="flex flex-col gap-2">
          {showHints && (
            <div className="text-theme-text-secondary text-xs border-2 border-theme-border-default p-2 mb-2">
              <div className="flex justify-between items-start mb-1">
                <p>╔════ Keyboard Shortcuts ════╗</p>
                <button
                  onClick={onToggleHints}
                  className="text-theme-text-highlight hover:text-theme-error ml-4"
                >
                  [x]
                </button>
              </div>
              <div className="pl-2">
                <p>• Ctrl+Enter - Save changes</p>
                <p>• Esc - Cancel editing</p>
              </div>
              <p>╚═══════════════════════════╝</p>
            </div>
          )}
          <div className="relative">
            <textarea
              value={editText}
              onChange={(e) => onEditTextChange(e.target.value)}
              onKeyDown={handleEditKeyDown}
              style={{ height: `${getTextareaHeight(editText)}px` }}
              className="w-full p-2 bg-theme-background border-2 border-theme-border-default
                       text-theme-text-primary font-dos resize-none focus:outline-none
                       focus:border-theme-border-focus text-sm sm:text-base
                       overflow-y-auto transition-all duration-200"
              autoFocus
            />
            <div className="absolute bottom-2 right-2 flex items-center gap-2">
              <span className="text-theme-text-secondary text-xs">
                {getCharCount(editText)} chars
              </span>
              <span className="animate-pulse text-theme-text-primary">█</span>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-theme-border-default pt-2">
            <div className="flex items-center gap-2">
              <span className="text-theme-text-secondary text-xs">
                {showHints ? '↑ Pro tips above' : '[?] Press ? for help'}
              </span>
            </div>
            <div className="flex gap-2">
              <Button size="small" variant="secondary" onClick={onCancelEdit}>
                [Cancel]
              </Button>
              <Button size="small" variant="secondary" onClick={onSaveEdit}>
                [Save]
              </Button>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card variant="bordered" className="bg-theme-background hover:border-theme-border-focus transition-colors">
      <div className="flex flex-col gap-2">
        <p className="text-theme-text-primary break-words text-sm sm:text-base">{content.content}</p>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-2 mt-1 gap-2 border-t border-theme-border-default">
          <span className="text-theme-text-secondary text-xs sm:text-sm">
            {getCharCount(content.content)} chars
          </span>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button size="small" variant="secondary" onClick={() => onStartEdit(content)} className="flex-1 sm:flex-none">
              [Edit]
            </Button>
            <Button size="small" variant="secondary" onClick={() => onTweet(content.content)} className="flex-1 sm:flex-none">
              [Tweet]
            </Button>
            <Button size="small" variant="secondary" onClick={() => onDelete(content.id)} className="flex-1 sm:flex-none text-theme-error hover:bg-theme-error">
              [Del]
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

// ContentSection component for sidebar sections (Twitter/LinkedIn)
function ContentSection({
  title,
  icon,
  items,
  emptyMessage,
  editingItem,
  editText,
  showHints,
  onEditTextChange,
  onSaveEdit,
  onCancelEdit,
  onStartEdit,
  onTweet,
  onDelete,
  onToggleHints,
  getCharCount,
  getTextareaHeight,
  defaultExpanded = true
}) {
  return (
    <Section title={`${icon} ${title}`} defaultExpanded={defaultExpanded}>
      <div className="space-y-4 max-h-[30vh] overflow-y-auto">
        {items.map((item) => (
          <ContentCard
            key={item.id}
            content={item}
            isEditing={editingItem?.id === item.id}
            editText={editText}
            showHints={showHints}
            onEditTextChange={onEditTextChange}
            onSaveEdit={onSaveEdit}
            onCancelEdit={onCancelEdit}
            onStartEdit={onStartEdit}
            onTweet={onTweet}
            onDelete={onDelete}
            onToggleHints={onToggleHints}
            getCharCount={getCharCount}
            getTextareaHeight={getTextareaHeight}
          />
        ))}
        {items.length === 0 && (
          <div className="text-theme-text-secondary text-center p-4 text-sm">
            {emptyMessage}
          </div>
        )}
      </div>
    </Section>
  )
}

function App() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [parsedTweets, setParsedTweets] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [savedContent, setSavedContent] = useState({
    [CONTENT_TYPES.TWITTER]: [],
    [CONTENT_TYPES.LINKEDIN]: []
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isSidebarVisible, setIsSidebarVisible] = useState(true)
  const [editingTweet, setEditingTweet] = useState(null)
  const [editText, setEditText] = useState('')
  const [showHints, setShowHints] = useState(true)
  const [supabaseError, setSupabaseError] = useState(null)
  const [contentType, setContentType] = useState(CONTENT_TYPES.TWITTER)

  // Fetch saved tweets on component mount
  useEffect(() => {
    fetchSavedContent()
  }, [])

  // Check Supabase connection on mount and periodically
  useEffect(() => {
    const checkConnection = async () => {
      const { error } = await checkSupabaseConnection()
      setSupabaseError(error)
    }

    // Initial check
    checkConnection()

    // Periodic check every 30 seconds
    const interval = setInterval(checkConnection, 30000)

    return () => clearInterval(interval)
  }, [])

  const fetchSavedContent = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_tweets')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Group content by type
      const grouped = (data || []).reduce((acc, item) => {
        const type = item.content_type || CONTENT_TYPES.TWITTER // Default to Twitter for legacy data
        acc[type] = acc[type] || []
        acc[type].push(item)
        return acc
      }, {
        [CONTENT_TYPES.TWITTER]: [],
        [CONTENT_TYPES.LINKEDIN]: []
      })

      setSavedContent(grouped)
    } catch (error) {
      console.error('Error fetching saved content:', error)
    }
  }

  const handleSaveContent = async (content) => {
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('saved_tweets')
        .insert([{
          content: content,
          content_type: contentType
        }])

      if (error) throw error

      playSaveSound()
      await fetchSavedContent()
    } catch (error) {
      console.error('Error saving content:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteSavedContent = async (id) => {
    try {
      const { error } = await supabase
        .from('saved_tweets')
        .delete()
        .eq('id', id)

      if (error) throw error

      playDeleteSound()
      await fetchSavedContent()
    } catch (error) {
      console.error('Error deleting tweet:', error)
    }
  }

  const handleEditClick = (tweet) => {
    setEditingTweet(tweet)
    setEditText(tweet.content)
  }

  const handleCancelEdit = () => {
    setEditingTweet(null)
    setEditText('')
  }

  const handleSaveEdit = async () => {
    if (!editingTweet) return

    try {
      const { error } = await supabase
        .from('saved_tweets')
        .update({ content: editText })
        .eq('id', editingTweet.id)

      if (error) throw error

      playEditCompleteSound()
      await fetchSavedContent()
      handleCancelEdit()
    } catch (error) {
      console.error('Error updating tweet:', error)
    }
  }

  // Function to parse numbered tweets
  const parseTweets = (text) => {
    if (!text) return []
    const tweets = text.split('\n')
      .map(line => line.trim())
      .filter(line => /^\d+\.\s/.test(line))
      .map(line => line.replace(/^\d+\.\s/, ''))
    return tweets
  }

  const handleTweetClick = (tweet) => {
    const tweetText = encodeURIComponent(tweet)
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank')
  }

  const handleRemix = async () => {
    setIsLoading(true)
    setError(null)
    setParsedTweets([])
    try {
      const response = await fetch('/api/remix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
          contentType
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to remix content')
      }

      setOutputText(data.remixedText)
      setParsedTweets(parseTweets(data.remixedText))
      playGenerateSound()
    } catch (error) {
      console.error('Detailed error:', error)
      setError(error.message)
      setOutputText('')
    } finally {
      setIsLoading(false)
    }
  }

  const getTweetCharCount = (tweet) => tweet.length

  const getTextareaHeight = (text) => {
    const lineHeight = 20
    const padding = 32
    const lines = text.split('\n').length
    return Math.max(lines * lineHeight + padding, 160)
  }

  return (
    <div className="min-h-screen bg-theme-background text-theme-text-primary font-dos p-2 sm:p-4">
      {supabaseError && (
        <Alert
          type="error"
          size="small"
          title="Connection Error"
          className="fixed top-0 left-0 right-0 z-50"
        >
          {supabaseError}
        </Alert>
      )}
      <div className="container mx-auto max-w-6xl flex flex-col lg:flex-row gap-4">
        {/* Main Content */}
        <div className="flex-1">
          {/* DOS-style Header */}
          <div className="mb-4 sm:mb-8">
            <h1 className="text-2xl sm:text-4xl font-bold text-center text-theme-text-highlight whitespace-nowrap overflow-x-auto">
              <span className="hidden sm:inline">╔═══════════════════╗</span>
              <span className="inline sm:hidden">╔═══════╗</span>
              <br />
              <span className="hidden sm:inline">║  Content Remixer  ║</span>
              <span className="inline sm:hidden">║ Remixer ║</span>
              <br />
              <span className="hidden sm:inline">╚═══════════════════╝</span>
              <span className="inline sm:hidden">╚═══════╝</span>
            </h1>
            <p className="text-center mt-2 text-theme-text-secondary text-sm sm:text-base">
              D:\APPS\REMIXER&gt; Generate Twitter and LinkedIn Posts from your Articles
            </p>
          </div>

          {/* Main Terminal Window */}
          <div className="p-2 sm:p-4">
            {/* Input Section */}
            <div className="mb-4 sm:mb-6">
              <label className="block mb-2 text-theme-text-highlight text-sm sm:text-base">
                D:\INPUT&gt;
              </label>
              <div className="relative">
                <textarea
                  className="w-full p-2 bg-theme-background border-2 border-theme-border-default text-theme-text-primary
                            font-dos resize-none focus:outline-none focus:border-theme-border-focus
                            min-h-[120px] text-sm sm:text-base"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type or paste your content here..."
                  disabled={isLoading}
                />
                <span className="absolute bottom-2 right-2 animate-pulse text-theme-text-primary">█</span>
              </div>
            </div>

            {/* Mode Buttons */}
            <div className="flex justify-center gap-4 mb-4 sm:mb-6">
              <Button
                variant="secondary"
                size="medium"
                disabled={isLoading || !inputText.trim()}
                loading={isLoading && contentType === CONTENT_TYPES.TWITTER}
                onClick={() => {
                  setContentType(CONTENT_TYPES.TWITTER)
                  handleRemix()
                }}
                className={contentType === CONTENT_TYPES.TWITTER ? 'border-theme-text-highlight' : ''}
              >
                [Generate for Twitter]
              </Button>
              <Button
                variant="secondary"
                size="medium"
                disabled={isLoading || !inputText.trim()}
                loading={isLoading && contentType === CONTENT_TYPES.LINKEDIN}
                onClick={() => {
                  setContentType(CONTENT_TYPES.LINKEDIN)
                  handleRemix()
                }}
                className={contentType === CONTENT_TYPES.LINKEDIN ? 'border-theme-text-highlight' : ''}
              >
                [Generate for LinkedIn]
              </Button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-4 sm:mb-6">
                <Alert type="error" title="Error" onClose={() => setError(null)}>
                  {error}
                </Alert>
              </div>
            )}

            {/* Output Section */}
            <div>
              <label className="block mb-2 text-theme-text-highlight text-sm sm:text-base">
                D:\OUTPUT&gt; Generated {contentType === CONTENT_TYPES.TWITTER ? 'tweets' : 'posts'}:
              </label>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center items-center h-[120px]">
                    <div className="animate-pulse text-theme-text-secondary text-sm sm:text-base">
                      Processing request...
                      <br />
                      Please wait...
                    </div>
                  </div>
                ) : parsedTweets.length > 0 ? (
                  parsedTweets.map((tweet, index) => (
                    <Card
                      key={index}
                      variant="bordered"
                      className="bg-theme-background hover:border-theme-border-focus transition-colors"
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-start gap-2">
                          <span className="text-theme-text-secondary shrink-0 text-sm sm:text-base">{index + 1}.</span>
                          <p className="text-theme-text-primary flex-1 text-sm sm:text-base">{tweet}</p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-2 mt-1 gap-2 border-t border-theme-border-default">
                          <span className="text-theme-text-secondary text-xs sm:text-sm">
                            {getTweetCharCount(tweet)} chars
                          </span>
                          <div className="flex gap-2 w-full sm:w-auto">
                            <Button
                              size="small"
                              variant="secondary"
                              onClick={() => handleSaveContent(tweet)}
                              disabled={isSaving}
                              className="flex-1 sm:flex-none"
                            >
                              [Save]
                            </Button>
                            <Button
                              size="small"
                              variant="secondary"
                              onClick={() => handleTweetClick(tweet)}
                              className="flex-1 sm:flex-none"
                            >
                              [Tweet]
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : outputText ? (
                  <div className="whitespace-pre-wrap text-sm sm:text-base">{outputText}</div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 text-center text-theme-text-secondary text-sm sm:text-base">
            Don't just be, press a key :D
          </div>
        </div>

        {/* Mobile Sidebar Toggle */}
        <div className="lg:hidden text-center mt-4">
          <Button
            variant="secondary"
            size="small"
            onClick={() => setIsSidebarVisible(!isSidebarVisible)}
          >
            [Saved Content {isSidebarVisible ? '▼' : '▲'}]
          </Button>
        </div>

        {/* Sidebar Container */}
        <div className={`
          lg:relative
          transition-all duration-300 ease-in-out
          ${isSidebarVisible ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}
          lg:max-h-none lg:opacity-100
          mt-2 lg:mt-0
          lg:min-w-[350px]
        `}>
          {/* Desktop Sidebar Toggle */}
          <div className="hidden lg:block">
            <Button
              variant="secondary"
              size="small"
              onClick={() => setIsSidebarVisible(!isSidebarVisible)}
              className="mb-2"
            >
              [{isSidebarVisible ? '<<' : '>>'}]
            </Button>
          </div>

          {/* Saved Content Panel */}
          <div className={`
            w-full lg:w-auto
            border-2 border-theme-border-default
            bg-theme-background
            p-4 flex flex-col
            transition-all duration-300 ease-in-out
            ${isSidebarVisible ? 'opacity-100' : 'lg:opacity-0 lg:w-0 lg:p-0 lg:border-0'}
          `}>
            <h2 className="text-lg sm:text-xl text-theme-text-highlight mb-4 border-b-2 border-theme-border-default pb-2">
              D:\SAVED&gt; Saved Content
            </h2>

            {/* Twitter Section */}
            <div className="mb-6">
              <ContentSection
                title="Twitter"
                icon="├─▼"
                items={savedContent[CONTENT_TYPES.TWITTER]}
                emptyMessage="No saved tweets"
                editingItem={editingTweet}
                editText={editText}
                showHints={showHints}
                onEditTextChange={setEditText}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
                onStartEdit={handleEditClick}
                onTweet={handleTweetClick}
                onDelete={handleDeleteSavedContent}
                onToggleHints={() => setShowHints(prev => !prev)}
                getCharCount={getTweetCharCount}
                getTextareaHeight={getTextareaHeight}
                defaultExpanded={true}
              />
            </div>

            {/* LinkedIn Section */}
            <div>
              <ContentSection
                title="LinkedIn"
                icon="└─▼"
                items={savedContent[CONTENT_TYPES.LINKEDIN]}
                emptyMessage="No saved posts"
                editingItem={editingTweet}
                editText={editText}
                showHints={showHints}
                onEditTextChange={setEditText}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
                onStartEdit={handleEditClick}
                onTweet={handleTweetClick}
                onDelete={handleDeleteSavedContent}
                onToggleHints={() => setShowHints(prev => !prev)}
                getCharCount={getTweetCharCount}
                getTextareaHeight={getTextareaHeight}
                defaultExpanded={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
