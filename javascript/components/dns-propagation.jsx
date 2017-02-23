/*
 * The MIT License (MIT)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import React from 'react';
import { FormattedMessage } from 'react-intl';
import DnsServerCollection from './dns-server-collection';
import DnsRecordInformation from './dns-record-information';
import DnsWebSocket from '../websocket/websocket';
import DnsMessage from './dns-message';
import DnsRecaptcha from './dns-recaptcha';
import DnsProgress from './dns-progress';

/**
 *
 */
class DnsPropagation extends React.Component {
  constructor(props) {
    super(props);

    this.onDnsQuerySubmit = this.onDnsQuerySubmit.bind(this);
    this.handleDomainChange = this.handleDomainChange.bind(this);
    this.handleTypeChange = this.handleTypeChange.bind(this);

    this.state = {
      domain: 'golang.org',
      type: 'a',
      servers: [],
      working: false,
      percentage: 0,
      message: {
        message: '',
        type: 'info'
      },
      recatpcha: {
        challenge: '',
        display: props.recaptcha
      }
    };

    this.websocket = new DnsWebSocket('ws://127.0.0.1:8080/api/v1/query');
    this.websocket.onWebSocketReply = this.onWebSocketReply.bind(this);
    this.websocket.onWebSocketError = this.onWebSocketError.bind(this);
  }

  componentDidMount() {
    window.addEventListener('keyup', (event) => {
      const input = document.getElementById('domain');
      const focused = document.activeElement;

      if (focused.type !== 'text' && focused.type !== 'select') {
        if (event.key.toLowerCase() === 'q') {
          this.onDnsQuerySubmit(event);
        } else if (event.key.toLowerCase() === 'a') {
          input.focus();
          input.selectionStart = input.selectionEnd = input.value.length;
        }
      }
    });
  }

  componentWillUnmount() {
    window.removeEventListener('keyup');
  }

  onDnsQuerySubmit(event) {
    event.preventDefault();
    this.setState({ working: true, percentage: 0, servers: [], message: { message: '', type: 'info' } });
    this.websocket.fetch(this.state.domain, this.state.type, this.state.recatpcha.display ? window.grecaptcha.getResponse() : null);
  }

  onWebSocketError() {
    this.setState({ working: false, message: { message: 'Connection error. Please try again!', type: 'danger' } });
  }

  onWebSocketReply(event) {
    const dataset = JSON.parse(event.data);

    if (dataset.Error) {
      this.setState({ working: false, message: { message: dataset.Error, type: 'danger' } });
      return;
    }

    const percentage = ((this.state.servers.length + 1) / 15) * 100;
    const state = {
      servers: this.state.servers.concat(JSON.parse(event.data)),
      percentage,
      working: percentage !== 100,
      recatpcha: {
        challenge: '',
        display: false
      }
    };

    this.setState(state);
  }

  handleDomainChange(event) {
    this.setState({ domain: event.target.value });
  }

  handleTypeChange(event) {
    this.setState({ type: event.target.value });
  }

  render() {
    let recaptcha = null;
    if (this.state.recatpcha.display) {
      recaptcha = <div className="col-lg-12"><DnsRecaptcha publickey={this.props.publickey} /></div>;
    }

    return (
      <div>
        <header className="navbar navbar-default navbar-fixed-top">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div>
                  <h1>
                    <img alt="DNS Propagation Logo" src="//i.imgur.com/rN1zILE.png" />
                    <FormattedMessage id="app-name" defaultMessage={'dnspropagation'} />
                  </h1>
                  <small>
                    <FormattedMessage id="app-tagline" defaultMessage={'Check a domain\'s DNS records. Check the propagation of your record changes and debug DNS related issues on the Internet.'} />
                  </small>
                </div>

                <form onSubmit={this.onDnsQuerySubmit} method="post" action="/api/v1/query">
                  <div className="row">
                    <div className="col-lg-4">
                      <input id="domain" placeholder="What is the domain you want to check?" className="form-control" type="text" value={this.state.domain} onChange={this.handleDomainChange} required />
                    </div>
                    <div className="col-lg-2">
                      <select className="form-control" value={this.state.type} onChange={this.handleTypeChange} required>
                        <option value="a">A</option>
                        <option value="aaaa">AAAA</option>
                        <option value="caa">CAA</option>
                        <option value="cname">CNAME</option>
                        <option value="mx">MX</option>
                        <option value="ns">NS</option>
                        <option value="ptr">PTR</option>
                        <option value="soa">SOA</option>
                        <option value="srv">SRV</option>
                        <option value="txt">TXT</option>
                      </select>
                    </div>
                    <div className="col-lg-2">
                      <button className="btn btn-primary" type="submit" disabled={this.state.working}>
                        <span className="glyphicon glyphicon-search">&nbsp;</span>
                        <span>
                          <FormattedMessage id="app-name" defaultMessage={'Query {type} record for {domain}'} values={{ type: this.state.type, domain: this.state.domain }} />
                        </span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <DnsProgress max={100} percentage={this.state.percentage} />
        </header>

        <div className="container results">
          <div className="row">
            <div className="col-lg-12">
              <DnsRecordInformation record={this.state.type} />
            </div>

            { recaptcha }

            <div className="col-lg-12">
              { this.state.message.message.length > 0 ?
                <DnsMessage message={this.state.message.message} type={this.state.message.type} /> :
                <DnsServerCollection servers={this.state.servers} /> }
            </div>
          </div>
        </div>
        <footer className="container main">
          <small>
            <FormattedMessage id="app-footer" defaultMessage={'Press {q} to refresh the URL in text box and {a} focus on the textbox. Source Code is available in {link}'} values={{ q: <code>Q</code>, a: <code>A</code>, link: <a target="_blank" rel="noopener noreferrer" href="https://github.com/rvelhote/dnspropagation">GitHub</a> }} />
          </small>
        </footer>
      </div>
    );
  }
}

DnsPropagation.displayName = 'DnsPropagation';

DnsPropagation.propTypes = {
  publickey: React.PropTypes.string,
  recaptcha: React.PropTypes.bool
};

DnsPropagation.defaultProps = {
  publickey: '',
  recaptcha: true
};

export default DnsPropagation;
