# Nexus 365 Backend API Reference

## Base URL

- **Local**: `http://localhost:8000`
- **Production**: `https://your-backend-url.onrender.com` (after deployment)

---

## Endpoints

### **GET /**

Health check endpoint.

**Response:**

```json
{
  "status": "online",
  "service": "Nexus 365 Backend",
  "version": "2.0"
}
```

---

### **POST /process-audio**

Process audio files with various effects.

**Parameters:**

- `file` (File): Audio file to process
- `task` (string): Processing task

**Supported Tasks:**

- `restructure-hiphop`: Time-stretch to 90 BPM with compression
- `denoise`: Noise reduction via spectral gating
- `speed-up`: 1.5x faster playback
- `slow-down`: 0.75x slower playback
- `normalize`: Audio level normalization (default)

**Example:**

```bash
curl -X POST http://localhost:8000/process-audio \
  -F "file=@audio.wav" \
  -F "task=restructure-hiphop"
```

**Response:**

- Returns processed audio file (WAV format)

---

### **POST /process-image**

Process images with filters and enhancements.

**Parameters:**

- `file` (File): Image file to process
- `task` (string): Processing task
- `param` (string, optional): Additional parameter (e.g., "800x600" for resize)

**Supported Tasks:**

- `resize`: Resize image (param: "WIDTHxHEIGHT" or default 50%)
- `enhance-brightness`: Increase brightness by 1.5x
- `enhance-contrast`: Increase contrast by 1.5x
- `enhance-color`: Increase color saturation by 1.5x
- `sharpen`: Apply sharpening filter
- `blur`: Apply Gaussian blur (radius 5)
- `grayscale`: Convert to black & white
- `edge-detect`: Find edges filter
- `emboss`: Apply 3D emboss effect

**Example:**

```bash
# Resize to 800x600
curl -X POST http://localhost:8000/process-image \
  -F "file=@image.jpg" \
  -F "task=resize" \
  -F "param=800x600"

# Sharpen image
curl -X POST http://localhost:8000/process-image \
  -F "file=@image.jpg" \
  -F "task=sharpen"
```

**Response:**

- Returns processed image file (PNG format)

---

### **POST /process-video**

Process video files (requires moviepy - currently placeholder).

**Parameters:**

- `file` (File): Video file to process
- `task` (string): Processing task
- `param` (string, optional): Additional parameter (e.g., "0-10" for trim)

**Supported Tasks:**

- `trim`: Extract time range (param: "START-END" in seconds)
- `speed-up`: 2x faster playback
- `slow-down`: 0.5x slower playback

**Example:**

```bash
# Trim video from 0 to 10 seconds
curl -X POST http://localhost:8000/process-video \
  -F "file=@video.mp4" \
  -F "task=trim" \
  -F "param=0-10"
```

**Response:**

- Returns processed video file (MP4 format)

**Note:** Full video processing requires uncommenting `moviepy` in `requirements.txt` and updating the code.

---

## Error Handling

All endpoints return standard HTTP status codes:

- `200 OK`: Success
- `400 Bad Request`: Invalid parameters
- `500 Internal Server Error`: Processing failed

**Error Response:**

```json
{
  "detail": "Error message here"
}
```

---

## CORS Configuration

The backend allows all origins (`*`) for development. In production, update `allow_origins` in `main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-domain.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## File Storage

- **Uploads**: Stored in `uploads/` directory (temporary)
- **Processed**: Stored in `processed/` directory (temporary)
- **Cleanup**: Input files are deleted after processing

---

## Adding New Tasks

### Audio Task Example

```python
elif task == "pitch-shift":
    y, sr = librosa.load(input_path, sr=None)
    y = librosa.effects.pitch_shift(y, sr=sr, n_steps=2)
    sf.write(output_path, y, sr)
```

### Image Task Example

```python
elif task == "rotate":
    img = img.rotate(90)
```

### Video Task Example (with moviepy)

```python
from moviepy.editor import VideoFileClip

elif task == "extract-audio":
    clip = VideoFileClip(input_path)
    clip.audio.write_audiofile(output_path.replace('.mp4', '.mp3'))
```

---

## Performance Notes

- **Audio**: Fast processing (< 5s for most files)
- **Image**: Very fast (< 1s)
- **Video**: Slower, depends on length and resolution
- **Memory**: Librosa loads entire audio into memory
- **Timeout**: Consider Render's 60s timeout for large files

---

## Dependencies

```
fastapi==0.104.1
uvicorn==0.24.0
python-multipart==0.0.6
librosa==0.10.1
soundfile==0.12.1
numpy==1.24.3
scipy==1.11.4
Pillow==10.1.0
```

---

## Running Locally

```bash
# Install dependencies
pip install -r requirements.txt

# Run server
python main.py

# Or with uvicorn
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

---

## Testing

```bash
# Test health endpoint
curl http://localhost:8000/

# Test audio processing
curl -X POST http://localhost:8000/process-audio \
  -F "file=@test.wav" \
  -F "task=denoise" \
  --output processed.wav

# Test image processing
curl -X POST http://localhost:8000/process-image \
  -F "file=@test.jpg" \
  -F "task=sharpen" \
  --output processed.png
```

---

## Production Deployment

### Render.com

1. Create new Web Service
2. Connect GitHub repo
3. **Build Command**: `pip install -r requirements.txt`
4. **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Environment: Python 3
6. Deploy

### Railway.app

1. Create new project
2. Add service from GitHub
3. Railway auto-detects Python and requirements.txt
4. Deploy

### Docker (Optional)

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## Security Considerations

1. **File Size Limits**: Add max file size validation
2. **File Type Validation**: Verify file types server-side
3. **Rate Limiting**: Add rate limiting for production
4. **CORS**: Restrict origins in production
5. **Input Sanitization**: Validate all user inputs
6. **Temporary Files**: Ensure cleanup of temp files

---

## Future Enhancements

- [ ] Add file size limits
- [ ] Implement rate limiting
- [ ] Add authentication
- [ ] Support batch processing
- [ ] Add progress tracking for long tasks
- [ ] Implement caching for repeated tasks
- [ ] Add webhook support for async processing
- [ ] Support cloud storage (S3, GCS)
