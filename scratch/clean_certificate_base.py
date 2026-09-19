import base64
from PIL import Image

src_path = r'C:\Users\lakshmanan\.gemini\antigravity-ide\brain\e0bd196d-5f6e-41f4-868f-0e94d0d96fb2\.user_uploaded\media_1789747224670.jpg'
img = Image.open(src_path).convert('RGB')
w, h = img.size
print(f'Source image size: {w}x{h}')

clean_img = img.copy()

y_top = 349
y_bot = 538
x_left = 30
x_right = 994

tl = img.getpixel((x_left, y_top))
tr = img.getpixel((x_right, y_top))
bl = img.getpixel((x_left, y_bot))
br = img.getpixel((x_right, y_bot))

for y in range(y_top + 1, y_bot):
    ty = (y - y_top) / (y_bot - y_top)
    c_left = img.getpixel((x_left, y))
    c_right = img.getpixel((x_right, y))
    
    for x in range(x_left + 1, x_right):
        tx = (x - x_left) / (x_right - x_left)
        c_top = img.getpixel((x, y_top))
        c_bot = img.getpixel((x, y_bot))
        
        rgb = []
        for i in range(3):
            v_b = c_top[i] * (1 - ty) + c_bot[i] * ty
            h_b = c_left[i] * (1 - tx) + c_right[i] * tx
            c_b = (tl[i] * (1 - tx) * (1 - ty) +
                   tr[i] * tx * (1 - ty) +
                   bl[i] * (1 - tx) * ty +
                   br[i] * tx * ty)
            val = int(round(v_b + h_b - c_b))
            rgb.append(max(0, min(255, val)))
        clean_img.putpixel((x, y), tuple(rgb))

# 1. Save 1X (1024x682)
clean_img.save('assets/certificate_clean_base.png', 'PNG', quality=100)
clean_img.save('assets/certificate_clean_base.jpg', 'JPEG', quality=98)
print('Saved 1x images')

# 2. Save 2X (2048x1364)
img_2x = clean_img.resize((2048, 1364), Image.Resampling.LANCZOS)
img_2x.save('assets/certificate_clean_base_2x.png', 'PNG', quality=100)
print('Saved 2x image')

# 3. Save 300DPI 3X (3072x2046)
img_3x = clean_img.resize((3072, 2046), Image.Resampling.LANCZOS)
img_3x.save('assets/certificate_clean_base_300dpi.png', 'PNG', quality=100)
print('Saved 3x image')

# 4. Generate base64 data file
with open('assets/certificate_clean_base.png', 'rb') as f:
    b64_1x = base64.b64encode(f.read()).decode('ascii')

with open('assets/certificate_clean_base_300dpi.png', 'rb') as f:
    b64_3x = base64.b64encode(f.read()).decode('ascii')

with open('assets/certificate_base_data.js', 'w', encoding='utf-8') as f:
    f.write('// Auto-generated clean base certificate template data\n')
    f.write('// Generated with clean body text area (no duplicate baked-in text)\n')
    f.write(f"window.CERT_BASE_1X = 'data:image/png;base64,{b64_1x}';\n")
    f.write(f"window.CERT_BASE_3X = 'data:image/png;base64,{b64_3x}';\n")

print('All assets and certificate_base_data.js generated successfully!')
