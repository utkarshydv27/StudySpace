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

  function simpleExplanation(subject, item) {
    const t = String(item.title || "").toLowerCase();
    const v = String(subject || "").toLowerCase();
    if (/social science/.test(v)) {
      if (/revolution|nationalism|colonial|pastoral|empire|global world|industrialisation|print culture|partition|kingship|forest society|1857|cold war|bipolarity|harappan|bhakti|sufi/.test(t)) return "History ko kahani ki tarah samjho: pehle situation kya thi, change kyun hua, kya events hue, aur unke results kya nikle. Dates ko ratne ke bajay cause → event → consequence ki chain banao. Answer mein prescribed textbook ka specific example do.";
      if (/india:|physical features|drainage|climate|vegetation|wildlife|population|geography|resources and development|forest, water|agriculture|minerals|manufacturing|lifelines|transport|human geography|landforms|earth|oceans|rainwater|rainwater harvesting/.test(t)) return "Geography mein 4 sawal pucho: kya hai, kahan milta hai, kyun hota hai, aur log/environment par kya asar hota hai. Map question mein title, direction, legend aur labels check karo; example se point clear karo.";
      if (/democracy|constitution|federalism|rights|judiciary|election|political|security|government|citizenship|secularism|power sharing|gender, religion|outcomes of democracy/.test(t)) return "Civics mein pehle concept ki simple definition, phir uska purpose, main features aur ek relevant example likho. Institutions ke roles mix mat karo; question mein 'explain', 'compare' ya 'why' jo poochha hai, uska seedha jawab do.";
      if (/development|people as resource|poverty|money|credit|market|demand|production|income|budget|banking|trade|employment|consumer|sectors of the economy|economic/.test(t)) return "Economics ko real-life situation se jodo: problem kya hai, kis wajah se aayi, kin logon par asar hua, aur kya result ya solution ho sakta hai. Definition ke baad simple example likho, aur data use karo to uska source/date check karo.";
      return "Social Science mein pehle identify karo ki question History, Geography, Civics ya Economics ka hai. History mein cause-event-result; Geography mein location-cause-impact; Civics mein definition-role-example; Economics mein problem-reason-effect samjho. Question ke command word ka seedha answer do.";
    }
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
    if (/carbon and its compounds|hydrocarbon|organic chemistry|haloalkane|alcohol|phenol|ether|aldehyde|ketone|carboxylic|amine/.test(t)) return "Organic chemistry mein compound ka structure aur functional group pehchanna important hai. Pehle carbon chain aur group identify karo, phir name, properties ya reaction likho. Same formula wale compounds ka structure alag bhi ho sakta hai.";
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
    if (/science/.test(v) && !/social science|political science/.test(v)) return "Science ke concept ko 3 parts mein samjho: definition, kaise/kyun hota hai, aur example ya effect. Numerical ho to working aur unit dikhao; biology topic ho to process aur labelled diagram jahan prescribed ho, revise karo.";
    if (/accountancy/.test(v)) return "Accountancy mein har transaction ka effect samjho: kaun sa account badla, debit/credit kyun hai, aur balance par kya asar pada. Entry karne se pehle data aur transaction date padho; phir working dikhao.";
    if (/business/.test(v)) return "Business Studies mein concept ka meaning, purpose, features aur real-life example samjho. Case-based question mein pehle situation se relevant clue dhoondo, phir correct concept name karke reason do.";
    if (/statistics/.test(t) && /economics/.test(v)) return "Economics mein statistics numbers/data ko collect, organise aur compare karne mein madad karta hai. Example: prices ya employment ka data table mein rakhkar trend dekho; source, unit aur time period clear hona chahiye.";
    if (/civics|political science/.test(v) && /cold war|bipolarity|us dominance|security|globalisation/.test(t)) return "International politics mein samjho kaun se countries ya groups important the, unke beech competition/cooperation kyun tha, aur iska duniya par kya effect hua. Answer mein key term define karo, phir event/cause aur result ko sequence mein likho.";
    if (/history|revolution|nationalism|colonial|empire|pastoral|industrialisation|global world|partition|kingship|cold war|bipolarity/.test(t) || /history/.test(v)) return "History ko kahani ki tarah samjho: pehle situation kya thi, change kyun hua, kya events hue, aur unke results kya nikle. Dates sirf ratne ke bajay cause → event → consequence ki chain banao. Answer mein specific example use karo.";
    if (/geography|climate|drainage|population|resources|vegetation|agriculture|transport|landforms|earth|ocean|human development/.test(t) || /geography/.test(v)) return "Geography mein 4 sawal pucho: kya hai, kahan milta hai, kyun hota hai, aur log/environment par kya asar hota hai. Map question mein title, direction, legend aur place labels check karo; example se point clear karo.";
    if (/democracy|constitution|federalism|rights|judiciary|election|political|security|government|citizenship|secularism/.test(t) || /civics|political science/.test(v)) return "Civics mein pehle concept ki simple definition, phir uska purpose, main features aur ek relevant example likho. Institutions ke roles mix mat karo; question mein 'explain', 'compare' ya 'why' jo poochha hai, uska seedha jawab do.";
    if (/economics|development|poverty|money|credit|market|demand|production|income|budget|banking|trade|employment|consumer/.test(t) || /economics/.test(v)) return "Economics ko real-life situation se jodo: problem kya hai, kis wajah se aayi, kin logon par asar hua, aur kya result ya solution ho sakta hai. Definition ke baad simple example likhne se answer samajhne mein easy hota hai.";
    if (/business|management|accountancy/.test(v)) return "Business/Accounts mein terms ka exact meaning samjho aur phir use situation ya entry par apply karo. Accounting question mein working aur debit-credit logic dikhao; business answer mein concept, reason aur example ko connected points mein likho.";
    if (/english|literature|writing|reading|grammar/.test(t) || /english|language/.test(v)) return "English mein pehle question ka command word samjho. Comprehension mein answer passage se support karo; literature mein prescribed text ka event/character use karo; writing mein required format, purpose aur grammar check karo.";
    return "Seedhe tareeke se padho: pehle topic ka meaning samjho, phir key points ko apne words mein bolo, phir neeche diya example solve/answer karo. Agar khud explain nahi kar paa rahe, usi point ko notes/textbook se dobara padho.";
  }
  function workedExample(subject, item) {
    const t = String(item.title || "").toLowerCase();
    const v = String(subject || "").toLowerCase();
    const make = (situation, steps, result, takeaway) => ({ situation, steps, result, takeaway });
    const rules = [
      [/real numbers|number system|rational|irrational/, () => make(
        "Do students ko 3/4 aur √2 jaise numbers diye gaye hain. Unhe batana hai kaun sa rational hai.",
        ["3/4 ko do integers ke fraction ke roop mein likh sakte hain: numerator 3, denominator 4.", "√2 ko kisi do integers ke exact fraction ke roop mein nahi likh sakte.", "Isliye 3/4 rational aur √2 irrational hai."],
        "3/4 rational hai; √2 irrational hai.",
        "Number ka type batate waqt definition ke saath reason bhi likho.")],
      [/polynomial/, () => make(
        "Expression x² + 5x + 6 ko factorise karna hai.",
        ["Aise do numbers dhoondo jinka product 6 ho aur sum 5 ho.", "Ye numbers 2 aur 3 hain.", "Expression ko (x + 2)(x + 3) likho. Agar equation zero ke equal ho, har factor ko zero karke roots nikaalo."],
        "x² + 5x + 6 = (x + 2)(x + 3).",
        "Factors ke product ko expand karke original expression se match kar lo.")],
      [/pair of linear equations|linear equation|linear inequalities/, () => make(
        "Do conditions hain: x + y = 7 aur x − y = 1.",
        ["Dono equations jodo: 2x = 8, so x = 4.", "x + y = 7 mein x = 4 rakho: y = 3.", "Dono values original equations mein rakhkar check karo."],
        "x = 4, y = 3.",
        "Same operation dono sides par karo; final answer ko original condition mein check karo.")],
      [/quadratic/, () => make(
        "Equation x² − 7x + 12 = 0 solve karni hai.",
        ["Do numbers dhoondo jinka product +12 aur sum −7 ho: −3 aur −4.", "Equation ko (x − 3)(x − 4) = 0 likho.", "Har bracket zero ho sakta hai, isliye x = 3 ya x = 4."],
        "Roots 3 aur 4 hain.",
        "Factorisation ke baad dono roots likho aur substitute karke verify karo.")],
      [/arithmetic progression|sequences and series/, () => make(
        "Savings har week ₹100, ₹150, ₹200, ₹250 hoti hain.",
        ["Har baar ₹50 add ho raha hai, isliye common difference d = 50.", "Pehla term a = 100.", "Nth-term formula aₙ = a + (n−1)d use karo; 4th term ₹250 aati hai."],
        "Sequence arithmetic progression hai; har next term ₹50 badh rahi hai.",
        "Question mein nth term maangi hai ya total sum, pehle identify karo.")],
      [/coordinate geometry|straight lines|three-dimensional geometry/, () => make(
        "Map par point A=(1,2) aur B=(4,6) diye hain.",
        ["x-coordinate ka difference: 4−1 = 3.", "y-coordinate ka difference: 6−2 = 4.", "Distance formula se distance = √(3²+4²) = √25 = 5 units."],
        "A aur B ke beech distance 5 units hai.",
        "Negative coordinates ke saath brackets lagao aur formula mein x ke saath x, y ke saath y use karo.")],
      [/trigonometric|trigonometry/, () => make(
        "Right triangle mein chosen angle ke opposite side 3 cm aur hypotenuse 5 cm hai.",
        ["Chosen angle ke hisaab se opposite aur hypotenuse identify karo.", "sin θ = opposite ÷ hypotenuse.", "sin θ = 3 ÷ 5 = 0.6."],
        "sin θ = 3/5.",
        "Angle badlega to opposite/adjacent side labels bhi dobara check karne hote hain.")],
      [/triangle/, () => make(
        "Do triangles ke corresponding angles equal hain aur corresponding sides same ratio mein hain.",
        ["Diagram mein matching vertices ko same order mein label karo.", "Similarity theorem ke mutabik corresponding side ratios compare karo.", "Agar length ratio 2:3 hai, area ratio 2²:3² = 4:9 hoga."],
        "Similar triangles mein matching sides proportional hoti hain; areas ka ratio side ratio ka square hota hai.",
        "Similar aur congruent ek hi cheez nahi: similar ka size alag ho sakta hai.")],
      [/circle|tangent/, () => make(
        "Circle ko line P par sirf ek point T par touch karti hai; O centre hai.",
        ["Centre O se contact point T tak radius OT banao.", "Tangent aur radius OT ke beech angle 90° mark karo.", "Proof ya calculation mein isi theorem ko use karo."],
        "Radius at the point of contact tangent ke perpendicular hota hai.",
        "Diagram mein centre aur point of contact label karna proof ko clear karta hai.")],
      [/mensuration|areas related to circles|surface area and volume/, () => make(
        "Cylinder ka radius 3 cm aur height 5 cm hai; volume nikalna hai.",
        ["Volume ka formula V = πr²h likho.", "Values rakho: π × 3² × 5.", "3² = 9, so V = 135π cm³."],
        "Volume = 135π cm³ (approx. 424.1 cm³).",
        "Volume ke answer mein cubic units (cm³) aur area mein square units (cm²) likho.")],
      [/statistics/, () => make(
        "Marks hain 2, 4 aur 6; average nikalna hai.",
        ["Marks ka total: 2 + 4 + 6 = 12.", "Total observations 3 hain.", "Mean = total ÷ number = 12 ÷ 3 = 4."],
        "Mean = 4.",
        "Grouped-frequency question mein har value ki frequency ko dhyan se include karo.")],
      [/probability/, () => make(
        "Ek fair die roll karte hain. Even number aane ka chance kya hai?",
        ["Possible results: 1, 2, 3, 4, 5, 6 — total 6.", "Favourable even results: 2, 4, 6 — total 3.", "Probability = favourable ÷ total = 3/6 = 1/2."],
        "Probability = 1/2.",
        "Sample space sahi list karo; probability 0 aur 1 ke beech hoti hai.")],
      [/sets|relations and functions|functions/, () => make(
        "A = {1,2,3} aur B = {3,4} hain.",
        ["A∩B mein sirf common elements aate hain.", "Dono sets mein 3 common hai.", "Isliye intersection {3} hai."],
        "A∩B = {3}.",
        "Set ka element aur subset ko alag samjho; braces ka use sahi karo.")],
      [/complex numbers/, () => make(
        "z = 3 + 2i diya hai, jahan i² = −1.",
        ["Real part 3 hai.", "Imaginary part ka coefficient 2 hai.", "i² ko −1 se replace karna ho to sign carefully handle karo."],
        "Re(z)=3 aur Im(z)=2.",
        "Imaginary part ko 2i ka coefficient nahi, Im(z)=2 likha jata hai.")],
      [/binomial theorem/, () => make(
        "(1 + x)³ ka expansion chahiye.",
        ["Binomial coefficients 1, 3, 3, 1 use karo.", "Terms: 1³, 3(1)²x, 3(1)x², x³.", "Terms ko power ke order mein likho."],
        "(1+x)³ = 1 + 3x + 3x² + x³.",
        "Exponent aur x ki power step-by-step kam/badh rahi hai ya nahi, check karo.")],
      [/conic sections/, () => make(
        "Equation x² + y² = 25 di hui hai.",
        ["Standard circle equation x² + y² = r² se compare karo.", "r² = 25, so r = 5.", "Centre origin (0,0) hai."],
        "Circle ka radius 5 units hai.",
        "Standard form mein radius squared hota hai; radius khud nahi.")],
      [/limits and derivatives|derivative|differentiability/, () => make(
        "Function f(x)=x² hai. Rate of change ka rule nikalna hai.",
        ["Power rule: d(xⁿ)/dx = n xⁿ⁻¹.", "n=2 rakho: derivative = 2x.", "x=3 par slope poochhi ho to 2×3 = 6."],
        "f'(x)=2x; x=3 par slope 6 hai.",
        "Derivative function aur derivative at a point ko alag rakho.")],
      [/integrals/, () => make(
        "∫2x dx evaluate karo.",
        ["Socho kis function ka derivative 2x hota hai.", "x² ka derivative 2x hai.", "Indefinite integral mein constant C add karo."],
        "∫2x dx = x² + C.",
        "Indefinite integral mein +C bhoolna common mistake hai.")],
      [/applications of integrals/, () => make(
        "Curve y=x aur x-axis ke beech x=0 se x=2 tak area nikalna hai.",
        ["Pehle region ka rough sketch banao.", "Area = ∫₀² x dx.", "Antiderivative x²/2 use karke [x²/2]₀² = 2 nikaalo."],
        "Area = 2 square units.",
        "Curves ke beech area ho to upper curve minus lower curve use karo.")],
      [/differential equations/, () => make(
        "dy/dx = 2x aur y(0)=3 diya hai.",
        ["Dono sides integrate karo: y = ∫2x dx = x² + C.", "Condition y(0)=3 rakho: 3 = 0 + C.", "Isliye C=3."],
        "Particular solution y=x²+3 hai.",
        "Initial condition use karke integration constant zaroor find karo.")],
      [/matrices/, () => make(
        "A = [[1,2],[3,4]] aur B = [[5,6],[7,8]] hain.",
        ["Addition mein same position ke numbers add karo.", "Top-left entry: 1+5=6; top-right: 2+6=8.", "Isi tarah remaining entries add karo."],
        "A+B = [[6,8],[10,12]].",
        "Matrices add karne ke liye unka order same hona chahiye.")],
      [/determinants/, () => make(
        "2×2 matrix [[a,b],[c,d]] ka determinant nikalna hai.",
        ["Main diagonal ka product ad nikaalo.", "Doosri diagonal ka product bc nikaalo.", "Pehle product se second product subtract karo."],
        "Determinant = ad − bc.",
        "Diagonal products ko ulta subtract mat karo.")],
      [/linear programming/, () => make(
        "Shop ko profit maximise karna hai aur do resources ki limits hain.",
        ["Har limit ko inequality ki form mein likho.", "Graph par common feasible region shade karo.", "Corner points par objective value calculate karke compare karo."],
        "Linear programming mein optimum bounded feasible region ke kisi corner point par milta hai.",
        "Graph mein axes aur inequalities ki correct side shade karna zaroori hai.")],
      [/permutations and combinations/, () => make(
        "5 students mein se 2 students ki team select karni hai.",
        ["Team mein order matter nahi karta.", "Isliye permutation nahi, combination use hoga.", "⁵C₂ = 5!/(2!3!) = 10 possible teams."],
        "10 different teams ban sakti hain.",
        "Pehle decide karo order matters ya nahi.")],
      [/matter|state of matter/, () => make(
        "Ice cube room mein rakha hai aur dheere-dheere water ban raha hai.",
        ["Heat ice ko milti hai.", "Particles ki arrangement aur movement change hoti hai.", "Solid melt hokar liquid banta hai; chemical substance water hi rehta hai."],
        "Ye physical change hai, kyunki state badli hai, substance ki chemical identity nahi.",
        "Physical change aur chemical change ko alag pehchano.")],
      [/organisation in the living world|cell structure|cell organelle|cell/, () => make(
        "Ek cell ko school ki tarah imagine karo.",
        ["Cell membrane gate ki tarah andar-bahar ke movement ko control karti hai.", "Nucleus instructions store karta hai.", "Mitochondria energy release mein help karte hain."],
        "Har organelle ka apna role hai; cell milkar life processes chalata hai.",
        "Analogy yaad rakhne mein help karti hai, lekin exam answer mein real biological function likho.")],
      [/motion|kinematics/, () => make(
        "Student 100 metres ko 20 seconds mein cover karta hai.",
        ["Given: distance = 100 m, time = 20 s.", "Average speed = distance ÷ time.", "100 ÷ 20 = 5."],
        "Average speed = 5 m/s.",
        "Speed aur velocity mein difference hai: velocity mein direction bhi hoti hai.")],
      [/force|laws of motion/, () => make(
        "2 kg ka trolley 3 m/s² acceleration se move karta hai.",
        ["Given mass m=2 kg aur acceleration a=3 m/s².", "Newton's second law F=ma use karo.", "F=2×3=6 N."],
        "Net force = 6 newtons.",
        "Net force use karo, sirf ek force ka number nahi; unit N likho.")],
      [/work, energy|power/, () => make(
        "Force object ko force ki direction mein 5 m move karta hai; force 10 N hai.",
        ["Given F=10 N aur s=5 m.", "Same direction mein ho to W=Fs.", "W=10×5=50 J."],
        "Work = 50 joules.",
        "Force aur displacement same direction mein na ho to angle bhi consider karo.")],
      [/rotational motion/, () => make(
        "Door ko hinge se door handle par push karna aasan hota hai.",
        ["Torque turning effect ko describe karta hai.", "Hinge se perpendicular distance zyada ho to same force zyada turning effect de sakti hai.", "Torque formula mein lever arm aur angle dekho."],
        "Door handle hinge se door hota hai taaki torque zyada mile.",
        "Torque ke liye perpendicular lever arm use karo.")],
      [/gravitation/, () => make(
        "Ek ball chhodne par zameen ki taraf girti hai.",
        ["Earth aur ball ek doosre ko gravitational force se attract karte hain.", "Near Earth's surface ball ka weight W=mg hota hai.", "Mass object ki property hai; weight gravity par depend karta hai."],
        "Agar mass 2 kg aur g≈9.8 m/s² ho, weight ≈19.6 N.",
        "Mass (kg) aur weight (N) ko interchange mat karo.")],
      [/properties of matter|fluid|pressure|elasticity/, () => make(
        "Sharp pin blunt object ke muqable kam area par force lagati hai.",
        ["Pressure = force ÷ area.", "Same force aur smaller area se pressure zyada hota hai.", "Isi liye pin aasani se surface mein enter karti hai."],
        "Area kam hone par, same force ke liye pressure badhta hai.",
        "Formula use karte waqt area ki units consistent rakho.")],
      [/thermodynamics|kinetic theory/, () => make(
        "Garam chai thodi der baad room temperature ke paas aa jati hai.",
        ["Chai aur surrounding air ke beech energy transfer hota hai.", "Heat garam chai se cooler surroundings ki taraf transfer hoti hai.", "Temperature difference kam hota hai."],
        "System aur surroundings define karke heat/work signs apply karo.",
        "Heat aur temperature same cheez nahi hain.")],
      [/oscillation|wave/, () => make(
        "Wave ki frequency 5 Hz aur wavelength 2 m hai.",
        ["Given f=5 Hz aur λ=2 m.", "Wave-speed relation v=fλ use karo.", "v=5×2=10 m/s."],
        "Wave speed = 10 m/s.",
        "Frequency Hz mein aur wavelength metres mein ho to speed m/s aati hai.")],
      [/chemical reactions|chemical equation|redox/, () => make(
        "Hydrogen oxygen ke saath react karke water banata hai: H₂ + O₂ → H₂O.",
        ["Left side par oxygen ke 2 atoms hain; right par 1.", "H₂O ke aage coefficient 2 lagao: H₂ + O₂ → 2H₂O.", "Ab hydrogen right par 4 atoms ho gaye, so H₂ ke aage 2 lagao."],
        "Balanced equation: 2H₂ + O₂ → 2H₂O.",
        "Balance karne ke liye coefficients change karo; formula ke subscripts nahi.")],
      [/acid|base|salt|ph/, () => make(
        "Lemon juice blue litmus paper par drop kiya jata hai.",
        ["Lemon juice acidic hota hai.", "Blue litmus acid mein red ho jata hai.", "Observation ke saath 'acidic' conclusion likho."],
        "Blue litmus red hona acidic solution ka indicator hai.",
        "Test observation aur inference ko clear likho.")],
      [/metal|non-metal/, () => make(
        "Iron nail ko copper sulphate solution mein dala jata hai.",
        ["Iron, copper se zyada reactive hai.", "Iron copper ko solution se displace kar sakta hai.", "Blue colour kam ho sakta hai aur copper deposit form ho sakta hai."],
        "Fe + CuSO₄ → FeSO₄ + Cu.",
        "Reaction tabhi predict karo jab reactivity series aur given conditions match karein.")],
      [/carbon and its compounds|hydrocarbon/, () => make(
        "Cooking gas ya vehicle fuel ke compounds mein carbon-hydrogen bonds common hain.",
        ["Compound ka structure dekho.", "Sirf single C–C bonds hon to saturated hydrocarbon ho sakta hai; double/triple bond unsaturation dikhata hai.", "Structure se formula/name aur likely reaction identify karo."],
        "Bond type structure aur reaction behaviour samajhne mein help karta hai.",
        "Name likhne se pehle carbon chain aur bond type check karo.")],
      [/mole concept|basic concepts of chemistry/, () => make(
        "18 g water hai; water ki molar mass 18 g/mol hai.",
        ["Given mass = 18 g.", "Moles = mass ÷ molar mass.", "18 g ÷ 18 g/mol = 1 mol."],
        "Amount of water = 1 mol.",
        "Mass ko molar mass se divide karo; units cancel hokar mol bachna chahiye.")],
      [/structure of atom|atoms, nuclei|nuclear/, () => make(
        "Carbon-14 ka atomic number 6 aur mass number 14 hai.",
        ["Atomic number protons ki count batata hai: 6.", "Mass number = protons + neutrons.", "Neutrons = 14−6 = 8."],
        "Carbon-14 mein 6 protons aur 8 neutrons hain.",
        "Mass number aur atomic number ko confuse mat karo.")],
      [/classification and periodicity|periodic classification|d- and f-block/, () => make(
        "Periodic table mein sodium (Na) aur chlorine (Cl) ko compare karna hai.",
        ["Atomic number table mein element ki position decide karta hai.", "Group aur period se related electron arrangement/patterns samajhne mein help milti hai.", "Trend explain karte waqt period ya group direction clearly batao."],
        "Element properties ko position aur electronic configuration ke saath explain karo.",
        "Periodic trends ke answer mein direction (across/down) aur reason dono likho.")],
      [/chemical bonding|coordination compounds/, () => make(
        "Sodium chloride (common salt) ek familiar ionic-compound example hai.",
        ["Sodium electron lose karke positive ion bana sakta hai.", "Chlorine electron gain karke negative ion bana sakta hai.", "Opposite charges attract karke ionic bonding hoti hai."],
        "Na⁺ aur Cl⁻ ions ki attraction NaCl ko hold karti hai.",
        "Ionic transfer aur covalent sharing ko mix mat karo.")],
      [/solutions/, () => make(
        "10 g sugar ko paani mein dissolve karke 0.5 L solution banaya.",
        ["Sugar ki molar mass ke hisaab se moles nikaalo.", "Molarity = solute moles ÷ solution volume in litres.", "Volume ko litres mein use karna zaroori hai."],
        "Molarity ki unit mol/L ya M hai.",
        "Solvent volume ke bajay final solution volume use hota hai.")],
      [/electrochemistry|electromagnetic induction|current electricity/, () => make(
        "Battery, wire aur bulb ka simple circuit socho.",
        ["Battery potential difference provide karti hai.", "Closed circuit mein current flow ho sakta hai.", "Resistance current ko affect karti hai; V=IR relation use karo where applicable."],
        "Agar V=12 V aur R=4 Ω, current I=3 A.",
        "Circuit diagram, units aur direction rules ko question ke hisaab se use karo.")],
      [/chemical kinetics|rate of reaction|equilibrium/, () => make(
        "Powdered antacid tablet ek badi tablet se jaldi dissolve ho sakti hai, agar baaki conditions similar hon.",
        ["Powder ka exposed surface area zyada hota hai.", "Particles/solution ke contact ka area badhta hai.", "Isliye process ya reaction rate badh sakta hai, though exact rate conditions par depend karta hai."],
        "Surface area reaction/dissolution rate ko affect kar sakta hai.",
        "Rate, equilibrium position aur reaction yield ko ek hi cheez mat samjho.")],
      [/organic chemistry|haloalkane|alcohol|phenol|ether|aldehyde|ketone|carboxylic|amine/, () => make(
        "Do organic compounds mein pehle functional group compare karo.",
        ["Molecular structure mein main chain identify karo.", "–OH alcohol/phenol type compounds mein hota hai; –COOH carboxylic acid ka group hai.", "Functional group se naming aur typical reaction samajhne mein help milti hai."],
        "Structure se functional group identify karna organic chemistry ka pehla important step hai.",
        "Compound ka exact group dekhna; naam ke similarity se guess mat karna.")],
      [/life processes|digestion|breathing|circulation|excretion|plant physiology/, () => make(
        "Jab tum daudte ho, muscles ko energy aur oxygen ki demand badh jati hai.",
        ["Food se nutrients milte hain.", "Respiration cells mein energy release karta hai.", "Blood oxygen aur nutrients transport karta hai; wastes ko remove karna bhi zaroori hai."],
        "Nutrition, respiration, transport aur excretion alag processes hain, lekin ek doosre se connected hain.",
        "Breathing (air movement) aur cellular respiration ko same mat likho.")],
      [/reproduction/, () => make(
        "Flowering plant mein pollen anther se stigma tak transfer hota hai.",
        ["Is transfer ko pollination kehte hain.", "Uske baad compatible conditions mein pollen tube/fertilisation ke steps aa sakte hain.", "Pollination aur fertilisation alag events hain."],
        "Pollination = anther se stigma tak pollen ka transfer.",
        "Biology process ko order mein likho aur terms ko interchangeable mat use karo.")],
      [/heredity|inheritance|gene|genetics/, () => make(
        "Agar pea plant ke seed colour ke liye alleles diye hon, Punnett square se possible offspring combinations show kiye ja sakte hain.",
        ["Question se parent genotypes identify karo.", "Gametes likho aur square mein combine karo.", "Genotype ratio aur phenotype ratio ko alag state karo."],
        "Inheritance question ko table/Punnett square se step-by-step solve karo.",
        "Dominant ka matlab common ya better nahi hota.")],
      [/evolution/, () => make(
        "Population mein kuch insects ek environment mein better camouflage rakhte hain.",
        ["Heritable variation maujood hai.", "Predators se bachne wale insects zyada survive/reproduce kar sakte hain.", "Kai generations mein population mein trait ka proportion badal sakta hai."],
        "Natural selection population mein inherited traits ke proportions change kar sakti hai.",
        "Evolution ko individual ki need ke response mein instant change ke roop mein mat samjho.")],
      [/cell structure|cell organelle|cell\b|biomolecule/, () => make(
        "Body cells proteins banate hain jinhe growth aur repair mein use kiya ja sakta hai.",
        ["DNA mein instructions hoti hain.", "Ribosomes proteins banate hain.", "Proteins body mein structural aur functional roles nibhate hain."],
        "Organelles/functions ko process ke saath connect karke yaad karo.",
        "Organelle ka naam likhne ke baad uska exact function bhi state karo.")],
      [/diversity of living organisms|classification/, () => make(
        "Do organisms ko compare karne ke liye unke shared features use karo.",
        ["Reliable characteristics note karo.", "Prescribed classification criteria apply karo.", "Similar-looking organisms ko sirf appearance ke basis par classify na karo."],
        "Classification mein features aur relationships use kiye jate hain.",
        "Common name alag jagah alag ho sakta hai; scientific classification use karo.")],
      [/human health|disease|immunity|reproductive health/, () => make(
        "Vaccination se body ko kisi pathogen/antigen ko recognise karne ki preparation mil sakti hai.",
        ["Vaccine immune system ko antigen ya uski safe form se expose karti hai.", "Body immune response develop kar sakti hai.", "Future exposure par response faster/stronger ho sakta hai, vaccine aur disease ke hisaab se."],
        "Vaccines prevention mein help karti hain; har vaccine/disease ka effect same nahi hota.",
        "Prevention, treatment aur diagnosis ko alag samjho.")],
      [/biotechnology/, () => make(
        "Research mein aisa vector use kiya ja sakta hai jo desired DNA sequence ko host cell tak le jaye.",
        ["Required DNA sequence identify ki jati hai.", "Appropriate vector mein insert kiya jata hai.", "Host cell mein transfer karke result check kiya jata hai."],
        "Vector genetic material deliver karne ka carrier hai.",
        "Textbook ke prescribed stages aur terms ko sequence mein likho.")],
      [/ecology|environment|forest society|forest, water|resources and development|natural vegetation|food security/, () => make(
        "A local pond mein plants, insects, fish, water, sunlight aur soil interact karte hain.",
        ["Living parts biotic components hain.", "Water, light aur temperature abiotic components hain.", "Food chain and habitats ko affect karne wala change poore ecosystem par asar kar sakta hai."],
        "Ecosystem mein living aur non-living components connected hote hain.",
        "Food chain arrows energy transfer ki direction dikhate hain.")],
      [/french revolution|russian revolution|nationalism|nazism|industrialisation|colonialism|pastoral|harappan|empires|kingship|bhakti|sufi|partition|cold war|bipolarity|modernisation|global world/, () => make(
        "Kisi historical change ko samajhne ke liye socho: pehle society mein kya situation thi, phir logon ne change ki demand kyun ki.",
        ["Cause identify karo (jaise inequality, political conflict, economic pressure—topic ke according).", "Important event/movement ko sahi chronology mein likho.", "Consequence explain karo aur prescribed textbook ka actual historical example add karo."],
        "Strong history answer mein cause → event → consequence ka link hota hai.",
        "Specific dates/names sirf prescribed text se confirm karke likho; generic explanation ko actual event ka substitute mat banao.")],
      [/climate|drainage|physical features|earth|landforms|oceans|geography|population|transport|trade|agriculture|minerals|manufacturing|human development|resources/, () => make(
        "Ek region mein baarish kam ho jati hai aur logon ko irrigation ki zyada zaroorat padti hai.",
        ["Pehle physical factor identify karo: rainfall ya water availability.", "Phir agriculture/settlement par impact explain karo.", "Finally relevant map, example or conservation measure add karo, agar question maange."],
        "Geography answer ko place/factor → process → human/environmental effect se organise karo.",
        "Map work mein exact place names official textbook map se practise karo.")],
      [/democracy|constitution|federalism|rights|judiciary|election|political parties|secularism|power sharing|citizenship|security|government/, () => make(
        "Class ke students class representative choose karte hain aur representative ko students ke concerns teacher tak pahunchane hote hain.",
        ["Choice/election se representation milta hai.", "Representative ko group ki baat rakhni hoti hai.", "Accountability ke liye questions aur feedback ka process chahiye."],
        "Democratic ideas mein representation ke saath accountability bhi important hai.",
        "Classroom analogy concept samjhati hai; final answer mein political/constitutional term aur prescribed example use karo.")],
      [/economics|poverty|credit|demand|production|income|budget|banking|market|trade|consumer|sectors of the economy|accounting|cash book|ledger|trial balance|depreciation|financial statements|management|business|marketing|organisation|staffing/, () => make(
        "Ek small shop daily sales, purchase cost, customer demand aur cash balance track karti hai.",
        ["Pehle relevant data/concept identify karo.", "Us par rule apply karo—jaise total cost, sale, profit, account entry ya customer need.", "Result ko simple words mein interpret karo; only calculation/definition par stop mat karo."],
        "Business/economics answers concepts ko real decision or example se connect karte hain.",
        "Accountancy question ho to proper debit-credit entry/workings likho; economics/business ho to relevant assumptions mention karo.")],
      [/reading|comprehension|english|writing|grammar|literature|analysis|composition/, () => make(
        "Passage kehta hai ki heavy rain ke baad school garden mein paani jama tha. Question poochta hai ki plants ko nuksan kyun ho sakta hai.",
        ["Question ka key word 'why' identify karo.", "Passage se evidence lo: water remained around the roots.", "Apne words mein evidence ko answer se connect karo."],
        "Answer: roots ko oxygen kam mil sakti hai, jis se kuch plants ki growth affect ho sakti hai—provided passage/course context supports it.",
        "Comprehension mein answer passage ki information par base karo; writing mein required format and purpose follow karo.")],
      [/statistics for economics|collection and presentation of data|measures of central tendency/, () => make(
        "A student's weekly study hours are 2, 3 and 4.",
        ["Total hours = 2+3+4 = 9.", "Observations = 3.", "Mean = 9/3 = 3 hours."],
        "Mean study time is 3 hours.",
        "Mean outliers se affect ho sakta hai; data aur measure question ke mutabik choose karo.")],
      [/money and banking|national income|income determination|government budget|balance of payments/, () => make(
        "Family ka income ₹20,000 hai aur expenses ₹17,000 hain.",
        ["Income aur expenses ko same period ka banao.", "Saving = income − expense = ₹20,000−₹17,000.", "Result ko context mein explain karo."],
        "Saving ₹3,000 hai. Ye household example hai; national accounts ke formulas alag data/definitions use karte hain.",
        "Household example ko macroeconomic definition ke barabar mat samjho.")],
      [/accountancy|journal|ledger|cash book|trial balance|depreciation|cash flow|financial statements|share capital|debenture|partnership/, () => make(
        "Shop ₹500 ka stationery cash se kharidti hai.",
        ["Stationery expense/purchase ko transaction ke nature ke hisaab se identify karo.", "Cash account kam hota hai; corresponding expense/purchase account record hota hai.", "Journal entry prescribed rule ke mutabik banao aur ledger mein post karo."],
        "Transaction ko record karne se cash balance aur expense/purchase account dono affect hote hain.",
        "Exact debit-credit entry account type aur prescribed accounting treatment ke hisaab se likho.")],
      [/business studies|management|marketing|consumer protection|business environment/, () => make(
        "A local shop customers ki demand kam dekhkar product choice aur service timing review karti hai.",
        ["Problem ko identify karo: demand ya customer satisfaction.", "Relevant business concept apply karo—planning, marketing, service or consumer rights.", "Decision ka reason aur expected effect likho."],
        "Case-based answer mein situation ke clue ko named concept se connect karna hota hai.",
        "Case question mein concept ka naam aur case se evidence dono do.")],
      [/reading comprehension|reading and inference/, () => make(
        "Passage mein likha hai, 'Ravi carried an umbrella even though the sky was clear.' Question asks what this might suggest.",
        ["Passage ki exact information dekho.", "Possible inference banao, lekin sirf evidence se supported inference hi likho.", "Agar passage extra detail deta hai, usse answer confirm karo."],
        "An inference should be supported by context, not a random guess.",
        "Stated fact aur inference ko alag rakho.")],
      [/writing skills|writing and composition|formal writing|grammar|editing/, () => make(
        "School principal ko library hours badhane ke liye formal request likhni hai.",
        ["Purpose clear rakho aur correct format choose karo.", "Request ka reason aur practical suggestion short paragraphs mein likho.", "Salutation/closing, grammar, punctuation aur tone check karo."],
        "Formal writing mein format, purpose, clarity aur polite tone important hain.",
        "Question mein di hui format instructions ko exactly follow karo.")],
      [/literature|literary|text|prose|poetry/, () => make(
        "Question asks why a character changes their decision in a prescribed story.",
        ["Story ka relevant event ya dialogue find karo.", "Character ke reason ko text evidence se explain karo.", "Answer mein plot ko repeat karne ke bajay change ka meaning batao."],
        "Literature answer = direct point + prescribed-text evidence + explanation.",
        "Unrelated memorised summary answer ko strong nahi banati.")],
      [/physical world|measurement|units/, () => make(
        "A table is 1.2 m long; a student records it as 120 cm.",
        ["1 metre = 100 centimetres.", "1.2 × 100 = 120.", "Measurement same hai, sirf unit change hui."],
        "1.2 m = 120 cm.",
        "Calculations se pehle quantities ko consistent units mein convert karo.")]
    ];
    for (const [pattern, build] of rules) if (pattern.test(t)) return build();

    if (/math|physics|chemistry|accountancy/.test(v)) {
      return make("Topic se juda ek chhota practice case: " + item.question,
        ["Given information aur kya find/define karna hai, usko pehchano.", item.key[0] || "Relevant rule/formula choose karo.", "Ab sample answer compare karo aur har step ko apne words mein explain karo."],
        item.answer,
        "Sirf answer yaad mat karo; rule choose karne ka reason bhi samjho.");
    }
    if (/biology|science/.test(v)) {
      return make("Daily-life science se socho: " + item.question,
        ["Topic ka main term/organ/process identify karo.", item.key[0] || "Prescribed concept ko apply karo.", "Cause ya function ko result se connect karke explain karo."],
        item.answer,
        "Scientific term ka meaning aur process ka order clear rakho.");
    }
    return make("Topic ko ek example ke through apply karo: " + item.question,
      ["Question se key term identify karo.", item.key[0] || "Relevant concept ko use karo.", "Answer ko is concept se link karo: " + item.answer],
      item.answer,
      "Answer mein definition ke saath relevant reason ya example bhi do.");
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