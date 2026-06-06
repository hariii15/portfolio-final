from PIL import Image, ImageOps

img = Image.open('/home/hari/portfolio-final/src/profile.jpeg')
img = ImageOps.exif_transpose(img)
w, h = img.size
print(f'After EXIF fix: {w}x{h}')

# Rotate 90 counter-clockwise to correct orientation
img = img.rotate(90, expand=True)
w, h = img.size
print(f'After rotate: {w}x{h}')

# After rotation: landscape image, face is on the right side -> now top
# Crop a portrait square focusing on face (right portion of rotated image = top)
# Face occupies roughly x: 1700-2600 in rotated coords (original right side)
# In landscape 4608x2592, face was at right ~1700-2600px horizontally, top 0-2000px vertically
# After CCW rotation: face is in top-right quadrant
# Crop: take right 60% horizontally (face side), full height, then square it
face_left = int(w * 0.40)  # skip the body/hands on the left
face_right = w
face_top = 0
face_bottom = h

region = img.crop((face_left, face_top, face_right, face_bottom))
rw, rh = region.size
# Make square from the shorter dimension
crop_size = min(rw, rh)
left2 = (rw - crop_size) // 2
top2 = 0
img_cropped = region.crop((left2, top2, left2 + crop_size, top2 + crop_size))
print(f'Cropped to: {img_cropped.size}')
img_cropped.save('/home/hari/portfolio-final/src/profile_fixed.jpeg', quality=95)
print('Saved!')
