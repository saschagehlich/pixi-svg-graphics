import os
import json
import cStringIO
import sys
import time
import subprocess

from PIL import Image
import selenium.webdriver
import image_comparison


def get_browserstack_webdriver(capabilities):
    capabilities.setdefault('resolution', '1920x1080')
    capabilities.setdefault('browserstack.local', True)
    capabilities.setdefault('browserstack.debug', True)

    config = os.path.expanduser('~/.browserstack.json')
    cfg = json.load(open(config))

    hub = 'http://{user}:{key}@hub.browserstack.com/wd/hub'
    hub = hub.format(**cfg)
    webdriver = selenium.webdriver.Remote(
                command_executor=hub,
                desired_capabilities=capabilities
    )

    webdriver.set_page_load_timeout(60)
    webdriver.implicitly_wait(10)
    return webdriver

def run_browserstack_test(images, cap):
    driver = get_browserstack_webdriver(cap)
    driver.get('http://127.0.0.1:8000/test/index.html')

    t = TestRunner(driver)
    time.sleep(1)

    images_s_bad = []
    images_rms_bad = []
    images_good = []

    for image in images:
        if not image.endswith('.svg'):
            continue
        driver.execute_script('changeTestImage("src/' + image + '");')
        while not driver.execute_script('return checkReady();'):
            time.sleep(1)
        i = t.screenshot_element('output')
        i.save('test/out/' + cap['browser'] + '/' + image + '.png')
        comparisons = image_comparison.compare('test/out/' + cap['browser'] + '/' + image + '.png', 'test/ref/' + image + '.png')
        if not comparisons['s']:
            images_s_bad.append(image)
        if not comparisons['rms']:
            images_rms_bad.append(image)
        if image not in images_s_bad and image not in images_rms_bad:
            images_good.append(image)

    return {
        'images_s_bad': images_s_bad,
        'images_rms_bad': images_rms_bad,
        'images_good': images_good,
        'cap': cap
    }

def print_results(images_s_bad, images_rms_bad, images_good, cap, images):
    FAIL = '\033[91m'
    OKGREEN = '\033[92m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'
    HEADER = '\033[95m'

    print '\n' + HEADER + 'Test Results ' + cap['browser'] + ' ' + cap['browser_version'] + ' (' + \
          str(len(images_good)) + '/' + str(len(images)) + ' passed)' + \
          ENDC
    print BOLD + 'filename \t bands \t histogram' + ENDC
    for image in images:
        output = image
        if image in images_s_bad:
            output += '\t ' + FAIL + '[FAIL]'
        else:
            output += '\t ' + OKGREEN + '[OK]'
        if image in images_rms_bad:
            output += '\t ' + FAIL + '[FAIL]'
        else:
            output += '\t ' + OKGREEN + '[OK]'
        print output + ENDC

class TestRunner(object):
    def __init__(self, driver):
        self.driver = driver

    def __del__(self):
        self.driver.quit()

    def screenshot_element(self, element):
        element = self.driver.find_element_by_id(element)
        location = element.location
        size = element.size

        png = self.driver.get_screenshot_as_png()
        buf = cStringIO.StringIO(png)
        im = Image.open(buf)

        left = location['x']
        top = location['y']
        right = location['x'] + size['width']
        bottom = location['y'] + size['height']

        im = im.crop((left, top, right, bottom))
        return im


def main():
    caps = [
        {
            'os': 'Windows',
            'os_version': '10',
            'browser': 'Chrome',
            'browser_version': '60.0',
        },
        {
            'os': 'Windows',
            'os_version': '10',
            'browser': 'Firefox',
            'browser_version': '54',
        },
        {
            'os': 'Windows',
            'os_version': '10',
            'browser': 'Edge',
            'browser_version': '15',
        },
        {
            'os': 'Windows',
            'os_version': '10',
            'browser': 'Internet Explorer',
            'browser_version': '11',
        }
    ]

    # create the references
    subprocess.call('test/convert_test_images.sh')

    images = os.listdir('test/src')
    images.sort()

    results = []

    for cap in caps:
        result = run_browserstack_test(images, cap)
        results.append(result)

    for r in results:
        print_results(r['images_s_bad'], r['images_rms_bad'], r['images_good'], r['cap'], images)

if __name__ == '__main__':
    main()
