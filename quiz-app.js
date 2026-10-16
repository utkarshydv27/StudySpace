(() => {
  const $ = (id) => document.getElementById(id);
  const cls = $("quizClass");
  const sub = $("quizSubject");
  const topic = $("quizTopic");
  const questionBox = $("question");
  const answersBox = $("answers");
  const feedback = $("feedback");
  const count = $("qcount");
  const scoreBox = $("score");
  const next = $("next");
  const status = $("quizStatus");
  const reveal = $("revealAnswer");
  const assess = $("selfAssessment");
  const know = $("markKnow");
  const revise = $("markRevise");
  let questions = [];
  let qi = 0;
  let confident = 0;
  let needsRevision = 0;
  let missed = [];
  let revealed = false;
  let marked = false;

  const data = () => window.STUDYSPACE_SYLLABUS || {};
  const escapeHtml = (v) => String(v ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
  const currentSubjects = () => data()[cls.value] || {};
  const currentCourse = () => currentSubjects()[sub.value];
  const currentChapters = () => (currentCourse() && currentCourse().chapters) || [];

  function updateSubjects() {
    const subjects = Object.keys(currentSubjects());
    sub.innerHTML = subjects.map(x => '<option value="' + escapeHtml(x) + '">' + escapeHtml(x) + '</option>').join("");
    updateTopics();
  }
  function updateTopics() {
    const chapters = currentChapters();
    topic.innerHTML = '<option value="all">All topics · mixed revision</option>' +
      chapters.map((x,i) => '<option value="' + escapeHtml(x.title) + '">' + (i+1) + '. ' + escapeHtml(x.title) + '</option>').join("");
    startQuiz();
  }
  function boardGuidance(subject) {
    const s = String(subject || "").toLowerCase();
    if (/math|physics|chemistry|accountancy/.test(s)) {
      return "Formula/rule ka meaning samjho, symbols aur units pehchano, solved example dekho, phir bina notes ke 3 similar questions step-by-step solve karo.";
    }
    if (/science|biology/.test(s)) {
      return "Definition aur process ko sequence mein samjho; 'kaise' aur 'kyun' ka jawab apne words mein do. Prescribed course mein ho to labelled diagram aur key-term differences practise karo.";
    }
    if (/history|geography|civics|political|economics|business/.test(s)) {
      return "Key terms ki meaning seekho, phir cause-effect, difference ya example ko connected points mein likho. Geography mein prescribed map work practise karo; answer ki length question ke marks aur board instructions ke hisaab se rakho.";
    }
    return "Question ko dhyan se padho, required writing format aur grammar revise karo, aur comprehension/literature mein passage ya prescribed text ke evidence se answer support karo.";
  }
  function officialUnitInfo(className, subject, item) {
    if (className !== "Class 10") return null;
    const title = item.title.toLowerCase();
    if (subject === "Mathematics") {
      if (/real numbers|number system/.test(title)) return "Number System — 5 marks out of the 70-mark written paper.";
      if (/polynomial|linear equations|quadratic equations|arithmetic progression/.test(title)) return "Algebra — 18 marks out of 70 (unit weightage; not a one-chapter prediction).";
      if (/coordinate geometry/.test(title)) return "Coordinate Geometry — 5 marks out of 70.";
      if (/triangle|circle|tangent/.test(title)) return "Geometry — 10 marks out of 70.";
      if (/trigonometric|applications of trigonometry/.test(title)) return "Trigonometry — 12 marks out of 70.";
      if (/areas related to circles|surface area and volume/.test(title)) return "Mensuration — 10 marks out of 70.";
      if (/statistics|probability/.test(title)) return "Statistics and Probability — 10 marks out of 70.";
    }
    if (subject === "Science") {
      if (/chemical reactions|acids, bases|metals and non-metals|carbon and its compounds/.test(title)) return "Chemical substances — nature and behaviour: 20 marks out of 70.";
      if (/life processes|control and coordination|reproduction|heredity/.test(title)) return "Biological world — 20 marks out of 70.";
      if (/light: reflection|light/.test(title)) return "Natural phenomena — 12 marks out of 70.";
      if (/electricity$|magnetic effects/.test(title)) return "Effects of electricity — 13 marks out of 70.";
      if (/our environment/.test(title)) return "Natural resources — 5 marks out of 70.";
    }
    if (subject === "Social Science") {
      if (/nationalism|global world|industrialisation|print culture/.test(title)) return "History unit — 20 marks out of 70.";
      if (/resources and development|forest, water|manufacturing and lifelines/.test(title)) return "Geography unit — 20 marks out of 70.";
      if (/power sharing|federalism|gender, religion|outcomes of democracy/.test(title)) return "Democratic Politics unit — 15 marks out of 70.";
      if (/development|sectors of the economy|money, credit|consumer rights/.test(title)) return "Understanding Economic Development unit — 15 marks out of 70.";
    }
    return null;
  }
  function startQuiz() {
    const all = currentChapters();
    questions = topic.value === "all" ? [...all] : all.filter(x => x.title === topic.value);
    if (!questions.length) {
      renderEmpty("Is selection ke liye abhi questions available nahi hain.");
      return;
    }
    qi = 0; confident = 0; needsRevision = 0; missed = [];
    status.textContent = questions.length + " recall question" + (questions.length===1?"":"s") +
      " · " + cls.value + " · " + sub.value + ". Answer pehle yaad karo, phir reveal karke explanation padho.";
    scoreBox.textContent = "Confident: 0 · Needs revision: 0";
    showQuestion();
  }
  function renderEmpty(msg) {
    questionBox.textContent = msg;
    answersBox.innerHTML = "";
    feedback.innerHTML = "";
    count.textContent = "NO QUESTIONS";
    reveal.style.display = "none";
    assess.style.display = "none";
    next.style.display = "none";
  }
  function showQuestion() {
    if (!questions.length) return;
    if (qi >= questions.length) { showResults(); return; }
    const q = questions[qi];
    revealed = false; marked = false;
    count.textContent = "QUESTION " + (qi+1) + " / " + questions.length;
    scoreBox.textContent = "Confident: " + confident + " · Needs revision: " + needsRevision;
    questionBox.textContent = q.question;
    answersBox.innerHTML = '<p class="small">Options dekhne se pehle apna answer khud socho ya rough notebook mein likho.</p>';
    feedback.innerHTML = "";
    reveal.style.display = "inline-block";
    assess.style.display = "none";
    know.style.display = "inline-block";
    revise.style.display = "inline-block";
    next.style.display = "none";
    next.textContent = qi === questions.length-1 ? "See revision summary →" : "Next question →";
    delete next.dataset.restart;
  }
  function showAnswer() {
    if (revealed || !questions[qi]) return;
    revealed = true;
    const q = questions[qi];
    const learning = window.STUDYSPACE_LEARNING || {};
    const pointExplanation = typeof learning.corePointExplanation === "function" ? learning.corePointExplanation : (() => "Is point ko apne words mein explain karo aur chapter ke worked example se connect karo.");
    const points = q.key.map(x => "<li class=\"core-point\"><strong>"+escapeHtml(x)+"</strong><p>"+escapeHtml(pointExplanation(sub.value,x))+"</p></li>").join("");
    const unitInfo = officialUnitInfo(cls.value, sub.value, q);
    const plainExplanation = typeof learning.simpleExplanation === "function" ? learning.simpleExplanation(sub.value, q) : q.explain;
    const example = typeof learning.workedExample === "function" ? learning.workedExample(sub.value, q) : null;
    const exampleSteps = example ? example.steps.map((x,i) => "<li><b>Step " + (i+1) + ":</b> " + escapeHtml(x) + "</li>").join("") : "";
    const commonMistake = typeof learning.commonMistake === "function" ? learning.commonMistake(sub.value) : "Answer ko prescribed textbook se compare karo.";
    feedback.innerHTML =
      '<div class="quiz-feedback">' +
      '<h3>Answer</h3><p class="answer-text">' + escapeHtml(q.answer) + '</p>' +
      '<h4>Bilkul simple language mein</h4><p>' + escapeHtml(plainExplanation) + '</p>' +
      '<details><summary>Further explanation from the study notes</summary><p>' + escapeHtml(q.explain) + '</p></details>' +
      (example ? '<h4>Chhota worked example</h4><p><b>Situation:</b> ' + escapeHtml(example.situation) + '</p><ol>' + exampleSteps + '</ol><p><b>Answer:</b> ' + escapeHtml(example.result) + '</p><p><b>Yaad rakho:</b> ' + escapeHtml(example.takeaway) + '</p>' : '') +
      '<h4>Board ke liye ye core points revise karo</h4><ul>' + points + '</ul>' +
      (q.formula ? '<p><b>Formula / key relation:</b> ' + escapeHtml(q.formula) + '</p>' : '') +
      (unitInfo ? '<p><b>Official Class 10 unit weightage:</b> ' + escapeHtml(unitInfo) + ' Ye poore unit ke marks hain, is ek question ki guarantee nahi.</p>' : '<p><b>Board importance:</b> is screen par is class/subject ka exact unit-wise marks breakdown verify nahi hai. Official syllabus/model paper check karo; guessed marks par depend mat karo.</p>') +
      '<p><b>Common mistake se bacho:</b> ' + escapeHtml(commonMistake) + '</p>' +
      '<p><b>Ab kya practice karni hai:</b> ' + escapeHtml(boardGuidance(sub.value)) + '</p>' +
      '</div>';
    reveal.style.display = "none";
    assess.style.display = "flex";
  }
  function markResult(knewIt) {
    if (!revealed || marked || !questions[qi]) return;
    marked = true;
    if (knewIt) confident++;
    else { needsRevision++; missed.push(questions[qi].title); }
    scoreBox.textContent = "Confident: " + confident + " · Needs revision: " + needsRevision;
    assess.style.display = "none";
    next.style.display = "inline-block";
  }
  function showResults() {
    count.textContent = "REVISION SUMMARY";
    questionBox.textContent = cls.value + " · " + sub.value + " complete.";
    const list = missed.length ? '<p><b>Dobara revise karo:</b> ' + escapeHtml([...new Set(missed)].join(", ")) + '</p>' : '<p>Is round mein koi topic revision ke liye mark nahi hua. Ab answers ko bina options ke likhkar practise karo.</p>';
    answersBox.innerHTML =
      '<div class="quiz-result"><strong>' + confident + ' topic(s) confident · ' + needsRevision + ' topic(s) need revision</strong>' +
      '<p>“I knew it” ka matlab sirf self-check confidence hai; board marks ka prediction nahi.</p>' + list +
      '<p>Next step: prescribed textbook ke questions karo, phir current UPMSP question bank aur model paper se exam format practise karo.</p>' +
      '<div class="resources"><a href="https://upmsp.edu.in/Board_QuestionBank.aspx" target="_blank" rel="noopener noreferrer">Official question bank ↗</a><a href="https://upmsp.edu.in/Board_ModelPaper.aspx" target="_blank" rel="noopener noreferrer">Official model paper ↗</a><a href="' + escapeHtml((currentCourse()||{}).source || "https://upmsp.edu.in/Board_Syllabus.aspx") + '" target="_blank" rel="noopener noreferrer">Official syllabus PDF ↗</a></div></div>';
    feedback.innerHTML = "";
    reveal.style.display = "none";
    assess.style.display = "none";
    next.textContent = "Try this quiz again ↻";
    next.style.display = "inline-block";
    next.dataset.restart = "true";
    scoreBox.textContent = "Finished: " + questions.length + " questions";
  }
  cls.addEventListener("change", updateSubjects);
  sub.addEventListener("change", updateTopics);
  topic.addEventListener("change", startQuiz);
  reveal.addEventListener("click", showAnswer);
  know.addEventListener("click", () => markResult(true));
  revise.addEventListener("click", () => markResult(false));
  next.addEventListener("click", () => {
    if (next.dataset.restart === "true") { startQuiz(); return; }
    if (!marked) return;
    qi++;
    showQuestion();
  });
  updateSubjects();
})();