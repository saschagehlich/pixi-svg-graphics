import os
import json
import cStringIO
import sys

from PIL import Image
import selenium.webdriver


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
    cap = {
        'os': 'Windows',
        'os_version': '8.1',
        'browser': 'Firefox',
        'browser_version': '30',
    }
    driver = get_browserstack_webdriver(cap)
    driver.get('http://127.0.0.1:8000/test/index.html')

    t = TestRunner(driver)
    i = t.screenshot_element('output')
    i.save('test.png')
    # self.driver.execute_script('set_test_svg('1.svg');')

    #while self.driver.execute_script('return check_ready()'):
    #    print 'player still undefined'
    #    time.sleep(1)

if __name__ == '__main__':
    main()
