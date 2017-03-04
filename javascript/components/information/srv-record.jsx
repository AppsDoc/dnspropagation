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

const SrvRecord = () =>
  <blockquote>
    <p><FormattedMessage id="srv-record-desc" defaultMessage={'SRV records are often used to help with service discovery. For example, SRV records are used in Internet Telephony for defining where a SIP service may be found. An SRV record typically defines a symbolic name and the transport protocol used as part of the domain name, and defines the priority, weight, port and target for the service in the record content.'} /></p>
    <footer>https://support.dnsimple.com/articles/srv-record</footer>
  </blockquote>;

SrvRecord.displayName = 'ARecord';

export default SrvRecord;
