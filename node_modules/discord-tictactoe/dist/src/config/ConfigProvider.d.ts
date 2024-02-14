import Config from './Config';
import { AIDifficulty } from './types';
export default class ConfigProvider implements Config {
    token: string;
    language: string;
    command: string;
    commandOptionName: string;
    textCommand: undefined;
    allowedChannelIds: never[];
    allowedRoleIds: never[];
    embedColor: number;
    requestExpireTime: number;
    requestCooldownTime: number;
    simultaneousGames: boolean;
    aiDifficulty: AIDifficulty;
    gameExpireTime: number;
    gameBoardDelete: boolean;
    gameBoardDisableButtons: boolean;
    gameBoardEmbed: boolean;
    gameBoardEmojies: never[];
    gameBoardReactions: boolean;
    [key: string]: any;
    private readonly CONFIG_PATH;
    constructor();
    private initializeFromFile;
    private initializeFromEnv;
    private static camelCase;
}
