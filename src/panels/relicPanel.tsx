import * as React from "react";
import { GameState } from "../core/game-state";
import {RelicGenerator} from "../economy/transactions/relicGenerator";
import {StudentTransaction} from "../economy/transactions/studentTransaction";
import ReactTooltip from "react-tooltip";
import {assignGatherers, countAvailableStudents, removeGatherers} from "../economy/jobAssignments";

type GeneratorProps = {
    gameState: GameState,
    onPurchase: any,
    onAddCurrency: any
}

export class RelicPanel extends React.Component<GeneratorProps> {
    readonly studentTransaction = new StudentTransaction();

    assignGather() {
        const { gameState } = this.props;
        assignGatherers(1, gameState);
    }
    removeGather() {
        const { gameState } = this.props;
        removeGatherers(1, gameState);
    }

    render() {
        const { gameState, onAddCurrency, onPurchase } = this.props;
        const availableStudents = countAvailableStudents(gameState);
        return (
            <div>
                <button onClick={() => onAddCurrency("relics", 1)}>Look for relics</button>
                <p>
                    Students working: {gameState.jobAssignments.gatherRelics}
                    <button
                        disabled={availableStudents <= 0}
                        onClick={()=>this.assignGather()}>+</button>
                    <button
                        disabled={gameState.jobAssignments.gatherRelics <= 0}
                        onClick={()=>this.removeGather()}>-</button>
                </p>
                <br/>
                <div>
                    <div data-tip data-for="hireStudent">
                        <button disabled={!this.studentTransaction.isValidPurchase(gameState, 1)}
                                onClick={() => onPurchase(1, this.studentTransaction)}>
                            Hire a Student
                        </button>
                    </div>
                    <ReactTooltip id="hireStudent" place="top" effect="solid">
                        Hire some students to dust off relics for you. They work for relics.
                        Relics: {this.studentTransaction.getCost(gameState, 1)}
                    </ReactTooltip>
                </div>
            </div>
        );
    }
}
