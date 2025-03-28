/**
 * Redis Service
 * Handles all Redis database operations for the Globe Explorer app
 */
import {RedisClient} from '@devvit/public-api';

/**
 * Service class for Redis operations
 */
export class RedisService {
    private redis: RedisClient;

    /**
     * Create a new RedisService
     * @param redis - Devvit Redis client
     */
    constructor(redis: RedisClient) {
        this.redis = redis;
    }

    /**
     * Get user score
     * @param userId - User ID
     * @returns User score or 0 if not found
     */
    async getUserScore(userId: string): Promise<number> {
        try {
            const scoreStr = await this.redis.get(`score_${userId}`);
            return scoreStr ? parseInt(scoreStr) : 0;
        } catch (error) {
            console.error('Error getting user score:', error);
            return 0;
        }
    }

    /**
     * Save user score
     * @param userId - User ID
     * @param username - Username
     * @param score - Score to save
     * @returns True if successful
     */
    async saveUserScore(userId: string, username: string, score: number): Promise<boolean> {

        // Save score
            await this.redis.set(`score_${userId}`, score.toString());
            // Save username for leaderboard
            await this.redis.set(`username_${userId}`, username);
            // Add user to the list of users with scores if not already there
            await this.addUserToLeaderboard(userId);
            return true;
    }

    /**
     * Add user to leaderboard users list
     * @param userId - User ID
     */
    private async addUserToLeaderboard(userId: string): Promise<void> {

        const userIdsStr = await this.redis.get('globe_explorer_users');
            let userIds: string[] = [];

            if (userIdsStr) {
                userIds = JSON.parse(userIdsStr);
                if (!userIds.includes(userId)) {
                    userIds.push(userId);
                }
            } else {
                userIds = [userId];
            }

            await this.redis.set('globe_explorer_users', JSON.stringify(userIds));

    }

    /**
     * Get leaderboard data
     * @param limit - Maximum number of entries to return
     * @returns Leaderboard data sorted by score
     */
    async getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {

        // Get the list of all users who have scores
            const userIdsStr = await this.redis.get('globe_explorer_users');
            if (!userIdsStr) return [];

            const userIds = JSON.parse(userIdsStr) as string[];
            const leaderboardData: LeaderboardEntry[] = [];

            // Fetch each user's score and username
            for (const userId of userIds) {
                const userScore = await this.redis.get(`score_${userId}`);
                const userName = await this.redis.get(`username_${userId}`);

                if (userScore) {
                    leaderboardData.push({
                        userId,
                        username: userName || 'Anonymous',
                        score: parseInt(userScore)
                    });
                }
            }

            // Sort by score (highest first) and limit the results
            return leaderboardData
                .sort((a, b) => b.score - a.score)
                .slice(0, limit);

    }

    /**
     * Save a location for a post
     * @param postId - Post ID
     * @param location - Location data
     * @returns True if successful
     */
    async saveLocation(postId: string, location: any): Promise<boolean> {

        await this.redis.set(
                `lastLocation_${postId}`,
                JSON.stringify(location)
            );
            return true;

    }

    /**
     * Get saved location for a post
     * @param postId - Post ID
     * @returns Location data or null if not found
     */
    async getLocation(postId: string): Promise<any | null> {

        const savedLocation = await this.redis.get(`lastLocation_${postId}`);
            return savedLocation ? JSON.parse(savedLocation) : null;

    }
}

/**
 * Leaderboard entry type
 */
export interface LeaderboardEntry {
    userId: string;
    username: string;
    score: number;
}