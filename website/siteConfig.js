/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* List of projects/orgs using your project for the users page */
const users = [
  {
    caption: 'uma empresa',
    image: '/danfy/img/danfy.svg',
    infoLink: 'https://www.danfy.com',
    pinned: true,
  },
];

const siteConfig = {
  title: 'danfy' /* title for your website */,
  tagline: 'Um serviço para o cálculo de impostos',
  url: 'https://gabrielcarneiro97.github.io' /* your website url */,
  baseUrl: '/danfy/' /* base url for your project */,
  projectName: 'danfy',
  headerLinks: [
    {doc: 'intro', label: 'Intro'},    
    {doc: 'docs', label: 'Docs'},
    {page: 'help', label: 'Ajuda'},
    { href: 'https://github.com/gabrielcarneiro97/danfy', label: 'GitHub' },
    {blog: true, label: 'Blog'},
  ],
  users,
  /* path to images for header/footer */
  headerIcon: 'img/danfy.svg',
  footerIcon: 'img/danfy.svg',
  favicon: 'img/favicon.ico',
  /* colors for website */
  colors: {
    primaryColor: '#3F51B5',
    secondaryColor: '#5E9252',
  },
  // This copyright info is used in /core/Footer.js and blog rss/atom feeds.
  copyright:
    'Copyright © ' +
    new Date().getFullYear() +
    ' Gabriel Carneiro, et al',
  // organizationName: 'deltice', // or set an env variable ORGANIZATION_NAME
  highlight: {
    // Highlight.js theme to use for syntax highlighting in code blocks
    theme: 'default',
  },
  scripts: ['https://buttons.github.io/buttons.js'],
  // You may provide arbitrary config keys to be used as needed by your template.
  repoUrl: 'https://github.com/gabrielcarneiro97/danfy',
};

module.exports = siteConfig;
