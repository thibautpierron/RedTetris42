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
            state: props.room.state,
            antiRepeatFlag: false,
        }
        this.socket = props.socket
        this.gameStartSubmit = this.gameStartSubmit.bind(this)
    }

    onKeyDown (e) {
        if (this.state.antiRepeatFlag === false) {
            switch (e.keyCode) {
                case 37: this.props.actions.left(); break;
                case 39: this.props.actions.right(); break;
                case 40: this.props.actions.fall(); break;
                case 38: this.props.actions.rotate(); break;
                case 32: this.props.actions.dive(); break;
                case 53: this.props.actions.test(); break;
            }
            this.setState({antiRepeatFlag: true})
            setTimeout(() => {this.setState({antiRepeatFlag: false})}, 10)
        }
    }

    componentWillReceiveProps(nextProps) {
        let newPlayer = {}
        let oldPlayer = {}
        if (this.props.room.players) {
            newPlayer = nextProps.room.players.find(player => player.name === this.props.player.name)
            oldPlayer = this.props.room.players.find(player => player.name === this.props.player.name)
        }

        if (nextProps.room.state === 1 && this.props.room.state !== 1) {
            const intervalID = setInterval(() => this.props.actions.fall(), 1000);
            this.setState({pause: false, intervalID })
        } else if (nextProps.room.state !== 1 && this.props.room.state === 1 || newPlayer.looser !== oldPlayer.looser) {
            clearInterval(this.state.intervalID);
            console.log("HERE")           
            // window.removeEventListener("keydown", this.listener)
        }
    }

    componentDidMount() {
        this.listener = this.onKeyDown.bind(this)
        window.addEventListener("keydown", this.listener)
        this.socket.emit('room', {
            type: 'createOrJoin',
            room: {
                name: this.props.room.name,
            },
            player: {
                name: this.props.player.name,
            },
        })
    }

    componentWillUnmount() {
        clearInterval(this.state.intervalID);
        window.removeEventListener("keydown", this.listener)
        this.props.actions.room_exit()
        this.socket.emit('room', { type: 'exit' })
    }

    gameStartSubmit(event) {
        event.preventDefault()
        this.socket.emit('room', { type: "start" })
    }

    statusGame () {
        switch (this.props.room.state) {
            case 0:
                if (this.props.room.leader === this.props.player.name)
                    return (
                        <div className={"statusGame"}>
                            <div className={"cursor"}></div>
                            <h1 onClick={this.gameStartSubmit}>start game</h1>
                        </div>
                    )
                else
                    return (
                        <div className={"statusGame"}>
                           <h1>waiting for game start</h1>
                        </div>
                    )
            case 2:
                const looser = this.props.room.players.find(player => player.name === this.props.player.name).looser
                const resultGame = looser ? "you loose" : "you win"
                if (this.props.room.leader === this.props.player.name)
                    return (
                        <div className={"statusGame"}>
                            <div>{resultGame}</div>
                            <div className={"cursor"}></div>
                            <h1 onClick={this.gameStartSubmit}>restart game</h1>
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
        if (this.props.room.state === undefined) 
            return null;
        
        const list_shadows = this.props.room.players
            .filter(e => e.name !== this.props.player.name)
            .map( item => <Shadow board={item.board} name={item.name} />)
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
                        <Panel name={"lines"} info={"42"}/>
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