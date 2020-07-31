import {ITransaction } from "../ITransaction";
import {GameState} from "../../core/game-state";
import {ACHIEVEMENT_ENTRY_TYPE, addDetailedJournalEntry} from "../../core/journal";

export class Profit implements ITransaction {
    updateClock = false;

    commitTransaction(gameState: GameState, amount: number): GameState {
        if(this.isValidPurchase(gameState, amount)) {
            gameState.resourceState.knowledge -= 20;
            gameState.researchState.profiteering = true;
            addDetailedJournalEntry(gameState, {
                entry: "A patron finds your work interesting, and provides a slow but steady drip of funding. Relic speed x 1.5.",
                entryType: ACHIEVEMENT_ENTRY_TYPE
            });
        }
        return gameState;
    }

    isValidPurchase(gameState: GameState, amount: number): boolean {
        return gameState.resourceState.knowledge >= 20;
    }
}
