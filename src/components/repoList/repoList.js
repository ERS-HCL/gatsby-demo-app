import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ReactTable from 'react-table';
import BlockContainer from '../blockContainer/blockContainer';
import 'react-table/react-table.css';
import ProjectCard from '../projectCard/projectCard';
import Paper from '@material-ui/core/Paper';
import blueGrey from '@material-ui/core/colors/blueGrey';
import { CSVLink } from 'react-csv';
import CloudDownload from '@material-ui/icons/CloudDownload';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import GridContainer from '../grid/GridContainer';
import GridItem from '../grid/GridItem';
import MyButton from '../CustomButtons/Button';
import Parallax from '../parallax/Parallax';

const moment = require('moment-timezone');
moment.tz.setDefault('UTC');

const title = {
  color: '#3C4858',
  margin: '1.75rem 0 0.875rem',
  textDecoration: 'none',
  fontWeight: '700',
  fontFamily: `"Montserrat", "Times New Roman", serif`,
};

const conatinerFluid = {
  paddingRight: '15px',
  paddingLeft: '15px',
  marginRight: 'auto',
  marginLeft: 'auto',
  width: '100%',
};

const container = {
  ...conatinerFluid,
  '@media (min-width: 576px)': {
    maxWidth: '540px',
  },
  '@media (min-width: 768px)': {
    maxWidth: '720px',
  },
  '@media (min-width: 992px)': {
    maxWidth: '960px',
  },
  '@media (min-width: 1200px)': {
    maxWidth: '1140px',
  },
};

const styles = theme => ({
  container: {
    zIndex: '12',
    color: '#FFFFFF',
    ...container,
  },
  title: {
    ...title,
    display: 'inline-block',
    position: 'relative',
    marginTop: '30px',
    minHeight: '32px',
    color: '#FFFFFF',
    textDecoration: 'none',
    fontFamily: `"Montserrat", "Times New Roman", serif`,
  },
  subtitle: {
    fontSize: '1rem',
    maxWidth: '500px',
    fontFamily: `"Montserrat", "Times New Roman", serif`,
  },
  main: {
    background: '#FFFFFF',
    position: 'relative',
    zIndex: '3',
  },
  mainRaised: {
    margin: '-60px 30px 0px',
    borderRadius: '6px',
    boxShadow:
      '0 16px 24px 2px rgba(0, 0, 0, 0.14), 0 6px 30px 5px rgba(0, 0, 0, 0.12), 0 8px 10px -5px rgba(0, 0, 0, 0.2)',
  },
  paper: {
    /*     margin: 5,
    padding: 10, */
    display: 'block',
    height: '100%',
    minHeight: '100vh',
    transitionEnabled: true,
    backgroundColor: blueGrey[50],
    alignContent: 'center',
    alignItems: 'center',
    rounded: true,
    borderRadius: 5,
    shadowRadius: 5,
  },
  csv: {
    display: 'flex',
    flexDirection: 'row-reverse',
    alignSelf: 'flex-start',
  },
  button: {
    margin: theme.spacing.unit,
    fontSize: '.85em',
  },
  extendedIcon: {
    marginRight: theme.spacing.unit,
  },
});

class RepoList extends React.Component {
  render() {
    const { classes, hero } = this.props;
    const buildTime = this.props.buildTime;
    const columns = [
      {
        Header: 'Repository',
        accessor: 'name', //d => d.name
      },
      /*       {
        Header: 'Authors',
        accessor: 'contributors', // String-based value accessors!
      }, */
      {
        id: 'LanguageName',
        Header: 'Language',
        maxWidth: 170,
        accessor: d => d.language.name, // Custom value accessors!
        Cell: row => {
          return (
            <span>
              <span
                style={{
                  color: row.original.language.color,
                  transition: 'all .3s ease',
                }}
              >
                &#x25cf;
              </span>{' '}
              {row.original.language.name}
            </span>
          );
        },
      },
      {
        Header: 'Stars',
        accessor: 'stars',
        maxWidth: 80,
        Cell: props => <span className="number">{props.value}</span>, // Custom cell components!
      },
      {
        Header: 'Forks',
        accessor: 'forkCount',
        maxWidth: 80,
        Cell: props => <span className="number">{props.value}</span>, // Custom cell components!
      },
      {
        Header: 'Created On',
        maxWidth: 120,
        accessor: 'createdAt', // String-based value accessors!
        Cell: props => <span>{moment.utc(props.value).from(buildTime)}</span>,
      },
      {
        Header: 'Last Push',
        maxWidth: 120,
        accessor: 'pushedAt', // String-based value accessors!
        Cell: props => <span>{moment.utc(props.value).from(buildTime)}</span>,
      },
    ];
    const org = this.props.githubData.edges[0].node.data.organization;
    const orgData = {
      description: org.description,
      websiteUrl: org.websiteUrl,
    };
    const repositories = org.repositories;
    const getTopics = edges => {
      return edges.map(edge => {
        return edge.node.topic.name;
      });
    };

    const getContributors = contributors => {
      return contributors
        .map(edge => {
          return edge.node.name && edge.node.name.trim() !== ''
            ? edge.node.name
            : edge.node.login;
        })
        .join(',');
    };

    const getPrimaryLanguage = primaryLanguage => {
      return primaryLanguage
        ? {
            name: primaryLanguage.name,
            color: primaryLanguage.color,
          }
        : {
            name: 'na',
            color: 'black',
          };
    };

    const reposdata = repositories.edges.map(repo => {
      return {
        name: repo.node.name,
        forkCount: repo.node.forkCount,
        stars: repo.node.stargazers.totalCount,
        // TODO: contributors disabled as it requires extra github permissions to view
        // disabled for now
        /*  contributors: '',
          repo.node.collaborators !== null
            ? getContributors(repo.node.collaborators.edges)
            : '',*/
        language: getPrimaryLanguage(repo.node.primaryLanguage),
        pushedAt: repo.node.pushedAt,
        createdAt: repo.node.createdAt,
        descriptionHTML: repo.node.descriptionHTML,
        homepageUrl: repo.node.homepageUrl,
        url: repo.node.url,
        topics: getTopics(repo.node.repositoryTopics.edges),
        license: repo.node.licenseInfo ? repo.node.licenseInfo.name : null,
      };
    });
    const pageHeader =
      +repositories.totalCount +
      ' Repositories as on ' +
      moment(this.props.buildTime).format('Do MMM YYYY HH:MM A z');
    const csvFileName =
      'ProjectList_' + moment(new Date()).format('DD_MM_YYYY') + '.csv';
    return (
      <div>
        <Parallax filter image={hero}>
          <div className={classes.container}>
            <GridContainer>
              <GridItem xs={12} sm={12} md={6}>
                <h1 className={classes.title}>
                  ERS-HCL Open Source Initiative
                </h1>
                <h4 className={classes.subtitle}>
                  {pageHeader}
                  <br />
                  The top 100 active projects are listed below.
                </h4>
                <h5 className={classes.subtitle}>
                  The <b>Detailed View</b> provides all the project listings
                </h5>
                <MyButton
                  color="danger"
                  size="lg"
                  href="https://affectionate-keller-d4f61b.netlify.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fas fa-play" />
                  Detailed View
                </MyButton>
              </GridItem>
            </GridContainer>
          </div>
        </Parallax>
        <Paper className={classes.paper} elevation={2}>
          <div className={classes.csv}>
            <Tooltip title="Download CSV">
              <CSVLink data={reposdata} filename={csvFileName}>
                <IconButton aria-label="Download" color="primary">
                  <CloudDownload />
                </IconButton>
              </CSVLink>
            </Tooltip>
          </div>
          <ReactTable
            getProps={(state, rowInfo, column) => {
              return {
                style: {
                  backgroundColor: 'white',
                  fontFamily: 'Montserrat, sans-serif',
                },
              };
            }}
            getTheadThProps={(state, rowInfo, column) => {
              return {
                style: {
                  fontWeight: 'bold',
                },
              };
            }}
            data={reposdata}
            className="-striped -highlight"
            columns={columns}
            defaultPageSize={20}
            SubComponent={row => {
              return (
                <BlockContainer>
                  <ProjectCard
                    name={row.original.name}
                    url={row.original.url}
                    avatar=""
                    excerpt={row.original.descriptionHTML}
                    topics={row.original.topics}
                    language={row.original.language}
                    license={row.original.license}
                  />
                </BlockContainer>
              );
            }}
          />
        </Paper>
      </div>
    );
  }
}

RepoList.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(RepoList);
