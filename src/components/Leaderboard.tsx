/**
 * Leaderboard Component
 * Displays a leaderboard of top scores
 */
import {Devvit} from '@devvit/public-api';
import {LeaderboardEntry} from '../api/redisService';

interface LeaderboardProps {
    /**
     * List of leaderboard entries
     */
    entries: LeaderboardEntry[];

    /**
     * Title for the leaderboard
     */
    title?: string;

    /**
     * Current user ID to highlight their entry
     */
    currentUserId?: string;

    /**
     * Function to call when refresh is requested
     */
    onRefresh?: () => void;

    /**
     * Whether the leaderboard is loading
     */
    isLoading?: boolean;
}

/**
 * Leaderboard component
 */
export function Leaderboard(props: LeaderboardProps) {
    const {
        entries = [],
        title = 'Leaderboard',
        currentUserId,
        onRefresh,
        isLoading = false
    } = props;

    return (
        <vstack
            padding="medium"
            margin="medium"
            border="thin"
            cornerRadius="medium"
            background="secondary">

            <hstack alignment="center middle" width="100%">
                <text size="large" weight="bold" align="center">{title}</text>

                {onRefresh && (
                    <>
                        <spacer grow/>
                        <button
                            icon="refresh"
                            size="small"
                            onPress={onRefresh}
                            disabled={isLoading}
                        />
                    </>
                )}
            </hstack>

            {
                isLoading ? (
                    <vstack padding="medium" alignment="middle center">
                        <text>Loading...</text>
                    </vstack>
                ) : entries.length > 0 ? (
                    entries.map((entry, index) => (
                        <hstack
                            key={entry.userId}
                            padding="small"
                            border={index < entries.length - 1 ? "bottom" : "none"}
                            background={currentUserId === entry.userId ? "accent" : undefined}>

                            <text size="medium" weight="bold">{index + 1}.</text>
                            <spacer size="small"/>
                            <text
                                size="medium"
                                weight={currentUserId === entry.userId ? "bold" : "normal"}>
                                {entry.username}
                            </text>
                            <spacer grow/>
                            <text size="medium" weight="bold">{entry.score}</text>
                        </hstack>
                    ))
                ) : (
                    <vstack padding="medium" alignment="middle center">
                        <text align="center">No scores yet.</text>
                        <text align="center">Be the first explorer!</text>
                    </vstack>
                )
            }
        </vstack>
    );
}