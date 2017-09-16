import React from 'react'
import {Link} from 'react-router-dom'
import Table, {TableBody, TableCell, TableRow} from 'material-ui/Table'
import {LinearProgress} from 'material-ui/Progress'
import Paper from 'material-ui/Paper'
import {themeBgStyle} from './Style'
import {TopBar, SubBar, Jumbo, FloatBtn, Snack, Modal} from './Lib'
import __ from '../util'

export default class DepotView extends React.Component {
  constructor (props) {
    super(props)
    this.cx = props.cx
    this.state = {tabIx: this.cx.tmp.depotTabIx || 0}
    this.load = this.load.bind(this)
    this.tab = this.tab.bind(this)
    this.goAddAddr = () => this.props.history.push('/addr/add')
  }

  async componentDidMount () {
    Object.assign(this, __.initView(this, 'depot'))
    await this.load()
  }

  async load () {
    try {
      // uncomment to test error view:
      //   throw this.err('An error occurred')
      const [
        {addrs, tscs},
        {coin0, coin1}
      ] = await Promise.all([
        this.cx.depot.loadAddrs(),
        this.cx.user.getCoins(this.state.coin)
      ])
      const blc = this.cx.depot.getBlc(addrs)
      this.setState({
        err: null,
        addrs: addrs,
        tscs: tscs,
        coin0,
        coin1,
        blc1: `${coin0} ${blc.get(coin0)}`,
        blc2: `${coin1} ${blc.get(coin1)}`,
        snack: __.getSnack()
      })
    } catch (e) {
      this.setState({err: e.message})
      if (process.env.NODE_ENV === 'development') throw e
    }
  }

  async tab (evt, tabIx) {
    await this.load()
    this.setState({tabIx})
    this.cx.tmp.depotTabIx = tabIx
  }

  render () {
    if (this.state.err) {
      return (
        <Modal
          onClose={this.load}
          actions={[{lbl: 'Reload', onClick: this.load}]}
        >
          {this.state.err}
        </Modal>
      )
    } else if (this.state.addrs && this.state.addrs.length < 1) {
      return (
        <Modal
          onClose={this.load}
          lbl='Welcome'
          noCncl
          actions={[]}
        >
          <Link to={`/user/edit`}>Edit your settings</Link>
          <br />
          <Link to={`/addr/add`}>Add your first address</Link>
        </Modal>
      )
    } else if (this.state.addrs && this.state.tscs) {
      return (
        <div style={themeBgStyle}>
          {this.state.snack &&
            <Snack
              msg={this.state.snack}
              onClose={() => this.setState({snack: null})}
            />}
          <TopBar
            title='BK'
          />
          <Jumbo
            title={this.state.blc1}
            subTitle1={this.state.blc2}
           />
          <SubBar
            tabs={['Addresses', 'Transactions']}
            ix={this.state.tabIx}
            onClick={this.tab}
            color='primary'
          />

          <Paper square>
            {this.state.tabIx === 0 &&
              <List
                ilk='addr'
                rows={this.state.addrs}
                coin0={this.state.coin0}

              />}
            {this.state.tabIx === 1 &&
              <List
                ilk='tsc'
                rows={this.state.tscs}
                coin0={this.state.coin0}
              />}
            {this.state.tabIx === 0 &&
              <FloatBtn onClick={this.goAddAddr} />}
          </Paper>

        </div>
      )
    } else {
      return <LinearProgress />
    }
  }
}

const List = ({ilk, rows, coin0}) =>
  <Table>
    <TableBody>
      {rows.map(row => {
        const urlPath = ilk === 'addr' ? 'addr' : `tsc/${row.addrId}`
        return (
          <TableRow key={row._id}>
            <TableCell>
              {row.icon || `${row.coin}-Icon`}
            </TableCell>
            <TableCell>
              <Link to={`/${urlPath}/${row._id}`}>{row.name}</Link>
              <br />
              {row.hsh}
            </TableCell>
            <TableCell numeric>
              {row.coin} {row.amnt}
              <br />
              {coin0} {row.amnt * row.rates.get(coin0)}
            </TableCell>
          </TableRow>
        )
      })}
    </TableBody>
  </Table>
