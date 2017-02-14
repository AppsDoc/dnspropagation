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
    "net/http"
    "github.com/rvelhote/go-recaptcha"
)

type RecaptchaMiddleware struct {
    Conf []Server
}

func (middle RecaptchaMiddleware) Middleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        recaptchaCookie, _ := r.Cookie("reCAPTCHA")

        if recaptchaCookie == nil {
            challenge := r.URL.Query().Get("c")

            catpcha := recaptcha.Recaptcha{ PrivateKey: "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe" }
            recaptchaResponse, _ := catpcha.Verify(challenge, "127.0.0.1")

            if recaptchaResponse.Success == false {
                w.WriteHeader(403)
                return
            }

            recaptchaCookie = &http.Cookie{ Name: "reCAPTCHA", Value: "1", HttpOnly: true, Path: "/" }
        }

        next.ServeHTTP(w, r)
    })
}