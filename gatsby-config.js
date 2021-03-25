require('dotenv').config();
module.exports = {
  siteMetadata: {
    title: `OSS @ERS-HCL`,
    maintainedBy: `Maintained by ERS Technology Office`,
    poweredBy: `GatsbyJS`,
    contributors: `Tarun Sukhu<tsukhu@hcl.com>`,
    githubProject: `https://github.com/ERS-HCL/gatsby-ershcl-app`,
  },
  plugins: [
    `gatsby-plugin-postcss`,
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-plugin-google-fonts`,
      options: {
        fonts: [
          `Montserrat`
        ],
        display: 'swap'
      }
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `data`,
        path: `${__dirname}/src/data`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: 'gatsby-mdx',
      options: {
        extensions: ['.mdx', '.md'],

        gfm: true,
        commonmark: true,
        footnotes: true,
        pedantic: true,
        plugins: [
          {
            resolve: 'gatsby-remark-images',
            options: {
              maxWidth: 740,
            },
          },
          {
            resolve: 'gatsby-remark-responsive-iframe',
            options: {
              wrapperStyle: `margin-bottom: 1.0725rem`,
            },
          },
          { resolve: 'gatsby-remark-copy-linked-files' },
          {
            resolve: 'gatsby-remark-smartypants',
            options: {
              dashes: 'oldschool',
            },
          },
          { resolve: 'gatsby-remark-autolink-headers' },
          { resolve: 'gatsby-remark-prismjs' },
        ],
      },
    },
    `gatsby-transformer-excel`,
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        name: 'HCL ERS Static Site',
        short_name: 'ERS OSS',
        description: 'ERS Open Source',
        start_url: '/',
        background_color: '#f7f0eb',
        theme_color: '#a2466c',
        display: 'minimal-ui',
        icons: [
          {
            src: '/logos/logo-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/logos/logo-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    },
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: 'UA-119197833-1',
        // Puts tracking script in the head instead of the body
        head: false,
        // Setting this parameter is optional
        anonymize: true,
        // Setting this parameter is also optional
        respectDNT: true,
        // Avoids sending pageview hits from custom paths
        exclude: [],
      },
    } /* , {
      resolve: `gatsby-plugin-guess-js`,
      options: {
        GAViewID: `175275642`,
        minimumThreshold: 0.03,
        period: {
          startDate: new Date("2018-2-1"),
          endDate: new Date("2019-5-5")
        }
      }
    } */,
    `gatsby-plugin-offline`,
    {
      resolve: `gatsby-source-github-api`,
      options: {
        token: `${process.env.GITHUB_TOKEN}`,
        variables: {},
        graphQLQuery: `
        query ($author: String="") {
          all: search(query: "stars:>50000", type: REPOSITORY, first: 10) {
            repositoryCount
            edges {
              node {
                ... on Repository {
                  name
                  owner {
                    login
                    avatarUrl
                  }
                  url
                  description
                  descriptionHTML
                  primaryLanguage {
                    name
                    color
                  }
                  stargazers {
                    totalCount
                  }
                }
              }
            }
          }
          typescript: search(query: "stars:>3000 language:TypeScript", type: REPOSITORY, first: 10) {
            repositoryCount
            edges {
              node {
                ... on Repository {
                  name
                  owner {
                    login
                    avatarUrl
                  }
                  url
                  description
                  descriptionHTML
                  primaryLanguage {
                    name
                    color
                  }
                  stargazers {
                    totalCount
                  }
                }
              }
            }
          }
          css: search(query: "stars:>3000 language:CSS", type: REPOSITORY, first: 10) {
            repositoryCount
            edges {
              node {
                ... on Repository {
                  name
                  owner {
                    login
                    avatarUrl
                  }
                  url
                  description
                  descriptionHTML
                  primaryLanguage {
                    name
                    color
                  }
                  stargazers {
                    totalCount
                  }
                }
              }
            }
          }
          html: search(query: "stars:>3000 language:HTML", type: REPOSITORY, first: 10) {
            repositoryCount
            edges {
              node {
                ... on Repository {
                  name
                  owner {
                    login
                    avatarUrl
                  }
                  url
                  description
                  descriptionHTML
                  primaryLanguage {
                    name
                    color
                  }
                  stargazers {
                    totalCount
                  }
                }
              }
            }
          }
          javascript: search(query: "stars:>3000 language:JavaScript", type: REPOSITORY, first: 10) {
            repositoryCount
            edges {
              node {
                ... on Repository {
                  name
                  owner {
                    login
                    avatarUrl
                  }
                  url
                  description
                  descriptionHTML
                  primaryLanguage {
                    name
                    color
                  }
                  stargazers {
                    totalCount
                  }
                }
              }
            }
          }
          java: search(query: "stars:>3000 language:Java", type: REPOSITORY, first: 10) {
            repositoryCount
            edges {
              node {
                ... on Repository {
                  name
                  owner {
                    login
                    avatarUrl
                  }
                  url
                  description
                  descriptionHTML
                  primaryLanguage {
                    name
                    color
                  }
                  stargazers {
                    totalCount
                  }
                }
              }
            }
          }                
          organization(login: $author) {
            description
            websiteUrl
            avatarUrl
            name
            repositories(first: 100, orderBy: {field: UPDATED_AT , direction:DESC}) {
              totalCount
              edges {
                node {
                  name
                  descriptionHTML
                  licenseInfo{
                    name
                  }
                  stargazers(first: 50){
                    totalCount
                  }
                  repositoryTopics(first:20){
                    edges{
                      node{
                        topic {
                          name
                        }
                      }
                    }
                  }
                  forkCount
                  isFork
                  createdAt
                  updatedAt
                  pushedAt
                  homepageUrl
                  url
                  primaryLanguage {
                    name
                    color
                  }
                }
              }
            }
          }
        }        
        `,
        variables: {
          author: 'ERS-HCL',
        },
      },
    },
  ],
};
