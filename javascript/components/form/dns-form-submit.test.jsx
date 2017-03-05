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
import renderer from 'react-test-renderer';
import { IntlProvider } from 'react-intl';
import DnsFormSubmit from './dns-form-submit';

const params = { domain: 'golang.org', type: 'a' };

test('submit button should render and be enabled', () => {
  const component = renderer.create(
    <IntlProvider locale="en">
      <DnsFormSubmit domain={params.domain} type={params.type} />
    </IntlProvider>
  );

  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});

test('submit button should render and be disabled', () => {
  const component = renderer.create(
    <IntlProvider locale="en">
      <DnsFormSubmit working={false} domain={params.domain} type={params.type} />
    </IntlProvider>
  );

  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
