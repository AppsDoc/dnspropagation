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
	"github.com/gorilla/websocket"
    "github.com/rvelhote/go-recaptcha"
	"html/template"
	"log"
	"net/http"
)

func index(w http.ResponseWriter, req *http.Request) {
	w.Header().Add("Content-Type", "text/html")
	t, _ := template.New("index.html").ParseFiles("../templates/index.html")
	t.Execute(w, map[string]string{"Title": "Check DNS Propagation Worldwide"})
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:    4096,
	WriteBufferSize:   4096,
	EnableCompression: true,
	CheckOrigin: CheckOrigin,
}

func query(w http.ResponseWriter, req *http.Request, configuration []Server) {
    recaptchaCookie, _ := req.Cookie("reCAPTCHA")

    if recaptchaCookie == nil {
        challenge := req.URL.Query().Get("c")

        catpcha := recaptcha.Recaptcha{ PrivateKey: "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe" }
        recaptchaResponse, _ := catpcha.Verify(challenge, "127.0.0.1")

        if recaptchaResponse.Success == false {
            w.WriteHeader(403)
            return
        }

        recaptchaCookie = &http.Cookie{ Name: "reCAPTCHA", Value: "1", HttpOnly: true, Path: "/" }
    }

	conn, upgraderr := upgrader.Upgrade(w, req, http.Header{"Set-Cookie": {recaptchaCookie.String()}})

	if upgraderr != nil {
		log.Println(upgraderr)
		return
	}

	websocketreq := WebsocketRequest{}
	conn.ReadJSON(&websocketreq)

	defer conn.Close()

    err := websocketreq.Validate()
	if err != nil {
		conn.WriteJSON(ResponseError{Error: err.Error()})
		return
	}

	sem := make(chan Response, len(configuration))

	for _, server := range configuration {
		go func(server Server) {
			request := DnsQuery{Domain: websocketreq.Domain, Record: websocketreq.RecordType, Server: server}
			sem <- request.GetResponse()
		}(server)
	}

	for _, _ = range configuration {
		conn.WriteJSON(<-sem)
	}
}

func Init() {
	servers, _ := LoadConfiguration("conf/servers.json")
	log.Println("Server list loaded!")

	fs := http.FileServer(http.Dir("assets"))
	http.Handle("/assets/", http.StripPrefix("/assets/", fs))

	http.HandleFunc("/", index)

	http.HandleFunc("/api/v1/query", func(w http.ResponseWriter, req *http.Request) {
		query(w, req, servers)
	})

	log.Println("Ready to server requests!")
	http.ListenAndServe(":8080", nil)
}
