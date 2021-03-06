import React from 'react'
import Cell from './cell'
import Panel from './panel'

export function getShadow(tab, color) {
    for (let i = 11; i >= 0; i--) {
        let flag = false;
        for (let j = 240 + i; j >= 0; j -= 12) {
            if (tab[j] !== 0 || flag === true) {
                tab[j] = color
                flag = true
            }
        }
    }
    return tab
}

const Shadow = ({board, name}) => {
    const color = 11
    let shadow = getShadow([...board], color)
    shadow.forEach((e, i) => {
    if (i % 12 === 0 || i % 12 === 11)
        shadow[i] = 8
    })
    shadow.reverse()
    let cells = [];
    for (let i = 0; i < 240; i++) {
        cells.push(
            <Cell
                key={i}
                type={shadow[i]}
                shadow={true} />
        )
    }

    return (
        <div className={"shadowPart"}>
            <Panel name={name} info={""} key={0}/>
            <div className="shadowBoard" key={1}>
                {cells}
            </div>
        </div>
    )
};

export default Shadow