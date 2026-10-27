"""
pdf_generator.py — High-Precision 2-Column Study Guide PDF Generator
Inspired by the modern textbook/GoodNotes study guide aesthetic:
- Mint green numbered page badges
- Filled teal section header banners
- Pastel mint pill subtitle bars
- Fluorescent lime highlighter spans for key thesis sentences
- Magenta/berry bold keywords and terminology
- Side-by-side comparative analysis & embedded visual diagram cards
- Clean running footer with student branding and page counter
"""

import io
import re
import os
import base64
from typing import Dict, Any, List, Optional
from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import inch, mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    Image as RLImage,
    KeepTogether,
    HRFlowable,
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY


# Curated palette matching the reference study guide
TEAL_HEADER = colors.HexColor("#3BAF8A")      # Banner green/teal
TEAL_TEXT = colors.HexColor("#1E6B52")        # Darker teal for subheadings
MINT_PILL_BG = colors.HexColor("#D8F2E8")     # Pastel mint background for pills
MINT_PILL_TXT = colors.HexColor("#1A5B45")    # Mint pill text
LIME_HIGHLIGHT = "#E5F98A"                    # Fluorescent lime highlighter hex for XML
MAGENTA_KEYWORD = "#C02674"                   # Magenta/berry bold keyword hex for XML
BLUE_ACCENT = "#2B7BB9"                       # Subtle secondary blue accent
DARK_TEXT = colors.HexColor("#212E27")        # Dark slate readable body text
LIGHT_BORDER = colors.HexColor("#C8E7DB")
CARD_BG = colors.HexColor("#F7FCFA")


def escape_xml(text: str) -> str:
    """Safely escapes text for ReportLab Paragraph XML parsing."""
    if not text:
        return ""
    text = str(text)
    text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    return text


def highlight_text(text: str) -> str:
    """Wraps text in lime green highlighter span."""
    return f'<font backColor="{LIME_HIGHLIGHT}">{escape_xml(text)}</font>'


def magenta_term(term: str, rest: str = "") -> str:
    """Formats term in bold magenta with normal trailing text."""
    term_escaped = escape_xml(term)
    rest_escaped = escape_xml(rest)
    return f'<font color="{MAGENTA_KEYWORD}"><b>{term_escaped}</b></font> {rest_escaped}'


def build_pill_table(text: str, width: float = 240) -> Table:
    """Creates a pastel mint rounded pill bar (e.g. VOCABULARY)."""
    p = Paragraph(f'<b><font color="{MINT_PILL_TXT.hexval()}" size="8.5">{escape_xml(text)}</font></b>', ParagraphStyle(
        name="PillText",
        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=10,
        alignment=TA_LEFT
    ))
    t = Table([[p]], colWidths=[width])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), MINT_PILL_BG),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    return t


def build_banner_table(text: str, width: float = 240) -> Table:
    """Creates a solid teal header banner with white bold text (e.g. A4.1 EVOLUTION AND SPECIATION)."""
    p = Paragraph(f'<b><font color="#FFFFFF" size="9.5">{escape_xml(text)}</font></b>', ParagraphStyle(
        name="BannerText",
        fontName="Helvetica-Bold",
        fontSize=9.5,
        leading=12,
        alignment=TA_LEFT
    ))
    t = Table([[p]], colWidths=[width])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), TEAL_HEADER),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    return t


class NumberedCanvas(reportlab.pdfgen.canvas.Canvas if 'reportlab' in globals() else object):
    """Adds a clean study-guide running header and footer on every page."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_elements(num_pages)
            super().showPage()
        super().save()

    def draw_page_elements(self, page_count: int):
        self.saveState()
        # Page size: A4 is 595.27 x 841.89 points
        width = 595.27
        height = 841.89

        # Mint page number badge on top-left (like the reference image's green square with '1')
        badge_x = 36
        badge_y = height - 42
        self.setFillColor(TEAL_HEADER)
        self.roundRect(badge_x, badge_y, 22, 16, 2, fill=1, stroke=0)
        self.setFillColor(colors.white)
        self.setFont("Helvetica-Bold", 9)
        self.drawCentredString(badge_x + 11, badge_y + 4.5, str(self._pageNumber))

        # Running Footer
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#7A8B83"))
        self.drawString(36, 24, "I.A.M. NoteWorthy  •  Smart Multilingual Study Guide")

        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(width - 36, 24, page_str)

        # Subtle bottom line
        self.setStrokeColor(LIGHT_BORDER)
        self.setLineWidth(0.5)
        self.line(36, 36, width - 36, 36)

        self.restoreState()


import reportlab.pdfgen.canvas


class StudyGuideCanvas(reportlab.pdfgen.canvas.Canvas):
    """Two-pass canvas for dynamic total page counting and textbook header/footer."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_elements(num_pages)
            super().showPage()
        super().save()

    def draw_page_elements(self, page_count: int):
        self.saveState()
        width = 595.27
        height = 841.89

        # Top-left mint badge
        badge_x = 36
        badge_y = height - 44
        self.setFillColor(TEAL_HEADER)
        self.roundRect(badge_x, badge_y, 22, 16, 2, fill=1, stroke=0)
        self.setFillColor(colors.white)
        self.setFont("Helvetica-Bold", 9)
        self.drawCentredString(badge_x + 11, badge_y + 4.5, str(self._pageNumber))

        # Bottom footer
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#6C8278"))
        self.drawString(36, 22, "I.A.M. NoteWorthy • Intelligent Multi-Modal Lecture Notes")
        self.drawRightString(width - 36, 22, f"{self._pageNumber} of {page_count}")

        # Hairline rule
        self.setStrokeColor(LIGHT_BORDER)
        self.setLineWidth(0.5)
        self.line(36, 34, width - 36, 34)

        self.restoreState()


def generate_notes_pdf(note_payload: Dict[str, Any]) -> bytes:
    """
    Generates a structured, 2-column textbook-style PDF matching the inspiration aesthetic.
    Returns raw PDF bytes.
    """
    notes = note_payload.get("notes", note_payload)
    title = (note_payload.get("title") or notes.get("title") or "Lecture Notes").strip()
    subject = (note_payload.get("subject") or notes.get("subject") or "Study Guide").strip()
    date_str = (note_payload.get("date") or datetime_now_str()).strip()
    lang = (notes.get("language_detected") or notes.get("language") or "Hindi + English").strip()

    pdf_buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        pdf_buffer,
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=50,
        bottomMargin=46
    )

    usable_width = A4[0] - 72  # 595.27 - 72 = 523.27 pt
    col_width = (usable_width - 16) / 2  # ~253.6 pt each

    # Typography Styles
    body_style = ParagraphStyle(
        name="StudyBody",
        fontName="Helvetica",
        fontSize=8.5,
        leading=12,
        textColor=DARK_TEXT,
        alignment=TA_LEFT
    )

    bullet_style = ParagraphStyle(
        name="StudyBullet",
        fontName="Helvetica",
        fontSize=8.5,
        leading=11.5,
        textColor=DARK_TEXT,
        leftIndent=10,
        alignment=TA_LEFT
    )

    subhead_style = ParagraphStyle(
        name="StudySubhead",
        fontName="Helvetica-Bold",
        fontSize=9,
        leading=12,
        textColor=TEAL_TEXT,
        alignment=TA_LEFT
    )

    callout_box_style = ParagraphStyle(
        name="StudyCallout",
        fontName="Helvetica",
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#8C1D40"),
        alignment=TA_LEFT
    )

    story = []

    # 1. Main Title Block (Inspired by: "BIOLOGY - Evolution and Speciation")
    title_xml = f'<font color="{TEAL_HEADER.hexval()}"><b>{escape_xml(subject.upper())}</b></font> <font color="#557B69">— {escape_xml(title)}</font>'
    title_p = Paragraph(title_xml, ParagraphStyle(
        name="MainHeaderTitle",
        fontName="Helvetica-Bold",
        fontSize=14,
        leading=18,
        alignment=TA_LEFT,
        leftIndent=30  # Leave room for top-left numbered pill
    ))

    meta_xml = f'<font size="7.5" color="#668276">Date: {escape_xml(date_str)}  |  Language: {escape_xml(lang)}  |  I.A.M. NoteWorthy Synchronized Guide</font>'
    meta_p = Paragraph(meta_xml, ParagraphStyle(
        name="MainHeaderMeta",
        fontName="Helvetica",
        fontSize=7.5,
        leading=10,
        alignment=TA_LEFT,
        leftIndent=30
    ))

    story.append(title_p)
    story.append(Spacer(1, 2))
    story.append(meta_p)
    story.append(Spacer(1, 10))

    # =========================================================================
    # LEFT COLUMN FLOWABLES (Vocabulary, Core Concepts, Theories, Exam Highlights)
    # =========================================================================
    left_flowables = []

    # Top Banner 1: A1.1 CORE TOPIC & OVERVIEW
    banner_title = f"A1.1 {subject.upper()} & {title.upper()[:24]}"
    left_flowables.append(build_banner_table(banner_title, width=col_width))
    left_flowables.append(Spacer(1, 5))

    # Pill 1: VOCABULARY
    left_flowables.append(build_pill_table("VOCABULARY", width=col_width))
    left_flowables.append(Spacer(1, 4))

    # Highlighted Thesis Sentence
    summary = notes.get("executive_summary", notes.get("summary", ""))
    first_sentence = summary.split(".")[0].strip() if summary else "All core principles in this session are interconnected."
    if first_sentence:
        left_flowables.append(Paragraph(
            f'<font backColor="{LIME_HIGHLIGHT}"><b>{escape_xml(first_sentence)}.</b></font>',
            body_style
        ))
        left_flowables.append(Spacer(1, 4))

    # Key Concepts / Vocabulary list with Magenta Terms and Lime Highlights
    key_concepts = notes.get("key_concepts", notes.get("concepts", []))
    if key_concepts:
        # Filter out empty or single-word fragments like 'Artificial' or 'Intelligence' with no description
        valid_concepts = []
        for c in key_concepts:
            if isinstance(c, dict):
                tag = (c.get("tag") or c.get("name") or "").strip()
                desc = (c.get("description") or "").strip()
                if tag:
                    valid_concepts.append({"tag": tag, "description": desc})
            elif isinstance(c, str) and len(c.strip()) > 2:
                valid_concepts.append({"tag": c.strip(), "description": ""})

        for idx, item in enumerate(valid_concepts[:5]):
            tag = item["tag"]
            desc = item["description"]

            # If description contains bullet points (e.g. levels of AI)
            if "•" in desc or "\n" in desc:
                left_flowables.append(Paragraph(
                    f'<font color="{MAGENTA_KEYWORD}"><b>{escape_xml(tag)}:</b></font>',
                    body_style
                ))
                left_flowables.append(Spacer(1, 2))
                lines = [ln.strip().lstrip("•-").strip() for ln in re.split(r"[•\n]+", desc) if ln.strip()]
                for ln in lines:
                    sub_parts = ln.split(":", 1) if ":" in ln else ln.split("-", 1)
                    if len(sub_parts) == 2:
                        bullet_txt = f'  <font color="#2B7BB9"><b>• {escape_xml(sub_parts[0].strip())}:</b></font> {escape_xml(sub_parts[1].strip())}'
                    else:
                        bullet_txt = f'  • {escape_xml(ln)}'
                    left_flowables.append(Paragraph(bullet_txt, bullet_style))
                    left_flowables.append(Spacer(1, 2))
            else:
                desc_parts = [p.strip() for p in desc.split(".") if p.strip()] if desc else []
                if not desc_parts:
                    desc_lead = f"Foundational principle in {subject}"
                    highlight_tail = "Core requirement across all modules"
                elif len(desc_parts) == 1:
                    desc_lead = desc_parts[0]
                    highlight_tail = "Core requirement across all modules"
                else:
                    desc_lead = desc_parts[0]
                    highlight_tail = desc_parts[1]

                if desc_lead.lower() in ["refers to", "refers to."]:
                    desc_lead = f"Refers to core foundational concepts in {subject}"

                if idx == 0:
                    p_text = (
                        f'<font color="{MAGENTA_KEYWORD}"><b>{escape_xml(tag)}:</b></font> '
                        f'{escape_xml(desc_lead)}. '
                        f'<font backColor="{LIME_HIGHLIGHT}">{escape_xml(highlight_tail)}.</font>'
                    )
                else:
                    p_text = f'• <font color="{MAGENTA_KEYWORD}"><b>{escape_xml(tag)}:</b></font> {escape_xml(desc_lead)}.'

                left_flowables.append(Paragraph(p_text, bullet_style if idx > 0 else body_style))
                left_flowables.append(Spacer(1, 3))

    left_flowables.append(Spacer(1, 6))

    # Banner 2: EVIDENCE & EXAM CRITICAL POINTS
    left_flowables.append(build_banner_table("EVIDENCE & EXAM CRITICALITY", width=col_width))
    left_flowables.append(Spacer(1, 5))

    left_flowables.append(Paragraph(
        "Key curriculum proofs and instructor high-yield checkpoints identified in this lecture:",
        body_style
    ))
    left_flowables.append(Spacer(1, 4))

    # Exam Alerts in Left Column
    exam_alerts = notes.get("exam_alerts", [])
    if exam_alerts:
        for alert in exam_alerts[:3]:
            topic = alert.get("topic", "Exam Topic")
            ts = alert.get("timestamp", "00:00")
            imp = alert.get("importance", "High")
            tip = alert.get("instructor_tip", "")
            phrase = alert.get("trigger_phrase", "")

            # Alert Card Flowable
            alert_xml = (
                f'<b>[{escape_xml(ts)}] {escape_xml(imp.upper())}: {escape_xml(topic)}</b><br/>'
                f'<font color="#A0153E"><i>"{escape_xml(phrase[:90])}..."</i></font><br/>'
                f'<font color="#2D5A46"><b>Tip:</b> {escape_xml(tip[:110])}</font>'
            )
            alert_p = Paragraph(alert_xml, callout_box_style)
            alert_tbl = Table([[alert_p]], colWidths=[col_width])
            alert_tbl.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#FFF5F5")),
                ('BOX', (0, 0), (-1, -1), 0.75, colors.HexColor("#F8B4B4")),
                ('TOPPADDING', (0, 0), (-1, -1), 4),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
                ('LEFTPADDING', (0, 0), (-1, -1), 6),
                ('RIGHTPADDING', (0, 0), (-1, -1), 6),
            ]))
            left_flowables.append(alert_tbl)
            left_flowables.append(Spacer(1, 4))
    else:
        # Topic-tailored evidence points
        if "ai" in subject.lower() or "artificial" in title.lower():
            evidences = [
                "Turing Test & Machine Cognition Benchmarks",
                "Deep Learning Convergence & Loss Functions",
                "Algorithmic Complexity in Search & Heuristics",
                "Empirical Model Evaluation & Generalization"
            ]
        else:
            evidences = [
                "Empirical Experimental Observations",
                "Theoretical Derivation & Proofs",
                "Mathematical Foundations & Principles",
                "Applied Real-World Case Studies"
            ]
        for ev in evidences:
            left_flowables.append(Paragraph(f"• {ev}", bullet_style))
            left_flowables.append(Spacer(1, 2))

    # Additional Pill: SUMMARY SYNTHESIS
    left_flowables.append(Spacer(1, 4))
    left_flowables.append(build_pill_table("EXECUTIVE SUMMARY SYNTHESIS:", width=col_width))
    left_flowables.append(Spacer(1, 3))
    left_flowables.append(Paragraph(escape_xml(summary[:280] + ("..." if len(summary)>280 else "")), body_style))

    # =========================================================================
    # RIGHT COLUMN FLOWABLES (Comparative Analysis, Visuals, Glossary, Actions)
    # =========================================================================
    right_flowables = []

    # Pill 1: COMPARATIVE ANALYSIS & STRUCTURE
    right_flowables.append(build_pill_table("CONCEPT ARCHITECTURE & STRUCTURE:", width=col_width))
    right_flowables.append(Spacer(1, 4))

    # Subhead 1
    right_flowables.append(Paragraph("STRUCTURAL SCHEMATIC & MINDMAP", subhead_style))
    right_flowables.append(Spacer(1, 2))

    # Check for snapshots / diagrams attached to the session
    snapshots = note_payload.get("snapshots", [])
    has_image = False
    if snapshots:
        first_snap = snapshots[0]
        snap_url = first_snap.get("image_url", "")
        if snap_url and snap_url.startswith("data:image/"):
            try:
                header, b64data = snap_url.split("base64,", 1)
                img_bytes = io.BytesIO(base64.b64decode(b64data))
                rl_img = RLImage(img_bytes, width=col_width - 8, height=85)
                right_flowables.append(rl_img)
                right_flowables.append(Spacer(1, 4))
                has_image = True
            except Exception:
                pass

    if not has_image:
        # Dynamic Concept Architecture Card based on mindmaps or lecture topic
        mindmaps = notes.get("mindmaps", [])
        diag_title = "<b>CONCEPT ARCHITECTURE &amp; MINDMAP</b>"

        if mindmaps:
            mm = mindmaps[0]
            mm_head = escape_xml(mm.get("heading", "Structural Decomposition"))
            mm_nodes = mm.get("nodes", [])
            diag_body = f"<b>{mm_head}:</b><br/>"
            for n in mm_nodes[:4]:
                diag_body += f"• {escape_xml(str(n))}<br/>"
        elif "ai" in subject.lower() or "artificial" in title.lower() or "ai" in title.lower():
            diag_body = (
                "<b>Levels of Artificial Intelligence:</b><br/>"
                "• <b>Narrow AI (ANI):</b> Dedicated to single tasks (e.g., Siri, Chess)<br/>"
                "• <b>General AI (AGI):</b> Human-level cognitive versatility<br/>"
                "• <b>Super AI (ASI):</b> Exceeds human cognitive performance<br/>"
                "<i>Core Pillars:</i> Learning ➔ Reasoning ➔ Problem Solving"
            )
        elif "database" in subject.lower() or "normal" in title.lower():
            diag_body = (
                "<b>Relational Normalization Architecture:</b><br/>"
                "• <b>1NF:</b> Atomic attributes &amp; no repeating groups<br/>"
                "• <b>2NF:</b> Full functional dependency on primary key<br/>"
                "• <b>3NF:</b> Elimination of transitive dependencies"
            )
        elif "distributed" in subject.lower() or "concurrency" in title.lower():
            diag_body = (
                "<b>Distributed System Architecture:</b><br/>"
                "• <b>Concurrency:</b> Parallel transaction scheduling<br/>"
                "• <b>Transparency:</b> Unified system image to clients<br/>"
                "• <b>Consensus:</b> Coordinated state via two-phase commit"
            )
        else:
            diag_body = f"<b>{escape_xml(title)} Framework:</b><br/>"
            for c in valid_concepts[:3]:
                diag_body += f"• <b>{escape_xml(c['tag'])}:</b> Core structural component<br/>"

        diag_p = Paragraph(f"{diag_title}<br/>{diag_body}", ParagraphStyle(
            name="DiagCard",
            fontName="Helvetica",
            fontSize=7.5,
            leading=10.5,
            textColor=DARK_TEXT
        ))
        diag_tbl = Table([[diag_p]], colWidths=[col_width])
        diag_tbl.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), CARD_BG),
            ('BOX', (0, 0), (-1, -1), 0.75, TEAL_HEADER),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('LEFTPADDING', (0, 0), (-1, -1), 7),
            ('RIGHTPADDING', (0, 0), (-1, -1), 7),
        ]))
        right_flowables.append(diag_tbl)
        right_flowables.append(Spacer(1, 5))

    # Explanation text with lime green highlights
    right_flowables.append(Paragraph(
        f'Systems <font backColor="{LIME_HIGHLIGHT}">built on foundational core principles</font> share common architecture. '
        f'Specific functional tiers adapt to meet specialized operational demands.',
        body_style
    ))
    right_flowables.append(Spacer(1, 5))

    # Subhead 2: PRACTICAL EXAMPLES & CODE-SWITCHING
    right_flowables.append(Paragraph("PRACTICAL EXAMPLES & CODE-SWITCHING", subhead_style))
    right_flowables.append(Spacer(1, 3))

    glossary = notes.get("hinglish_glossary", [])
    if glossary:
        for g in glossary[:3]:
            c_phrase = g.get("classroom_phrase", "")
            f_term = g.get("formal_term", "")
            exp = g.get("explanation", "")

            g_text = (
                f'• <i>"{escape_xml(c_phrase)}"</i> ➔ <font color="{BLUE_ACCENT}"><b>{escape_xml(f_term)}</b></font>: '
                f'<font backColor="{LIME_HIGHLIGHT}">{escape_xml(exp[:80])}</font>'
            )
            right_flowables.append(Paragraph(g_text, bullet_style))
            right_flowables.append(Spacer(1, 2.5))
    elif "ai" in subject.lower() or "artificial" in title.lower():
        right_flowables.append(Paragraph(
            f'• <font color="{BLUE_ACCENT}"><b>Narrow AI Application:</b></font> Virtual assistants &amp; vision models <font backColor="{LIME_HIGHLIGHT}">dedicated to single domains</font>.',
            bullet_style
        ))
        right_flowables.append(Spacer(1, 2))
        right_flowables.append(Paragraph(
            f'• <font color="{BLUE_ACCENT}"><b>General Adaptation:</b></font> Cross-domain cognitive transfer matching human capabilities.',
            bullet_style
        ))
        right_flowables.append(Spacer(1, 2))
    else:
        right_flowables.append(Paragraph(
            f'• <font color="{BLUE_ACCENT}"><b>Applied Execution:</b></font> Features that <font backColor="{LIME_HIGHLIGHT}">solve operational requirements</font> across production workloads.',
            bullet_style
        ))
        right_flowables.append(Spacer(1, 2))
        right_flowables.append(Paragraph(
            f'• <font color="{BLUE_ACCENT}"><b>Modular Integration:</b></font> Component optimization to scale under constraints.',
            bullet_style
        ))
        right_flowables.append(Spacer(1, 2))

    # Action Items / Review Checklist
    right_flowables.append(Spacer(1, 4))
    right_flowables.append(build_pill_table("ACTION ITEMS & STUDY CHECKLIST:", width=col_width))
    right_flowables.append(Spacer(1, 3))

    action_items = notes.get("action_items", [])
    if action_items:
        for task in action_items[:3]:
            right_flowables.append(Paragraph(f"☐  {escape_xml(str(task))}", bullet_style))
            right_flowables.append(Spacer(1, 2))
    elif "ai" in subject.lower() or "artificial" in title.lower():
        ai_actions = [
            "Review definitions of Narrow AI (ANI) vs General AI (AGI).",
            "Identify 3 real-world examples of Narrow AI in current industry.",
            "Prepare 5-mark answer on machine learning vs reasoning vs problem solving."
        ]
        for act in ai_actions:
            right_flowables.append(Paragraph(f"☐  {act}", bullet_style))
            right_flowables.append(Spacer(1, 2))
    else:
        default_actions = [
            "Review highlighted vocabulary terms and core definitions.",
            "Practice architectural schematic flow with component arrows.",
            "Prepare 5-mark synthesis answer on key system levels."
        ]
        for da in default_actions:
            right_flowables.append(Paragraph(f"☐  {da}", bullet_style))
            right_flowables.append(Spacer(1, 2))

    # =========================================================================
    # TWO-COLUMN TABLE COMPILATION
    # =========================================================================
    main_grid = Table(
        [[left_flowables, right_flowables]],
        colWidths=[col_width, col_width]
    )
    main_grid.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (0, 0), 0),
        ('RIGHTPADDING', (0, 0), (0, 0), 8),
        ('LEFTPADDING', (1, 0), (1, 0), 8),
        ('RIGHTPADDING', (1, 0), (1, 0), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
    ]))

    story.append(main_grid)

    # Build document with custom canvas
    doc.build(story, canvasmaker=StudyGuideCanvas)

    pdf_buffer.seek(0)
    return pdf_buffer.getvalue()


def datetime_now_str() -> str:
    import datetime
    return datetime.datetime.now().strftime("%B %d, %Y")
