import './createPost.js';
import { Devvit, useState, useWebView } from '@devvit/public-api';
import type { DevvitMessage, WebViewMessage } from './message.ts';

Devvit.configure({
  redditAPI: true,
  redis: true,
});

// Add a custom post type to Devvit
Devvit.addCustomPostType({
  name: 'Globe Explorer',
  height: 'tall',
  render: (context) => {
    // Load username with `useAsync` hook
    const [username] = useState(async () => {
      return (await context.reddit.getCurrentUsername()) ?? 'anon';
    });

    const [score, setScore] = useState(async () => {
      const scoreStr = await context.redis.get(`score_${context.userId}`);
      return scoreStr ? parseInt(scoreStr) : 0;
    });

    // State to track when a game has just finished and the new score
    const [gameJustFinished, setGameJustFinished] = useState(false);
    const [lastScore, setLastScore] = useState(0);
    const [isNewHighScore, setIsNewHighScore] = useState(false);

    // Helper function to fetch leaderboard data
    const fetchLeaderboardData = async (ctx) => {
      try {
        // Get the list of all users who have scores
        const userIds = await ctx.redis.get('globe_explorer_users');
        if (!userIds) return [];

        const userIdList = JSON.parse(userIds);
        const leaderboardData = [];

        // Fetch each user's score and username
        for (const userId of userIdList) {
          const userScore = await ctx.redis.get(`score_${userId}`);
          const userName = await ctx.redis.get(`username_${userId}`);

          if (userScore) {
            leaderboardData.push({
              userId,
              username: userName || 'Anonymous',
              score: parseInt(userScore)
            });
          }
        }

        // Sort by score (highest first)
        return leaderboardData.sort((a, b) => b.score - a.score).slice(0, 10);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
      }
    };

    // Get the leaderboard data
    const [leaderboard, setLeaderboard] = useState(async () => {
      return await fetchLeaderboardData(context);
    });

    // Track last location for game state restoration
    const [lastLocation, setLastLocation] = useState(async () => {
      const savedLocation = await context.redis.get(`lastLocation_${context.postId}`);
      return savedLocation ? JSON.parse(savedLocation) : null;
    });

    const webView = useWebView<WebViewMessage, DevvitMessage>({
      // URL of your web view content
      url: 'page.html',
      // Handle messages sent from the web view
      async onMessage(message, webView) {
        console.log('Received message:', message);
        switch (message.type) {
          case 'webViewReady':
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
            await context.redis.set(
                `lastLocation_${context.postId}`,
                JSON.stringify(message.data.location)
            );
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
                await context.redis.set(`score_${context.userId}`, roundScore.toString());
                setScore(roundScore);
              }

              // Store the username for display in leaderboard
              await context.redis.set(`username_${context.userId}`, username);

              // Add this user to the list of users with scores if not already there
              const userIdsStr = await context.redis.get('globe_explorer_users');
              let userIds = [];

              if (userIdsStr) {
                userIds = JSON.parse(userIdsStr);
                if (!userIds.includes(context.userId)) {
                  userIds.push(context.userId);
                }
              } else {
                userIds = [context.userId];
              }

              await context.redis.set('globe_explorer_users', JSON.stringify(userIds));

              // Update state to show the game finished UI
              setLastScore(roundScore);
              setIsNewHighScore(isNewRecord);
              setGameJustFinished(true);

              // Close the webView to return to the main UI


              // Refresh the leaderboard data
              const refreshedLeaderboard = await fetchLeaderboardData(context);
              setLeaderboard(refreshedLeaderboard);

            } catch (error) {
              console.error('Error saving score:', error);
              context.ui.showToast('Error saving score. Please try again.');
            }
            break;
          default:
            throw new Error(`Unknown message type: ${message satisfies never}`);
        }
      },
      onUnmount() {
        context.ui.showToast('Globe view closed!');
      },
    });

    // Render the simplified custom post type
    return (
        <vstack grow padding="medium" cornerRadius="medium" border="thin">
          <text size="xlarge" weight="bold" align="center">Globe Explorer</text>

          {/* Game finished screen */}
          {gameJustFinished ? (
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
                    onPress={() => setGameJustFinished(false)}
                    color="brand"
                    size="large">
                  Continue
                </button>
              </vstack>
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
          <vstack
              padding="medium"
              margin="medium"
              border="thin"
              cornerRadius="medium"
              background="secondary">
            <text size="large" weight="bold" align="center">Leaderboard</text>

            {leaderboard && leaderboard.length > 0 ? (
                leaderboard.map((entry, index) => (
                    <hstack
                        key={entry.userId}
                        padding="small"
                        border={index < leaderboard.length - 1 ? "bottom" : "none"}>
                      <text size="medium" weight="bold">{index + 1}.</text>
                      <spacer size="small" />
                      <text size="medium">{entry.username}</text>
                      <spacer grow />
                      <text size="medium" weight="bold">{entry.score}</text>
                    </hstack>
                ))
            ) : (
                <vstack padding="medium" alignment="middle center">
                  <text align="center">No scores yet.</text>
                  <text align="center">Be the first explorer!</text>
                </vstack>
            )}
          </vstack>
        </vstack>
    );
  },
});

export default Devvit;