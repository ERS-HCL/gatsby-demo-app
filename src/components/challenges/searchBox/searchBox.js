import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Tooltip from '@material-ui/core/Tooltip'
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import Fab from '@material-ui/core/Fab'
import SearchIcon from '@material-ui/icons/Search'
import ClearIcon from '@material-ui/icons/Clear'
import PageHeader from '../../pageHeader/pageHeader'
import blueGrey from '@material-ui/core/colors/blueGrey'
import TextField from '@material-ui/core/TextField'
import Input from '@material-ui/core/Input'
import InputLabel from '@material-ui/core/InputLabel'
import Fade from '@material-ui/core/Fade'
import FormControl from '@material-ui/core/FormControl'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import Select from '@material-ui/core/Select'
import getColumnData from '../metadata'

const styles = theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    backgroundColor: 'white'
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 120
  },
  buttonWrapper: {
    justifyContent: 'flex-end'
  },
  button: {
    margin: theme.spacing.unit
  },
  paper: {
    margin: 5,
    padding: 10,
    transitionEnabled: true,
    backgroundColor: blueGrey[50],
    alignContent: 'center',
    alignItems: 'center',
    rounded: true,
    borderRadius: 5,
    shadowRadius: 5
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    minWidth: 250
  },
  menu: {
    width: 200
  }
})

class SearchBox extends React.Component {
  constructor(props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleClearSearch = this.handleClearSearch.bind(this)
    this.state = {
      text: '',
      domain: '',
      priority: '',
      status: '',
      latest: false,
      updatedAfter: '',
      updatedBefore: ''
    }
  }

  handleSubmit(event) {
    event.preventDefault()
    //  console.log('A name was submitted: ' + this.state.searchText)
  }

  handleChange = name => event => {
    this.setState({
      text: event.target.value
    })
  }

  handleDomainChange = name => event => {
    this.setState({
      domain: event.target.value === 'Not Selected' ? '' : event.target.value
    })
  }

  handlePriorityChange = name => event => {
    this.setState({
      priority: event.target.value === 'Not Selected' ? '' : event.target.value
    })
  }

  handleStatusChange = name => event => {
    this.setState({
      status: event.target.value === 'Not Selected' ? '' : event.target.value
    })
  }

  handleLatestChange = name => event => {
    this.setState({
      latest: !this.state.latest
    })
  }

  handleUpdateAfterChange = name => event => {
    this.setState({
      updatedAfter: event.target.value
    })
  }

  handleUpdateBeforeChange = name => event => {
    this.setState({
      updatedBefore: event.target.value
    })
  }

  handleClearSearch = e => {
    const { onClear } = this.props
    this.setState(
      {
        text: '',
        domain: '',
        priority: '',
        status: '',
        latest: false,
        updatedAfter: '',
        updatedBefore: ''
      },
      function() {
        onClear()
      }
    )
  }

  render() {
    const { classes, onSearch, onClear } = this.props

    const {
      text,
      domain,
      priority,
      status,
      latest,
      updatedAfter,
      updatedBefore
    } = this.state

    const updatedAfterSearch = (
      <FormControl className={classes.formControl}>
        <TextField
          id="date"
          label="Updated After"
          type="date"
          value={updatedAfter}
          className={classes.textField}
          onChange={this.handleUpdateAfterChange()}
          InputLabelProps={{
            shrink: true
          }}
        />
      </FormControl>
    )

    const updatedBeforeSearch = (
      <FormControl className={classes.formControl}>
        <TextField
          id="date"
          label="Updated Before"
          type="date"
          value={updatedBefore}
          className={classes.textField}
          onChange={this.handleUpdateBeforeChange()}
          InputLabelProps={{
            shrink: true
          }}
        />
      </FormControl>
    )

    const latestSearch = (
      <Tooltip title="Last 7 days">
        <FormControl className={classes.formControl}>
          <FormControlLabel
            control={
              <Checkbox
                checked={latest}
                onChange={this.handleLatestChange()}
                value="latest"
                color="primary"
              />
            }
            label="Latest Updates"
          />
        </FormControl>
      </Tooltip>
    )

    const domainSearch = (
      <FormControl className={classes.formControl}>
        <InputLabel htmlFor="age-native-helper">DOMAIN</InputLabel>
        <Select
          native
          value={domain ? domain : 'Not Selected'}
          onChange={this.handleDomainChange()}
          input={<Input id="age-native-helper" />}
        >
          <option value="Not Selected" key="Not Selected">
            Not Selected
          </option>
          {getColumnData(true)
            .filter(data => data.id === 'domain')[0]
            .options.map(option => (
              <option value={option.value} key={option.name}>
                {option.name}
              </option>
            ))}
        </Select>
      </FormControl>
    )

    const prioritySearch = (
      <FormControl className={classes.formControl}>
        <InputLabel htmlFor="priority-native-helper">PRIORITY</InputLabel>
        <Select
          native
          value={priority ? priority : 'Not Selected'}
          onChange={this.handlePriorityChange()}
          input={<Input id="priority-native-helper" />}
        >
          <option value="Not Selected" key="Not Selected">
            Not Selected
          </option>
          {getColumnData(true)
            .filter(data => data.id === 'priority')[0]
            .options.map(option => (
              <option value={option.value} key={option.name}>
                {option.name}
              </option>
            ))}
        </Select>
      </FormControl>
    )

    const statusSearch = (
      <FormControl className={classes.formControl}>
        <InputLabel htmlFor="status-native-helper">STATUS</InputLabel>
        <Select
          native
          value={status ? status : 'Not Selected'}
          onChange={this.handleStatusChange()}
          input={<Input id="status-native-helper" />}
        >
          <option value="Not Selected" key="Not Selected">
            Not Selected
          </option>
          {getColumnData(true)
            .filter(data => data.id === 'status')[0]
            .options.map(option => (
              <option value={option.value} key={option.name}>
                {option.name}
              </option>
            ))}
        </Select>
      </FormControl>
    )
    return (
      <Fade in={true} timeout={100}>
        <Paper className={classes.paper} elevation={4}>
          <PageHeader text="Filter" />

          <div className={classes.container}>
            <form
              noValidate
              autoComplete="on"
              onSubmit={event => {
                event.preventDefault()
                onSearch(this.state)
              }}
            >
              <TextField
                id="search"
                label="Filter Text"
                type="search"
                value={text}
                className={classes.textField}
                helperText="Search"
                onChange={this.handleChange('search')}
                margin="normal"
              />
              {domainSearch}
              {prioritySearch}
              {statusSearch}

              {updatedAfterSearch}
              {updatedBeforeSearch}
              {latestSearch}
              <div className={classes.buttonWrapper}>
                <Fab 
                  color="primary"
                  aria-label="search"
                  className={classes.button}
                  onClick={() => onSearch(this.state)}
                >
                  <SearchIcon />
                </Fab>
                <Fab
                  color="primary"
                  aria-label="clear search"
                  className={classes.button}
                  onClick={e => this.handleClearSearch(e)}
                >
                  <ClearIcon />
                </Fab>
              </div>
            </form>
          </div>
        </Paper>
      </Fade>
    )
  }
}

SearchBox.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(SearchBox)
