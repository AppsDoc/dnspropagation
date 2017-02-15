// Package application contains the server-side application code.
package application

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
import (
	"encoding/json"
	"io/ioutil"
)

// Configuration holds the application configuration settings. Configuration files should be created in the conf folder.
type Configuration struct {
	Recaptcha Recaptcha `json:"recaptcha"`
	Servers   []Server  `json:"servers"`
}

// Recaptcha holds the Google reCAPTCHA settings mainly the public and private keys.
type Recaptcha struct {
	PublicKey  string `json:"publickey"`
	PrivateKey string `json:"privatekey"`
}

// Server holds the list of DNS servers that the application is allowed to query.
type Server struct {
	IPAddress string `json:"ipaddress"`
	Provider  string `json:"provider"`
	Country   string `json:"country"`
	City      string `json:"city"`
	Code      string `json:"code"`
}

// LoadConfiguration loads a configuration file from the specified path. It will return the configuration in the JSON
// file or an error with details if the operation fails (e.g. file does not exist, invalid JSON)
func LoadConfiguration(path string) (Configuration, error) {
	configuration := Configuration{}
	file, err := ioutil.ReadFile(path)

	if err != nil {
		return configuration, err
	}

	err = json.Unmarshal(file, &configuration)
	if err != nil {
		return configuration, err
	}

	return configuration, nil
}
