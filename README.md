GHC
===

A shell client for communicating with the GitHub API.

I frequently want to query GitHub to see what I've been doing lately on different repositories. The
API is powerful, but using CURL to talk to it is a bit irritating. While it would be perfectly
suitable to use [node-github](https://github.com/ajaxorg/node-github) or [gh3](https://github.com/k33g/gh3) for talking to GitHub, I felt like using the raw
Node.js http modules instead, to give me more to do.

The goal is simple: query data from the GitHub API, in order to keep track of work being done by
individual users (myself) across a wide variety of repositories, and provide a nice, easy CLI client
for performing these queries.

The client should work as both a library and a command line client, it should have as few
dependencies as possible, and it should be simple.

The client doesn't do much yet, but there's no reason it can't do more in the future, if anyone thinks it ought to do more.

While it has currently just been quickly hacked together, tests and more functionality shall be
added as needed, and it's open for anyone else to work on as they see fit.

###License

The MIT License (MIT)

Copyright (c) 2013 Caitlin Potter & Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
