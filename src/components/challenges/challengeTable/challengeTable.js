import axios from 'axios'
import Paper from '@material-ui/core/Paper'
import Popover from '@material-ui/core/Popover'
import Snackbar from '@material-ui/core/Snackbar'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import * as _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { challengeTableStyles } from '../../../style/components/challenges/challenges'
import { createUser, loginOAuth, logout } from '../../../utils/auth'
// import firebase from 'firebase/app'
import { firebaseAuth, ref, database } from '../../../utils/firebase'
import ChallengeForm from '../challengeForm/challengeForm'
import HelpInfo from '../helpInfo/helpInfo'
import getColumnData, { createData } from '../metadata'
import Reports from '../reports/reports'
import SearchBox from '../searchBox/searchBox'
import UpVote from '../upvote/upvote'
import ChallengeTableFooter from './challengeTableFooter/challengeTableFooter'
import ChallengeTableHead from './challengeTableHead/challengeTableHead'
import ChallengeTableToolbar from './challengeTableToolbar/challengeTableToolbar'
import PriorityChip from './priorityChip/priorityChip'
import StatusComponent from './statusComponent/statusComponent'
import SelectComponent from './selectComponent/selectComponent'
import UrlListComponent from './urlListComponent/urlListComponent'
import Badge from './badge/badge'
import Contributor from './contributor/contributor'
import FloatingActionButtons from './floatingActionButtons/floatingActionButtons'
import Avatar from '@material-ui/core/Avatar'
import FaceIcon from '@material-ui/icons/Face'
import DoneIcon from '@material-ui/icons/Done'

const moment = require('moment-timezone')
moment.tz.setDefault('UTC')

class ChallengeTable extends React.Component {
  constructor(props, context) {
    super(props, context)

    this.state = {
      addInProgress: false,
      open: [],
      anchorEl: null,
      order: 'asc',
      orderBy: 'name',
      selected: [],
      data: [],
      filteredData: [],
      adminUsers: [],
      vote: [],
      votesAvailable: false,
      page: 0,
      rowsPerPage: 15,
      rowsPerPageOptions: [5, 15, 25],
      editing: false, // State: Editing data
      filter: false,
      selectedRow: null,
      isLoggedIn: false,
      isLoggingIn: false, // State: Is Logging in user
      isSaving: false, // State: Saving data
      isLoading: true, // State : Is Loading data
      showLogin: false,
      showSnackbar: false,
      snackBarMessage: '',
      user: null,
      isEditable: false, // Check is row is editable or not
      isAdmin: false,
      filterText: null,
      filterDomain: null,
      filterPriority: null,
      filterStatus: null,
      filterLatest: false,
      filterUpdatedAfter: null,
      filterUpdatedBefore: null,
      showHelp: false
    }
  }

  componentDidMount() {
    this.dbItems = ref.child('data')
    this.dbAuthItems = ref.child('admin')
    this.dbVotes = ref.child('vote')
    this.removeListener = firebaseAuth().onAuthStateChanged(user => {
      if (user) {
        let isAdmin = false
        if (user.email === undefined) user.email = user.displayName

        if (this.state.adminUsers.length === 0) {
          this.dbAuthItems.on('value', dataSnapshot => {
            var items = []

            dataSnapshot.forEach(function (childSnapshot) {
              var item = childSnapshot.val()
              items.push(item)
            })

            this.setState(
              {
                adminUsers: items
              },
              () => {
                isAdmin = this.isAdminUser(user.email)
                this.setState({
                  ...this.state,
                  user: user,
                  isAdmin: isAdmin,
                  isLoggedIn: true,
                  isLoggingIn: false,
                  selected: []
                })
              }
            )
          })
        } else {
          isAdmin = this.isAdminUser(user.email)
          this.setState({
            ...this.state,
            user: user,
            isAdmin: isAdmin,
            isLoggedIn: true,
            isLoggingIn: false,
            selected: []
          })
        }
      } else {
        this.setState({
          ...this.state,
          user: null,
          isAdmin: false,
          isLoggedIn: false,
          selected: []
        })
      }
    })
    this.setState({ isLoading: true })

    this.dbItems.on('value', dataSnapshot => {
      var items = []
      dataSnapshot.forEach(function (childSnapshot) {
        const item = childSnapshot.val()
        items.push(item)
      })
      // Sort based on the current order
      const { order, orderBy } = this.state
      const sortedItems =
        order === 'desc'
          ? items.sort((a, b) => (b[orderBy] < a[orderBy] ? -1 : 1))
          : items.sort((a, b) => (a[orderBy] < b[orderBy] ? -1 : 1))
      const newData = sortedItems.filter(item => this.applyfilter(item))

      this.setState({
        data: sortedItems,
        filteredData: newData,
        isLoading: false
      })
    })

    this.dbVotes.on('value', dataSnapshot => {
      var items = []

      dataSnapshot.forEach(function (childSnapshot) {
        const item = childSnapshot.val()
        items.push(item)
      })
      const voteTransformed = _.chain(items)
        .groupBy('id')
        .map((objs, key) => ({
          id: isNaN(key) ? key : +key,
          total: _.reduce(
            objs,
            (count, v) => (v.type === 'upVote' ? count + 1 : count - 1),
            0
          )
        }))
        .value()

      const { data } = this.state
      const mergedVotes = []
      data.forEach(item => {
        const vote = voteTransformed.filter(data => data.id === item.id)[0]
        mergedVotes.push({
          ...item,
          votes: parseInt(vote ? vote.total : 0)
        })
      })

      const newData = mergedVotes.filter(item => this.applyfilter(item))
      //  const open = !!anchorEl;
      let open = []
      // Set all pop overs off
      newData.map(item => {
        open[item.id] = false
      })
      // console.log(open);
      this.setState({
        ...this.state,
        open,
        vote: items,
        data: mergedVotes,
        filteredData: newData,
        votesAvailable: true
      })
    })
  }

  componentWillUnmount() {
    this.removeListener()
    this.dbItems.off()
    this.dbAuthItems.off()
    this.dbVotes.off()
  }

  handlePopoverOpen = (event, id) => {
    // let { open } = this.state
    let items = [...this.state.open];
    items[id] = true
    this.setState({ open: items, anchorEl: event.target })
  }

  handlePopoverClose = (event, id) => {
    //  let { open } = this.state
    let items = [...this.state.open];
    items[id] = false
    this.setState({ open: items, anchorEl: null })
  }

  isAdminUser = email => {
    const adminUsers = this.state.adminUsers

    const emailMatch =
      adminUsers.filter(user => {
        return user.email.toLowerCase().includes(email.toLowerCase())
      }).length > 0

    const displayNameMatch =
      adminUsers.filter(user => {
        return user.displayName.toLowerCase().includes(email.toLowerCase())
      }).length > 0

    return emailMatch || displayNameMatch
  }

  handleRequestSort = (event, property) => {
    const orderBy = property
    let order = 'desc'

    if (this.state.orderBy === property && this.state.order === 'desc') {
      order = 'asc'
    }

    const filteredData =
      order === 'desc'
        ? this.state.filteredData.sort(
          (a, b) => (b[orderBy] < a[orderBy] ? -1 : 1)
        )
        : this.state.filteredData.sort(
          (a, b) => (a[orderBy] < b[orderBy] ? -1 : 1)
        )

    this.setState({ filteredData, order, orderBy })
  }


  handleRowClick = (event, id, newRow) => {
    const { selected, editing, data, isLoggedIn } = this.state
    if (editing || !isLoggedIn) {
      return
    }
    let newSelected = [...selected];
    if (selected.indexOf(id) !== 0) {
      newSelected = [];
      newSelected.push(id)
    }
    const currentItem = data.find(item => item.id === id)
    const isEditable = this.checkEditStatus(currentItem)

    const formElementsArray = this.transformRowToForm(currentItem, newRow)
    this.setState({
      selected: newSelected,
      isEditable: isEditable,
      selectedRow: formElementsArray.sort(
        (a, b) =>
          a.id === 'name' ? -1 : b.id === 'name' ? 1 : a.id < b.id ? -1 : 1
      )
    })
  }

  checkEditStatus = currentItem => {
    const { isAdmin, user } = this.state
    // If you are not an admin
    // Then you cannot edit any one else's content
    // and for your content you cannot edit any other entry except the Approval Pending ones
    if (!isAdmin) {
      if (
        currentItem.contributor !== user.email ||
        (currentItem.contributor === user.email &&
          currentItem.status !== 'Approval Pending')
      ) {
        return false
      } else {
        return true
      }
    } else {
      return true
    }
  }

  transformRowToForm = (currentItem, newRow) => {
    const formElementsArray = []
    const colsMetaData = getColumnData(this.state.isAdmin)
    for (let key in currentItem) {
      if (key !== 'id' && key !== 'vote' && key !== 'votes') {
        let colData = []

        colData = colsMetaData.filter(data => {
          return data.id === key
        })
        if (colData === undefined) {
          colData[0] = {
            type: 'text',
            helperText: 'Enter Value'
          }
        }
        formElementsArray.push({
          id: key,
          value: currentItem[key],
          type: colData[0].type,
          multiline: colData[0].multiline ? colData[0].multiline : false,
          helperText: colData[0].helperText,
          disabled: colData[0].disabled
            ? colData[0].disabled
            : key === 'priority' || key === 'status'
              ? newRow
              : false,
          visible: colData[0].visible ? colData[0].visible : false,
          editable: colData[0].editable ? colData[0].editable : false,
          options: colData[0].options ? colData[0].options : []
        })
      }
    }

    // For new fields which are still not defined
    // Add them to the form data
    colsMetaData.map((data, index) => {
      if (currentItem[data.id] === undefined) {
        formElementsArray.push({
          id: data.id,
          value: data.type === 'select' ? colsMetaData[index].options[0].value : '',
          type: data.type,
          disabled: data.disabled,
          visible: data.visible,
          editable: data.editable,
          multiline: data.multiline,
          helperText: data.helperText,
          options: data.options
        })
      }
    })

    return formElementsArray
  }

  handleChangePage = (event, page) => {
    this.setState({ page })
  }

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value })
  }

  handleEditClick = event => {
    const { editing } = this.state
    this.setState({ editing: !editing })
  }

  handleAddClick = event => {
    const { data, orderBy, order } = this.state
    // Create new row
    const newRow = createData(this.state.user.email)

    database
      .ref()
      .child('data')
      .push(newRow)
      .catch(err => {
        this.setState({
          showSnackbar: true,
          snackBarMessage: 'Failed to save data !!',
          isSaving: false
        })
      })
      .then(() => {
        this.setState({
          showSnackbar: true,
          snackBarMessage: 'Data saved !!',
          isSaving: false
        })
        this.handleRowClick(null, newRow.id, true)
        this.handleEditClick(null)
      })
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (
      this.state.addInProgress !== nextState.addInProgress &&
      nextState.addInProgress === true
    ) {
      return false
    }
    return true
  }

  handleDeleteClick = status => {
    const { selected } = this.state
    if (selected[0] === undefined || status !== 'Approval Pending') return
    const childId = this.findDBKey(selected[0])

    if (childId !== null) {
      database
        .ref('data/' + childId)
        .remove()
        .catch(err => {
          this.setState({
            showSnackbar: true,
            snackBarMessage: 'Failed to delete data !!',
            isSaving: false
          })
        })
        .then(() =>
          this.setState({
            showSnackbar: true,
            snackBarMessage: 'Data deleted !!',
            isSaving: false
          })
        )
    }

    this.setState({
      selected: [],
      editing: false
    })
  }

  handleSearchClick = event => {
    const { filter } = this.state
    this.setState({ filter: !filter })
  }

  // Call serverless function for sending on email notifications
  postEmailNotification = async (currentItem) => {
    // console.log('Called postEmailNotification');
    return;
    const headers = {
      'Content-Type': 'application/json'
    }
    if (currentItem && currentItem.domain && currentItem.updatedBy) {

      try {
        await axios.post('https://us-central1-challenges-tfg.cloudfunctions.net/challengeUpdate', currentItem, { headers })
      } catch (error) {
        console.error('There was an error while executing the post call', error);
      }
    }

  }

  handleFormSubmit = (event, formData) => {
    const { selected, data } = this.state
    if (selected[0] === undefined) return
    const currentItem = _.find(data, { id: selected[0] })
    const childId = this.findDBKey(selected[0])
    const colsMetaData = getColumnData(this.state.isAdmin)
    // For new fields which are still not defined
    // Add them to the current item
    colsMetaData.map(data => {
      if (currentItem[data.id] === undefined) {
        currentItem[data.id] = ''
      }
    })

    if (childId !== null) {
      // console.log(formData)
      for (let key in currentItem) {
        if (key !== 'id' && key !== 'vote' && key !== 'votes') {
          const entry = formData.filter(data => data.id === key)
          currentItem[key] = entry[0].value
        }
      }
      currentItem['updatedOn'] = moment().format()
      currentItem['updatedBy'] = this.state.user.email

      database
        .ref('data/' + childId)
        .set(currentItem)
        .catch(err => {
          this.setState({
            showSnackbar: true,
            snackBarMessage: 'Failed to save data !!',
            isSaving: false
          })
        })
        .then(() => {
          this.postEmailNotification(currentItem);
          this.setState({
            showSnackbar: true,
            snackBarMessage: 'Data saved !!',
            isSaving: false,
            editing: false,
            selected: []
          })
          // console.log(currentItem)

        }
        )
    }
  }

  handleFormCancel = event => {
    this.setState({
      editing: false
    })
  }

  handleLoginClick = event => {
    loginOAuth()
      .then(data => {
        const username = data.additionalUserInfo.profile.email
          ? data.additionalUserInfo.profile.email
          : data.additionalUserInfo.profile.login

        this.setState({
          showSnackbar: true,
          snackBarMessage: username + ' Logged In'
        })
      })
      .catch(err => {
        this.setState({ isLoggingIn: false })
        this.setState({
          showSnackbar: true,
          snackBarMessage: 'Invalid Username/Password'
        })
      })
  }

  loginNewUser = (username, password) => {
    createUser(username, password)
      .then(data => {
        const username = data.additionalUserInfo.profile.email
          ? data.additionalUserInfo.profile.email
          : data.additionalUserInfo.profile.login

        this.setState({
          showSnackbar: true,
          snackBarMessage: username + ' Logged In'
        })
      })
      .catch(err => {
        this.setState({ isLoggingIn: false })
        this.setState({
          showSnackbar: true,
          snackBarMessage: 'Invalid Username/Password'
        })
      })
  }

  handleLogOutClick = event => {
    logout()
  }

  findDBKey = id => {
    const { data } = this.state
    let keys = []
    ref
      .child('data')
      .orderByChild('id')
      .equalTo(id)
      .on('value', function (snapshot) {
        const value = snapshot.val()
        for (var k in value) keys.push(k)
      })
    return keys && keys.length === 1 ? keys[0] : null
  }

  updateRecord = id => {
    const { data } = this.state
    const currentItem = _.find(data, { id: id })
    const childId = this.findDBKey(id)

    if (childId !== null) {
      // Add update information
      currentItem['updatedOn'] = moment().format()
      currentItem['updatedBy'] = this.state.user.email

      database
        .ref('data/' + childId)
        .set(currentItem)
        .catch(err => {
          this.setState({
            showSnackbar: true,
            snackBarMessage: 'Failed to save data !!',
            isSaving: false
          })
        })
        .then(() => {
          this.postEmailNotification(currentItem);
          this.setState({
            showSnackbar: true,
            snackBarMessage: 'Data saved !!',
            isSaving: false
          })
          // console.log(currentItem);

        }
        )
    }
  }

  handleSaveClick = event => {
    this.setState({ isSaving: true })
    ref
      .child('data')
      .set(this.state.data)
      .catch(err => {
        this.setState({
          showSnackbar: true,
          snackBarMessage: 'Failed to save data !!',
          isSaving: false
        })
      })
      .then(() =>
        this.setState({
          showSnackbar: true,
          snackBarMessage: 'Data saved !!',
          isSaving: false
        })
      )
  }

  handleCloseSnackBar = () => {
    this.setState({ showSnackbar: false })
  }

  handleHelpClick = () => {
    this.setState({ showHelp: !this.state.showHelp })
  }

  handleClearFilter = () => {
    this.setState(
      {
        filterText: '',
        filterDomain: '',
        filterPriority: '',
        filterStatus: '',
        filterUpdatedAfter: '',
        filterUpdatedBefore: '',
        filterLatest: false
      },
      function () {
        const newData = this.state.data.filter(item => this.applyfilter(item))
        this.setState({
          ...this.state,
          filteredData: newData
        })
      }
    )
  }

  handleSearchFilter = filter => {
    this.setState(
      {
        filterText: filter.text,
        filterDomain: filter.domain,
        filterPriority: filter.priority,
        filterStatus: filter.status,
        filterLatest: filter.latest,
        filterUpdatedAfter:
          filter.updatedAfter && filter.updatedAfter !== ''
            ? moment(filter.updatedAfter).format()
            : null,
        filterUpdatedBefore:
          filter.updatedBefore && filter.updatedBefore !== ''
            ? moment(filter.updatedBefore).format()
            : null
      },
      function () {
        const newData = this.state.data.filter(item => this.applyfilter(item))
        this.setState({
          ...this.state,
          filteredData: newData
        })
      }
    )
  }

  canVote = (vote, id, upVote) => {
    let upVoteCount = this.state.vote.filter(
      vote =>
        vote.id === id &&
        vote.email === this.state.user.email &&
        vote.type === 'upVote'
    ).length

    let downVoteCount = this.state.vote.filter(
      vote =>
        vote.id === id &&
        vote.email === this.state.user.email &&
        vote.type === 'downVote'
    ).length

    if (upVote) {
      upVoteCount++
    } else {
      downVoteCount++
    }

    return Math.abs(upVoteCount - downVoteCount) <= 1
  }

  handleUpVote = (id, count) => {
    const { isLoggedIn } = this.state
    if (!isLoggedIn) {
      this.setState({
        showSnackbar: true,
        snackBarMessage: 'You need to log in to vote'
      })
      return
    }
    let refVotes = ref.child('vote')
    // Check if user has previously upvoted
    if (this.canVote(this.state.vote, id, true)) {
      refVotes
        .push({
          id: id,
          email: this.state.user.email,
          type: 'upVote'
        })
        .catch(err => {
          console.log('Error saving up votes:' + err)
        })
    } else {
      this.setState({
        showSnackbar: true,
        snackBarMessage: 'You can up vote only once per challenge'
      })
    }
  }

  handlePriorityChange = (event, id) => {
    let { data } = this.state
    _.find(data, { id: id }).priority = event.target.value
    this.setState(
      {
        data: data
      },
      function () {
        this.updateRecord(id)
      }
    )
  }

  handleStatusChange = (event, id) => {
    let { data } = this.state
    _.find(data, { id: id }).status = event.target.value
    this.setState(
      {
        data: data
      },
      function () {
        this.updateRecord(id)
      }
    )
  }

  handleDownVote = (id, count) => {
    const { isLoggedIn } = this.state
    if (!isLoggedIn) {
      this.setState({
        showSnackbar: true,
        snackBarMessage: 'You need to log in to vote'
      })
      return
    }

    let refVotes = ref.child('vote')

    if (this.canVote(this.state.vote, id, false)) {
      refVotes
        .push({
          id: id,
          email: this.state.user.email,
          type: 'downVote'
        })
        .catch(err => {
          console.log('Error saving down votes:' + err)
        })
    } else {
      this.setState({
        showSnackbar: true,
        snackBarMessage: 'You can downvote only once per challenge'
      })
    }
  }

  emailShortForm = (email) => {
    if (email === undefined)
      return
    const index = email.indexOf('@') > -1 ? email.indexOf('@') : 5
    return email.substr(0, index);
  }

  applyfilter = item => {
    const isUpdatedAfterFilter = this.state.filterUpdatedAfter
      ? this.isUpdatedAfter(item.updatedOn, this.state.filterUpdatedAfter)
      : true

    const isUpdatedBeforeFilter = this.state.filterUpdatedBefore
      ? this.isUpdatedBefore(item.updatedOn, this.state.filterUpdatedBefore)
      : true

    const isLatestFiltered = this.state.filterLatest
      ? this.isLatest(item.updatedOn)
      : true

    const isTextFiltered = this.state.filterText
      ? item.name.toLowerCase().includes(this.state.filterText.toLowerCase()) ||
      item.description
        .toLowerCase()
        .includes(this.state.filterText.toLowerCase())
      : true

    const isDomainFiltered = this.state.filterDomain
      ? item.domain
        .toLowerCase()
        .includes(this.state.filterDomain.toLowerCase())
      : true

    const isPriorityFiltered = this.state.filterPriority
      ? item.priority
        .toLowerCase()
        .includes(this.state.filterPriority.toLowerCase())
      : true

    const isStatusFiltered = this.state.filterStatus
      ? item.status
        .toLowerCase()
        .includes(this.state.filterStatus.toLowerCase())
      : true

    const isApprovalPendingFiltered = true

    return (
      isUpdatedAfterFilter &&
      isUpdatedBeforeFilter &&
      isLatestFiltered &&
      isTextFiltered &&
      isDomainFiltered &&
      isPriorityFiltered &&
      isStatusFiltered &&
      isApprovalPendingFiltered
    )
  }

  isSelected = id => this.state.selected.indexOf(id) !== -1

  addPopOverColumn = (id, description, impact, anchorEl, classes) => {
    const { open } = this.state
    const popOverText = (
      <div>
        <Typography variant="subtitle1" gutterBottom>
          Description
        </Typography>
        <Typography variant="body1" gutterBottom>
          {description}
        </Typography>
        {impact && (
          <div>
            <Typography variant="subtitle1" gutterBottom>
              Business Impact
            </Typography>
            <Typography variant="body1" gutterBottom>
              {impact}
            </Typography>
          </div>
        )}
      </div>
    )
    return (
      <TableCell
        padding="dense"
        onMouseOver={event => this.handlePopoverOpen(event, id)}
        onMouseOut={event => this.handlePopoverClose(event, id)}
        className={classes.hover}
      >
        {description.length > 100
          ? description.slice(0, 100) + '...'
          : description}
        <Popover
          className={classes.popover}
          classes={{ paper: classes.paperPopover }}
          open={open ? (open[id] === true ? true : false) : undefined}
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'left'
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'left'
          }}
          onClose={event => this.handlePopoverClose(event, id)}
          disableRestoreFocus
        >
          {popOverText}
        </Popover>
      </TableCell>
    )
  }

  // Check if date is within the last 7 days
  isLatest = dateStr => {
    if (dateStr === undefined) {
      return false
    }
    const now = moment()
    const challengeDate = moment(dateStr)
    return now.diff(challengeDate, 'days') <= 7
  }

  isUpdatedAfter = (dateStr, dateAfter) => {
    if (dateStr === undefined) {
      return false
    }
    //  console.log(dateStr, dateAfter, moment(dateStr).isAfter(dateAfter))

    return moment(dateStr).isAfter(dateAfter)
  }

  isUpdatedBefore = (dateStr, dateBefore) => {
    if (dateStr === undefined) {
      return false
    }
    //  console.log(dateStr, dateBefore, moment(dateStr).isBefore(dateBefore))
    return moment(dateStr).isBefore(dateBefore)
  }

  render() {
    // console.log('render')
    const { classes } = this.props
    const {
      open,
      anchorEl,
      user,
      isAdmin,
      data,
      filteredData,
      order,
      orderBy,
      selected,
      rowsPerPage,
      rowsPerPageOptions,
      page,
      selectedRow,
      isLoggedIn,
      isLoggingIn,
      isLoading,
      isSaving,
      isEditable,
      showSnackbar,
      snackBarMessage,
      showLogin,
      showHelp,
      votesAvailable
    } = this.state

    const newSVG = (
      <svg className={classes.svg} viewBox="0 0 24 24">
        <path d="M20,4C21.11,4 22,4.89 22,6V18C22,19.11 21.11,20 20,20H4C2.89,20 2,19.11 2,18V6C2,4.89 2.89,4 4,4H20M8.5,15V9H7.25V12.5L4.75,9H3.5V15H4.75V11.5L7.3,15H8.5M13.5,10.26V9H9.5V15H13.5V13.75H11V12.64H13.5V11.38H11V10.26H13.5M20.5,14V9H19.25V13.5H18.13V10H16.88V13.5H15.75V9H14.5V14A1,1 0 0,0 15.5,15H19.5A1,1 0 0,0 20.5,14Z" />
      </svg>
    )

    const emptyRows =
      rowsPerPage -
      Math.min(rowsPerPage, filteredData.length - page * rowsPerPage)
    const snackBar = showSnackbar ? (
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={showSnackbar}
        onClose={this.handleCloseSnackBar}
        ContentProps={{
          'aria-describedby': 'message-id'
        }}
        message={<span id="message-id">{snackBarMessage}</span>}
      />
    ) : null

    const helpInfo = showHelp ? <HelpInfo /> : null

    return (
      <div className={classes.root}>
        {helpInfo}
        {snackBar}
        {this.state.isLoading === false && <Reports data={data} />}
        <Paper className={classes.paper}>
          {this.state.editing === true ? (
            <ChallengeForm
              selectedRow={selectedRow}
              open={true}
              handleFormCancel={this.handleFormCancel}
              handleFormSubmit={this.handleFormSubmit}
            />
          ) : null}
          {this.state.filter === true ? (
            <SearchBox
              onSearch={this.handleSearchFilter}
              onClear={this.handleClearFilter}
            />
          ) : null}
          <ChallengeTableToolbar
            numSelected={selected.length}
            onClickAdd={this.handleAddClick}
            onClickSearch={this.handleSearchClick}
            onClickLogin={this.handleLoginClick}
            onClickSave={this.handleSaveClick}
            onClickLogout={this.handleLogOutClick}
            onClickHelp={this.handleHelpClick}
            isLoggedIn={isLoggedIn}
            isLoggingIn={isLoggingIn}
            isSaving={isSaving}
            isLoading={isLoading}
            isDirty={false}
            showHelp={showHelp}
            user={user}
            data={data}
            rowCount={filteredData ? filteredData.length : 0}
          />

          <div className={classes.tableWrapper}>
            <Table className={classes.table}>
              <ChallengeTableHead
                numSelected={selected.length}
                isLoggedIn={isLoggedIn}
                order={order}
                orderBy={orderBy}
                onRequestSort={this.handleRequestSort}
                rowCount={filteredData ? filteredData.length : 0}
              />
              <TableBody>
                {filteredData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map(n => {
                    const isSelected = this.isSelected(n.id)
                    return (
                      <TableRow
                        hover
                        role="checkbox"
                        aria-checked={isSelected}
                        tabIndex={-1}
                        key={n.id}
                        selected={isSelected}
                        className={classes.row}
                        onClick={event =>
                          this.handleRowClick(event, n.id, false)
                        }
                      >
                        <TableCell padding="checkbox">
                          {this.isLatest(n.updatedOn) && newSVG}
                          {/*  <Checkbox
                            checked={isSelected}
                            onClick={event =>
                              this.handleRowClick(event, n.id, false)
                            }
                          /> */}
                          <Badge text={n.domain} className={classes.svg} />

                          {/*  <Contributor email={n.contributor} subject={n.name} className={classes.svg} /> */}
                          <div className={classes.spacingTop}>
                            {n.contributor && <div><b>By: </b>{this.emailShortForm(n.contributor)}</div>}
                            {n.owner && <div><b>Owner: </b>{n.owner}</div>}
                            {n.implementor && <div><b>Implementor(s): </b>{n.implementor}</div>}
                          </div>
                          {isEditable &&
                            isSelected && (
                              <FloatingActionButtons
                                onClickEdit={this.handleEditClick}
                                onClickDelete={() =>
                                  this.handleDeleteClick(n.status)
                                }
                              />
                            )}
                        </TableCell>
                        <TableCell padding="dense">
                          {n.recommendation && (<div className={classes.spacingBottom}><Badge
                            text={n.recommendation.toUpperCase()}
                            className={classes.svg} /></div>)}
                          {n.name.length > 100
                            ? n.name.slice(0, 100) + '...'
                            : n.name}
                        </TableCell>
                        {this.addPopOverColumn(
                          n.id,
                          n.description,
                          n.impact,
                          anchorEl,
                          classes
                        )}
                        <TableCell padding="dense">
                          {' '}
                          {n.impact && n.impact.length > 100
                            ? n.impact.slice(0, 100) + '...'
                            : n.impact}
                        </TableCell>
                        {/*                         <TableCell padding="none">
                          <Contributor email={n.contributor} subject={n.name} />
                        </TableCell>
                        <TableCell padding="none">
                          <Badge text={n.domain} />
                        </TableCell> */}
                        <TableCell padding="none">
                          {isLoggedIn && isAdmin ? (
                            <SelectComponent
                              option={n.status}
                              onChange={(event, id) =>
                                this.handleStatusChange(event, n.id)
                              }
                              disabled={isLoggedIn && isAdmin}
                              options={[
                                {
                                  name: 'Approval Pending',
                                  value: 'Approval Pending'
                                },
                                { name: 'Backlog', value: 'Backlog Item' },
                                { name: 'Done', value: 'Done' },
                                { name: 'In Progress', value: 'In Progress' }
                              ]}
                            />
                          ) : (
                              <StatusComponent status={n.status} />
                            )}
                        </TableCell>
                        <TableCell padding="none" className={classes.smallCell}>
                          {isLoggedIn && isAdmin ? (
                            <SelectComponent
                              option={n.priority}
                              onChange={(event, id) =>
                                this.handlePriorityChange(event, n.id)
                              }
                              disabled={isLoggedIn && isAdmin}
                              options={[
                                { name: 'High', value: 'High' },
                                { name: 'Medium', value: 'Medium' },
                                { name: 'Low', value: 'Low' },
                                { name: 'None', value: 'None' }
                              ]}
                            />
                          ) : (
                              <PriorityChip priority={n.priority} />
                            )}
                        </TableCell>
                        <TableCell padding="none">
                          <UrlListComponent urls={n.githubURL} />
                        </TableCell>
                        <TableCell padding="none">
                          {votesAvailable ? (
                            <UpVote
                              votes={n.votes}
                              id={n.id}
                              onUpVote={this.handleUpVote}
                              onDownVote={this.handleDownVote}
                            />
                          ) : (
                              <div />
                            )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                {emptyRows > 0 && (
                  <TableRow style={{ height: 49 * emptyRows }}>
                    <TableCell colSpan={6} />
                  </TableRow>
                )}
              </TableBody>
              <ChallengeTableFooter
                filteredData={filteredData}
                page={page}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={rowsPerPageOptions}
                handleChangePage={this.handleChangePage}
                handleChangeRowsPerPage={this.handleChangeRowsPerPage}
              />
            </Table>
          </div>
        </Paper>
      </div>
    )
  }
}

ChallengeTable.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(challengeTableStyles)(ChallengeTable)
