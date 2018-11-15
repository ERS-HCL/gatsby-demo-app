import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import PostPagination from './postPagination/postPagination'
import PageHeader from '../pageHeader/pageHeader'
import SimpleCard from '../simpleCard/simpleCard'


const styles = theme => ({
  card: {
    alignSelf: 'auto',
    flex: '1 1 auto',
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    theme: 'inherit',
    alignContent: 'center'
  },
  root: {
    padding: theme.spacing.unit * 2,
  },
  control: {
    padding: theme.spacing.unit * 2,
  }
})

export class BlogPosts extends Component {
  state = {
    spacing: '40',
  };

  render() {
    const { classes, theme } = this.props
    const { spacing } = this.state
    const { group, index, pageCount } = this.props.pageContext
    const showcaseUrlPrefix = 'showcase/'
    const previousUrl =
      showcaseUrlPrefix + (index - 1 === 1 ? '' : (index - 1).toString())
    const nextUrl = showcaseUrlPrefix + (index + 1).toString()
    const isFirstPage = index - 1 === 0
    const isLastPage = index === pageCount
    const pageHeader = 'Showcase (' + this.props.totalCount + ')'
    return (
      <div className={classes.card}>
        <PageHeader text={pageHeader.toUpperCase()} />
        <PostPagination
          index={index}
          pageCount={pageCount}
          isFirstPage={isFirstPage}
          isLastPage={isLastPage}
          nextUrl={nextUrl}
          previousUrl={previousUrl}
        />
        <Grid container className={classes.root} spacing={8}>
          <Grid item xs={12}>
            <Grid container className={classes.demo} justify="center" spacing={Number(spacing)}>
              {group.map(({ node }) => (
                <Grid key={node.id} item>
                <SimpleCard
                              date={node.frontmatter.date}
                              excerpt={node.excerpt}
                              title={node.frontmatter.title}
                              url={node.fields.slug}
                            />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
        <PostPagination
          index={index}
          pageCount={pageCount}
          isFirstPage={isFirstPage}
          isLastPage={isLastPage}
          nextUrl={nextUrl}
          previousUrl={previousUrl}
        />
      </div>
    )
  }
}

BlogPosts.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
}

export default withStyles(styles, { withTheme: true })(BlogPosts)
