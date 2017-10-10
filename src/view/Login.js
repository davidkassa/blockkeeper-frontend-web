import React from 'react'
import Button from 'material-ui/Button'
import Typography from 'material-ui/Typography'
import TextField from 'material-ui/TextField'
import Paper from 'material-ui/Paper'
import Grid from 'material-ui/Grid'
import { withStyles } from 'material-ui/styles'
import {LinearProgress} from 'material-ui/Progress'
import {Lock} from 'material-ui-icons'
import {theme, paperStyle, loginStyle, fullWidth, fullHeightRoot, actnBtnClr} from './Style'
import {Modal} from './Lib'
import __ from '../util'

const styles = {
  fullHeightRoot,
  loginStyle,
  paperStyle,
  fullWidth,
  actnBtnClr,
  loginButton: {
    width: '100%',
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit
  },
  lockIcon: {
    width: theme.spacing.unit * 2,
    height: theme.spacing.unit * 2
  }
}

class LoginView extends React.Component {
  constructor (props) {
    super(props)
    this.cx = props.cx
    this.goBack = props.history.goBack
    this.reset = () => ({busy: undefined, username: '', pw: ''})
    this.reload = () => this.setState(this.reset())
    this.login = this.login.bind(this)
    this.state = this.reset()
    this.set = this.set.bind(this)
  }

  componentDidMount () {
    Object.assign(this, __.initView(this, 'login'))
  }

  set (ilk, val) {
    this.setState({[ilk]: val}, () => {
      let d = {upd: false, usernameEmsg: __.vldAlphNum(this.state.username, {min: __.cfg('minUser'), max: __.cfg('maxUser')})}
      if (this.state.pw) {
        d.pwEmsg = __.vldPw(this.state.pw)
      }
      if (this.state.username && this.state.pw &&
          !d.usernameEmsg && !d.pwEmsg) {
        d.upd = true
      }
      this.setState(d)
    })
  }

  async login () {
    this.setState({err: undefined, busy: true})
    try {
      await this.cx.core.login(this.state.username, this.state.pw)
      this.props.history.push('/depot')  // redirect
    } catch (e) {
      (e.sts === 404)
        ? this.setState({...this.reset(), emsg: e.message})
        : this.setState({...this.reset(), err: e.message})
    }
  }

  render () {
    if (this.state.err) {
      return (
        <Modal
          onClose={this.reload}
          actions={[{lbl: 'Back to login', onClick: this.reload}]}
        >
          {this.state.err}
        </Modal>
      )
    } else {
      return (
        <div className={this.props.classes.fullHeightRoot}>
          {this.state.busy &&
          <LinearProgress />}
          {!this.state.busy &&
          <div className={this.props.classes.loginStyle}>
            <Grid container spacing={0} justify='center'>
              <Grid item xs={12} sm={8} md={6} lg={4} xl={4}>
                <Typography type='display3' color='inherit'>
                  Block Keeper
                </Typography>
                <Typography type='display1' color='inherit' gutterBottom>
                  Please enter your login credentials
                </Typography>
                <Paper square className={this.props.classes.paperStyle} elevation={24}>
                  <TextField
                    autoFocus
                    fullWidth
                    label='Username'
                    margin='normal'
                    value={this.state.username}
                    error={
                      Boolean(this.state.emsg) ||
                      Boolean(this.state.usernameEmsg)
                    }
                    helperText={this.state.emsg || this.state.usernameEmsg}
                    onChange={evt => this.set('username', evt.target.value)}
                    />
                  <TextField
                    fullWidth
                    label='Password'
                    type='password'
                    margin='normal'
                    autoComplete='current-password'
                    value={this.state.pw}
                    error={Boolean(this.state.pwEmsg)}
                    helperText={this.state.pwEmsg}
                    onChange={evt => this.set('pw', evt.target.value)}
                    />
                  <Button
                    raised
                    color={'accent'}
                    className={this.props.classes.loginButton}
                    onClick={(event) => this.login(event)}
                    disabled={!this.state.upd}
                    classes={{
                      raisedAccent: this.props.classes.actnBtnClr
                    }}
                    >
                    <Lock
                      className={this.props.classes.lockIcon} />
                      Login
                  </Button>
                  <br />
                  <Button
                    href='/rgstr'
                    className={this.props.classes.fullWidth}
                  >
                    Register
                  </Button>
                </Paper>
              </Grid>
            </Grid>
          </div>}
        </div>
      )
    }
  }
}

export default withStyles(styles)(LoginView)
