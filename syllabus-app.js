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
    if (/social science/.test(v)) {
      if (/revolution|nationalism|colonial|pastoral|empire|global world|industrialisation|print culture|partition|kingship|forest society|1857|cold war|bipolarity|harappan|bhakti|sufi/.test(t)) return "History ko kahani ki tarah samjho: pehle situation kya thi, change kyun hua, kya events hue, aur unke results kya nikle. Dates ko ratne ke bajay cause → event → consequence ki chain banao. Answer mein prescribed textbook ka specific example do.";
      if (/india:|physical features|drainage|climate|vegetation|wildlife|population|geography|resources and development|forest, water|agriculture|minerals|manufacturing|lifelines|transport|human geography|landforms|earth|oceans|rainwater|rainwater harvesting/.test(t)) return "Geography mein 4 sawal pucho: kya hai, kahan milta hai, kyun hota hai, aur log/environment par kya asar hota hai. Map question mein title, direction, legend aur labels check karo; example se point clear karo.";
      if (/democracy|constitution|federalism|rights|judiciary|election|political|security|government|citizenship|secularism|power sharing|gender, religion|outcomes of democracy/.test(t)) return "Civics mein pehle concept ki simple definition, phir uska purpose, main features aur ek relevant example likho. Institutions ke roles mix mat karo; question mein 'explain', 'compare' ya 'why' jo poochha hai, uska seedha jawab do.";
      if (/development|people as resource|poverty|money|credit|market|demand|production|income|budget|banking|trade|employment|consumer|sectors of the economy|economic/.test(t)) return "Economics ko real-life situation se jodo: problem kya hai, kis wajah se aayi, kin logon par asar hua, aur kya result ya solution ho sakta hai. Definition ke baad simple example likho, aur data use karo to uska source/date check karo.";
      return "Social Science mein pehle identify karo ki question History, Geography, Civics ya Economics ka hai. History mein cause-event-result; Geography mein location-cause-impact; Civics mein definition-role-example; Economics mein problem-reason-effect samjho. Question ke command word ka seedha answer do.";
    }
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

  function simpleExplanation(subject, item) {
    const t = String(item.title || "").toLowerCase();
    const v = String(subject || "").toLowerCase();
    if (/real numbers|number system|rational|irrational/.test(t)) return "Numbers ko do useful groups mein samjho: rational numbers ko fraction p/q ke roop mein likh sakte hain (jaise 3/4); irrational numbers ko aise exact fraction mein nahi likh sakte (jaise √2). Question mein number ka type pehchano, aur proof maanga ho to har step likho.";
    if (/polynomial/.test(t)) return "Polynomial, x jaise variable aur numbers se bani expression hoti hai. Example: x² + 5x + 6. Iske zeroes woh x-values hain jin par expression 0 ban jata hai. Question mein expression ko factorise karke ya solve karke answer check karo.";
    if (/pair of linear equations|linear equation/.test(t)) return "Jab do conditions ek saath di hon, dono equations ko saath solve karna hota hai. Example: x+y=7 aur x-y=1. Dono jodo: 2x=8, isliye x=4; phir y=3. Answer ko dono equations mein rakhkar check karo.";
    if (/quadratic/.test(t)) return "Quadratic equation mein x² term hota hai, jaise x²-7x+12=0. Aise numbers dhoondo jinka product 12 aur sum -7 ho, yani -3 aur -4. Isliye (x-3)(x-4)=0 aur solutions 3, 4 hain.";
    if (/arithmetic progression|sequences and series/.test(t)) return "AP mein har next term same number add ya subtract karke milti hai. Example: 3, 7, 11, 15 mein common difference 4 hai. Pehle first term aur common difference identify karo; phir nth-term ya sum ka formula chuno.";
    if (/trigonometric|trigonometry/.test(t)) return "Trigonometry right-angled triangle ke sides aur angle ka relation batati hai. SOH-CAH-TOA yaad rakho: sin = opposite/hypotenuse, cos = adjacent/hypotenuse, tan = opposite/adjacent. Pehle angle ke hisaab se sides label karo, phir ratio lagao.";
    if (/coordinate geometry|straight lines|three-dimensional geometry/.test(t)) return "Coordinates point ki position batate hain. 2D mein point (x,y) hota hai; 3D mein (x,y,z). Distance, slope ya equation nikalte waqt coordinates ko sahi order mein rakho, negative signs aur formula dhyan se check karo.";
    if (/triangle/.test(t)) return "Triangles ke questions mein pehle diagram banao aur equal angles/sides mark karo. Similar triangles ka shape same hota hai, size alag ho sakta hai; unki matching sides ka ratio same hota hai. Proof mein theorem ka naam aur corresponding sides likho.";
    if (/circle|tangent/.test(t)) return "Circle ke question mein centre, radius aur point of contact ko diagram mein mark karo. Tangent circle ko ek hi point par touch karti hai, aur us point tak ka radius tangent ke perpendicular hota hai. Diagram ke saath theorem laga kar steps likho.";
    if (/statistics/.test(t) && /math/.test(v)) return "Statistics data ko ek useful number se summarize karta hai. Mean average hota hai, median beech ki value, aur mode sabse zyada baar aane wali value. Pehle data/frequency sahi arrange karo aur question mein maanga gaya measure hi calculate karo.";
    if (/probability/.test(t) && /math/.test(v)) return "Probability kisi event ke hone ka chance hai. Fair die par even number (2,4,6) ke 3 favourable results hain aur total 6 results, isliye chance 3/6=1/2. Favourable outcomes ko total equally likely outcomes se divide karo.";
    if (/integral/.test(t)) return "Integration ko derivative ka reverse aur area/jama hone wali quantity nikalne ka tareeqa samjho. Example: ∫2x dx = x² + C, kyunki x² ka derivative 2x hai. Indefinite integral mein +C bhoolna mat.";
    if (/derivative|differentiability|limits/.test(t)) return "Derivative batata hai ki koi value kitni tezi se badal rahi hai; graph par ise tangent ki slope samajh sakte ho. Formula apply karne se pehle function aur point identify karo, phir result ka meaning samjho.";
    if (/matrix/.test(t) && /math/.test(v)) return "Matrix numbers ki rows aur columns wali table hai. Addition ke liye dono matrices ka size same hona chahiye. Multiplication mein pehli matrix ke columns aur doosri ke rows ki count match honi chahiye; aam taur par AB aur BA same nahi hote.";
    if (/determinant/.test(t) && /math/.test(v)) return "Determinant square matrix se nikla ek number hai. Iska value zero ho to matrix singular hoti hai aur uska inverse nahi hota. Calculation mein signs aur row/column ke terms carefully likho.";
    if (/math/.test(v) && /\bsets?\b|\brelations?\b|\bfunctions?\b/.test(t)) return "Set ek clearly defined collection hota hai, jaise A={1,2,3}. Function mein har input ka exactly ek output hota hai. Domain inputs hain aur range actual outputs; question mein element, subset aur mapping ko confuse mat karo.";
    if (/chemical reaction|equation/.test(t) && /chemistry|science/.test(v)) return "Chemical reaction mein starting substances badal kar naye substances banate hain. Equation balance karne ka matlab dono taraf har element ke atoms ki count same karna hai. Formula ke chhote numbers (subscripts) change mat karo; coefficients badlo.";
    if (/acid|base|salt|ph/.test(t)) return "Acid, base aur salt ke alag properties hoti hain. Indicator ya pH se solution ka nature samajh sakte ho; aqueous solution mein pH 7 se kam generally acidic aur pH 7 se zyada basic hota hai. Question mein observation ke saath reason bhi likho.";
    if (/metal|non-metal/.test(t)) return "Metals aur non-metals ko properties aur reactions se compare karo. Reactivity series batati hai kaun sa metal zyada reactive hai. More reactive metal kisi less reactive metal ko uske compound se displace kar sakta hai, jab reaction conditions allow karein.";
    if (/biomolecule/.test(t) && /biology/.test(v)) return "Biomolecules living things mein milne wale compounds hain. Carbohydrates energy mein, proteins structure/enzymes mein, lipids membranes aur energy storage mein, aur nucleic acids genetic information mein role play karte hain. Prescribed textbook ke examples se functions yaad karo.";
    if (/carbon and its compounds|hydrocarbon|organic chemistry|haloalkane|alcohol|phenol|ether|aldehyde|ketone|carboxylic|amine|biomolecule/.test(t)) return "Organic chemistry mein compound ka structure aur functional group pehchanna important hai. Pehle carbon chain aur group identify karo, phir name, properties ya reaction likho. Same formula wale compounds ka structure alag bhi ho sakta hai.";
    if (/mole concept|basic concepts of chemistry/.test(t)) return "Mole particles ki bahut badi fixed count ko represent karne ka chemistry unit hai. Mass se mole nikalne ke liye mass ko molar mass se divide karo. Example: 18 g water ÷ 18 g/mol = 1 mol.";
    if (/chemical bonding|molecular structure/.test(t)) return "Atoms bonds bana kar stable arrangements banate hain. Ionic bond mein oppositely charged ions attract karte hain; covalent bond mein atoms electron pairs share karte hain. Structure draw karke batao ki electrons transfer hue ya share.";
    if (/cell|organelle/.test(t)) return "Cell body ki basic living unit hai. Cell membrane gate ki tarah substances ka movement control karti hai, nucleus genetic instructions rakhta hai, aur mitochondria energy release mein help karte hain. Har organelle ka naam uske function se connect karke yaad karo.";
    if (/life processes|digestion|breathing|circulation|excretion|plant physiology/.test(t)) return "Living things ko energy aur materials chahiye. Nutrition food leta hai, respiration usable energy release karta hai, transport materials body mein pahunchata hai, aur excretion wastes nikalta hai. Process ka order aur har step ka kaam samjho.";
    if (/reproduction/.test(t)) return "Reproduction se naye organisms bante hain. Sexual reproduction mein gametes aur fertilisation jaise steps important hain; asexual reproduction mein ek parent se offspring ban sakta hai. Question ke exact process ko steps aur diagram ke saath explain karo.";
    if (/heredity|inheritance|evolution|gene|genetics/.test(t)) return "Heredity ka matlab traits ka parents se offspring tak pass hona. Gene genetic information ka ek hissa hai. Inheritance question mein given traits ko carefully track karo aur variation ko evolution ke broader idea se jodo.";
    if (/light|optics|refraction|reflection/.test(t)) return "Light jab mirror se takrati ya ek medium se doosre mein jaati hai, uska path reflect ya bend ho sakta hai. Ray diagram banao, normal mark karo, sign convention follow karo, aur image ki position/nature ko words mein explain karo.";
    if (/electricity|current|circuit/.test(t)) return "Electric circuit mein current charge ke flow ko describe karta hai, voltage push jaisa difference hai aur resistance flow ko oppose karta hai. Example: V=12 V aur R=4 ohm ho to I=V/R=3 A. Formula ke saath unit bhi likho.";
    if (/oscillation|wave/.test(t)) return "Oscillation ka matlab kisi cheez ka baar-baar ek pattern mein aage-peeche hona, jaise swing. Wave disturbance ke through energy ek jagah se doosri jagah transfer karti hai. Frequency, time period, wavelength aur speed ko alag samjho; wave speed ke liye v=fλ use karo jab applicable ho.";
    if (/magnetic|electromagnetic induction|waves/.test(t)) return "Magnetism aur induction mein field ki direction aur change important hain. Diagram ya right-hand rule se direction dhoondo; induction mein magnetic flux ka change emf induce kar sakta hai. Cause, direction aur result ko alag-alag samjhao.";
    if (/motion|kinematics|force|laws of motion/.test(t)) return "Motion ko describe karne ke liye distance/displacement, speed/velocity aur acceleration ka difference samjho. Example: 100 m ko 20 s mein travel kiya, to average speed=100/20=5 m/s. Numerical mein formula, substitution aur unit dikhao.";
    if (/work|energy|power|gravitation|rotational/.test(t)) return "Physics ke numerical mein pehle given values aur required quantity likho. Sahi formula chuno, SI units match karo, values substitute karo, phir answer ka unit aur size check karo. Concept question mein formula ke symbols ka meaning bhi samjho.";
    if (/thermodynamics|kinetic theory|solutions|equilibrium|electrochemistry|kinetics|redox/.test(t)) return "Is topic ko cause aur result ki tarah padho: system mein kya change hua, kaunsi quantity measure hoti hai, aur condition badalne par result kaise badlega. Formula use karte waqt symbols, units aur assumptions check karo.";
    if (/mathematics/.test(v)) return "Maths ko steps wale puzzle ki tarah solve karo: given values likho, poochhi gayi quantity identify karo, right formula/rule choose karo, calculation dikhao, aur answer ko question mein rakhkar check karo. Example question aur sample working neeche di gayi hai.";
    if (/physics/.test(v)) return "Physics mein pehle phenomenon ko words ya diagram mein samjho, phir known values aur unknown quantity likho. Formula ke symbols ka meaning samjho, correct SI units ke saath values put karo, aur final answer ki unit/size check karo.";
    if (/chemistry/.test(v)) return "Chemistry mein pehle substance/particle aur reaction ka main idea samjho. Equations mein atoms conserve hote hain; structures, conditions aur terms ko clearly likho. Numerical ho to units ke saath steps dikhao.";
    if (/biology/.test(v)) return "Biology mein process ko sequence mein samjho: kya start hota hai, beech ke steps kya hain, aur result kya hota hai. Key term ka meaning, organ/function connection, aur prescribed diagram ke labels apne words mein explain karne ki practice karo.";
    if (/science/.test(v)) return "Science ke concept ko 3 parts mein samjho: definition, kaise/kyun hota hai, aur example ya effect. Numerical ho to working aur unit dikhao; biology topic ho to process aur labelled diagram jahan prescribed ho, revise karo.";
    if (/accountancy/.test(v)) return "Accountancy mein har transaction ka effect samjho: kaun sa account badla, debit/credit kyun hai, aur balance par kya asar pada. Entry karne se pehle data aur transaction date padho; phir working dikhao.";
    if (/business/.test(v)) return "Business Studies mein concept ka meaning, purpose, features aur real-life example samjho. Case-based question mein pehle situation se relevant clue dhoondo, phir correct concept name karke reason do.";
    if (/statistics/.test(t) && /economics/.test(v)) return "Economics mein statistics numbers/data ko collect, organise aur compare karne mein madad karta hai. Example: prices ya employment ka data table mein rakhkar trend dekho; source, unit aur time period clear hona chahiye.";
    if (/history|revolution|nationalism|colonial|empire|pastoral|industrialisation|global world|partition|kingship|cold war|bipolarity/.test(t) || /history/.test(v)) return "History ko kahani ki tarah samjho: pehle situation kya thi, change kyun hua, kya events hue, aur unke results kya nikle. Dates sirf ratne ke bajay cause → event → consequence ki chain banao. Answer mein specific example use karo.";
    if (/geography|climate|drainage|population|resources|vegetation|agriculture|transport|landforms|earth|ocean|human development/.test(t) || /geography/.test(v)) return "Geography mein 4 sawal pucho: kya hai, kahan milta hai, kyun hota hai, aur log/environment par kya asar hota hai. Map question mein title, direction, legend aur place labels check karo; example se point clear karo.";
    if (/democracy|constitution|federalism|rights|judiciary|election|political|security|government|citizenship|secularism/.test(t) || /civics|political science/.test(v)) return "Civics mein pehle concept ki simple definition, phir uska purpose, main features aur ek relevant example likho. Institutions ke roles mix mat karo; question mein 'explain', 'compare' ya 'why' jo poochha hai, uska seedha jawab do.";
    if (/economics|development|poverty|money|credit|market|demand|production|income|budget|banking|trade|employment|consumer/.test(t) || /economics/.test(v)) return "Economics ko real-life situation se jodo: problem kya hai, kis wajah se aayi, kin logon par asar hua, aur kya result ya solution ho sakta hai. Definition ke baad simple example likhne se answer samajhne mein easy hota hai.";
    if (/business|management|accountancy/.test(v)) return "Business/Accounts mein terms ka exact meaning samjho aur phir use situation ya entry par apply karo. Accounting question mein working aur debit-credit logic dikhao; business answer mein concept, reason aur example ko connected points mein likho.";
    if (/english|literature|writing|reading|grammar/.test(t) || /english|language/.test(v)) return "English mein pehle question ka command word samjho. Comprehension mein answer passage se support karo; literature mein prescribed text ka event/character use karo; writing mein required format, purpose aur grammar check karo.";
    return "Seedhe tareeke se padho: pehle topic ka meaning samjho, phir key points ko apne words mein bolo, phir neeche diya example solve/answer karo. Agar khud explain nahi kar paa rahe, usi point ko notes/textbook se dobara padho.";
  }
  function commonMistake(subject) {
    const v = String(subject || "").toLowerCase();
    if (/math/.test(v)) return "Sirf final answer likh kar steps skip mat karo. Formula/identity sahi choose karo, calculation dobara check karo, aur proof mein reason/theorem bhi likho.";
    if (/physics|chemistry|accountancy/.test(v)) return "Units ya debit-credit/reaction steps skip mat karo. Given values likho, required rule/formula batao, working dikhao aur final result ko check karo.";
    if (/science|biology/.test(v)) return "Terms ko ek doosre ke saath mix mat karo. Process ka order, correct scientific words aur labelled diagram (jab syllabus mein ho) practice karo.";
    if (/history/.test(v)) return "Events ko galat chronology mein mat likho, aur reason ya result pooche jaane par sirf dates ki list mat do.";
    if (/geography/.test(v)) return "Map labels, direction aur units miss mat karo; pattern batane ke saath reason aur example bhi do.";
    if (/civics|political/.test(v)) return "Definitions aur institutions ke roles mix mat karo. Har point ka reason ya relevant example do.";
    if (/economics|business/.test(v)) return "Definition rat kar chhod mat do. Concept ko given situation se jodo aur cause/effect ko clearly likho.";
    if (/english|language/.test(v)) return "Question se hatkar memorised paragraph mat likho. Format, grammar aur relevant text/passage evidence check karo.";
    return "Question ko poora padho, key term define karo, relevant point/example do, aur answer ko prescribed textbook se verify karo.";
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
      '<div class="simple-lesson"><h4>1. Bilkul simple language mein samjho</h4><p class="chapter-explain">' + escapeHtml(simpleExplanation(active.subject, item)) + '</p><details><summary>Thoda aur detail mein samjho</summary><p>' + escapeHtml(item.explain) + '</p></details></div>' +
      '<h4>2. Board ke liye ye important points yaad rakho</h4><ul class="chapter-points">' + points + '</ul>' +
      '<div class="worked-example"><h4>3. Example: question ko kaise solve/answer karna hai</h4><p class="self-question">' + escapeHtml(item.question) + '</p><p><strong>Sample answer / working:</strong> ' + escapeHtml(item.answer) + '</p><p class="small">Pehle sawal khud try karo, phir answer compare karo. Ye StudySpace practice example hai, official board question hone ka claim nahi.</p></div>' +
      '<div class="mistake-box"><h4>4. Common mistake se bacho</h4><p>' + escapeHtml(commonMistake(active.subject)) + '</p></div>' +
      (unitInfo ? '<div class="weightage-box"><strong>Official board unit weightage: ' + escapeHtml(unitInfo.label) + '</strong><p>' + escapeHtml(unitInfo.note) + '</p><p class="small">Official source: 2026–27 subject syllabus PDF linked below. Unit marks are not per-chapter predictions.</p></div>' : '<div class="weightage-box weightage-neutral"><strong>Board importance check</strong><p>Exact unit-wise marks are not displayed here for this class/subject. Check the linked official syllabus and current model paper instead of trusting guessed “most important questions”.</p></div>') +
      (item.formula ? '<div class="formula-box"><strong>Formula / key relation</strong><p>' + escapeHtml(item.formula) + '</p></div>' : '') +
      '<div class="exam-box"><h4>Board ke liye kya padhna hai?</h4><p>' + escapeHtml(boardPlan(active.subject)) + '</p><ol><li>Upar diye gaye core points bina dekhe explain karne ki koshish karo.</li><li>Prescribed textbook se isi topic ke solved example aur exercise questions karo.</li><li>Official UPMSP question bank/model paper mein isi subject ka question format check karo.</li></ol><p><strong>Important:</strong> ye revision priority hai, guaranteed exam prediction ya official marking scheme nahi.</p></div>' +

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
    addText("Simple explanation", 12, 2, "bold");
    addText(simpleExplanation(active.subject, active.item), 11, 4);
    addText("Further detail", 11, 2, "bold");
    addText(active.item.explain, 10, 4);
    addText("Important points to remember", 12, 2, "bold");
    active.item.key.forEach((p,i) => addText((i+1) + ". " + p, 11, 1));
    if (active.item.formula) {
      addText("Formula / key relation", 12, 2, "bold");
      addText(active.item.formula, 11, 4);
    }
    addText("Worked example / sample question", 12, 2, "bold");
    addText(active.item.question, 11, 2, "bold");
    addText("Sample answer / working: " + active.item.answer, 10, 4);
    addText("Common mistake to avoid", 12, 2, "bold");
    addText(commonMistake(active.subject), 10, 4);
    addText("Board ke liye kya padhna hai?", 12, 2, "bold");
    addText(boardPlan(active.subject), 10, 3);
    const pdfWeightage = officialUnitInfo(active.className, active.subject, active.item);
    if (pdfWeightage) {
      addText("Official board unit weightage", 12, 2, "bold");
      addText(pdfWeightage.label, 10, 1, "bold");
      addText(pdfWeightage.note, 10, 3);
    } else {
      addText("Weightage note", 10, 2, "bold");
      addText("Exact unit-wise weightage is not stated in this revision sheet. Check the official syllabus PDF; do not treat these notes as exam predictions.", 9, 3);
    }
    addText("Board revision checklist", 12, 2, "bold");
    addText("1. Explain the key points without looking. 2. Solve textbook questions. 3. Practise the current official question bank/model-paper format.", 10, 3);
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
  window.STUDYSPACE_LEARNING = { simpleExplanation, commonMistake };
  populateSubjects();
})();