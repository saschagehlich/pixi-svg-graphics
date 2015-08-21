import sys
import math
import operator

from PIL import Image
import numpy


def image_similarity_bands_via_numpy(filepath1, filepath2):
    image1 = Image.open(filepath1)
    image2 = Image.open(filepath2)

    # create thumbnails - resize em
    image1 = get_thumbnail(image1)
    image2 = get_thumbnail(image2)

    # this eliminated unqual images - though not so smarts....
    if image1.size != image2.size or image1.getbands() != image2.getbands():
        return -1
    s = 0
    for band_index, band in enumerate(image1.getbands()):
        m1 = numpy.array([p[band_index] for p in image1.getdata()]).reshape(*image1.size)
        m2 = numpy.array([p[band_index] for p in image2.getdata()]).reshape(*image2.size)
        s += numpy.sum(numpy.abs(m1 - m2))
    return s


def image_similarity_histogram_via_pil(filepath1, filepath2):
    image1 = Image.open(filepath1)
    image2 = Image.open(filepath2)

    image1 = get_thumbnail(image1)
    image2 = get_thumbnail(image2)

    h1 = image1.histogram()
    h2 = image2.histogram()

    data = list(map(lambda a, b: (a - b) ** 2, h1, h2))
    rms = math.sqrt(reduce(operator.add, data) / len(h1))
    return rms


def get_thumbnail(image, size=(256, 256), stretch_to_fit=False, greyscale=False):
    """get a smaller version of the image - makes comparison much faster/easier"""
    if not stretch_to_fit:
        image.thumbnail(size, Image.ANTIALIAS)
    else:
        image = image.resize(size)  # for faster computation
    if greyscale:
        image = image.convert("L")  # Convert it to grayscale.
    else:
        image = image.convert('RGBA')
    return image


def compare(filepath1, filepath2):
    s = image_similarity_bands_via_numpy(filepath1, filepath2)
    rms = image_similarity_histogram_via_pil(filepath1, filepath2)

    return s < 12000 and rms < 16


def main():
    img0 = sys.argv[1]
    img1 = sys.argv[2]
    print 'image_similarity_bands_via_numpy'
    print image_similarity_bands_via_numpy(img0, img1)

    print 'image_similarity_histogram_via_pil'
    print image_similarity_histogram_via_pil(img0, img1)


if __name__ == '__main__':
    main()



