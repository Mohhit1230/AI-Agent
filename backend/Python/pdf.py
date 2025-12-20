# import io, os, sys, json, base64, time, re, requests
# from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image
# from reportlab.lib.pagesizes import A4
# from reportlab.pdfbase.ttfonts import TTFont
# from reportlab.pdfbase import pdfmetrics
# from reportlab.lib.styles import ParagraphStyle
# import emoji

# # Setup fonts
# __dirname = os.path.dirname(__file__)
# font_path = os.path.join(__dirname, "DejaVuSans.ttf")
# pdfmetrics.registerFont(TTFont("DejaVu", font_path))

# STYLES = {
#     "title": ParagraphStyle("Title", fontName="DejaVu", fontSize=22, leading=28, spaceAfter=12),
#     "normal": ParagraphStyle("Normal", fontName="DejaVu", fontSize=12, leading=18, wordWrap="CJK")
# }

# # Convert emojis -> Twemoji CDN URLs
# def emoji_to_image(emoji_char, size=20):
#     # Convert emoji to its unicode hex code
#     codepoints = "-".join([f"{ord(c):x}" for c in emoji_char])
#     url = f"https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/{codepoints}.png"

#     try:
#         resp = requests.get(url, timeout=5)
#         if resp.status_code == 200:
#             buffer = io.BytesIO(resp.content)
#             return Image(buffer, width=size, height=size)
#     except:
#         pass
#     # fallback: show text if emoji image not found
#     return Paragraph(emoji_char, STYLES["normal"])

# def text_to_flowable(text, style):
#     """
#     Split text into paragraphs + inline emojis
#     """
#     flow = []
#     parts = emoji.emoji_list(text)  # detect emojis with positions
#     if not parts:
#         flow.append(Paragraph(text, style))
#         return flow

#     last_idx = 0
#     for e in parts:
#         start, end = e['match_start'], e['match_end']
#         # Add preceding text
#         if start > last_idx:
#             flow.append(Paragraph(text[last_idx:start], style))
#         # Add emoji image
#         flow.append(emoji_to_image(e['emoji']))
#         last_idx = end

#     # Add leftover text
#     if last_idx < len(text):
#         flow.append(Paragraph(text[last_idx:], style))

#     return flow

# def markdown_to_paragraph(text):
#     text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
#     text = re.sub(r"\*(.+?)\*", r"<i>\1</i>", text)
#     return text

# def generate_pdf(content):
#     buffer = io.BytesIO()
#     doc = SimpleDocTemplate(
#         buffer, pagesize=A4,
#         rightMargin=40, leftMargin=40,
#         topMargin=40, bottomMargin=40
#     )
#     flow = []

#     flow.append(Paragraph("Agent Generated PDF", STYLES["title"]))
#     flow.append(Spacer(1, 12))

#     for item in content:
#         if item["type"] == "text":
#             text = markdown_to_paragraph(item["text"])
#             flow.extend(text_to_flowable(text, STYLES["normal"]))
#             flow.append(Spacer(1, 6))

#     doc.build(flow)
#     buffer.seek(0)
#     return base64.b64encode(buffer.read()).decode("utf-8")

# if __name__ == "__main__":
#     data = json.loads(sys.argv[1]) if len(sys.argv) > 1 else []
#     pdf_base64 = generate_pdf(data)
#     result = {
#         "pdf_uri": f"data:application/pdf;base64,{pdf_base64}",
#         "name": f"agent_pdf_{int(time.time())}.pdf"
#     }
#     print(json.dumps(result))




# import io, os, sys, json, base64, time, re
# from reportlab.platypus import SimpleDocTemplate, Paragraph
# from reportlab.lib.pagesizes import A4
# from reportlab.pdfbase.ttfonts import TTFont
# from reportlab.pdfbase import pdfmetrics
# from reportlab.lib.styles import ParagraphStyle

# # Use Windows default Segoe UI Emoji font
# __dirname = os.path.dirname(__file__)
# font_path = os.path.join(__dirname, "seguiemj.ttf")  # Make sure you have this TTF
# pdfmetrics.registerFont(TTFont("SegoeEmoji", font_path))

# # Styles
# STYLES = {
#     "title": ParagraphStyle(
#         "Title", fontName="SegoeEmoji", fontSize=22, leading=28, spaceAfter=14, fontWeight="bold"
#     ),
#     "normal": ParagraphStyle(
#         "Normal", fontName="SegoeEmoji", fontSize=12, leading=18, spaceAfter=8
#     )
# }

# # Markdown conversion: bold/italic
# def markdown_to_paragraph(text):
#     text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
#     text = re.sub(r"\*(.+?)\*", r"<i>\1</i>", text)
#     return text

# def generate_pdf(content):
#     buffer = io.BytesIO()
#     doc = SimpleDocTemplate(
#         buffer, pagesize=A4, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40
#     )
#     flow = []

#     flow.append(Paragraph("Agent Generated PDF", STYLES["title"]))
    
#     for item in content:
#         if item["type"] == "text":
#             text = markdown_to_paragraph(item["text"])
#             flow.append(Paragraph(text, STYLES["normal"]))

#     doc.build(flow)
#     buffer.seek(0)
#     return base64.b64encode(buffer.read()).decode("utf-8")

# if __name__ == "__main__":
#     data = json.loads(sys.argv[1]) if len(sys.argv) > 1 else []
#     pdf_base64 = generate_pdf(data)
#     result = {
#         "pdf_uri": f"data:application/pdf;base64,{pdf_base64}",
#         "name": f"agent_pdf_{int(time.time())}.pdf"
#     }
#     print(json.dumps(result))







import io, os, sys, json, base64, time, re
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from reportlab.lib.styles import ParagraphStyle

# Use Windows default Segoe UI Emoji font (with fallback)
__dirname = os.path.dirname(__file__)
font_path = os.path.join(__dirname, "seguiemj.ttf")  # Make sure you have this TTF
if os.path.exists(font_path):
    pdfmetrics.registerFont(TTFont("SegoeEmoji", font_path))
    default_font = "SegoeEmoji"
else:
    print("⚠️ seguiemj.ttf not found, using Helvetica fallback")
    default_font = "Helvetica"

# Styles
STYLES = {
    "title": ParagraphStyle(
        "Title", fontName=default_font, fontSize=22, leading=28, spaceAfter=14
    ),
    "normal": ParagraphStyle(
        "Normal", fontName=default_font, fontSize=12, leading=18, spaceAfter=8
    ),
    "code": ParagraphStyle(
        "Code", fontName="Courier", fontSize=9, leading=12, spaceAfter=6
    ),
}

# Markdown conversion: bold/italic
def markdown_to_paragraph(text):
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"\*(.+?)\*", r"<i>\1</i>", text)
    return text

# Detect code fences and split text into blocks
def parse_blocks(text):
    blocks = []
    code_block_pattern = re.compile(r"```(.*?)```", re.DOTALL)

    last_end = 0
    for match in code_block_pattern.finditer(text):
        if match.start() > last_end:
            blocks.append({"type": "text", "text": text[last_end:match.start()]})
        code_text = match.group(1).strip()
        blocks.append({"type": "code", "text": code_text})
        last_end = match.end()

    if last_end < len(text):
        blocks.append({"type": "text", "text": text[last_end:]})

    return blocks


def generate_pdf(content):
    # print("Generating PDF...", content)
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40
    )
    flow = []

    flow.append(Paragraph("Agent Generated PDF", STYLES["title"]))

    for item in content:
        if item["type"] == "text":
            for block in parse_blocks(item["text"]):
                if block["type"] == "text":
                    # Split paragraphs by double newline
                    paragraphs = block["text"].split("\n\n")
                    for para in paragraphs:
                        if para.strip():
                            # Replace single line breaks with <br/>
                            formatted = markdown_to_paragraph(
                                para.strip().replace("\n", "<br/>")
                            )
                            flow.append(Paragraph(formatted, STYLES["normal"]))
                elif block["type"] == "code":
                    code_html = (
                        block["text"]
                        .replace("&", "&amp;")
                        .replace("<", "&lt;")
                        .replace(">", "&gt;")
                        .replace(" ", "&nbsp;")
                        .replace("\n", "<br/>")
                    )
                    flow.append(Paragraph(code_html, STYLES["code"]))

        elif item["type"] == "code":
            code_html = (
                item["text"]
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace(" ", "&nbsp;")
                .replace("\n", "<br/>")
            )
            flow.append(Paragraph(code_html, STYLES["code"]))

    doc.build(flow)
    buffer.seek(0)
    return base64.b64encode(buffer.read()).decode("utf-8")


if __name__ == "__main__":
    data = json.loads(sys.argv[1]) if len(sys.argv) > 1 else []
    pdf_base64 = generate_pdf(data)
    result = {
        "pdf_uri": f"data:application/pdf;base64,{pdf_base64}",
        "name": f"agent_pdf_{int(time.time())}.pdf",
    }
    print(json.dumps(result))
