/**
 * Globe Explorer - Main Entry Point
 */
import { Devvit, useState, useWebView } from '@devvit/public-api';
import {RedisService, LeaderboardEntry} from './api/redisService';
import {Leaderboard} from './components/Leaderboard';
import './createPost';
import type {DevvitMessage, WebViewMessage} from './types/message';

// Configure Devvit
Devvit.configure({
  redditAPI: true,
  redis: true,
});

/**
 * GameFinishedScreen Component
 * Displayed after a game is finished
 */
function GameFinishedScreen({
                                lastScore,
                                score,
                                isNewHighScore,
                                onContinue
                            }) {
    return (
        <vstack padding="large" spacing="medium" alignment="middle center">
            <text size="large" weight="bold" align="center">Game Finished!</text>

            <vstack
                background={isNewHighScore ? "success" : "secondary"}
                padding="large"
                cornerRadius="large"
                alignment="middle center"
                width="90%">

                <text size="medium" weight="bold">YOUR SCORE</text>
                <text size="xxlarge" weight="bold">{lastScore}</text>

                {isNewHighScore && (
                    <vstack padding="medium" alignment="middle center">
                        <text size="large" weight="bold" color="white">NEW HIGH SCORE!</text>
                        <text size="small">Previous best: {score !== lastScore ? score : "None"}</text>
                    </vstack>
                )}
            </vstack>

            <button
                onPress={onContinue}
                color="brand"
                size="large">
                Continue
            </button>
        </vstack>
    );
}

/**
 * Main component for the Globe Explorer custom post type
 */
Devvit.addCustomPostType({
  name: 'Globe Explorer',
  height: 'tall',
  render: (context) => {
      // Load username
    const [username] = useState(async () => {
      return (await context.reddit.getCurrentUsername()) ?? 'anon';
    });

      // Create Redis service
      const redisService = new RedisService(context.redis);

      // Load user score
    const [score, setScore] = useState(async () => {
        return await redisService.getUserScore(context.userId);
    });

      // State for game completion
    const [gameJustFinished, setGameJustFinished] = useState(false);
    const [lastScore, setLastScore] = useState(0);
    const [isNewHighScore, setIsNewHighScore] = useState(false);

      // Load leaderboard data
      const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(async () => {
          return await redisService.getLeaderboard();
    });

    // Track last location for game state restoration
    const [lastLocation, setLastLocation] = useState(async () => {
        return await redisService.getLocation(context.postId);
    });

      // Set up WebView
    const webView = useWebView<WebViewMessage, DevvitMessage>({
      url: 'page.html',
      async onMessage(message, webView) {
        console.log('Received message:', message);

        switch (message.type) {
          case 'webViewReady':
              // Send initial data to the WebView
            webView.postMessage({
              type: 'initialData',
              data: {
                username: username,
                lastLocation: lastLocation,
              },
            });
            break;

          case 'locationClicked':
            // Save the clicked location
              await redisService.saveLocation(context.postId, message.data.location);
            setLastLocation(message.data.location);

            // Acknowledge the click
            webView.postMessage({
              type: 'locationUpdated',
              data: {
                location: message.data.location,
              },
            });

            // Show toast with location info
            context.ui.showToast(`Location clicked: ${message.data.location.name || 'Unknown'}`);
            break;

          case 'gameFinished':
            try {
              const roundScore = message.data.roundScore;

              // Check if this is a new high score
              const isNewRecord = roundScore > score;

              // Store the user's score if it's higher than their previous best
              if (isNewRecord) {
                  await redisService.saveUserScore(context.userId, username, roundScore);
                setScore(roundScore);
              }

              // Update state to show the game finished UI
              setLastScore(roundScore);
              setIsNewHighScore(isNewRecord);
              setGameJustFinished(true);

              // Close the webView to return to the main UI
                webView.close();

              // Refresh the leaderboard data
                const refreshedLeaderboard = await redisService.getLeaderboard();
              setLeaderboard(refreshedLeaderboard);
            } catch (error) {
              console.error('Error saving score:', error);
              context.ui.showToast('Error saving score. Please try again.');
            }
            break;

          default:
              throw new Error(`Unknown message type: ${message}`);
        }
      },
      onUnmount() {
        context.ui.showToast('Globe view closed!');
      },
    });

      // Refresh leaderboard data
      const refreshLeaderboard = async () => {
          const refreshedLeaderboard = await redisService.getLeaderboard();
          setLeaderboard(refreshedLeaderboard);
      };

      // Render the custom post type
    return (
        <vstack grow padding="medium" cornerRadius="medium" border="thin">
          <text size="xlarge" weight="bold" align="center">Globe Explorer</text>

          {/* Game finished screen */}
          {gameJustFinished ? (
              <GameFinishedScreen
                  lastScore={lastScore}
                  score={score}
                  isNewHighScore={isNewHighScore}
                  onContinue={() => setGameJustFinished(false)}
              />
          ) : (
              /* User info and Play button */
              <vstack padding="medium" spacing="medium" alignment="middle center">
                <hstack spacing="small">
                  <text size="medium">Welcome,</text>
                  <text size="medium" weight="bold">{username}</text>
                </hstack>

                {score > 0 && (
                    <hstack>
                      <text size="medium">Your Best Score:</text>
                      <spacer size="xsmall" />
                      <text size="large" weight="bold" color="white">{score}</text>
                    </hstack>
                )}

                <button
                    onPress={() => webView.mount()}
                    color="brand"
                    size="large">
                  Play
                </button>
              </vstack>
          )}

          {/* Always visible leaderboard */}
            <Leaderboard
                title="Leaderboard"
                entries={leaderboard}
                currentUserId={context.userId}
                onRefresh={refreshLeaderboard}
            />
        </vstack>
    );
  },
});

export default Devvit;