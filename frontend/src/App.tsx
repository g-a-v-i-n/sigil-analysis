import * as React from "react";
import {generate} from "./analyze.js"
import {sigil, reactImageRenderer } from '@tlon/sigil-js'
import dict from './dict'

export default class App extends React.Component {
  state = {
    valids: []
  }
  componentDidMount() {
    const valids = generate({
      // yReflection: true,
      // xReflection: true,
      // monolithic: true
      dict: dict,
      rotation:true,
      count: 100,
      exclusive:true,
    })
    this.setState({ valids: valids })
  }

  render() {
    return (
      <div>
        {
          this.state.valids.map(p => {
            return sigil({
              patp: p,
              renderer: reactImageRenderer,
              size: 100,
              colors: ['black', 'white'],
            })
          })
        }
      </div>
    );
  }
}
