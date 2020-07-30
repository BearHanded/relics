import * as React from "react";
import {loadSave, newSave, saveGame, saveGameExists} from "./saveService";
import {Header} from "../layout/Header";
import {Generators} from "../generators/generators";
import {Settings} from "../settings/Settings";
import {GameState} from "./game-state";
import {IPurchasable} from "../economy/IPurchaseable";
import {GameClock} from "./game-clock";
import {AdventureLog} from "../adventure-log/AdventureLog";
import {addJournalEntry, clearJournal} from "../adventure-log/journal";
import {PanelSelector} from "../layout/PanelSelector";
import {GENERATORS_PANEL_KEY, SETTINGS_PANEL_KEY} from "../config/constants";

type CoreProps = {}
type CoreState = {
    gameState: GameState,
    activePanel: string
}

export class CorePanel extends React.Component<CoreProps, CoreState> {
    clock: GameClock | undefined;
    readonly state = {
        gameState: saveGameExists() ? loadSave() : newSave(),
        activePanel: GENERATORS_PANEL_KEY
    };

    componentDidMount(): void {
        this.clock = new GameClock(this.state.gameState, (newState: GameState) => this.onTick(newState));
        this.setState({activePanel: GENERATORS_PANEL_KEY});
    }

    onTick(newState: GameState) {
        this.setState({gameState: newState});
    }

    addCurrency(currencyName: string, currencyAmount: number) {
        // TODO: Abstract this for manual action & future FAME multiplier
        const newState = {...this.state.gameState};
        newState.currencies.relics += currencyAmount;
        addJournalEntry(newState, "You dust off some potsherds.");
        this.setState({gameState: newState})
    }

    makePurchase(purchaseAmount: number, purchaseType: IPurchasable) {
        let newState = {...this.state.gameState};
        newState = purchaseType.commitTransaction(newState, purchaseAmount);

        this.setState({gameState: newState});
        if(purchaseType.updateClock) {
            // @ts-ignore
            this.clock.updateState(newState);
        }
    }

    clearLog() {
        clearJournal(this.state.gameState)
    }

    changeActivePanel(panelKey: string) {
        this.setState({activePanel: panelKey});
    }

    save() {
        const newState = {...this.state.gameState};
        newState.saveTime = new Date();
        this.setState({gameState: newState});
        saveGame(newState);
    }

    clearSave() {
        console.log("CLEARING SAVE")
        // @ts-ignore
        this.clock.clearClock();
        const newState = newSave();
        newState.saveTime = new Date();
        this.setState({gameState: newState});
        saveGame(newState);
        // eslint-disable-next-line no-restricted-globals
        location.reload();
    }

    render() {
        let activePanel;
        switch (this.state.activePanel) {
            case SETTINGS_PANEL_KEY:
                activePanel = (
                    <Settings
                        gameState={this.state.gameState}
                        onSave={() => this.save()}
                        onClearSave={() => this.clearSave()}
                    />
                )
                break;
            case GENERATORS_PANEL_KEY:
            default:
                activePanel = (
                    <Generators
                        gameState={this.state.gameState}
                        onAddCurrency={(currencyName: string, currencyAmount: number) => this.addCurrency(currencyName, currencyAmount)}
                        onPurchase={(purchaseAmount: number, purchaseType: IPurchasable) => this.makePurchase(purchaseAmount, purchaseType)}
                    />
                );
        }

        return (
            <div>
                <header className="app-header">
                    <Header gameState={this.state.gameState}/>
                </header>
                <PanelSelector onChangePanel={(panelKey: string) => this.changeActivePanel(panelKey)}/>
                <div className="core-panel__flex">
                    {activePanel}
                    <div>
                        <AdventureLog clearLog={() => this.clearLog()} journalState={this.state.gameState.journalState}/>
                    </div>
                </div>

            </div>
        );
    }
}
