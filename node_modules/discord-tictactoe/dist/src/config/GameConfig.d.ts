import { AIDifficulty, EmbedColor } from './types';
export default interface GameConfig {
    aiDifficulty?: AIDifficulty;
    embedColor?: EmbedColor;
    gameExpireTime?: number;
    gameBoardDelete?: boolean;
    gameBoardDisableButtons?: boolean;
    gameBoardEmbed?: boolean;
    gameBoardEmojies?: string[];
    gameBoardReactions?: boolean;
}
