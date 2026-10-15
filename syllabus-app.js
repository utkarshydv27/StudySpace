(() => {
  const $ = (id) => document.getElementById(id);
  const classSelect = $("notesClass");
  const subjectSelect = $("notesSubject");
  const chapterSelect = $("notesChapter");
  const panel = $("chapterNotePanel");
  const status = $("notesStatus");
  let active = null;

  const escapeHtml = (v) => String(v ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
  const slug = (v) => String(v).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  const data = () => window.STUDYSPACE_SYLLABUS || {};
  const coursesForClass = () => data()[classSelect.value] || {};
  const course = () => coursesForClass()[subjectSelect.value];
  const chapter = () => {
    const c = course();
    return c && c.chapters.find(x => x.title === chapterSelect.value);
  };

  function populateSubjects() {
    const courses = coursesForClass();
    subjectSelect.innerHTML = Object.keys(courses).map(s =>
      '<option value="' + escapeHtml(s) + '">' + escapeHtml(s) + '</option>').join("");
    populateChapters();
  }
  function populateChapters() {
    const c = course();
    chapterSelect.innerHTML = c ? c.chapters.map((item,i) =>
      '<option value="' + escapeHtml(item.title) + '">' + (i+1) + '. ' + escapeHtml(item.title) + '</option>').join("") : "";
    renderNotes();
  }
  function renderNotes() {
    const c = course();
    const item = chapter();
    if (!c || !item) {
      panel.innerHTML = '<p>Select a class, subject and chapter to view revision notes.</p>';
      active = null;
      return;
    }
    active = { className: classSelect.value, subject: subjectSelect.value, course: c, item };
    const points = item.key.map(x => '<li>' + escapeHtml(x) + '</li>').join("");
    const unitLabel = c.units ? "Official syllabus unit / topic" : "Chapter / topic";
    panel.innerHTML =
      '<div class="note-meta"><span>' + escapeHtml(unitLabel) + '</span><span>' + escapeHtml(active.className) + '</span><span>' + escapeHtml(active.subject) + '</span></div>' +
      '<h3 class="chapter-title">' + escapeHtml(item.title) + '</h3>' +
      '<p class="chapter-explain">' + escapeHtml(item.explain) + '</p>' +
      '<h4>Important points to remember</h4><ul class="chapter-points">' + points + '</ul>' +
      (item.formula ? '<div class="formula-box"><strong>Formula / key relation</strong><p>' + escapeHtml(item.formula) + '</p></div>' : '') +
      '<div class="exam-box"><h4>Exam revision focus</h4><p>Be ready to define key terms, explain ideas in your own words, show working or draw a labelled diagram where relevant, and practise a textbook-style question. This is a revision guide, not a guarantee of exam questions.</p></div>' +
      '<div class="practice-box"><h4>Quick self-check</h4><p class="self-question">' + escapeHtml(item.question) + '</p>' +
      '<details><summary>Show answer and explanation</summary><p>' + escapeHtml(item.answer) + '</p></details></div>' +
      '<p class="small note-source">Syllabus source: <a href="' + escapeHtml(c.source) + '" target="_blank" rel="noopener noreferrer">Official UPMSP subject syllabus PDF ↗</a>. Compare the latest official PDF before final exam preparation.</p>';
    status.textContent = c.chapters.length + " " + (c.units ? "units/topics" : "chapters/topics") + " available for " + active.className + " " + active.subject + ".";
  }

  function pdfAscii(text) {
    return String(text ?? "")
      .replace(/[–—−]/g,"-").replace(/[×✕]/g,"x").replace(/÷/g,"/")
      .replace(/π/g,"pi").replace(/√/g,"sqrt ").replace(/θ/g,"theta")
      .replace(/²/g,"^2").replace(/³/g,"^3").replace(/Ω/g,"ohm")
      .replace(/°/g," degrees ").replace(/≠/g,"!=").replace(/≤/g,"<=")
      .replace(/≥/g,">=").replace(/→/g,"->").replace(/∩/g," intersection ")
      .replace(/∪/g," union ").replace(/∈/g," in ").replace(/∑/g,"sum ")
      .replace(/[^\x20-\x7E]/g,"");
  }
  function downloadPdf() {
    if (!active) return;
    const jsPDF = window.jspdf && window.jspdf.jsPDF;
    if (!jsPDF) {
      status.textContent = 'The direct PDF helper did not load. In the print window, select "Save as PDF".';
      window.print();
      return;
    }
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const margin = 17, width = 176;
    let y = 18;
    const addText = (text, size=11, gap=2, style="normal") => {
      doc.setFont("helvetica", style);
      doc.setFontSize(size);
      const lines = doc.splitTextToSize(pdfAscii(text), width);
      const lineHeight = size * 0.45;
      if (y + lines.length * lineHeight + gap > 278) { doc.addPage(); y = 18; }
      doc.text(lines, margin, y);
      y += lines.length * lineHeight + gap;
    };
    doc.setTextColor(49,87,213);
    addText("StudySpace | Free Chapter Revision Notes", 16, 4, "bold");
    doc.setTextColor(30,40,60);
    addText(active.className + " | " + active.subject, 12, 2, "bold");
    addText(active.item.title, 17, 4, "bold");
    addText("Explanation", 12, 2, "bold");
    addText(active.item.explain, 11, 4);
    addText("Important points to remember", 12, 2, "bold");
    active.item.key.forEach((p,i) => addText((i+1) + ". " + p, 11, 1));
    if (active.item.formula) {
      addText("Formula / key relation", 12, 2, "bold");
      addText(active.item.formula, 11, 4);
    }
    addText("Quick self-check", 12, 2, "bold");
    addText(active.item.question, 11, 2, "bold");
    addText("Answer: " + active.item.answer, 11, 4);
    addText("Exam reminder", 12, 2, "bold");
    addText("These notes support revision; practise prescribed textbook questions and check the latest official UPMSP syllabus. They do not predict the exact exam paper.", 10, 4);
    addText("Official syllabus: " + active.course.source, 8, 2);
    addText("StudySpace is an independent student resource and is not affiliated with UPMSP.", 8, 2);
    doc.save("StudySpace-" + slug(active.className) + "-" + slug(active.subject) + "-" + slug(active.item.title) + "-notes.pdf");
    status.textContent = "PDF downloaded. Revise the notes, then solve questions from your prescribed textbook.";
  }

  classSelect.addEventListener("change", populateSubjects);
  subjectSelect.addEventListener("change", populateChapters);
  chapterSelect.addEventListener("change", renderNotes);
  $("downloadChapterPdf").addEventListener("click", downloadPdf);
  $("openOfficialSyllabus").addEventListener("click", () => {
    const c = course();
    if (c) window.open(c.source, "_blank", "noopener,noreferrer");
  });
  $("printChapterNotes").addEventListener("click", () => window.print());
  populateSubjects();
})();