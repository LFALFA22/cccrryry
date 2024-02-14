import { AIComputeResult } from './AIComputeResult';
import { AIDifficultyLevel } from './AIDifficultyLevel';
import Entity from '../Entity';
import Game from '../Game';
export default class AI implements Entity {
    private static readonly DIFFICULTY_RANDOM_RATES;
    id: string;
    displayName: string;
    private randomRate;
    constructor(difficultyLevel?: AIDifficultyLevel);
    operate(game: Game): AIComputeResult;
    toString(): string;
    private static minimax;
    private static minimaxCell;
    private static getComputeType;
    private static randomized;
}
