---
published: true
name: ROI Blur
description: Interactive ROI selection tool to blur parts of an image for privacy redaction using OpenCV.
thumbnail: roi_blur_preview.png
images:
  [
    roi_blur_preview.png,
    roi_blur_command.png,
    roi_blur_image.png,
    roi_blur_selection.png,
    roi_blur_commit.png,
    roi_blur_censor.png,
    roi_blur_logs.png
  ]
github: https://github.com/techquestsdev/roi-blur
website: https://pypi.org/project/roi-blur
date: 2026-02-05
---

Howdy!

Ever needed to blur a license plate or a face before posting an image, only to find that your favorite editor stripped out the color profile or made the file look "flat"?

I built the **ROI Blur Tool** because I needed a fast, interactive CLI tool that handles the "redaction" part without ruining the technical quality (metadata, ICC profiles) of the original image.

## What It Does

**Interactive Selection**: Just drag and drop your regions of interest (ROIs). It's simple, visual, and fast.

**Privacy Redaction**: Perfect for quickly obscuring sensitive info in documents or photos.

**Metadata Preservation**: This is the big one. It uses Pillow for I/O to ensure ICC color profiles and EXIF metadata stay exactly where they belong. No more "washed out" colors after a quick edit.

**Fine-Tuned Blur**: Control the intensity. Adjust kernel size and sigma via the command line to get the exact level of "censorship" you need.

## How to Use

Launch the tool by providing the input and output file paths:

```shell
python roi_blur.py input.jpg output.jpg
```

### Options

```shell
usage: roi_blur [-h] [-k N] [-s N] [-v] INPUT OUTPUT

Interactively select regions in an image and apply Gaussian blur.

positional arguments:
  INPUT                 Path to the input image file
  OUTPUT                Path for the output image file

options:
  -h, --help            show this help message and exit
  -k N, --ksize N       Blur kernel size (positive odd integer, default: 23)
  -s N, --sigma N       Blur sigma/strength (positive float, default: 30.0)
  -v, --version         show program's version number and exit
```

## Examples

### CLI Usage

**Blur Faces for Privacy**

```shell
python roi_blur.py family_photo.jpg privacy_safe.jpg --ksize 45 --sigma 60
```

**Redact Sensitive Text**

```shell
python roi_blur.py document.png redacted.png --ksize 31 --sigma 40
```

### Programmatic Usage

You can also use the blurring logic directly in your Python scripts:

```python
import cv2
from roi_blur import blur_boxes

# Load image
image = cv2.imread("photo.jpg")

# Define ROIs: list of (x, y, width, height) tuples
boxes = [
    (100, 100, 200, 150),  # First region
    (400, 300, 100, 100),  # Second region
]

# Apply blur
result = blur_boxes(image, boxes, ksize=31, sigma=40)

# Save result
cv2.imwrite("blurred.jpg", result)
```

## How It Works

The tool is a bridge between the precision of **OpenCV** and the robustness of **Pillow**:

1. **The Ingest**: Pillow opens the image and grabs all that precious metadata.
2. **The Interaction**: It converts the image to a NumPy array for OpenCV to handle the interactive window.
3. **The Blur**: Gaussian blur is applied precisely to the rectangles you drew.
4. **The Export**: Pillow saves the final result, injecting the original ICC profile back in.

## Why I Built This

I was tired of heavy image editors for simple tasks. I wanted something that felt like a developer tool—CLI-first, fast, and technically sound.

Most "quick blur" tools on the web are garbage for privacy (don't upload your sensitive IDs to random sites!) and most local tools are too slow to launch. This is the middle ground.

**What I wanted:**

- A CLI tool that opens a window for interaction
- Proper handling of color profiles (no more broken colors!)
- Ability to blur multiple areas in one go
- No complex dependencies beyond standard Python libs

## Tech Stack

- **Language**: Python 3.8+
- **Image Processing**: OpenCV (cv2)
- **I/O & Metadata**: Pillow (PIL)
- **Scientific Computing**: NumPy

## Status

Stable, fast, and ready for your redaction needs on GitHub.
