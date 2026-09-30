import os
import sys
import wave
import struct
import math
import subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFont

FFMPEG_PATH = r"C:\Users\kaila\anaconda3\Lib\site-packages\imageio_ffmpeg\binaries\ffmpeg-win-x86_64-v7.1.exe"
AUDIO_DIR = "demo_media/audio"
os.makedirs(AUDIO_DIR, exist_ok=True)
RAW_SCENES_DIR = "demo_media/raw_scenes"

sys.stdout.reconfigure(encoding='utf-8')

# ==============================================================================
# 1. NARRATION GENERATION VIA WINDOWS SAPI
# ==============================================================================
SCENES_SCRIPT = [
    {
        "id": 1,
        "start": 0.0,
        "duration": 12.0,
        "text": "A before and after photo can show change. But can it prove what happened? TerraWitness turns sustainability media into traceable, evidence-grade impact records.",
        "badge": "EVIDENCE-GRADE IMPACT INTELLIGENCE",
    },
    {
        "id": 2,
        "start": 12.0,
        "duration": 18.0,
        "text": "Real field evidence is messy. Cameras move, metadata disappears, and media can become disconnected from the event it was meant to document.",
        "badge": "FIELD REALITY: SENSOR DRIFT & TEMPORAL GAPS",
    },
    {
        "id": 3,
        "start": 30.0,
        "duration": 25.0,
        "text": "TerraWitness starts with Cloudinary as the media layer. Once evidence arrives, the platform registers the asset and builds its own evidence record around it.",
        "badge": "CLOUDINARY MEDIA LAYER & CRYPTO FINGERPRINT",
    },
    {
        "id": 4,
        "start": 55.0,
        "duration": 25.0,
        "text": "Instead of comparing two images blindly, TerraWitness first evaluates alignment, then calculates visible change within the reliably comparable region.",
        "badge": "SPATIAL ALIGNMENT (94.2%) & OBSERVED CHANGE (+37.8%)",
    },
    {
        "id": 5,
        "start": 80.0,
        "duration": 23.0,
        "text": "Every important observation stays connected to its source. You can inspect the metadata, the analysis, the confidence, and the evidence behind the conclusion.",
        "badge": "EVIDENCE LENS: EXPLAINABLE CITATIONS",
    },
    {
        "id": 6,
        "start": 103.0,
        "duration": 22.0,
        "text": "The differentiator is chain of custody. TerraWitness records evidence events in a cryptographic hash chain, creating an auditable history of what the platform received, analyzed, reviewed, and exported. It is not a blockchain, and it does not by itself prove camera-original authenticity.",
        "badge": "CHAIN OF CUSTODY: 12/12 CHECKS PASSED · INTACT",
    },
    {
        "id": 7,
        "start": 125.0,
        "duration": 20.0,
        "text": "That evidence can then be discovered across the project through semantic and metadata-aware search.",
        "badge": "SEMANTIC & METADATA-AWARE SEARCH",
    },
    {
        "id": 8,
        "start": 145.0,
        "duration": 22.0,
        "text": "Once evidence is reviewed, TerraWitness turns the same evidence chain into a donor-ready story, without disconnecting the narrative from its underlying sources.",
        "badge": "STORY COMPILER: NARRATIVE BACKED BY PROOF",
    },
    {
        "id": 9,
        "start": 167.0,
        "duration": 13.0,
        "text": "The media doesn't just show change. It testifies to it.",
        "badge": "TERRAWITNESS · TESTIFYING TO CHANGE",
    },
]

def generate_voiceovers():
    print("[1/4] Synthesizing professional voiceovers via SAPI...", flush=True)
    import win32com.client
    speaker = win32com.client.Dispatch("SAPI.SpVoice")
    speaker.Rate = -1 # Clear, measured, calm cadence
    speaker.Volume = 100

    # Select David or first available
    for v in speaker.GetVoices():
        if "David" in v.GetDescription():
            speaker.Voice = v
            break

    for sc in SCENES_SCRIPT:
        wav_path = os.path.join(AUDIO_DIR, f"scene_{sc['id']}.wav")
        fs = win32com.client.Dispatch("SAPI.SpFileStream")
        fs.Open(wav_path, 3, False)
        speaker.AudioOutputStream = fs
        speaker.Speak(sc["text"])
        fs.Close()
        print(f"  + Generated voiceover for Scene {sc['id']}", flush=True)

# ==============================================================================
# 2. AUDIO SYNTHESIS & MASTERING (48kHz Stereo, Exactly 180s)
# ==============================================================================
SAMPLE_RATE = 48000
TOTAL_DURATION = 180.0
TOTAL_SAMPLES = int(SAMPLE_RATE * TOTAL_DURATION)

def read_wav_resample(path, target_sr=SAMPLE_RATE):
    w = wave.open(path, "rb")
    n_ch = w.getnchannels()
    sr = w.getframerate()
    n_frames = w.getnframes()
    raw = w.readframes(n_frames)
    w.close()

    # Unpack 16-bit PCM
    data = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0
    if n_ch == 2:
        data = data.reshape(-1, 2).mean(axis=1)

    # Resample to target_sr if needed
    if sr != target_sr:
        num_target = int(len(data) * target_sr / sr)
        indices = np.linspace(0, len(data) - 1, num_target)
        data = np.interp(indices, np.arange(len(data)), data)
    return data

def build_master_soundtrack():
    print("[2/4] Composing ambient technical score & sound effects...", flush=True)
    master_left = np.zeros(TOTAL_SAMPLES, dtype=np.float32)
    master_right = np.zeros(TOTAL_SAMPLES, dtype=np.float32)

    # A. Ambient technical synth pads
    # Chord progression: Am (A2, C3, E3) -> Dm (D2, F3, A3) -> F (F2, A3, C4) -> G (G2, B3, D4)
    chords = [
        ([110.0, 130.81, 164.81], 45.0),  # Am: 00:00 - 00:45
        ([146.83, 174.61, 220.0], 45.0),  # Dm: 00:45 - 01:30
        ([174.61, 220.0, 261.63], 45.0),  # F:  01:30 - 02:15
        ([196.0, 246.94, 293.66], 45.0),  # G:  02:15 - 03:00
    ]

    cur_sample = 0
    t = np.linspace(0, TOTAL_DURATION, TOTAL_SAMPLES, endpoint=False)

    for freqs, dur in chords:
        num_s = int(dur * SAMPLE_RATE)
        sub_t = t[cur_sample : cur_sample + num_s]
        pad_signal = np.zeros(num_s, dtype=np.float32)
        for f in freqs:
            # Gentle sine with warm 2nd harmonic and soft pulse
            pad_signal += 0.035 * np.sin(2 * np.pi * f * sub_t)
            pad_signal += 0.012 * np.sin(2 * np.pi * (f * 2) * sub_t)
            pad_signal += 0.005 * np.sin(2 * np.pi * (f * 1.5) * sub_t)

        # Apply smooth envelope
        fade_len = int(2.0 * SAMPLE_RATE)
        fade_in = np.linspace(0, 1, fade_len)
        fade_out = np.linspace(1, 0, fade_len)
        pad_signal[:fade_len] *= fade_in
        pad_signal[-fade_len:] *= fade_out

        master_left[cur_sample : cur_sample + num_s] += pad_signal * 0.8
        master_right[cur_sample : cur_sample + num_s] += pad_signal * 0.8
        cur_sample += num_s

    # B. Add subtle sound effects
    def add_chime(time_sec, freqs=[523.25, 659.25], dur=1.2, amp=0.08):
        s_idx = int(time_sec * SAMPLE_RATE)
        n_samples = int(dur * SAMPLE_RATE)
        st = np.linspace(0, dur, n_samples, endpoint=False)
        decay = np.exp(-4.0 * st)
        chime_signal = np.zeros(n_samples, dtype=np.float32)
        for f in freqs:
            chime_signal += (amp / len(freqs)) * np.sin(2 * np.pi * f * st) * decay
        if s_idx + n_samples < TOTAL_SAMPLES:
            master_left[s_idx : s_idx + n_samples] += chime_signal
            master_right[s_idx : s_idx + n_samples] += chime_signal

    # Add SFX at key narrative moments
    add_chime(1.5, [440.0, 554.37], 1.5, 0.06)    # Hook title chime
    add_chime(32.0, [659.25, 880.0], 1.0, 0.07)   # Ingest chirp
    add_chime(57.0, [587.33, 739.99], 1.2, 0.07)  # Alignment match
    add_chime(106.0, [523.25, 659.25, 783.99], 1.8, 0.10) # Provenance Verify PASS Chime
    add_chime(128.0, [783.99, 987.77], 1.0, 0.06) # Search match
    add_chime(148.0, [523.25, 659.25, 1046.5], 2.0, 0.08) # Story compiled

    # C. Overlay Scene Narration (with intelligent background music ducking)
    for sc in SCENES_SCRIPT:
        wav_path = os.path.join(AUDIO_DIR, f"scene_{sc['id']}.wav")
        voice = read_wav_resample(wav_path, SAMPLE_RATE)
        start_sample = int((sc["start"] + 0.6) * SAMPLE_RATE)
        end_sample = min(start_sample + len(voice), TOTAL_SAMPLES)
        length = end_sample - start_sample

        # Duck background music slightly under voiceover
        duck_start = max(0, start_sample - int(0.3 * SAMPLE_RATE))
        duck_end = min(TOTAL_SAMPLES, end_sample + int(0.5 * SAMPLE_RATE))
        master_left[duck_start:duck_end] *= 0.35
        master_right[duck_start:duck_end] *= 0.35

        # Mix voiceover with prominent volume
        master_left[start_sample:end_sample] += voice[:length] * 0.85
        master_right[start_sample:end_sample] += voice[:length] * 0.85

    # Master limiter & clipping protection
    max_val = max(np.max(np.abs(master_left)), np.max(np.abs(master_right)), 0.001)
    if max_val > 0.95:
        norm = 0.95 / max_val
        master_left *= norm
        master_right *= norm

    # Save to 16-bit 48kHz stereo WAV
    master_path = os.path.join(AUDIO_DIR, "master_soundtrack_180s.wav")
    left_int16 = (master_left * 32767).astype(np.int16)
    right_int16 = (master_right * 32767).astype(np.int16)
    stereo_interleaved = np.empty((TOTAL_SAMPLES, 2), dtype=np.int16)
    stereo_interleaved[:, 0] = left_int16
    stereo_interleaved[:, 1] = right_int16

    with wave.open(master_path, "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SAMPLE_RATE)
        wf.writeframes(stereo_interleaved.tobytes())

    print(f"  + Master soundtrack exported: {master_path} (48kHz stereo, 180.00s)", flush=True)
    return master_path

# ==============================================================================
# 3. VIDEO COMPOSITION & EDITORIAL RENDERING (1920x1080 @ 30fps)
# ==============================================================================
WIDTH, HEIGHT = 1920, 1080
FPS = 30
TOTAL_FRAMES = int(TOTAL_DURATION * FPS) # 5400 frames

def get_font(size):
    try:
        return ImageFont.truetype("arial.ttf", size)
    except Exception:
        return ImageFont.load_default()

def create_title_card(title, subtitle, meta_lines):
    img = Image.new("RGB", (WIDTH, HEIGHT), color=(11, 13, 17))
    draw = ImageDraw.Draw(img)

    # Accent top border
    draw.rectangle([0, 0, WIDTH, 6], fill=(16, 185, 129))

    font_title = get_font(56)
    font_sub = get_font(26)
    font_meta = get_font(20)

    # Centered Title
    draw.text((WIDTH // 2, 380), title, fill=(243, 244, 246), font=font_title, anchor="mm")
    draw.text((WIDTH // 2, 450), subtitle, fill=(52, 211, 153), font=font_sub, anchor="mm")

    draw.line([WIDTH // 2 - 200, 500, WIDTH // 2 + 200, 500], fill=(35, 42, 54), width=2)

    y = 540
    for line in meta_lines:
        draw.text((WIDTH // 2, y), line, fill=(161, 161, 170), font=font_meta, anchor="mm")
        y += 34

    return img

def create_closing_card():
    lines = [
        "CAPTURE.  VERIFY.  UNDERSTAND.  PROVE.",
        "“The media doesn't just show change. It testifies to it.”",
        "",
        "Code Cubicle 6.0 — Cloudinary Track",
        "Team: infinitehacks",
        "Pochiraju Kailash Ram Markandeya Sharma · Solo Participant",
    ]
    return create_title_card("TERRAWITNESS", "Evidence-Grade Chain-of-Custody & Impact Intelligence", lines)

def load_scene_image(filename):
    path = os.path.join(RAW_SCENES_DIR, filename)
    if os.path.exists(path):
        img = Image.open(path).convert("RGB")
        return img.resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS)
    return Image.new("RGB", (WIDTH, HEIGHT), color=(15, 20, 28))

def render_overlay(frame_img, scene_idx, frame_in_sec, total_sec):
    draw = ImageDraw.Draw(frame_img, "RGBA")
    sc = SCENES_SCRIPT[scene_idx]

    # A. Top Telemetry Ribbon
    draw.rectangle([0, 0, WIDTH, 36], fill=(11, 13, 17, 230))
    draw.rectangle([0, 36, WIDTH, 37], fill=(35, 42, 54, 255))
    font_mono_small = get_font(14)
    draw.text((30, 10), "TERRAWITNESS EVIDENCE RECORD", fill=(52, 211, 153), font=font_mono_small)
    draw.text((360, 10), "|   MEDIA INFRASTRUCTURE: CLOUDINARY (jfsfulbk)", fill=(161, 161, 170), font=font_mono_small)
    draw.text((820, 10), "|   CRYPTOGRAPHIC FINGERPRINT: ACTIVE SHA-256", fill=(161, 161, 170), font=font_mono_small)
    time_str = f"UTC TC {int(frame_in_sec // 60):02d}:{int(frame_in_sec % 60):02d}:{int((frame_in_sec % 1) * 30):02d} / 03:00:00"
    draw.text((WIDTH - 30, 10), time_str, fill=(113, 113, 122), font=font_mono_small, anchor="rt")

    # B. Lower-Third Technical Badge
    draw.rectangle([30, HEIGHT - 130, 680, HEIGHT - 84], fill=(15, 23, 42, 220))
    draw.rectangle([30, HEIGHT - 130, 34, HEIGHT - 84], fill=(16, 185, 129, 255))
    font_badge = get_font(15)
    draw.text((45, HEIGHT - 107), sc["badge"], fill=(243, 244, 246), font=font_badge, anchor="lm")

    # C. Subtitle Caption Box (Understated, clean lower-third)
    draw.rectangle([0, HEIGHT - 76, WIDTH, HEIGHT], fill=(11, 13, 17, 240))
    draw.rectangle([0, HEIGHT - 76, WIDTH, HEIGHT - 75], fill=(35, 42, 54, 255))
    font_sub = get_font(18)
    draw.text((WIDTH // 2, HEIGHT - 38), sc["text"], fill=(244, 244, 245), font=font_sub, anchor="mm")

    return frame_img

def produce_video(master_audio_path):
    print(f"[3/4] Rendering 5400 Full HD frames to FFmpeg stream...", flush=True)
    output_mp4 = "terrWitness_demo.mp4"

    # Preload scene captures
    scene_images = {
        1: [load_scene_image("scene1_landing_hero.png"), load_scene_image("scene1_landing_scroll.png")],
        2: [load_scene_image("scene2_evidence_list.png"), load_scene_image("scene2_evidence_detail.png")],
        3: [load_scene_image("scene3_settings_overview.png"), load_scene_image("scene3_ingest_workspace.png")],
        4: [load_scene_image("scene4_comparisons_list.png"), load_scene_image("scene4_comparison_detail.png")],
        5: [load_scene_image("scene5_evidence_lens_top.png"), load_scene_image("scene5_evidence_lens_metadata.png")],
        6: [load_scene_image("scene6_provenance_ledger.png"), load_scene_image("scene6_provenance_verified.png")],
        7: [load_scene_image("scene7_search_results.png"), load_scene_image("scene7_search_results.png")],
        8: [load_scene_image("scene8_stories_overview.png"), load_scene_image("scene8_story_scenes.png")],
        9: [load_scene_image("scene9_reports_summary.png"), create_closing_card()],
    }

    opening_card = create_title_card(
        "TERRAWITNESS",
        "Evidence-Grade Chain-of-Custody & Impact Intelligence",
        [
            "Code Cubicle 6.0 — Cloudinary Track",
            "Team: infinitehacks",
            "Participant: Pochiraju Kailash Ram Markandeya Sharma · Solo Participant",
        ]
    )

    # Launch FFmpeg pipe
    ffmpeg_cmd = [
        FFMPEG_PATH,
        "-y",
        "-f", "rawvideo",
        "-vcodec", "rawvideo",
        "-s", f"{WIDTH}x{HEIGHT}",
        "-pix_fmt", "rgb24",
        "-r", str(FPS),
        "-i", "-", # stdin pipe for video
        "-i", master_audio_path, # master audio
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-profile:v", "high",
        "-preset", "fast",
        "-crf", "18",
        "-c:a", "aac",
        "-b:a", "192k",
        "-ar", str(SAMPLE_RATE),
        "-t", "180.00", # Exactly 03:00
        output_mp4,
    ]

    pipe = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)

    try:
        for f in range(TOTAL_FRAMES):
            t_sec = f / FPS

            # Determine active scene
            scene_idx = 0
            for idx, sc in enumerate(SCENES_SCRIPT):
                if t_sec >= sc["start"] and t_sec < sc["start"] + sc["duration"]:
                    scene_idx = idx
                    break

            sc = SCENES_SCRIPT[scene_idx]
            rel_t = (t_sec - sc["start"]) / sc["duration"]

            # Scene 1 opening title card for first 3.5s
            if scene_idx == 0 and t_sec < 3.5:
                base_img = opening_card.copy()
            elif scene_idx == 8 and t_sec > 173.0:
                base_img = create_closing_card()
            else:
                imgs = scene_images[sc["id"]]
                active_img = imgs[0] if rel_t < 0.55 else imgs[1]
                # Subtle Ken Burns zoom (1.00 -> 1.04)
                zoom = 1.0 + (rel_t * 0.04)
                w_crop = int(WIDTH / zoom)
                h_crop = int(HEIGHT / zoom)
                left = (WIDTH - w_crop) // 2
                top = int((HEIGHT - h_crop) * 0.4) # slight upper bias
                cropped = active_img.crop((left, top, left + w_crop, top + h_crop))
                base_img = cropped.resize((WIDTH, HEIGHT), Image.Resampling.BILINEAR)

            # Render overlay, subtitles, and telemetry
            final_frame = render_overlay(base_img, scene_idx, t_sec, TOTAL_DURATION)

            # Pipe RGB raw bytes
            pipe.stdin.write(final_frame.tobytes())

            if f % 300 == 0:
                print(f"  + Rendered {f}/{TOTAL_FRAMES} frames ({int(t_sec)}s / 180s)...", flush=True)

        pipe.stdin.close()
        stderr = pipe.stderr.read().decode(errors="ignore")
        pipe.wait()
        print(f"[4/4] Video encoding finished: {output_mp4} (ReturnCode: {pipe.returncode})", flush=True)
        if pipe.returncode != 0:
            print("FFmpeg error:", stderr[-500:], flush=True)
    except Exception as e:
        print("Error during video pipeline:", e, flush=True)
        pipe.terminate()
        raise

if __name__ == "__main__":
    generate_voiceovers()
    master_audio = build_master_soundtrack()
    produce_video(master_audio)
