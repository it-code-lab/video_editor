from flask import Flask, request, jsonify, render_template, send_from_directory
import json
from flask_cors import CORS
import os

# from caption_generator import prepare_captions_file_for_notebooklm_audio
# from scraper import scrape_and_process  # Ensure this exists
# from settings import background_music_options, font_settings, tts_engine, voices, sizes
from video_editor import batch_process
# from youtube_uploader import upload_videos

app = Flask(__name__, template_folder='templates')
CORS(app)

# ------------------------ API ROUTES ------------------------ #

# @app.route('/get_full_text', methods=['GET'])
# def get_full_text():
#     try:
#         with open("temp/full_text.txt", "r", encoding="utf-8") as f:
#             data = json.load(f)
#         return jsonify(data)
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

# @app.route('/get_word_timestamps', methods=['GET'])
# def get_word_timestamps():
#     try:
#         with open("temp/word_timestamps.json", "r", encoding="utf-8") as f:
#             data = json.load(f)
#         return jsonify(data)
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

# @app.route('/save_word_timestamps', methods=['POST'])
# def save_word_timestamps():
#     try:
#         data = request.json
#         with open("temp/word_timestamps.json", "w", encoding='utf-8') as f:
#             json.dump(data, f, indent=4, ensure_ascii=False)
#         return jsonify({"message": "✅ Word timestamps updated successfully!"})
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

# @app.route('/get_structured_output', methods=['GET'])
# def get_structured_output():
#     try:
#         with open("temp/structured_output.json", "r") as f:
#             data = json.load(f)
#         return jsonify(data)
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

# ------------------------ HTML UI ROUTES ------------------------ #

@app.route('/')
def index():
    return render_template('index.html',
        music_options="",
        style_options="",
        tts_options="",
        voice_genders="",
        voice_map="",
        sizes=""
    )

# @app.route('/thumbnail')
# def thumbnail():
#     return render_template('thu_index.html')

# @app.route('/prepare_captions')
# def prep_caption():
#     return render_template('index_captions.html')

@app.route('/video/<filename>')
def serve_video(filename):
    return send_from_directory(directory='.', path=filename)

# 
@app.route('/editvideos', methods=['POST'])
def run_video_editor():
    try:
        print("Processing request...run edit videos")
        orientation = request.form.get('orientation', 'auto')
        add_music = True
        bg_music_folder = request.form.get('bgmusic')
        if bg_music_folder == 'none':
            add_music = False
        topcut = request.form.get('topcut',0)
        if topcut == '':
            topcut = 0

        bottomcut = request.form.get('bottomcut',0)
        if bottomcut == '':
            bottomcut = 0

        slowfactor = request.form.get('slowfactor',0)
        if slowfactor == '':
            slowfactor = 0

        slow_down = True
        if slowfactor == 0:
            slow_down = False

        add_watermark = True

        watermarkposition = request.form.get('watermarkposition','bottom-left')
        if watermarkposition == "none":
            add_watermark = False

        batch_process(
            input_folder="edit_vid_input",
            output_folder="edit_vid_output",
            bg_music_folder="god_bg",
            remove_top=float(topcut),
            remove_bottom=float(bottomcut),
            add_music=add_music,
            slow_down=slow_down,
            slow_down_factor=float(slowfactor),
            target_orientation=orientation, 
            add_watermark=add_watermark,
            watermark_path="logo.png",
            watermark_position=watermarkposition,
            watermark_scale=0.15
        )
        return "✅ Videos Processed successfully!", 200
    except Exception as e:
        return f"❌ Error: {str(e)}", 500    
# ------------------------ MAIN ------------------------ #
@app.route('/addoverlays', methods=['POST'])
def add_overlays():
    try:
        print("Processing request...add overlays")
        add_petal_overlay = request.form.get('add_petals', 'no') == 'yes'
        add_sparkle_overlay = request.form.get('add_sparkles', 'no') == 'yes'
        overlay_position = (0, 0)  # Default position, can be modified as needed

        from add_overlays import add_gif_overlays_to_videos
        add_gif_overlays_to_videos(
            input_folder="edit_vid_input",
            output_folder="edit_vid_output",
            add_petal_overlay=add_petal_overlay,
            add_sparkle_overlay=add_sparkle_overlay,
            overlay_position=overlay_position
        )
        return "✅ Overlays added successfully!", 200
    except Exception as e:
        return f"❌ Error: {str(e)}", 500  


if __name__ == '__main__':
    # app.run(debug=True, port=5000)
    app.run(debug=True, host='0.0.0.0', port=5000)  # Use host='
