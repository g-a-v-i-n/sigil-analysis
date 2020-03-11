import * as React from "react";
import {generate, test} from "./analyze.js"
import {sigil, reactImageRenderer } from '@tlon/sigil-js'
import dict from './dict'
import marbus from './marbus'
import tirrel from './tirrel'
import monrel from './monrel'

export default class App extends React.Component {
  state = {
    valids: [],
  }
  componentDidMount() {
    // const valids = generate({
    //   // yReflection: true,
    //   // xReflection: true,
    //   // monolithic: true,
    //   dict: dict,
    //   rotation:true,
    //   count: 1,
    //   // contains: ['a']
    //   onlyContains: ['a'],
    //   exclusive:true,
    // })

    const valids = monrel.filter(p => {
      return test({
        p: p,
        yReflection: true,
        // xReflection: true,
        // monolithic: true,
        dict: dict,
        // rotation:true,
        // count: 1,
        contains: ['e'],
        // onlyContains: ['e'],
        exclusive:true,
      })
    })

    this.setState({ valids: valids }, () => console.log('done'))


  }

  render() {
    return (
      <div>
        {
          this.state.valids.map(p => {
            return <div>{sigil({
              patp: p,
              renderer: reactImageRenderer,
              size: 100,
              colors: ['black', 'white'],
            })}
            {p}
            </div>
          })
        }
      </div>
    );
  }
}
