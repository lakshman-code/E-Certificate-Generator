from PIL import Image

ref = Image.open('assets/reference_certificate.jpg').convert('RGB')
print('Ref image size:', ref.size)

# Let's crop vertical slices from y=280 to y=560
# and check where text is located
for y in range(300, 560, 5):
    dark_count = 0
    for x in range(100, 924):
        c = ref.getpixel((x, y))
        if c[0] < 120 and c[1] < 120 and c[2] < 120:
            dark_count += 1
    if dark_count > 0:
        print(f'ref y={y}: dark={dark_count}')
