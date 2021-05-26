** This project is deprecated **

# gatsby-ershcl-app

[![Build Status](https://travis-ci.org/ERS-HCL/gatsby-ershcl-app.svg?branch=master)](https://travis-ci.org/ERS-HCL/gatsby-ershcl-app)
[![GitHub version](https://badge.fury.io/gh/ERS-HCL%2Fgatsby-demo-app.svg)](https://badge.fury.io/gh/ERS-HCL%2Fgatsby-demo-app)
[![Dependency Status](https://david-dm.org/ERS-HCL/gatsby-ershcl-app.svg)](https://david-dm.org/ERS-HCL/gatsby-ershcl-app)
---

This is a Gatsby Demo App that will be used to create a static web app to report the github organization , users and project details and statistics.

## Overall Objective

One of the challenges we face is to get a view of the open source contributions we are making at an Organization level , in terms of whats trending , who are the new contributors , getting an overview about the project , the kanban details of the projects, issues etc.

### Solution

* We use Gatsby as the static site generator and gain from the powerful technologies of React , Redux , GraphQL and all the goodies which come OOTB with GatsbyJS.
* The github GraphQL APIs provide all the needed data
* Using Gatsby and the various plugins we can now pull in the required data from Github and bind it the various views we need. 
* The final output is published to the organization github landing page [ers-hcl.github.io](https://ers-hcl.github.io/)

### Additional Organization Updates

* Gatsby provides great set of plugins for source and transforms which we use to create additional posts about the ERS-HCL open source initiative. These convert the Markdown files to content that can be then rendered as pages.
* Steps for that
    1 Create a new Markdown file under the src/pages/posts/data folder
    2 Make sure to have these with the extension .md
    3 See the existing samples for details about the expected format. 
        * Primarily we expect a 'title' property.
        * Also the first paragraph is used as a short discription of the post.

### Future additions (in Progress)

* Kanban data from the organization projects
* Each repository specific detailed page
* Excel source based separate pages

## Configuration

Create a .env<.development|.production> file

* Add the required github configuration details. This will be required for the github projects and top 10 pages
* Create a firebase database on the firebase cloud. This will be required for challenges page.

### Example .env<.development|.production> file

```property
GITHUB_TOKEN=<ADD YOUR GITHUB USER OAUTH TOKEN>
GATSBY_FIREBASE_API_KEY=<ADD YOUR FIREBASE CREDENTIALS>
GATSBY_FIREBASE_AUTH_DOMAIN=<ADD YOUR FIREBASE CREDENTIALS>
GATSBY_FIREBASE_DATABASE_URL=<ADD YOUR FIREBASE CREDENTIALS>
GATSBY_FIREBASE_PROJECT_ID=<ADD YOUR FIREBASE CREDENTIALS>
GATSBY_FIREBASE_STORAGE_BUCKET=<ADD YOUR FIREBASE CREDENTIALS>
GATSBY_FIREBASE_MESSAGING_SENDER_ID=<ADD YOUR FIREBASE CREDENTIALS>
```

* Note we need to have the OAuth github API token in place as a prerequisite.

## Running in development

`gatsby develop`

### Publishing

`npm publish`
