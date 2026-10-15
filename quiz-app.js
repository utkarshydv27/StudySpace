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
  const panel = $("quiz");
  let questions = [];
  let qi = 0;
  let score = 0;
  let answered = false;
  let selected = -1;

  const data = () => window.STUDYSPACE_SYLLABUS || {};
  const escapeHtml = (v) => String(v ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
  const trimAnswer = (text) => {
    let v = String(text || "").trim();
    const dot = v.indexOf(". ");
    if (dot > 25 && dot < 130) v = v.slice(0, dot + 1);
    if (v.length > 112) v = v.slice(0, 109).replace(/\s+\S*$/, "") + "…";
    return v;
  };
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
  function boardGuidance(subject, item) {
    const s = subject.toLowerCase();
    if (/math|physics|chemistry|accountancy/.test(s)) {
      return "Board practice: learn the formula or rule, write each working step clearly, show the final unit where needed, and solve a similar question without looking at the notes.";
    }
    if (/science|biology/.test(s)) {
      return "Board practice: learn the definition and process in the correct order; prepare a labelled diagram only when it belongs to your prescribed chapter; practise a 'how/why' explanation.";
    }
    if (/history|geography|civics|political|economics|business/.test(s)) {
      return "Board practice: learn key terms, then write a direct answer with linked points and an accurate example, cause/effect or map detail when relevant to the question.";
    }
    return "Board practice: answer exactly what the question asks, support comprehension or literature answers with evidence from the prescribed text, and practise the current board format.";
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

  function buildOptions(item, allItems, index) {
    const correct = trimAnswer(item.answer);
    const candidates = [];
    for (let offset=1; offset<allItems.length && candidates.length<3; offset++) {
      const candidate = trimAnswer(allItems[(index + offset) % allItems.length].answer);
      if (candidate && candidate.toLowerCase() !== correct.toLowerCase() &&
          !candidates.some(x => x.toLowerCase() === candidate.toLowerCase())) candidates.push(candidate);
    }
    const safeFallbacks = ["Review the definition in your prescribed textbook.", "This statement does not match the topic's key idea.", "Recheck the example and the rule from the chapter."];
    safeFallbacks.forEach(v => { if(candidates.length<3 && !candidates.includes(v)) candidates.push(v); });
    const choices = [correct, ...candidates.slice(0,3)];
    // Deterministic rotation avoids the correct option always appearing first.
    const shift = index % choices.length;
    const rotated = choices.slice(shift).concat(choices.slice(0,shift));
    return { choices: rotated, correctIndex: rotated.findIndex(x => x.toLowerCase() === correct.toLowerCase()) };
  }
  function startQuiz() {
    const all = currentChapters();
    const chosen = topic.value === "all" ? all : all.filter(x => x.title === topic.value);
    if (!chosen.length) {
      questions = [];
      renderEmpty("No topics are available for this selection yet.");
      return;
    }
    questions = chosen.map(item => {
      const originalIndex = all.indexOf(item);
      const opts = buildOptions(item, all, originalIndex);
      return { ...item, options: opts.choices, correctIndex: opts.correctIndex };
    });
    qi = 0; score = 0; answered = false; selected = -1;
    status.textContent = questions.length + " question" + (questions.length===1?"":"s") +
      " for " + cls.value + " · " + sub.value + ". These are original StudySpace practice questions based on the selected notes, not official board questions.";
    scoreBox.textContent = "Score: 0 / " + questions.length;
    showQuestion();
  }
  function renderEmpty(msg) {
    questionBox.textContent = msg;
    answersBox.innerHTML = "";
    feedback.innerHTML = "";
    count.textContent = "NO QUESTIONS";
    next.style.display = "none";
  }
  function showQuestion() {
    if (!questions.length) return;
    if (qi >= questions.length) { showResults(); return; }
    const q = questions[qi];
    answered = false; selected = -1;
    count.textContent = "QUESTION " + (qi+1) + " / " + questions.length;
    scoreBox.textContent = "Score: " + score + " / " + questions.length;
    questionBox.textContent = q.question;
    answersBox.innerHTML = q.options.map((ans,i) =>
      '<button class="quiz-option" type="button" data-quiz-answer="' + i + '">' +
      '<span class="option-letter">' + String.fromCharCode(65+i) + '</span><span>' + escapeHtml(ans) + '</span></button>'
    ).join("");
    feedback.innerHTML = "";
    next.style.display = "none";
    next.textContent = qi === questions.length-1 ? "See result →" : "Next question →";
    answersBox.querySelectorAll("[data-quiz-answer]").forEach(button => button.addEventListener("click", () => answerQuestion(Number(button.dataset.quizAnswer))));
  }
  function answerQuestion(choice) {
    if (answered || !questions[qi]) return;
    answered = true; selected = choice;
    const q = questions[qi];
    const right = choice === q.correctIndex;
    if (right) score++;
    scoreBox.textContent = "Score: " + score + " / " + questions.length;
    answersBox.querySelectorAll("[data-quiz-answer]").forEach(button => {
      const n=Number(button.dataset.quizAnswer);
      button.disabled=true;
      if(n===q.correctIndex) button.classList.add("answer-correct");
      if(n===choice && !right) button.classList.add("answer-wrong");
    });
    const pointList = q.key.slice(0,3).map(x => "<li>"+escapeHtml(x)+"</li>").join("");
    const unitInfo = officialUnitInfo(cls.value, sub.value, q);
    feedback.innerHTML =
      '<div class="quiz-feedback ' + (right?"is-correct":"needs-review") + '">' +
      '<strong>' + (right ? "Correct — good work!" : "Not quite — revise this concept.") + '</strong>' +
      '<p><b>Correct answer:</b> ' + escapeHtml(q.answer) + '</p>' +
      '<p><b>Understand it:</b> ' + escapeHtml(q.explain) + '</p>' +
      '<h4>Board revision checklist for this topic</h4><ul>' + pointList + '</ul>' +
      (unitInfo ? '<p><b>Official Class 10 unit weightage:</b> ' + escapeHtml(unitInfo) + ' This is unit-level weightage, not guaranteed marks from this question.</p>' : '<p><b>Board priority:</b> exact unit-wise weightage is not shown here. Check the current official syllabus and model paper instead of relying on exam predictions.</p>') +
      '<p><b>What to practise next:</b> ' + escapeHtml(boardGuidance(sub.value,q)) + '</p>' +
      '</div>';
    next.style.display = "inline-block";
  }
  function showResults() {
    count.textContent = "QUIZ COMPLETE";
    questionBox.textContent = "Revision complete for " + cls.value + " · " + sub.value + ".";
    answersBox.innerHTML = '<div class="quiz-result"><strong>' + score + ' / ' + questions.length + ' correct</strong><p>' +
      (score === questions.length ? "Excellent. Now practise writing the answers without options." :
       score >= Math.ceil(questions.length*0.7) ? "Good progress. Revisit the questions you missed and explain each answer in your own words." :
       "Use the feedback to revise the key concepts, then repeat the quiz before moving on.") +
      '</p><p>Board reminder: practise from the prescribed textbook and check the official UPMSP question bank and model paper. This quiz does not predict the exam paper.</p></div>';
    feedback.innerHTML = "";
    next.textContent = "Try again ↻";
    next.style.display = "inline-block";
    next.dataset.restart = "true";
    scoreBox.textContent = "Final score: " + score + " / " + questions.length;
  }
  cls.addEventListener("change", updateSubjects);
  sub.addEventListener("change", updateTopics);
  topic.addEventListener("change", startQuiz);
  next.addEventListener("click", () => {
    if (next.dataset.restart === "true") {
      delete next.dataset.restart; startQuiz(); return;
    }
    qi++; showQuestion();
  });
  updateSubjects();
})();