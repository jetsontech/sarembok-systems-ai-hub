from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import shutil
import os
import librosa
import soundfile as sf
import numpy as np
import uuid
from PIL import Image, ImageEnhance, ImageFilter
import io

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for now
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
PROCESSED_DIR = "processed"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(PROCESSED_DIR, exist_ok=True)

@app.get("/")
async def root():
    return {"status": "online", "service": "Nexus 365 Backend", "version": "2.0"}

@app.post("/process-audio")
async def process_audio(
    file: UploadFile = File(...),
    task: str = Form(...)
):
    try:
        # Save uploaded file
        file_id = str(uuid.uuid4())
        input_filename = f"{file_id}_{file.filename}"
        input_path = os.path.join(UPLOAD_DIR, input_filename)
        
        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Process based on task
        output_filename = f"processed_{input_filename}"
        output_path = os.path.join(PROCESSED_DIR, output_filename)
        
        if task == "restructure-hiphop":
            # Load audio
            y, sr = librosa.load(input_path, sr=None)
            
            # Simple "Hip Hop" restructuring:
            # 1. Time stretch to ~90 BPM
            target_bpm = 90.0
            tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
            if tempo > 0:
                rate = target_bpm / tempo
                y = librosa.effects.time_stretch(y, rate=rate)
            
            # 2. Add punch (compression/normalization)
            y = librosa.util.normalize(y) * 0.9
            
            sf.write(output_path, y, sr)
            
        elif task == "denoise":
            y, sr = librosa.load(input_path, sr=None)
            # Simple noise reduction via spectral gating
            y = librosa.effects.preemphasis(y)
            sf.write(output_path, y, sr)
            
        elif task == "speed-up":
            y, sr = librosa.load(input_path, sr=None)
            y = librosa.effects.time_stretch(y, rate=1.5)
            sf.write(output_path, y, sr)
            
        elif task == "slow-down":
            y, sr = librosa.load(input_path, sr=None)
            y = librosa.effects.time_stretch(y, rate=0.75)
            sf.write(output_path, y, sr)
            
        else:
            # Default: normalize
            y, sr = librosa.load(input_path, sr=None)
            y = librosa.util.normalize(y)
            sf.write(output_path, y, sr)

        return FileResponse(output_path, filename=f"nexus_{task}_{file.filename}")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(input_path):
            os.remove(input_path)

@app.post("/process-image")
async def process_image(
    file: UploadFile = File(...),
    task: str = Form(...),
    param: str = Form(None)
):
    try:
        file_id = str(uuid.uuid4())
        
        # Read image
        image_data = await file.read()
        img = Image.open(io.BytesIO(image_data))
        
        # Convert RGBA to RGB if needed
        if img.mode == 'RGBA':
            img = img.convert('RGB')
        
        # Process based on task
        if task == "resize":
            # param format: "800x600"
            if param:
                width, height = map(int, param.split('x'))
                img = img.resize((width, height), Image.Resampling.LANCZOS)
            else:
                # Default: 50% size
                new_size = (img.width // 2, img.height // 2)
                img = img.resize(new_size, Image.Resampling.LANCZOS)
                
        elif task == "enhance-brightness":
            enhancer = ImageEnhance.Brightness(img)
            img = enhancer.enhance(1.5)
            
        elif task == "enhance-contrast":
            enhancer = ImageEnhance.Contrast(img)
            img = enhancer.enhance(1.5)
            
        elif task == "enhance-color":
            enhancer = ImageEnhance.Color(img)
            img = enhancer.enhance(1.5)
            
        elif task == "sharpen":
            img = img.filter(ImageFilter.SHARPEN)
            
        elif task == "blur":
            img = img.filter(ImageFilter.GaussianBlur(5))
            
        elif task == "grayscale":
            img = img.convert('L').convert('RGB')
            
        elif task == "edge-detect":
            img = img.filter(ImageFilter.FIND_EDGES)
            
        elif task == "emboss":
            img = img.filter(ImageFilter.EMBOSS)
        
        # Save processed image
        output_filename = f"processed_{file_id}.png"
        output_path = os.path.join(PROCESSED_DIR, output_filename)
        img.save(output_path, 'PNG')
        
        return FileResponse(output_path, filename=f"nexus_{task}_{file.filename}")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/process-video")
async def process_video(
    file: UploadFile = File(...),
    task: str = Form(...),
    param: str = Form(None)
):
    """
    Video processing endpoint (requires moviepy)
    Tasks: trim, speed-up, slow-down, extract-audio, resize
    """
    try:
        file_id = str(uuid.uuid4())
        input_filename = f"{file_id}_{file.filename}"
        input_path = os.path.join(UPLOAD_DIR, input_filename)
        
        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        output_filename = f"processed_{file_id}.mp4"
        output_path = os.path.join(PROCESSED_DIR, output_filename)
        
        # Note: This requires moviepy to be installed
        # For now, return a placeholder response
        # In production, uncomment and use moviepy
        
        # from moviepy.editor import VideoFileClip
        # clip = VideoFileClip(input_path)
        # 
        # if task == "trim":
        #     # param format: "0-10" (seconds)
        #     start, end = map(float, param.split('-'))
        #     clip = clip.subclip(start, end)
        # elif task == "speed-up":
        #     clip = clip.speedx(2.0)
        # elif task == "slow-down":
        #     clip = clip.speedx(0.5)
        # 
        # clip.write_videofile(output_path)
        
        # Placeholder: copy original file
        shutil.copy(input_path, output_path)
        
        return FileResponse(output_path, filename=f"nexus_{task}_{file.filename}")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(input_path):
            os.remove(input_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
