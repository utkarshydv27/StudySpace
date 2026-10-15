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
  function boardPlan(subject) {
    const v = String(subject || "").toLowerCase();
    if (/math|physics|chemistry|accountancy/.test(v)) {
      return "Formula/rule ko sirf ratto mat: symbols ka meaning samjho, solved example dekho, phir bina notes ke 3 similar questions solve karo. Har working step aur required unit likhne ki practice karo.";
    }
    if (/science|biology/.test(v)) {
      return "Definition aur process ke steps samjho; 'kaise' aur 'kyun' ka jawab apne words mein do. Prescribed chapter mein diagram hai to uska label aur function practise karo, aur similar terms ka difference revise karo.";
    }
    if (/history|geography|civics|political|economics|business/.test(v)) {
      return "Key terms ki meaning seekho, phir cause-effect, difference ya example ko connected points mein likho. Geography mein syllabus ke map work ko bhi practise karo. 2–5 mark answer ki length apne question ke marks aur board instructions ke hisaab se rakho.";
    }
    if (/english|hindi|sanskrit|urdu|language/.test(v)) {
      return "Question ko dhyan se padho, grammar aur required writing format revise karo. Literature/comprehension mein answer ko prescribed text ya passage ke evidence se support karo; question se unrelated memorised paragraph mat likho.";
    }
    return "Pehle definitions aur key concepts samjho, phir textbook ke worked examples/questions solve karo. Board question bank aur model paper mein diye gaye question formats par practice karo.";
  }

  function officialUnitInfo(className, subject, item) {
    if (className !== "Class 10") return null;
    const title = item.title.toLowerCase();
    if (subject === "Mathematics") {
      if (/real numbers|number system/.test(title)) return {label:"Number System — 5 marks out of the 70-mark written paper",note:"This is the official unit-level weightage, not a guarantee of marks from this one topic."};
      if (/polynomial|linear equations|quadratic equations|arithmetic progression/.test(title)) return {label:"Algebra — 18 marks out of 70",note:"Algebra has the largest unit allocation in the official Class 10 Mathematics syllabus. Prepare all listed algebra topics, not just one."};
      if (/coordinate geometry/.test(title)) return {label:"Coordinate Geometry — 5 marks out of 70",note:"Practise graphs, distance and internal section formula as listed in the official syllabus."};
      if (/triangle|circle|tangent/.test(title)) return {label:"Geometry — 10 marks out of 70",note:"Revise similarity, the prescribed triangle results and tangent properties."};
      if (/trigonometric|applications of trigonometry/.test(title)) return {label:"Trigonometry — 12 marks out of 70",note:"Practise ratios, identities, standard angles and heights/distances within the stated syllabus limits."};
      if (/areas related to circles|surface area and volume/.test(title)) return {label:"Mensuration — 10 marks out of 70",note:"Practise the exact circle, solid and combined-solid forms listed by the board."};
      if (/statistics|probability/.test(title)) return {label:"Statistics and Probability — 10 marks out of 70",note:"Practise grouped-data mean/median/mode and elementary probability as prescribed."};
    }
    if (subject === "Science") {
      if (/chemical reactions|acids, bases|metals and non-metals|carbon and its compounds/.test(title)) return {label:"Chemical substances — nature and behaviour: 20 marks out of 70",note:"This is the full unit allocation. Learn equations, reaction types, properties and prescribed uses—not only one chapter."};
      if (/life processes|control and coordination|reproduction|heredity/.test(title)) return {label:"Biological world — 20 marks out of 70",note:"Learn process steps, key terms, inheritance concepts and labelled diagrams where the prescribed course asks for them."};
      if (/light: reflection|light/.test(title)) return {label:"Natural phenomena — 12 marks out of 70",note:"Revise mirror/lens diagrams, image properties, vision and only the formula uses listed in the official syllabus."};
      if (/electricity$|magnetic effects/.test(title)) return {label:"Effects of electricity — 13 marks out of 70",note:"Practise Ohm's law, resistance combinations, electrical power, magnetic field patterns and relevant rules."};
      if (/our environment/.test(title)) return {label:"Natural resources — 5 marks out of 70",note:"Revise ecosystem, ozone depletion and biodegradable/non-biodegradable wastes."};
    }
    if (subject === "Social Science") {
      if (/nationalism|global world|industrialisation|print culture/.test(title)) return {label:"History unit — 20 marks out of 70",note:"The official unit includes map work. Practise chronology, causes/consequences and the listed map items."};
      if (/resources and development|forest, water|manufacturing and lifelines/.test(title)) return {label:"Geography unit — 20 marks out of 70",note:"The official unit includes map work. Revise concepts, examples and every prescribed map location."};
      if (/power sharing|federalism|gender, religion|outcomes of democracy/.test(title)) return {label:"Democratic Politics unit — 15 marks out of 70",note:"Practise definitions, comparisons and reasoned answers using the topics in the official syllabus."};
      if (/development|sectors of the economy|money, credit|consumer rights/.test(title)) return {label:"Understanding Economic Development unit — 15 marks out of 70",note:"Practise key definitions, examples, comparisons and cause-effect explanations from the syllabus."};
    }
    return null;
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
    const unitInfo = officialUnitInfo(active.className, active.subject, item);
    panel.innerHTML =
      '<div class="note-meta"><span>' + escapeHtml(unitLabel) + '</span><span>' + escapeHtml(active.className) + '</span><span>' + escapeHtml(active.subject) + '</span></div>' +
      '<h3 class="chapter-title">' + escapeHtml(item.title) + '</h3>' +
      '<h4>Simple explanation — pehle concept samjho</h4><p class="chapter-explain">' + escapeHtml(item.explain) + '</p>' +
      '<h4>Pehle ye core points pakke karo</h4><ul class="chapter-points">' + points + '</ul>' +
      (unitInfo ? '<div class="weightage-box"><strong>Official board unit weightage: ' + escapeHtml(unitInfo.label) + '</strong><p>' + escapeHtml(unitInfo.note) + '</p><p class="small">Official source: 2026–27 subject syllabus PDF linked below. Unit marks are not per-chapter predictions.</p></div>' : '<div class="weightage-box weightage-neutral"><strong>Board importance check</strong><p>Exact unit-wise marks are not displayed here for this class/subject. Check the linked official syllabus and current model paper instead of trusting guessed “most important questions”.</p></div>') +
      (item.formula ? '<div class="formula-box"><strong>Formula / key relation</strong><p>' + escapeHtml(item.formula) + '</p></div>' : '') +
      '<div class="exam-box"><h4>Board ke liye kya padhna hai?</h4><p>' + escapeHtml(boardPlan(active.subject)) + '</p><ol><li>Upar diye gaye core points bina dekhe explain karne ki koshish karo.</li><li>Prescribed textbook se isi topic ke solved example aur exercise questions karo.</li><li>Official UPMSP question bank/model paper mein isi subject ka question format check karo.</li></ol><p><strong>Important:</strong> ye revision priority hai, guaranteed exam prediction ya official marking scheme nahi.</p></div>' +
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