import base64

with open('assets/certificate_clean_base.png', 'rb') as f:
    b64_1x = base64.b64encode(f.read()).decode('utf-8')

with open('assets/certificate_clean_base_300dpi.png', 'rb') as f:
    b64_3x = base64.b64encode(f.read()).decode('utf-8')

with open('assets/certificate_base_data.js', 'w', encoding='utf-8') as f:
    f.write('window.CERT_BASE_1X = "data:image/png;base64,' + b64_1x + '";\n')
    f.write('window.CERT_BASE_3X = "data:image/png;base64,' + b64_3x + '";\n')

print('Generated assets/certificate_base_data.js with 1X and 3X base64!')
