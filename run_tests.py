import os
import sys
import urllib2
import subprocess
import zipfile
import cStringIO
import json

import nginc

BIN = os.path.expanduser('~/.local/bin')
FLOW = os.path.join(BIN, 'flow')
BROWSERSTACK = os.path.join(BIN, 'BrowserStackLocal')


class AppData(object):
    min_version = None

    def install(self):
        # check if already installed
        if os.path.exists(self.executable):
            if not self.min_version or self.get_version() >= self.min_version:
                return True

        # download flow
        response = urllib2.urlopen(self.download_url)
        zip_data = cStringIO.StringIO(response.read())
        zip_file = zipfile.ZipFile(zip_data)
        exe = zip_file.open(self.zip_path).read()
        with open(self.executable, 'w') as out:
            out.write(exe)
        os.chmod(self.executable, 0744)

    def call(self, *args):
        cmd = [self.executable]
        cmd.extend(args)
        return subprocess.call(cmd)


class Flow(AppData):
    download_url = 'https://github.com/facebook/flow/releases/download/v0.52.0/flow-linux64-v0.52.0.zip'
    zip_path = 'flow/flow'
    min_version = [0, 14, 0]
    executable = FLOW

    def get_version(self):
        version = subprocess.check_output([self.executable, 'version'])
        version = version.strip()
        i = version.rfind(' ')
        version = version[i:]
        return map(int, version.split('.'))


class BrowserStackLocal(AppData):
    download_url = 'https://www.browserstack.com/browserstack-local/BrowserStackLocal-linux-x64.zip'
    zip_path = 'BrowserStackLocal'
    min_version = [3, 7]
    executable = BROWSERSTACK

    def get_version(self):
        version = subprocess.check_output([BROWSERSTACK, '-version']).strip()
        i = version.rfind(' ')
        version = version[i:].strip('v')
        return map(int, version.split('.'))

    def __init__(self):
        # read config
        self.proc = None
        config = os.path.expanduser('~/.browserstack.json')
        self.config = json.load(open(config))

        print self.config

    def start(self, arg):
        if self.proc:
            self.stop()

        cmd = [self.executable, self.config['key'], arg]
        self.proc = subprocess.Popen(cmd)

    def stop(self):
        self.proc.terminate()
        self.proc = None

def main():
    if not os.path.exists(BIN):
        os.makedirs(BIN)

    flow = Flow()
    flow.install()
    # TODO use flow
    # assert flow.call() == 0

    # start nginx
    nginx = nginc.start('.', port=8000)

    # forward port to browserstack
    browserstack = BrowserStackLocal()
    browserstack.install()
    browserstack.start('localhost,8000,0')

    # wait for things to settle
    import time
    time.sleep(5)

    # run browserstack tests
    ok = subprocess.call(['python', 'test/browserstack.py'])
    nginx.terminate()
    browserstack.stop()

    sys.exit(ok)


    # browserstack
    # have fun here

if __name__ == '__main__':
    main()
