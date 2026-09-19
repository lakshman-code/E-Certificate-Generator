import base64
import io
from PIL import Image

with open('assets/certificate_base_data.js', 'r', encoding='utf-8') as f:
    line = f.readline()

prefix = 'window.CERT_BASE_1X = "data:image/png;base64,'
if prefix in line:
    b64_str = line.split(prefix)[1].split('"')[0]
    img = Image.open(io.BytesIO(base64.b64decode(b64_str))).convert('RGB')
    print('Decoded base1x size:', img.size)
    for y in range(480, 520, 2):
        dark = 0
        for x in range(150, 850):
            c = img.getpixel((x, y))
            if c[0] < 150:
                dark += 1
        if dark > 0:
            print(f'y={y}: dark={dark}')
