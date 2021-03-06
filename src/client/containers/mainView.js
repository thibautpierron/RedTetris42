import React from 'react'
import Board from '../components/board'
import Shadow from '../components/shadow'
import Preview from '../components/preview'
import Score from '../components/score'
import Panel from '../components/panel'
import math from 'mathjs'


class MainView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            pause: true,
            state: props.game.state,
            antiRepeatFlag: false,
        }
        this.socket = props.socket
        this.gameStartSubmit = this.gameStartSubmit.bind(this)
        this.listener = this.onKeyDown.bind(this)
    }

    onKeyDown (e) {
        if (this.state.antiRepeatFlag === false) {
            switch (e.keyCode) {
                case 37: this.props.actions.left(); break;
                case 39: this.props.actions.right(); break;
                case 40: this.props.actions.fall(); break;
                case 38: this.props.actions.rotate(); break;
                case 32: this.props.actions.dive(); break;
                case 40: this.props.actions.test(0); break;
                case 49: this.props.actions.test(1); break;
                case 50: this.props.actions.test(2); break;
                case 51: this.props.actions.test(3); break;
            }
            this.setState({antiRepeatFlag: true})
            setTimeout(() => {this.setState({antiRepeatFlag: false})}, 10)
        }
    }

    componentWillReceiveProps(nextProps) {
        let newPlayer = {}
        let oldPlayer = {}
        if (this.props.game.players) {
            newPlayer = nextProps.game.players.find(player => player.name === this.props.player.name)
            oldPlayer = this.props.game.players.find(player => player.name === this.props.player.name)
        }

        if (nextProps.game.state === 1 && this.props.game.state !== 1) {
            window.addEventListener("keydown", this.listener)
            const intervalID = setInterval(() => this.props.actions.fall(), 1000);
            this.setState({pause: false, intervalID })
        } else if (nextProps.game.state !== 1 && this.props.game.state === 1 || (newPlayer.looser && !oldPlayer.looser)) {
            window.removeEventListener("keydown", this.listener)
            clearInterval(this.state.intervalID);
        }
        if (nextProps.game.state === 2 && this.props.game.state === 1) {
            this.setState({older: true})
        }
    }

    componentWillUnmount() {
        clearInterval(this.state.intervalID);
        window.removeEventListener("keydown", this.listener)
        this.props.actions.game_exit()
        this.socket.emit('action', { type: 'server/exit' })
    }

    gameStartSubmit(event) {
        event.preventDefault()
        this.socket.emit('action', { type: "server/start" })
    }

    statusGame () {
        switch (this.props.game.state) {
            case 0:
                if (this.props.game.leader === this.props.player.name)
                    return (
                        <div className={"statusGame"}>
                            <div className={"cursor"}></div>
                            <h1 className={'startGameButton'} onClick={this.gameStartSubmit}>start game</h1>
                        </div>
                    )
                else
                    return (
                        <div className={"statusGame"}>
                           <h1>waiting for game start</h1>
                        </div>
                    )
            case 2:
                let resultGame = null
                if (this.state.older){
                    const looser = this.props.game.players.find(player => player.name === this.props.player.name).looser
                    resultGame = looser ? "you loose" : "you win"
                }
                if (this.props.game.leader === this.props.player.name)
                    return (
                        <div className={"statusGame"}>
                            <div>{resultGame}</div>
                            <div className={"cursor"}></div>
                            <h1 className={'startGameButton'} onClick={this.gameStartSubmit}>restart game</h1>
                        </div>
                    )
                else
                    return (
                        <div className={"statusGame"}>
                            <div>{resultGame}</div>
                            <h1>waiting for game restart</h1>
                        </div>
                    )
            default:
                return null
        }
    }


    render() {
        if (this.props.game.state === undefined) 
            return null;
        
        const list_shadows = this.props.game.players
            .filter( player => player.name !== this.props.player.name)
            .map( player => (<Shadow board={player.board} key={player.name} name={player.name} />))
        const len = list_shadows.length
        const nbBySide = math.ceil(len / 2)
        const sides = {
            left: list_shadows.slice(0, nbBySide),
            right: list_shadows.slice(nbBySide, len),
        }
        return (
            <div className={"mainView"}>
                <div className={"shadowLeftPart"}>
                    {sides.left}
                </div>
                <div className={"boardMainPart"}>
                    <Board 
                        tetro={this.props.tetro}
                        board={this.props.board}
                        actions={this.props.actions.fall}
                        message={this.statusGame()}
                    />
                    <div className={"boardInfoPart"}>
                        <Score score={this.props.score}/>
                        <Panel name={"lines"} info={this.props.linesDone}/>
                        <Preview tetro={this.props.nextTetro} />
                    </div>
                </div>
                <div className={"shadowRightPart"}>
                    {sides.right}                    
                </div>
            </div>
        )
    }
}

export default MainView