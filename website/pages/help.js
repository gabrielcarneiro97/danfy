/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const CompLibrary = require('../core/CompLibrary.js');
const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;

const siteConfig = require(process.cwd() + '/siteConfig.js');

class Help extends React.Component {
  render() {
    const supportLinks = [
      {
        content:
          'Nos esforçamos para manter nossa [documentação](/danfy/docs/docs.html) o mais completa possível.',
        title: 'Leia a documentação',
      },
      {
        content: 'Pergunte diretamente aos desenvolvedores pelo [Slack]() ou [Github]().',
        title: 'Converse com a gente',
      },
      {
        content: "Descubra como vai o desenvolvimento do projeto e as novidades planejadas, no [blog](/danfy/blog).",
        title: 'Me deixe por dentro',
      },
    ];

    return (
      <div className="docMainWrapper wrapper">
        <Container className="mainContainer documentContainer postContainer">
          <div className="post">
            <header className="postHeader">
              <h2>Precisando de ajuda?</h2>
            </header>
            <p>Esse projeto é mantido por um grupo de pessoas dedicadas a trazer a melhor experiência possível aos usuários.</p>
            <GridBlock contents={supportLinks} layout="threeColumn" />
          </div>
        </Container>
      </div>
    );
  }
}

module.exports = Help;
