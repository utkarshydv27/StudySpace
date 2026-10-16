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
    const topicExplanations = {
      "algebra": "Algebra mein letters jaise x unknown number ko represent karte hain. Example: 2x+3=11 mein 3 subtract karo, phir 2 se divide karo—x=4. Equation ko balance ki tarah treat karo: dono sides par same operation karo.",
      "geometry": "Geometry lines, angles aur shapes ke rules use karti hai. Example: straight line par angles ka total 180° hota hai; ek angle 110° ho to doosra 70° hoga. Diagram banao aur kaunsi property use ki hai, uska reason likho.",
      "mensuration": "Mensuration shape ka perimeter, area ya volume nikalti hai. Area flat surface ke liye square units (cm²) aur volume 3D space ke liye cubic units (cm³) mein hota hai. Pehle shape aur maangi gayi quantity pehchano, phir formula choose karo.",
      "introduction to trigonometry": "Right triangle mein chosen angle ke opposite, adjacent aur hypotenuse sides ko identify karo. SOH-CAH-TOA se sin, cos aur tan ke ratios yaad rakho. Example: opposite 3 aur hypotenuse 5 ho to sin θ=3/5.",
      "applications of trigonometry": "Heights aur distances mein real object ko right triangle ki tarah draw karte hain. Example: pole ki height aur ground distance di ho to tan θ = height/distance use ho sakta hai. Diagram, angle of elevation/depression aur known side clear mark karo.",
      "circles and tangents": "Tangent circle ko ek point par touch karti hai. Us point tak radius tangent ke perpendicular hota hai, yani 90° ka angle banta hai. Diagram mein centre, radius aur point of contact mark karke theorem apply karo.",
      "areas related to circles": "Is topic mein circle, sector aur combined shapes ka area nikalna hota hai. Example: shaded area ke liye bade shape ka area nikaal kar cut-out ka area subtract karo. Radius ko diameter se confuse mat karo; formula mein radius chahiye.",
      "linear inequalities": "Inequality equation jaisi hoti hai, lekin equal ke bajay <, >, ≤ ya ≥ signs hote hain. Important rule: dono sides ko negative number se multiply/divide karo to sign reverse hota hai. Solution ko number line par show karna bhi practise karo.",
      "permutations and combinations": "Permutation mein order matter karta hai; combination mein sirf selection matter karta hai. Example: race ke first aur second place alag order hain (permutation), par 2 students ki team mein order matter nahi karta (combination). Pehle decide karo order important hai ya nahi.",
      "binomial theorem": "Binomial theorem (a+b)^n ko terms mein expand karne ka rule hai. Example: (1+x)^3 = 1+3x+3x²+x³. Powers aur binomial coefficients ko sahi order mein likho; har term mein power ka total check karo.",
      "conic sections": "Circle, parabola, ellipse aur hyperbola ko specific geometric conditions/equations se describe kiya jata hai. Equation ka standard form pehchano aur centre, vertex, focus ya radius jaise features identify karo. Rough sketch equation ko samajhne mein help karta hai.",
      "matrices": "Matrix numbers ki rows aur columns wali table hai. Addition mein same position ke elements add karte hain; multiplication ke liye first matrix ke columns aur second ke rows ki count match honi chahiye. Generally AB, BA ke equal nahi hota.",
      "differential equations": "Differential equation mein unknown function ke saath uske derivatives hote hain. Pehle equation ka type/order identify karo, phir taught method se solve karo. Initial condition, jaise y(0)=3, integration constant nikalne ke kaam aati hai.",
      "vector algebra": "Vector mein magnitude aur direction dono hote hain. Dot product se scalar milta hai; non-zero perpendicular vectors ka dot product 0 hota hai. Example: (1,0)·(0,1)=1×0+0×1=0.",
      "linear programming": "Linear programming kisi quantity ko maximise/minimise karta hai, jab kuch limits/constraints hon. Inequalities se feasible region graph par shade karo, corner points nikaalo aur har point par objective function evaluate karo.",
      "matter: nature and behaviour": "Matter har cheez hai jiska mass hota hai aur jo space occupy karti hai. Solid mein particles apni position ke aas-paas vibrate karte hain; liquid mein slide kar sakte hain; gas mein zyada freely move karte hain. Ice ka melt hona physical change hai—water hi rehta hai, state badalti hai.",
      "organisation in the living world": "Living things cells se bani hoti hain; similar cells tissue, tissues organs aur organs organ systems banate hain. Cell membrane movement control karti hai, nucleus genetic instructions rakhta hai aur mitochondria energy release mein help karte hain. Cell se organism tak organisation ka order samjho.",
      "food production": "Food production mein crop variety, soil nutrients, irrigation, crop protection aur animal care important hain. Example: crop rotation different crops ko season ke hisaab se grow karke soil use ko balance kar sakti hai. Har farming method ka purpose aur suitable condition explain karna seekho.",
      "control and coordination": "Body ko stimuli par response dena hota hai. Garam cheez touch karne par hand jaldi withdraw karna reflex action ka example hai: receptors signal detect karte hain, nerve pathway message carry karta hai aur muscles respond karti hain. Hormones slower chemical messages ke through bhi coordinate karte hain.",
      "our environment": "Ecosystem mein living organisms aur unka non-living environment ek doosre se interact karte hain. Food chain energy transfer dikhati hai; decomposers dead matter ko break down karte hain. Non-biodegradable waste easily break nahi hota, isliye environment mein accumulate ho sakta hai.",
      "electricity": "Electric current charge flow ki rate hai; voltage potential difference aur resistance current ko oppose karti hai. Example: V=12 V aur R=4 Ω ho to Ohm's law I=V/R se current 3 A hoga. Formula, substitution aur unit likho.",
      "magnetic effects of electric current": "Current-carrying wire ke aas-paas magnetic field banta hai—compass needle deflect hona iska evidence hai. Current reverse karoge to field direction bhi reverse hoti hai. Diagram mein field lines aur current direction show karo; motor aur circuit safety prescribed topics bhi revise karo.",
      "reading comprehension": "Passage-based question ka answer passage ke evidence se do. Main idea ke liye central point dhoondo; inference ke liye clue + reason use karo. Example: passage mein rain ke baad garden flood hone ka zikr ho, to answer isi detail se connect hona chahiye, outside guess se nahi.",
      "reading and inference": "Inference woh conclusion hai jo passage ke clues se nikalta hai, lekin directly word-for-word nahi likha hota. Pehle relevant line dhoondo, phir batao woh line tumhare conclusion ko kaise support karti hai. Unrelated personal opinion ko passage ka fact mat banao.",
      "writing skills": "Writing mein pehle purpose, reader aur required format samjho. Formal letter/report/paragraph mein opening, logically ordered points aur suitable ending rakho. Final check: format, grammar, spelling, punctuation aur question ke saare parts cover hue ya nahi.",
      "writing and composition": "Composition ko plan karke likho: opening mein purpose/idea, middle mein organised points, aur end mein suitable conclusion. Formal task mein given format aur polite/appropriate tone follow karo. Example ya evidence sirf wahi add karo jo topic se relevant ho.",
      "formal writing": "Formal writing clear, respectful aur purpose-focused hoti hai. Agar principal ko request letter likhna ho, to request, reason aur practical suggestion seedhe likho; prescribed format, salutation, subject aur closing check karo.",
      "grammar in context": "Grammar sentence ke meaning ko clear banati hai. Verb ko subject ke saath match karo, tense ko consistent rakho aur punctuation se sentence ka structure clear karo. Correction mein pehle subject aur main verb identify karna helpful hai.",
      "grammar": "Grammar questions mein sentence ka subject, verb, tense aur context check karo. Example: 'She go' ki jagah 'She goes' hota hai because 'she' ke saath present simple mein verb par -s lagta hai. Rule ko example sentence mein apply karo.",
      "grammar and language": "Language rules ko sentence ke context mein use karo. Subject-verb agreement, tense, connectors aur punctuation meaning ko clear banate hain. Sirf rule yaad karne ke bajay incorrect sentence ko correct karke reason explain karo.",
      "literature response": "Literature answer mein pehle question ka direct point likho, phir prescribed story/poem se event, character ya line ka evidence do. Us evidence ka meaning explain karo. Sirf poori story retell karna analysis nahi hota.",
      "literature and long answers": "Long literature answer ko 3 parts mein plan karo: direct response, text ke relevant examples aur explanation/conclusion. Character ya theme ke baare mein claim karte waqt prescribed text se support do; unrelated memorised paragraphs avoid karo.",
      "literature analysis": "Literature analysis mein writer ne kya dikhaya aur kaise dikhaya, dono discuss hote hain. Example: character ka decision explain karte waqt event/dialogue quote ya refer karo, phir batao usse character/theme ke baare mein kya pata chalta hai.",
      "literature and critical response": "Critical response mein text ka meaning, evidence aur writer ke choices explain karo. Summary batati hai kya hua; analysis batata hai uska meaning/impact kya hai. Har claim ko prescribed text ke specific detail se support karo.",
      "writing and city life": "Ancient cities mein writing records, trade, tax aur administration ko organise karne mein help karti thi. Archaeologists clay tablets, buildings aur objects ko use karke city life ke baare mein inference nikaalte hain. Evidence aur historian ki interpretation alag rakhna important hai.",
      "empires and political power": "Large empire ko govern karne ke liye ruler ke saath officials, revenue systems, communication aur military control ki zaroorat hoti hai. Example: distant region mein taxes collect karne ke liye local administrators important hote hain. Specific empire ka evidence textbook se use karo.",
      "nomadic empires": "Nomadic societies mobile livelihood ke saath political power bhi build kar sakti thi. Mobility, horse-based travel, alliances, military organisation aur trade-route control kuch contexts mein advantage dete the. Kisi specific empire ka example aur administration prescribed chapter se revise karo.",
      "social hierarchies and changing traditions": "Social hierarchy society mein status, power aur access ke differences ko describe karti hai. Historians rulers, religious writings, ordinary people's records aur material remains jaise different sources compare karte hain, kyunki har source sirf ek perspective ya limited evidence de sakta hai.",
      "modernisation and historical change": "Modernisation ko ek change ke roop mein nahi, multiple social, political aur economic changes ke process ke roop mein padho. Technology, work, education ya government reforms se life badal sakti hai, lekin kuch traditions continue bhi karti hain. Prescribed period ka exact example zaroor jodo.",
      "harappan civilisation and archaeological evidence": "Harappan sites par city layouts, drainage, weights, seals aur artefacts ancient urban life ke clues dete hain. Example: planned streets aur drainage se town planning ka evidence mil sakta hai. Lekin artefact kya prove karta hai aur kya sirf possible interpretation hai, dono alag rakho.",
      "kingship, inscriptions and empires": "Inscriptions rulers ke orders, donations, titles ya public claims record kar sakte hain. Historian inscription ko context ke saath read karta hai: kisne banwaya, audience kaun thi, aur kya message diya ja raha tha. Inscription ke claim ko automatically complete history mat samjho.",
      "bhakti, sufi traditions and social change": "Bhakti aur Sufi traditions diverse devotional ideas, poetry aur community practices se linked thi. Kisi poem ya teaching ko samajhne ke liye uska central message, language, audience aur social context dekho. Alag traditions ko ek hi uniform group ki tarah mat describe karo.",
      "colonialism, rural society and 1857": "Colonial policies ne land revenue, rural livelihoods aur power relationships ko affect kiya. 1857 ko samajhne ke liye immediate events ke saath military, political, economic aur local grievances bhi dekhne hote hain. Different groups ke reasons aur experiences alag ho sakte the.",
      "national movement, partition and constitution": "Indian national movement mein alag social groups aur political ideas ne role play kiya. Partition history political decisions ke saath migration, violence, family loss aur memory ka bhi study hai. Constitution ko post-independence democratic rules/values ke context mein connect karo.",
      "geography as a discipline": "Geography places ke patterns aur physical/human processes ke links study karti hai. Example: settlements rivers ke paas kyun develop hoti hain—water, farming, transport aur history factors investigate karo. Location ke saath reason aur impact bhi likhna seekho.",
      "origin and evolution of the earth": "Earth aur solar system ki formation ko scientific models aur evidence ke through explain kiya jata hai. Ek common model gas/dust ke cloud ke gravity se contract hone aur material ke accretion se bodies banne ka hai. Prescribed textbook ke exact model/terms ko follow karo.",
      "interior of the earth and rocks": "Earth ke andar different layers hain; rocks un processes ke clues deti hain. Magma/lava cool hokar igneous rock bana sakta hai, sediments compact hokar sedimentary rock, aur heat/pressure existing rock ko metamorphic bana sakte hain. Formation process ke saath rock type yaad karo.",
      "landforms, climate and oceans": "Landforms weathering, erosion, deposition aur tectonic processes se shape hote hain; climate aur oceans heat/moisture movement se connected hain. Example: river highland se sediment laakar lower area mein deposit kar sakti hai. Process ke steps aur outcome ka labelled diagram practise karo.",
      "india: physical environment": "India ke relief, rivers, climate, soil aur vegetation physical environment ke main parts hain. Mountains rainfall patterns ko affect kar sakte hain aur rivers water, farming aur settlements ko support karti hain. Map location ke saath physical feature ka human impact bhi explain karo.",
      "human geography and population": "Human geography population, settlement, migration aur people-place relationships ko study karti hai. Example: density = people ÷ area; 10,000 log 5 km² mein hon to density 2,000 people/km² hogi. Population count, density aur distribution ko alag samjho.",
      "human development": "Human development income ke saath health, education aur opportunities ko bhi consider karta hai. Do places ki average income similar ho sakti hai, lekin schooling ya life expectancy alag ho sakti hai. Isliye ek single number se complete wellbeing decide nahi hoti.",
      "primary, secondary and tertiary activities": "Primary activity natural resources ko obtain karti hai (farmer crop ugata hai); secondary activity raw material process karti hai (mill flour banati hai); tertiary activity services provide karti hai (shop product bechti hai). Classification actual kaam ke basis par karo.",
      "transport, communication and trade": "Transport goods/people ko move karta hai, communication information share karta hai aur trade goods/services ka exchange hai. Example: road/rail/port factory ko raw material aur customers se connect karte hain. Cost, speed, capacity aur location advantages compare karo.",
      "india: population, resources and planning": "Population aur resources regions mein equally distribute nahi hote. Planning ka aim need, location, access aur sustainability ko saath dekhna hota hai. Map, data aur specific Indian example se regional difference explain karo.",
      "constitution: why and how": "Constitution government ke main rules set karta hai, institutions ke powers define karta hai aur citizens ke rights/values protect karne ka framework deta hai. Example: kisi authority ko unlimited power na dena arbitrary decisions ko limit karta hai. Values aur institutions dono revise karo.",
      "fundamental rights and citizenship": "Fundamental rights citizens/people ki protected freedoms aur equal treatment ko define karte hain; citizenship state membership se related status/rights-duties batati hai. Kisi right ka example dene ke baad batao ki usse kis unfair action se protection milti hai.",
      "elections, executive and legislature": "Legislature laws banati hai aur executive policies/laws implement karti hai; elections representatives choose karte hain. Exam answer mein institution ka naam, uska main kaam aur ek relevant example do. Legislature aur executive ke roles ko interchange mat karo.",
      "judiciary and federalism": "Judiciary laws interpret karti hai aur disputes decide karti hai; federalism powers ko different levels of government ke beech divide karta hai. Example: court constitutional issue review kar sakti hai, while state/local government apne assigned functions perform karti hai. Exact powers prescribed constitution/course se confirm karo.",
      "political philosophy: secularism, equality and rights": "Political philosophy fairness, equality, rights aur state ke role jaise concepts ko evaluate karti hai. Secularism mein state ko religions ke saath constitutional principles ke mutabik deal karna hota hai; equality ka matlab unjust discrimination se protection bhi hai. Definition ke saath reason/example likho.",
      "statistics for economics": "Statistics economics mein data collect, organise aur compare karne ke kaam aati hai. Example: prices ke 5 saal ke numbers ko table/graph mein rakh kar trend dekh sakte ho. Units, time period, source aur sample size check karo before conclusion.",
      "collection and presentation of data": "Primary data investigation ke liye directly collect hota hai; secondary data pehle se published source se milta hai. Data ko table, classification ya graph mein present karte waqt labels, units aur source likho. Unreliable data misleading conclusion de sakta hai.",
      "measures of central tendency": "Mean average hai, median ordered data ki middle value, aur mode sabse frequently aane wali value hai. Example: 2, 4, 6 ka mean (2+4+6)/3=4. Outliers ho to median kabhi-kabhi better summary hoti hai.",
      "introduction to microeconomics": "Microeconomics individual consumers, firms aur particular markets ke choices study karti hai. Scarcity ka matlab resources limited hain, isliye choice karni padti hai. Opportunity cost woh next-best option hai jo choice karne par chhoot jata hai.",
      "consumer behaviour and demand": "Demand batati hai ki consumers different prices par kitni quantity kharidne ko willing/able hain, baaki conditions same rahen. Price change ki wajah se curve par movement ho sakta hai; income, tastes ya related-good prices change hon to demand curve shift ho sakti hai.",
      "production, costs and market forms": "Production inputs (land, labour, capital, etc.) ko goods/services mein convert karta hai. Fixed cost output badalne par short run mein same reh sakti hai, variable cost output ke saath change hoti hai. Market forms competition aur firms ki market power se differ karti hain.",
      "introduction to accounting": "Accounting transactions ko record, classify aur summarise karti hai. Example: cash se supplies kharidne par supplies/purchases aur cash account dono affect hote hain. Accounting equation Assets = Liabilities + Capital ko balance check ke liye use karo.",
      "accounting principles and source documents": "Source document transaction ka evidence hota hai—jaise invoice, receipt ya voucher. Usme date, amount aur parties check karke record kiya jata hai. Accounting principles records ko consistent aur useful banane mein help karte hain.",
      "journal and ledger": "Journal transactions ko date-wise record karta hai; ledger same account ke entries ko group karta hai. Journal mein debit-credit rule apply karo, narration likho, phir entry ko correct ledger accounts mein post karo.",
      "cash book and bank reconciliation": "Cash book business ke cash/bank movements record karti hai. Bank statement aur cash book mein difference outstanding cheque, deposit timing, bank charges ya recording error ki wajah se ho sakta hai. Reconciliation mein har difference ko source ke saath explain karo.",
      "trial balance and errors": "Trial balance ledger ke debit aur credit balances ka summary hota hai. Total equal hona helpful check hai, lekin har error detect nahi hota—jaise wrong account mein equal amount post karna. Errors ko identify karke prescribed correction show karo.",
      "depreciation and financial statements": "Depreciation asset ki depreciable cost ko useful life ke periods mein allocate karti hai. Financial statements business ki performance aur position show karti hain. Asset cost, useful life, residual value aur method jo question mein diya ho, usi se calculation karo.",
      "accounting for partnership firms": "Partnership accounts partners ke capital, profit-sharing ratio, interest aur drawings jaise items track karte hain. Journal/appropriation entries se pehle partnership deed aur question ke given ratio/dates ko note karo.",
      "admission, retirement and dissolution": "Partner change hone par profit share badal sakta hai; new ratio, sacrificing/gaining ratio, goodwill aur revaluation adjust ho sakte hain. Pehle old shares likho, phir new shares aur differences nikaalo. Ratios ko same denominator par compare karna helpful hai.",
      "accounting for share capital and debentures": "Shares ownership capital ko represent karte hain; debentures company ka debt/borrowing hote hain. Example: 100 shares ₹10 each par full issue amount ₹1,000 ho sakta hai. Issue, calls, receipt aur forfeiture ke events ko separate journal entries mein record karo.",
      "financial statements and analysis": "Financial statements assets, liabilities, income aur expenses ka organised picture dikhati hain. Ratios compare karne ke liye useful hain—for example current ratio = current assets/current liabilities. Ratio calculate karne ke baad uska meaning bhi explain karo.",
      "cash flow statement": "Cash flow statement period ke cash inflows/outflows ko operating, investing aur financing activities mein classify karti hai. Closing cash nikalne ke liye opening cash plus net change use karo; non-cash items ko cash movement samajhkar include mat karo.",
      "nature and purpose of business": "Business goods/services provide karta hai aur usually economic return aim karta hai, lekin demand, competition aur uncertainty ke kaaran risk hota hai. Business, profession aur employment ko ownership, qualification, purpose aur payment ke basis par compare karo.",
      "forms of business organisation": "Sole proprietorship, partnership, company aur cooperative ownership, control, liability aur continuity mein differ karte hain. Example choose karte waqt business size, capital need, decision control aur legal responsibility dekho.",
      "public, private and global enterprises": "Public enterprises mein government ownership/control ka role hota hai; private enterprise private owners run karte hain. Global firms multiple countries mein operate kar sakti hain; joint venture defined project ke liye organisations ka collaboration hai.",
      "business services and finance": "Banking payments/credit, insurance specified risks, transport movement, warehousing storage aur communication information flow support karte hain. Ek shop ko inventory store, goods transport aur transactions pay karne ke liye different services ki need ho sakti hai.",
      "social responsibility and ethics": "Business ke decisions workers, consumers, community aur environment ko affect karte hain. Example: safe equipment workers ka risk reduce karta hai; pollution control local environment ko protect karta hai. Stakeholder + action + benefit ka link answer mein explain karo.",
      "small business and internal trade": "Small business local jobs aur specialised services provide kar sakta hai. Internal trade country ke andar producers, wholesalers, retailers aur consumers ko connect karta hai. Wholesale aur retail roles ko goods ki quantity aur final buyer ke basis par distinguish karo.",
      "nature and principles of management": "Management planning, organising, staffing, directing aur controlling ke through people/resources ko goal ki taraf coordinate karta hai. Efficiency resources ka sensible use hai; effectiveness intended goal achieve karna hai. Example-based questions mein dono words ka difference explain karo.",
      "business environment and planning": "Business environment mein economic, social, technological, political/legal aur competitive forces shamil ho sakte hain. Planning objectives aur actions set karti hai, lekin uncertainty ki wajah se plans ko review karna bhi zaroori hota hai.",
      "organising, staffing and directing": "Organising work/tasks aur authority define karta hai; staffing right people select/develop karti hai; directing team ko guide/motivate karta hai. Case question mein clue identify karo—job filling, task structure, motivation ya leadership—phir relevant function name karo.",
      "controlling and financial management": "Controlling actual performance ko standards se compare karke gap par action lene ka process hai. Financial management investment, financing aur dividend decisions se related hai. Question mein standard, actual result, difference aur corrective action identify karo.",
      "financial markets and marketing": "Financial markets savings ko funds ki need se connect karte hain. Marketing customer needs samajhkar product, price, place aur promotion ko plan karti hai. Product/marketing question mein customer, need aur offered value ka relation explain karo.",
      "consumer protection": "Consumer protection buyers ko safety, information, choice aur complaint/redress ke rights deta hai. Example: bill, product label aur warranty proof complaint mein help kar sakte hain. Rights ke saath consumer responsibility aur current official redress process bhi learn karo.",
      "the cold war and bipolarity": "Cold War mein US-led aur Soviet-led blocs ke beech strategic/political rivalry thi. Bipolarity ka matlab do dominant power centres. Many conflicts alliances, arms race aur proxy wars ke through hue; isey continuous direct battlefield war ke jaisa mat likho.",
      "end of bipolarity and us dominance": "Soviet Union ke breakup ne Cold War ke two-bloc structure ko badal diya. Causes ko short-term events aur longer political/economic pressures mein organise karo, phir newly independent states aur global power relations par impacts explain karo.",
      "south asia and international organisations": "International organisations countries ko shared problems par baat karne, rules develop karne aur cooperation ka forum deti hain. Regional cooperation ka example tabhi do jab organisation ka role sahi ho; political conflicts aur limitations bhi note karo.",
      "security and the environment": "Security sirf military threats tak limited nahi; water stress, climate risks, disease aur displacement bhi people's wellbeing ko affect kar sakte hain. Cause → effect → cooperation/response ke chain se answer organise karo.",
      "globalisation and contemporary politics": "Globalisation se countries trade, technology, culture aur production networks se connect hoti hain. Isse markets/jobs/opportunities badh sakte hain, lekin benefits equally distribute nahi hote aur kuch groups ko competition ya insecurity face karni pad sakti hai.",
      "national income accounting": "National income accounting economy ki production aur income ko measure karta hai. GDP jaise measures mein final goods/services include karte hain; intermediate goods ko separately add karne se double counting hogi. Indicator ka exact definition aur period state karo.",
      "money and banking": "Money exchange, value measurement aur saving ke kaam aata hai; banks deposits accept karte hain aur loans/services provide karte hain. Central bank monetary system aur policy ke important functions karta hai. Commercial banks aur central bank ke roles alag learn karo.",
      "income determination": "Simple Keynesian model mein planned aggregate expenditure aur output equal hon to equilibrium condition banti hai. Agar spending output se kam/zyada ho, inventories aur production decisions adjust ho sakte hain. Formula ke components aur model assumptions question ke mutabik likho.",
      "government budget": "Government budget planned receipts aur spending ka statement hai. Fiscal deficit broadly total expenditure minus receipts excluding borrowings hota hai. Revenue deficit, fiscal deficit aur primary deficit ke formula alag hain, isliye pehle exact term identify karo.",
      "balance of payments and exchange rates": "Balance of payments ek period mein residents aur rest of world ke economic transactions record karta hai. Exports-imports goods trade ka sirf ek part hain; services, income, transfers aur financial flows bhi matter karte hain. Exchange-rate change import/export prices ko affect kar sakta hai.",
      "indian economic development": "Economic development ko GDP growth se wider perspective mein dekha jata hai: employment, health, education, poverty, infrastructure aur distribution bhi matter karte hain. Current statistics use karte waqt source aur date likho; growth ka benefit har group tak equal pahunchna zaroori nahi.",
      "principles of inheritance": "Inheritance mein alleles parents se offspring tak pass hote hain. Punnett square possible combinations show kar sakta hai; genotype alleles ka combination aur phenotype observable trait hota hai. Dominant ka matlab 'better' ya 'more common' nahi hota.",
      "molecular basis of inheritance": "DNA genetic information store karta hai. Transcription mein DNA template se RNA banta hai; translation mein ribosome RNA code ke mutabik protein banata hai. DNA base-pairing, replication aur gene-expression ke steps sequence mein learn karo.",
      "evolution": "Evolution generations ke across population mein inherited traits ki frequency change hone ka process hai. Natural selection mein some heritable variations survival/reproduction mein advantage de sakti hain. Individual apni need se instantly evolve nahi karta.",
      "human health and disease": "Disease pathogens, body systems ya other causes se ho sakti hai; immunity body ko harmful agents recognise/respond karne mein help karti hai. Vaccine ka role, transmission route aur prevention ko specific disease ke context mein explain karo.",
      "biotechnology": "Biotechnology biological systems ya molecular tools ko useful applications ke liye use karti hai. Genetic engineering example mein required DNA identify, appropriate vector mein insert, host cell mein transfer aur result check karna shamil ho sakta hai. Prescribed stages in order learn karo.",
      "ecology and environment": "Ecology organisms ke populations, communities aur environment ke relationships study karti hai. Food chain energy transfer dikhati hai; decomposers nutrients recycle karne mein help karte hain. Biodiversity aur habitat protection ecosystem stability ko support karte hain."
    };
    if (topicExplanations[t]) return topicExplanations[t];
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
    if (/acid|base|salt|\bph\b/.test(t)) return "Acid, base aur salt ke alag properties hoti hain. Indicator ya pH se solution ka nature samajh sakte ho; aqueous solution mein pH 7 se kam generally acidic aur pH 7 se zyada basic hota hai. Question mein observation ke saath reason bhi likho.";
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
      [/acid|base|salt|\bph\b/, () => make(
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
    const topicExamples = {
      "algebra": () => make(
        "Equation 2x + 3 = 11 solve karni hai.",
        ["Dono sides se 3 subtract karo: 2x = 8.", "Dono sides ko 2 se divide karo: x = 4.", "Original equation mein value rakho: 2×4+3=11, isliye answer check ho gaya."],
        "x = 4.",
        "Equation ko balance ki tarah samjho: jo operation ek side karte ho, wahi doosri side bhi karo."),
      "geometry": () => make(
        "Ek straight line par do adjacent angles hain: 110° aur x.",
        ["Straight line ke angles ka total 180° hota hai.", "Equation likho: x + 110° = 180°.", "110° subtract karo."],
        "x = 70°.",
        "Diagram banao, known angles mark karo, phir theorem/angle property ka naam likho."),
      "india: size and location": () => make(
        "Map par India ko locate karke samjho ki alag-alag regions mein sunrise ka local time thoda alag kyun hota hai.",
        ["Earth west se east rotate karti hai.", "Longitude badalne se local solar time change hota hai.", "Standard time ek agreed meridian se liya jata hai, taaki desh mein common clock time use ho."],
        "India standard time ek common reference time deta hai; map par latitude, longitude aur neighbouring countries practise karo.",
        "Map answer mein direction, location aur correct place names use karo."),
      "electoral politics and institutions": () => make(
        "School class representative choose karne ke liye sab students vote karte hain.",
        ["Candidates apne plans batate hain.", "Students apna vote dete hain aur votes count hote hain.", "Fair process ke liye voter list, secret ballot/counting jaise safeguards hote hain—board answer mein official election institutions ke roles likho."],
        "Election se representatives choose hote hain; election process ko fair aur accountable banana institutions ki responsibility hai.",
        "Election Commission, legislature, executive aur judiciary ke roles ko ek-doosre ke saath mix mat karo."),
      "control and coordination": () => make(
        "Kisi ne garam bartan touch kiya aur haath jaldi peeche kheench liya.",
        ["Skin ke receptors heat/pain stimulus detect karte hain.", "Nerve signals spinal cord tak jaate hain aur motor signal muscles tak pahunchta hai.", "Muscles contract karke haath hata dete hain; baad mein brain sensation ko consciously process karta hai."],
        "Is fast automatic response ko reflex action kehte hain.",
        "Reflex arc ke parts sequence mein likho, aur receptor, sensory neuron, spinal cord, motor neuron aur effector ka role samjho."),
      "light: reflection and refraction": () => make(
        "Paani ke glass mein pencil daalne par pencil bent ya displaced si dikhti hai.",
        ["Light pencil se aate hue paani aur hawa ke boundary par guzarti hai.", "Medium change hone par light ki speed change hoti hai aur ray bend ho sakti hai.", "Isi effect ko refraction kehte hain; ray diagram se incident ray, normal aur refracted ray label karo."],
        "Pencil ka apparent bend refraction ka everyday example hai.",
        "Reflection mein ray wapas bounce karti hai; refraction mein medium change karte waqt direction/speed badal sakti hai."),
      "electricity": () => make(
        "Circuit mein voltage 12 V aur resistance 4 Ω hai; current find karna hai.",
        ["Given V=12 V, R=4 Ω.", "Ohm's law I=V/R use karo.", "I=12/4=3 A."],
        "Current = 3 A.",
        "Formula ke saath A (ampere) unit likho aur resistance/voltage ke units check karo."),
      "magnetic effects of electric current": () => make(
        "Compass ko current-carrying wire ke paas rakho; compass needle turn karti hai.",
        ["Electric current wire ke aas-paas magnetic field banata hai.", "Compass needle magnetic field ke direction se align karne ki koshish karti hai.", "Current reverse karoge to magnetic field ki direction bhi reverse hoti hai."],
        "Current ka magnetic effect compass needle se observe kiya ja sakta hai.",
        "Right-hand thumb rule ya prescribed direction rule ke steps clear likho."),
      "development": () => make(
        "Do villages ki average income same hai, lekin ek village mein school aur clinic nahi hain.",
        ["Average income ek indicator hai, poori quality of life nahi.", "Education, health, safe water aur distribution bhi compare karo.", "Dono villages ke public facilities aur opportunities dekhkar fuller judgement banao."],
        "Development ko sirf income se measure karna incomplete hai.",
        "Growth, average income, income distribution aur human development ko alag concepts ki tarah explain karo."),
      "neural and chemical coordination": () => make(
        "Exam se pehle heartbeat tez ho sakti hai; body mein neural signals aur hormones dono roles play karte hain.",
        ["Nervous system electrical signals ke through fast communication karta hai.", "Endocrine glands hormones blood mein release kar sakti hain.", "Hormones target cells/organs par effect karte hain; exact response hormone par depend karta hai."],
        "Neural signals aur hormones coordination ke different but connected methods hain.",
        "Hormone ka naam, source gland aur function tabhi likho jab prescribed chapter mein ho aur sure ho."),
      "social hierarchies and changing traditions": () => make(
        "Ek historical event ke baare mein ruler ka inscription aur ordinary people ka account alag detail de sakte hain.",
        ["Dono sources ka time, author aur purpose identify karo.", "Dekho kis group ka perspective represent ho raha hai.", "Sources ko compare karke similarities, differences aur limitations explain karo."],
        "Historians multiple sources compare karte hain taaki ek source ki bias ya gaps ko samajh saken.",
        "Source se kya pata chalta hai aur kya infer kiya ja raha hai, dono ko alag rakho."),
      "public, private and global enterprises": () => make(
        "Do companies ek naya product develop karne ke liye resources aur expertise share karne ka agreement karti hain.",
        ["Dono parties ka contribution identify karo.", "Common goal aur risks/returns ke arrangement ko samjho.", "Aise cooperative business arrangement ko joint venture kaha ja sakta hai, agreement ke details ke hisaab se."],
        "Joint venture mein parties defined enterprise ke liye milkar kaam karti hain.",
        "Public/private ownership aur joint venture jaise arrangement ko alag terms samjho."),
      "social responsibility and ethics": () => make(
        "Factory smoke filters lagati hai aur workers ko safety equipment deti hai.",
        ["Pollution control community/environment ko protect karne mein help karta hai.", "Safety equipment workers ke risk ko reduce karne mein help karta hai.", "Business decision ko stakeholders aur ethical responsibility se connect karo."],
        "Profit ke saath safety, society aur environment par impact bhi business decisions mein important hai.",
        "Business example mein stakeholder, action aur expected benefit explain karo."),
      "vector algebra": () => make(
        "Vector a=(1,0) aur b=(0,1) coordinate plane mein hain.",
        ["Dot product: a·b = 1×0 + 0×1.", "Calculation 0+0=0 hoti hai.", "Zero dot product non-zero vectors ke perpendicular hone ko indicate karta hai."],
        "a·b = 0; vectors perpendicular hain.",
        "Dot product scalar hota hai; cross product ka result vector hota hai."),
      "electric charges and fields": () => make(
        "Positive point charge ke aas-paas electric field ki direction draw karni hai.",
        ["Imagine ek tiny positive test charge rakha hai.", "Positive source charge use repel karega.", "Isliye electric field lines positive point charge se bahar ki taraf point karti hain."],
        "Positive point charge ke field lines radially outward hoti hain.",
        "Field direction positive test charge par lagne wali force ki direction hai."),
      "electrostatic potential and capacitance": () => make(
        "Capacitor par charge Q=6 C hai aur potential difference V=3 V hai.",
        ["Capacitance ka relation C=Q/V hai.", "Values put karo: C=6/3.", "Calculation karke units C/V, ya farad, likho."],
        "Capacitance = 2 F.",
        "Capacitance charge aur potential difference ka ratio hai; charge ki unit coulomb aur potential ki volt hai."),
      "moving charges and magnetism": () => make(
        "Charged particle magnetic field ke bilkul parallel move kar raha hai.",
        ["Magnetic force ka magnitude F=|q|vB sinθ hai.", "Parallel motion ke liye θ=0° aur sin0°=0.", "Isliye magnetic force zero hota hai."],
        "F=0 jab velocity field ke parallel/antiparallel ho, ideal relation ke mutabik.",
        "Magnetic force velocity aur field dono par depend karti hai; charge rest par ho to magnetic force zero hota hai."),
      "optics": () => make(
        "Converging lens ki focal length f=+0.5 m hai.",
        ["Lens power P=1/f (f metre mein).", "P=1/0.5=2.", "Converging lens ke liye prescribed sign convention use karke positive power likho."],
        "Lens power +2 dioptres hai.",
        "Focal length ko centimetre se metre mein convert karo before using P=1/f."),
      "primary, secondary and tertiary activities": () => make(
        "Ek farmer wheat ugata hai, mill wheat se flour banati hai, aur shop flour customer ko bechti hai.",
        ["Wheat ugana natural resource produce karna hai: primary activity.", "Flour manufacture raw material process karta hai: secondary activity.", "Shop ki selling/service activity tertiary sector mein aati hai."],
        "Farmer = primary, mill = secondary, shop = tertiary.",
        "Activity ko sector mein classify karte waqt kaam kya ho raha hai, woh dekho."),
      "globalisation and contemporary politics": () => make(
        "Ek T-shirt ka cotton ek country mein grow hota hai, kapda doosri jagah banta hai aur product kai countries mein sell hota hai.",
        ["Raw material, manufacturing, transport aur sales different places par ho sakte hain.", "Companies aur workers ko naye markets aur competition dono mil sakte hain.", "Benefits aur costs groups ke beech equal nahi batne zaroori."],
        "Globalisation places ko trade, production, technology aur culture ke through connect karti hai.",
        "Answer mein ek benefit aur ek challenge/unequal effect example ke saath explain karo."),
      "indian economic development": () => make(
        "GDP badh raha hai, lekin kuch households ki income aur public services mein improvement kam hai.",
        ["GDP overall economic production ka indicator hai.", "Average aur distribution dekho: growth ka benefit kis ko mila?", "Health, education, jobs aur infrastructure jaise indicators bhi consider karo."],
        "GDP growth akela prove nahi karta ki har household ki wellbeing improve hui.",
        "Economic development ke answer mein growth ke saath distribution aur quality-of-life aspects bhi likho."),
      "admission, retirement and dissolution": () => make(
        "Partners A aur B ka old profit ratio 3:2 hai. Naya partner C ko 1/4 share diya jata hai aur baaki share old ratio mein banta hai.",
        ["Remaining share = 1−1/4 = 3/4.", "A ko (3/5)×(3/4)=9/20 aur B ko (2/5)×(3/4)=3/10 milta hai.", "A ka sacrifice=3/5−9/20=3/20; B ka sacrifice=2/5−3/10=1/10. Dono sacrifices ka total 1/4 hai, jo C ke share ke equal hai."],
        "Sacrificing ratio A:B = 3/20:1/10 = 3:2.",
        "Admission questions mein old share, new share aur sacrifice/gain ko same denominator par likhkar compare karo.")

      ,
      "food production": () => make(
        "Ek farmer har saal same crop ugata hai aur soil nutrients kam hone lagte hain.",
        ["Soil mein crop growth ke liye nutrients chahiye.", "Farmer crop rotation, suitable manure/fertilisers, irrigation aur pest management jaise methods consider karta hai.", "Legume crop rotation mein use karne se kuch conditions mein soil nitrogen improve ho sakta hai."],
        "Balanced crop planning soil health aur long-term yield ko support kar sakti hai.",
        "Manure, fertiliser, irrigation aur crop rotation ka difference aur suitable use explain karna practise karo."),
      "the french revolution": () => make(
        "France mein old regime ke dauraan society unequal thi aur state ko financial problems bhi thi.",
        ["Third Estate mein common people par tax ka burden aur political inequality ka issue tha.", "1789 mein revolutionary events ne old order ko challenge kiya.", "Revolution ke ideas liberty, equality aur popular sovereignty ki debates ko influence karte rahe."],
        "Causes ko social inequality, economic crisis aur political conflict ke links ke saath explain karo.",
        "Answer mein causes, key events aur consequences ko alag headings ya connected points mein rakho."),
      "socialism and the russian revolution": () => make(
        "First World War ke dauraan Russia mein food shortages, war losses aur Tsar ke rule se dissatisfaction badhi.",
        ["War aur economic pressure ne public anger badhaya.", "1917 mein revolutions hui aur Tsarist rule ka end hua.", "Bolsheviks ne October 1917 mein power li; baad ke developments ne Soviet state ko shape kiya."],
        "War, social conditions aur political organisation ko revolution ke causes ke roop mein link karo.",
        "February aur October 1917 ke events ko ek hi event mat likho; chronology revise karo."),
      "nazism and the rise of hitler": () => make(
        "Post-war Germany mein economic hardship, political instability aur resentment ne extremist politics ke liye space banaya.",
        ["Versailles settlement aur economic crises jaise factors se resentment badhi.", "Nazis ne propaganda, nationalism aur scapegoating ka use kiya.", "Power consolidate hone ke baad dictatorship aur persecution hui."],
        "Economic crisis apne aap dictatorship nahi banata; institutions, political choices aur propaganda bhi matter karte hain.",
        "Nazi policies ke victims aur persecution ko seriously, accurately aur textbook evidence ke saath explain karo."),
      "forest society and colonialism": () => make(
        "Forest area mein colonial government timber supply ke liye trees aur forest access ko regulate karti hai.",
        ["Commercial forestry ke liye selected tree species ko priority mil sakti hai.", "Local communities ke grazing, fuel, cultivation aur collection rights restrict ho sakte hain.", "People ke livelihoods aur forest-use practices par impact padta hai."],
        "Forest policy ke answer mein policy goal, local impact aur resistance/adjustment ke examples jodo.",
        "Har forest community ka experience same nahi tha; prescribed case study ka naam use karo."),
      "pastoralists in the modern world": () => make(
        "Pastoral family season ke hisaab se apne animals ko grazing aur water wale areas tak le jaati hai.",
        ["Pasture aur water availability season ke saath change hoti hai.", "Seasonal movement animals ko feed karne mein help karta hai.", "Borders, grazing restrictions aur land-use changes routes ko affect kar sakte hain."],
        "Pastoral mobility ek strategy hai jo environment aur livelihood conditions se linked hoti hai.",
        "Pastoralist groups ke naam, route aur specific experiences current prescribed chapter se revise karo."),
      "nationalism in europe": () => make(
        "French Revolution ke baad citizenship aur sovereignty ke ideas Europe ke different regions mein spread hue.",
        ["People ne nation aur shared political identity ke ideas par debate ki.", "Unification movements, wars aur leaders ne borders/political structures ko affect kiya.", "Nationalism ne kuch movements ko unite kiya, aur kuch contexts mein exclusion bhi create kiya."],
        "Nationalism ko sirf ek slogan nahi, ideas + movements + political change ki process ke roop mein samjho.",
        "Map/timeline aur key personalities ko official textbook ke hisaab se practise karo."),
      "nationalism in india": () => make(
        "Colonial rule ke against alag-alag groups ne freedom movement mein hissa liya, lekin unki concerns hamesha identical nahi thi.",
        ["Non-Cooperation aur Civil Disobedience jaise movements ke goals aur methods samjho.", "Peasants, workers, business groups aur women ki participation ke examples dekho.", "Movement ki reach aur limits ko dono explain karo."],
        "National movement ko many social groups ki participation aur different expectations ke through samjho.",
        "Movement ka date/name likhne ke saath uska cause, method aur outcome bhi explain karo."),
      "the making of a global world": () => make(
        "Ek commodity grower, trader, shipper, factory aur customer alag countries mein ho sakte hain.",
        ["Raw material ek region mein produce hota hai.", "Transport aur trade usse doosri jagah le jaate hain.", "Prices, migration, policy aur technology se producers aur consumers dono affect ho sakte hain."],
        "Global links ka history trade, migration, labour, disease, technology aur policy ke through study kiya jata hai.",
        "Textbook ke period-specific example ko use karo; modern example akela historical evidence nahi hai."),
      "the age of industrialisation and print culture": () => make(
        "Printed books aur newspapers ideas ko pehle se zyada readers tak pahunchane mein help kar sakte hain.",
        ["Printing se copies ko relatively large scale par produce karna possible hua.", "Readers, publishers, writers aur authorities ke beech new relationships bane.", "Ideas ka spread education, religion aur politics par different effects la sakta tha."],
        "Technology ka impact sirf machine par nahi, readers, workers aur public discussion par bhi dekho.",
        "Industrialisation aur print culture ke topics ko separate concepts samajhkar examples revise karo."),
      "resources and development": () => make(
        "A village soil erosion rokne ke liye contour ploughing, trees aur water conservation use karta hai.",
        ["Resource ka type aur local problem identify karo.", "Suitable conservation/planning method chuno.", "Explain karo method resource quality aur future use ko kaise protect karta hai."],
        "Sustainable resource use present need aur future availability dono ko consider karta hai.",
        "Resource classification aur resource planning ke stages separately revise karo."),
      "forest, water, agriculture and minerals": () => make(
        "Rainfall irregular ho to farmer rainwater harvesting aur irrigation scheduling consider karta hai.",
        ["Water source aur local requirement identify karo.", "Storage, efficient irrigation ya watershed management jaise method ka role explain karo.", "Benefit ke saath limitation bhi note karo, jaise cost ya local conditions."],
        "Resource management place, climate, demand aur community needs ke hisaab se plan hota hai.",
        "Topic-specific map locations, crops/minerals aur conservation methods official list se practise karo."),
      "manufacturing and lifelines of the economy": () => make(
        "Textile factory ko cotton, workers, electricity, water aur market tak transport chahiye.",
        ["Raw material aur labour identify karo.", "Power, water, transport aur market access location ko affect karte hain.", "Transport/communication finished goods ko customers tak le jaate hain."],
        "Industry ki location multiple factors ka result hoti hai; ek factor se explanation complete nahi hoti.",
        "Manufacturing aur lifelines topics mein prescribed examples/map work bhi revise karo."),
      "power sharing and federalism": () => make(
        "Country mein national, state aur local governments ke paas different responsibilities hain.",
        ["Constitution ya law authorities ke functions divide kar sakta hai.", "Multiple levels local needs aur wider national issues handle karte hain.", "Power sharing conflicts ko negotiate karne aur concentration ko limit karne mein help kar sakti hai."],
        "Federalism mein constitutional division of powers important feature hai.",
        "Horizontal power sharing (institutions) aur vertical power sharing (levels of government) ko distinguish karo."),
      "gender, religion, caste and political parties": () => make(
        "Election mein candidates different communities ke concerns raise karte hain; rules ensure karne chahiye ki voters ko equal rights milein.",
        ["Identity aur social differences ko identify karo.", "Dekho political process representation ko kaise affect kar raha hai.", "Example ke saath inclusion, discrimination ya party role explain karo."],
        "Democracy mein social identities political life ko influence kar sakti hain, lekin discrimination ko justify nahi karti.",
        "Stereotype ya unsupported generalisation ke bajay textbook-based example use karo."),
      "outcomes of democracy": () => make(
        "Kisi local government ka decision logon ko explain kiya jata hai aur citizens complaints raise kar sakte hain.",
        ["Accountability check karo: decision-makers ko answer dena padta hai ya nahi.", "Responsiveness check karo: public concerns consider hue ya nahi.", "Equality, dignity aur public services jaise outcomes ke evidence dekho."],
        "Democracy ke outcomes ko evidence aur limitations ke saath evaluate karna hota hai.",
        "Sirf 'democracy good/bad hai' mat likho; criterion aur example ke saath reason do."),
      "money, credit and globalisation": () => make(
        "Small shop formal bank loan aur informal moneylender ke loan compare karti hai.",
        ["Interest rate, collateral, repayment rules aur transparency compare karo.", "Formal credit ka access har person ko equally available hai ya nahi, ye bhi dekho.", "Globalisation ke case mein supply chains, trade aur worker/consumer impacts add karo."],
        "Credit useful ho sakta hai, lekin loan ki terms repayment aur borrower ke risk ko determine karti hain.",
        "Interest, collateral, formal/informal credit aur global production links ke terms clear rakho."),
      "people as resource, poverty and food security": () => make(
        "Family ke paas income ho, lekin food prices badhne se healthy meals afford karna mushkil ho jaye.",
        ["Income aur food affordability dono dekho.", "Food availability, access aur stability food security ke important parts hain.", "Public distribution, nutrition support aur livelihood jaise measures ke role ko prescribed course ke according explain karo."],
        "Food security sirf food ka market mein hona nahi; households ka us tak reliable access bhi zaroori hai.",
        "Poverty, unemployment aur food security ke definitions ko alag-alag learn karo."),
      "writing and city life": () => make(
        "City ke officials grain deliveries aur taxes ka record maintain karna chahte hain.",
        ["Repeated transactions ko record karna useful hai.", "Writing se records, administration aur trade information preserve ki ja sakti hai.", "Archaeologists tablets aur city remains se past urban life infer karte hain."],
        "Writing aur urban administration/record-keeping ka link ancient city studies mein important hai.",
        "Archaeological evidence kya show karta hai aur historian kya infer karta hai, alag batao."),
      "empires and political power": () => make(
        "Large empire ko distant regions govern karne ke liye local officials, revenue collection aur communication systems chahiye.",
        ["Central ruler authority establish karta hai.", "Officials taxes, orders aur administration manage kar sakte hain.", "Local responses aur limits bhi empire ki power ko affect karte hain."],
        "Empire ki power military control ke saath administration, resources aur legitimacy par bhi depend karti hai.",
        "Specific empire ke examples, sources aur terminology textbook se revise karo."),
      "nomadic empires": () => make(
        "Mobile pastoral groups animals, routes aur seasonal resources ke saath move karte hain; kuch groups political/military power bhi build karte hain.",
        ["Mobility terrain aur supply lines par advantage de sakti hai.", "Alliances, military organisation aur trade routes control power ko affect kar sakte hain.", "Conquest ke baad administration aur settled populations ke saath relations bhi matter karte hain."],
        "Nomadic societies ko sirf movement se define mat karo; their political and economic organisation bhi study karo.",
        "Prescribed empire/leader ka actual historical evidence aur dates verify karke likho."),
      "modernisation and historical change": () => make(
        "Kisi society mein new transport, factories ya government reforms aate hain.",
        ["Change ke pehle ki situation describe karo.", "Naye technology/policy se daily life, work aur power kaise badle, identify karo.", "Kuch features continue aur kuch change hue, dono compare karo."],
        "Modernisation ko ek single event nahi; social, economic aur political changes ke process ke roop mein study karo.",
        "Answer mein jis specific society/period ka chapter hai, uske prescribed examples zaroor add karo."),
      "geography as a discipline": () => make(
        "Map par dekha gaya ki kuch settlements river ke paas hain aur kuch desert areas mein sparse hain.",
        ["Pattern locate karo.", "Water, relief, climate aur transport jaise possible factors consider karo.", "Ek factor ko guaranteed single cause na batao; evidence ke saath link explain karo."],
        "Geography places ke patterns aur physical/human factors ke relationships ko study karti hai.",
        "Location batane ke saath cause aur impact bhi explain karne ki practice karo."),
      "origin and evolution of the earth": () => make(
        "Solar system formation ko samjhane wale model mein gas aur dust ka cloud gravity se contract hota hai.",
        ["Gravity matter ko ek region ki taraf pull karti hai.", "Central region se Sun aur around material se smaller bodies form ho sakte hain.", "Scientific model ko observations/evidence se compare kiya jata hai."],
        "Earth ki formation ko solar-system formation ke broader model se connect karke samjho.",
        "Prescribed textbook mein jis theory/model par emphasis hai, uski terminology aur evidence wahi use karo."),
      "interior of the earth and rocks": () => make(
        "Volcano se nikla lava thanda hokar hard rock banata hai.",
        ["Lava molten material hai jo surface par aata hai.", "Cooling aur solidification se igneous rock form ho sakti hai.", "Rock type ko uski formation process se link karo."],
        "Igneous rocks molten material ke cooling/solidification se banti hain.",
        "Igneous, sedimentary aur metamorphic rocks ki formation ko compare karo."),
      "human geography and population": () => make(
        "Ek town mein 10,000 people 5 km² area mein rehte hain.",
        ["Population density = people ÷ area.", "10,000 ÷ 5 = 2,000.", "Unit people per km² likho."],
        "Population density = 2,000 people/km².",
        "Population count aur population density ko mix mat karo."),
      "human development": () => make(
        "Do places ki income similar hai, lekin ek mein life expectancy aur schooling better hai.",
        ["Income development ka ek dimension hai.", "Health aur education indicators compare karo.", "Explain karo ki opportunities aur public services overall human development ko affect karte hain."],
        "Human development ko income ke saath health, education aur opportunities se assess kiya jata hai.",
        "A single indicator se full development conclusion mat nikalo."),
      "the cold war and bipolarity": () => make(
        "Second World War ke baad United States aur Soviet Union major rival power centres ban gaye.",
        ["Dono systems/strategic interests ke differences samjho.", "Alliances aur arms competition ne wider world politics ko affect kiya.", "Many conflicts proxy wars, diplomacy aur blocs ke through hue."],
        "Bipolarity ka matlab world politics mein do dominant power centres ka hona.",
        "Cold War ko direct continuous US–USSR battlefield war ke roop mein define mat karo."),
      "end of bipolarity and us dominance": () => make(
        "Soviet Union ke breakup ke baad pehle wala two-bloc structure change ho gaya.",
        ["Breakup aur independence of republics ko chronology mein samjho.", "Former Soviet states ke political/economic transitions ko note karo.", "Global power relations par consequences explain karo."],
        "End of bipolarity ne international relations aur regional politics ko reshape kiya.",
        "Immediate cause, long-term factors aur after-effects ko separate karke answer do."),
      "south asia and international organisations": () => make(
        "Neighbouring countries flood response, trade ya public health par cooperation karna chahti hain.",
        ["Shared issue identify karo.", "Regional/global organisation discussion aur cooperation ka forum de sakti hai.", "Cooperation ki possibilities ke saath political differences/limitations bhi note karo."],
        "International organisations countries ko dialogue aur collective action ke forums deti hain, but results depend on members and rules.",
        "Organisation ka naam tabhi likho jab uska role aur relevance sure ho."),
      "security and the environment": () => make(
        "Long drought se water, crops aur livelihoods par pressure badhta hai.",
        ["Environmental change ko identify karo.", "Food/water access, health, displacement ya livelihoods par impact trace karo.", "Possible local aur international cooperation measures discuss karo."],
        "Non-traditional security concerns logon ki wellbeing aur stability ko affect kar sakte hain.",
        "Security ke traditional (military) aur non-traditional (environment/health) dimensions alag define karo."),
      "equilibrium": () => make(
        "Reversible reaction ek closed system mein aage aur peeche dono directions mein chal sakti hai.",
        ["Equilibrium par forward aur reverse reactions ki rates equal hoti hain.", "Concentrations constant dikh sakti hain, lekin reaction microscopic level par rukti nahi.", "Concentration, pressure ya temperature changes ka effect prescribed equilibrium rules se predict karo."],
        "Chemical equilibrium dynamic hota hai; forward aur reverse reaction rates equal hoti hain.",
        "Equal rates ka matlab concentrations equal hona zaroori nahi."),
      "dual nature of radiation and matter": () => make(
        "High-enough-frequency light metal par padti hai aur electrons eject ho sakte hain.",
        ["Photoelectric emission ke liye frequency threshold se upar honi chahiye.", "Light frequency photon energy se linked hai.", "Intensity aur frequency ka effect alag samjho; prescribed equation use karo."],
        "Photoelectric effect light ke particle-like behaviour ka evidence deta hai.",
        "Threshold frequency aur intensity ko interchange mat karo."),
      "human reproduction and reproductive health": () => make(
        "Human reproduction mein sperm aur ovum milkar zygote form karte hain.",
        ["Fertilisation gametes ke fusion ko kehte hain.", "Zygote cell division se development start karta hai.", "Placenta pregnancy mein maternal aur foetal systems ke beech material exchange support karta hai."],
        "Gamete, fertilisation, zygote aur placenta ke roles ko correct sequence mein samjho.",
        "Biology answers scientific and respectful language mein likho; structures aur functions mix mat karo."),
      "electromagnetic waves": () => make(
        "Radio waves communication ke liye aur X-rays medical imaging mein use hoti hain.",
        ["Electromagnetic spectrum mein waves ki frequency aur wavelength different hoti hain.", "Vacuum mein electromagnetic waves speed of light se travel karti hain.", "Wave type ko uski wavelength/frequency aur application se connect karo."],
        "Radio, visible light, X-rays aur other EM waves same family ke hain, but frequency/wavelength ranges differ karti hain.",
        "Spectrum ka order prescribed textbook ke chart se practise karo."),
      "business services and finance": () => make(
        "Shop goods purchase karti hai, unhe warehouse mein store karati hai, insurance leti hai aur customer tak transport karati hai.",
        ["Warehousing goods ko temporarily store karti hai.", "Transport goods ko move karta hai; insurance specified financial risk cover kar sakta hai.", "Banking payments aur working capital mein help kar sakti hai."],
        "Business services alag problems solve karti hain—storage, movement, payment aur risk.",
        "Service ka naam, function aur simple example pair mein yaad karo."),
      "national income accounting": () => make(
        "Ek economy mein final goods and services ka market value ek given year mein measure karna hai.",
        ["Final goods/services include karo.", "Intermediate inputs ko final output ke saath dobara count mat karo.", "Same period aur market-price conventions use karke GDP-type aggregate calculate/interpret karo."],
        "Double counting avoid karna national income accounting ka central rule hai.",
        "GDP, GNP/GNI aur national income terms ko current syllabus definitions ke saath revise karo."),
      "income determination": () => make(
        "Simplified model mein planned aggregate spending ₹100 aur output ₹100 ke equal hain.",
        ["Planned demand/output compare karo.", "Jab planned spending output ke equal ho, is simple model mein equilibrium condition meet hoti hai.", "Demand/output mismatch ho to inventory ya production decisions adjust ho sakte hain."],
        "Simple Keynesian model mein equilibrium output tab hota hai jab planned aggregate expenditure output ke equal ho.",
        "Model ke assumptions aur prescribed formula clearly state karo."),
      "government budget": () => make(
        "Government ka total expenditure ₹120 units hai aur borrowings ko chhodkar receipts ₹100 units hain.",
        ["Total expenditure note karo: 120.", "Receipts excluding borrowings note karo: 100.", "Difference 20 hai, jo fiscal deficit ki broad definition se match karta hai."],
        "Fiscal deficit = total expenditure − receipts excluding borrowings; is example mein 20 units.",
        "Revenue deficit aur fiscal deficit ko alag formulas ke saath yaad karo."),
      "balance of payments and exchange rates": () => make(
        "Ek country goods exports ₹100 aur goods imports ₹80 value karti hai.",
        ["Exports minus imports = 100−80 = 20.", "Goods trade balance mein surplus 20 hai.", "Full balance of payments mein services, income, transfers aur financial transactions bhi aate hain."],
        "Goods trade surplus 20 units hai, lekin ye full balance-of-payments position nahi batata.",
        "Exchange rate ka effect explain karte waqt currency kis direction mein appreciate/depreciate hui, clear batao."),
      "financial statements and analysis": () => make(
        "Business ke current assets ₹20,000 aur current liabilities ₹10,000 hain.",
        ["Current ratio = current assets ÷ current liabilities.", "20,000 ÷ 10,000 = 2.", "Answer ko 2:1 ratio ke roop mein likho."],
        "Current ratio = 2:1.",
        "Correct period aur correct balance-sheet figures use karo; ratio ka meaning bhi likho."),
      "cash flow statement": () => make(
        "Cash opening balance ₹5,000 hai. Cash inflow ₹3,000 aur cash outflow ₹1,200 hai.",
        ["Net increase = inflow − outflow = 3,000−1,200 = 1,800.", "Closing cash = opening cash + net increase.", "5,000+1,800=6,800."],
        "Closing cash = ₹6,800, if these are all cash movements for the period.",
        "Cash flow items ko operating, investing aur financing activities mein prescribed rules ke according classify karo."),
      "accounting for share capital and debentures": () => make(
        "Company 100 shares issue karti hai at ₹10 per share; full amount receive hota hai.",
        ["Shares ki count = 100.", "Issue price = ₹10 per share.", "Share capital proceeds = 100×10=₹1,000."],
        "Received share capital amount ₹1,000 hai; debenture issue borrowing/debt ko represent karta hai.",
        "Shares (ownership capital) aur debentures (debt) ka distinction answer mein clear likho.")
    };
    if (topicExamples[t]) return topicExamples[t]();
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
    const example = workedExample(active.subject, item);
    const exampleSteps = example.steps.map((x,i) => '<li><strong>Step ' + (i+1) + ':</strong> ' + escapeHtml(x) + '</li>').join("");
    const unitLabel = c.units ? "Official syllabus unit / topic" : "Chapter / topic";
    const unitInfo = officialUnitInfo(active.className, active.subject, item);
    panel.innerHTML =
      '<div class="note-meta"><span>' + escapeHtml(unitLabel) + '</span><span>' + escapeHtml(active.className) + '</span><span>' + escapeHtml(active.subject) + '</span></div>' +
      '<h3 class="chapter-title">' + escapeHtml(item.title) + '</h3>' +
      '<div class="simple-lesson"><h4>1. Bilkul simple language mein samjho</h4><p class="chapter-explain">' + escapeHtml(simpleExplanation(active.subject, item)) + '</p><details><summary>Thoda aur detail mein samjho</summary><p>' + escapeHtml(item.explain) + '</p></details></div>' +
      '<h4>2. Board ke liye ye important points yaad rakho</h4><ul class="chapter-points">' + points + '</ul>' +
      '<div class="worked-example"><h4>3. Example se samjho</h4><p><strong>Situation:</strong> ' + escapeHtml(example.situation) + '</p><ol class="example-steps">' + exampleSteps + '</ol><p><strong>Answer / conclusion:</strong> ' + escapeHtml(example.result) + '</p><p><strong>Is example ka lesson:</strong> ' + escapeHtml(example.takeaway) + '</p><p class="small">Ye samjhane ke liye original example hai; ise official board paper ka question na samjho.</p></div>' +
      '<div class="practice-box"><h4>4. Ab khud try karo</h4><p class="self-question">' + escapeHtml(item.question) + '</p><details><summary>Sample answer / working dekho</summary><p>' + escapeHtml(item.answer) + '</p></details></div>' +
      '<div class="mistake-box"><h4>5. Common mistake se bacho</h4><p>' + escapeHtml(commonMistake(active.subject)) + '</p></div>' +
      (unitInfo ? '<div class="weightage-box"><strong>Official board unit weightage: ' + escapeHtml(unitInfo.label) + '</strong><p>' + escapeHtml(unitInfo.note) + '</p><p class="small">Official source: 2026–27 subject syllabus PDF linked below. Unit marks are not per-chapter predictions.</p></div>' : '<div class="weightage-box weightage-neutral"><strong>Board importance check</strong><p>Exact unit-wise marks are not displayed here for this class/subject. Check the linked official syllabus and current model paper instead of trusting guessed “most important questions”.</p></div>') +
      (item.formula ? '<div class="formula-box"><strong>Formula / key relation</strong><p>' + escapeHtml(item.formula) + '</p></div>' : '') +
      '<div class="exam-box"><h4>6. Board ke liye kya padhna hai?</h4><p>' + escapeHtml(boardPlan(active.subject)) + '</p><ol><li>Upar diye gaye core points bina dekhe explain karne ki koshish karo.</li><li>Prescribed textbook se isi topic ke solved example aur exercise questions karo.</li><li>Official UPMSP question bank/model paper mein isi subject ka question format check karo.</li></ol><p><strong>Important:</strong> ye revision priority hai, guaranteed exam prediction ya official marking scheme nahi.</p></div>' +

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
    const example = workedExample(active.subject, active.item);
    addText("Worked example in simple language", 12, 2, "bold");
    addText("Situation: " + example.situation, 10, 2);
    example.steps.forEach((step,i) => addText("Step " + (i+1) + ": " + step, 10, 1));
    addText("Answer / conclusion: " + example.result, 10, 2);
    addText("Lesson from the example: " + example.takeaway, 10, 4);
    addText("Now try it yourself", 12, 2, "bold");
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
  window.STUDYSPACE_LEARNING = { simpleExplanation, workedExample, commonMistake };
  populateSubjects();
})();