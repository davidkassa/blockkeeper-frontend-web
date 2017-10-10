import {ApiBase} from './Lib'
import __ from '../util'

export default class User extends ApiBase {
  constructor (cx, _id, pld) {
    super('user', cx, _id || '0005b739-8462-4959-af94-271cd93f5195')
    this._store = 'user'
    this._apiGet = this._apiGet.bind(this)
    this._apiSet = this._apiSet.bind(this)
    this._apiDel = this._apiDel.bind(this)
    this.getCoins = this.getCoins.bind(this)
    if (pld) this.setSto(pld)
    this.info('Created')
  }

  async _apiGet () {
    const pld = await __.rqst({url: `${__.cfg('apiUrl')}/user/${this._id}`})
    const user = this.decrypt(pld.data)
    return user
  }

  async _apiSet (user) {
    await __.rqst({
      url: `${__.cfg('apiUrl')}/user/${user._id}`,
      data: {_id: user._id, data: this.encrypt(user)}
    })
  }

  async _apiDel (user) {
    await __.rqst({
      method: 'delete',
      url: `${__.cfg('apiUrl')}/user/${user._id}`,
      data: {_id: user._id, userhash: this.cx.core.get('userHsh')}
    })
  }

  async getCoins (curCoin, user) {
    const coins = (user || await this.load()).coins
    if (!coins.includes(curCoin)) curCoin = undefined
    const coin0 = curCoin || coins[0]
    const coin1 = (coin0 === coins[1]) ? coins[0] : coins[1]
    return {coin0, coin1}
  }
}
