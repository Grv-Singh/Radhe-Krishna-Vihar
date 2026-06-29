from PIL import Image

img = Image.open('site_plan.png').convert('RGB')
pixels = img.load()
width, height = img.size

# Find the bounding box of non-white, non-blue, non-magenta pixels
min_x, min_y = width, height
max_x, max_y = 0, 0

for y in range(height):
    for x in range(width):
        r, g, b = pixels[x, y]
        # Ignore white background
        if r > 200 and g > 200 and b > 200:
            continue
        # Ignore blue border
        if b > 200 and r < 100 and g < 100:
            continue
        # Ignore magenta/pinkish text (top)
        if r > 200 and b > 200 and g < 150:
            continue
        # Ignore compass specific colors if possible, but compass might be mixed.
        # Actually, let's just find the first and last black pixels (plots)
        if r < 100 and g < 100 and b < 100:
            if x < min_x: min_x = x
            if x > max_x: max_x = x
            if y < min_y: min_y = y
            if y > max_y: max_y = y

print(f"Bounding box: ({min_x}, {min_y}, {max_x}, {max_y})")

if min_x < max_x and min_y < max_y:
    pad = 20
    crop_box = (
        max(0, min_x - pad),
        max(0, min_y - pad),
        min(width, max_x + pad),
        min(height, max_y + pad)
    )
    cropped = img.crop(crop_box)
    cropped.save('site_plan_cropped.png')
    print("Cropped and saved to site_plan_cropped.png")
