import cgi
import json
import jwt
import os
import re
import ssl
import sys
import urllib

import SimpleHTTPServer
import SocketServer


# Simple Server to serve stub pages and mocked apis over https

PORT = 12222

class ServerHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):

    def end_headers(self):
        self.set_headers()
        SimpleHTTPServer.SimpleHTTPRequestHandler.end_headers(self)

    def set_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')

    def extract_query_string(self):
        path = self.path
        query_string = None

        if '?' in path:
            path_parts = path.split('?', 1)
            path = path_parts[0]
            query_string = path_parts[1]
            self.query_string = query_string
            self.path = path

    def _do_GET(self, post_body=None):
        self.extract_query_string()
        self.write_last_request(post_body)
        SimpleHTTPServer.SimpleHTTPRequestHandler.do_GET(self)

    def write_last_request(self, post_body=None):
        last_request = {'path': self.path, 'method': self.command}
        if getattr(self, 'query_string', None):
            last_request['query_string'] = self.query_string
        if post_body:
            last_request['post_body'] = post_body

        with open('requests.json', 'r') as r:
            data = json.load(r)

        with open('requests.json', 'w') as out:
            data['requests'].append(last_request)
            json.dump(data, out, indent=4)

        request_dir = 'requests/%s/' % self.path
        if not os.path.exists(request_dir):
            os.makedirs(request_dir)

        request_file = '%s/request.json' % request_dir
        with open(request_file, 'w') as out:
            json.dump(last_request, out, indent=4)

    def do_OPTIONS(self):
        self._do_GET()

    def do_GET(self):
        self._do_GET()

    def do_POST(self):
        post_body = None

        if ('/authorize/' in self.path):
            self.extract_query_string()
            self.write_last_request()
            self.send_response(302)
            redirect = re.search('redirect_uri=([^&]+)', self.query_string).group(1)
            redirect = urllib.unquote(redirect)
            token = jwt.encode({
                'email': 'blah@blah.com',
            }, 'secret')
            location = '%s#access_token=%s&token_type=Bearer&state=blah' % (redirect, token)
            self.send_header('Location', location)
            self.end_headers()
        else:
            content_len = int(self.headers.getheader('content-length', 0))
            post_body = json.loads(self.rfile.read(content_len))
            self._do_GET(post_body)


if __name__ == '__main__':
    Handler = ServerHandler

    with open('requests.json', 'w') as out:
        json.dump({'requests': []}, out)

    SocketServer.TCPServer.allow_reuse_address = True
    httpd = SocketServer.TCPServer(("", PORT), Handler)
    path = os.path.abspath('../../scripts/server.pem')
    httpd.socket = ssl.wrap_socket(httpd.socket, certfile=path, server_side=True)

    print "serving at port", PORT

    httpd.serve_forever()
