// ─── Types ────────────────────────────────────────────────────────────────────

export type ProviderType = 'medical' | 'financial' | 'emotional' | 'legal'
export type JourneyType  = 'IUI' | 'IVF' | 'IVF_donor' | 'exploring'

export interface Provider {
  id: string; name: string; type: ProviderType; subcategory: string
  description: string; relevance: string; sartAttested?: boolean
  locationStates?: string[]; budgetTier: 'low' | 'medium' | 'high' | 'any'; contact?: string
}
export interface JourneyStep {
  id: string; stepNumber: number; title: string; subtitle: string
  duration: string; totalCost: number; insuranceCoverage: number; yourCost: number
  requirements: string[]; keyTasks: { task: string; duration: string; priority: 'high'|'medium'|'low' }[]
  providers: Provider[]; icon: string; color: string
}
export interface Journey {
  id: JourneyType; title: string; subtitle: string
  totalDuration: string; totalCostRange: string; steps: JourneyStep[]
}
export interface PatientProfile {
  id: string; name: string; emoji: string; description: string
  age: string; maritalStatus: string; goal: JourneyType
  location: string; state: string; insurance: string; budget: number
  healthNotes: string; statelaw: string; color: string
}

// ─── Provider Master List ─────────────────────────────────────────────────────

const P: Record<string, Provider> = {
  fertility_clinic:      { id:'fertility_clinic',      name:'Fertility Clinic (SART)',          type:'medical',    subcategory:'Reproductive Endocrinology',  description:'Board-certified fertility specialists with SART-reported success rates',       relevance:'Primary care provider for evaluation, diagnosis, and treatment', sartAttested:true, budgetTier:'any' },
  obgyn:                 { id:'obgyn',                 name:'OB/GYN',                           type:'medical',    subcategory:'Obstetrics & Gynecology',      description:'General reproductive health and referral coordination',                       relevance:'Provides medical history, referrals, and clearance documentation',              budgetTier:'any' },
  diagnostic_lab:        { id:'diagnostic_lab',        name:'Diagnostic Laboratory',            type:'medical',    subcategory:'Clinical Laboratory',          description:'CLIA-certified lab for hormonal panels, infectious disease, genetic screens', relevance:'Processes FSH, LH, TSH, AMH and infectious disease screening',                 budgetTier:'any' },
  imaging_center:        { id:'imaging_center',        name:'Imaging Center',                   type:'medical',    subcategory:'Radiology & Ultrasound',        description:'Pelvic ultrasound, HSG, HyCoSy for tubal patency testing',                    relevance:'Confirms uterine structure and tubal patency',                                  budgetTier:'any' },
  andrology_lab:         { id:'andrology_lab',         name:'Andrology Laboratory',             type:'medical',    subcategory:'Male Reproductive Health',      description:'Specialist lab for semen analysis, sperm preparation and washing',            relevance:'Performs semen analysis and post-wash quality verification',                   budgetTier:'any' },
  sperm_bank:            { id:'sperm_bank',            name:'FDA-Registered Sperm Bank',        type:'medical',    subcategory:'Donor Sperm Services',          description:'Screened, quarantined donor sperm with FDA compliance',                       relevance:'Required if using donor sperm — must verify FDA compliance',                   budgetTier:'any' },
  urologist:             { id:'urologist',             name:'Urologist / Andrologist',          type:'medical',    subcategory:'Male Fertility',                description:'Specialist for male factor infertility evaluation and treatment',             relevance:'Evaluates male factor when semen analysis shows abnormalities',                budgetTier:'any' },
  pharmacist:            { id:'pharmacist',            name:'Fertility Pharmacy',               type:'medical',    subcategory:'Specialty Pharmacy',            description:'Letrozole, Clomid, trigger shots, progesterone supplements',                  relevance:'Dispenses ovulation induction and luteal support medications',                 budgetTier:'any' },
  genetic_counselor:     { id:'genetic_counselor',     name:'Genetic Counselor',                type:'medical',    subcategory:'Genetics',                      description:'Pre-conception genetic screening and counseling',                             relevance:'Recommended for patients with family history of genetic conditions',           budgetTier:'medium' },
  ivf_specialist:        { id:'ivf_specialist',        name:'IVF Specialist',                   type:'medical',    subcategory:'Advanced Reproductive Tech',    description:'Specialist in IVF, embryo transfer, and advanced ART procedures',            relevance:'Consulted when IUI fails or IVF is recommended as next step', sartAttested:true, budgetTier:'high' },
  surrogate_agency:      { id:'surrogate_agency',      name:'Surrogacy Agency (via PtP referral)', type:'medical', subcategory:'Third-Party Reproduction',      description:'Licensed agencies PtP refers you to for gestational carrier coordination',   relevance:'PtP navigates you to agencies — it does not find surrogates itself',           budgetTier:'high' },
  insurance_coordinator: { id:'insurance_coordinator', name:'Insurance Coordinator',            type:'financial',  subcategory:'Benefits Navigation',           description:'Verifies fertility benefits, prior authorizations, and network providers',    relevance:'Confirms coverage before each step to minimize surprise costs',                budgetTier:'any' },
  financial_counselor:   { id:'financial_counselor',   name:'Fertility Financial Counselor',    type:'financial',  subcategory:'Financial Planning',            description:'Payment plans, grants, loans, and multi-cycle discount packages',            relevance:'Helps structure payment and identify grant eligibility',                       budgetTier:'any' },
  employer_benefits:     { id:'employer_benefits',     name:'Employer Benefits / HR',           type:'financial',  subcategory:'Employer Benefits',             description:'Fertility benefits, FSA/HSA usage, and FMLA coordination',                   relevance:'Many employers cover IUI/IVF — check before out-of-pocket payment',            budgetTier:'any' },
  fertility_counselor:   { id:'fertility_counselor',   name:'Fertility Counselor',              type:'emotional',  subcategory:'Mental Health',                 description:'Licensed therapist specializing in fertility-related stress and grief',       relevance:'Supports emotional wellbeing throughout the treatment journey',                budgetTier:'any' },
  support_group:         { id:'support_group',         name:'Fertility Support Group',          type:'emotional',  subcategory:'Peer Support',                  description:'Community of patients sharing experiences and coping strategies',            relevance:'Reduces isolation and provides lived-experience guidance',                     budgetTier:'low' },
  grief_counselor:       { id:'grief_counselor',       name:'Grief & Loss Counselor',           type:'emotional',  subcategory:'Mental Health',                 description:'Specialist for processing failed cycles, pregnancy loss, difficult decisions', relevance:'Critical support after negative results or failed cycles',                    budgetTier:'any' },
  reproductive_attorney: { id:'reproductive_attorney', name:'Reproductive Attorney',            type:'legal',      subcategory:'Family Law',                    description:'Legal contracts for donor agreements, surrogacy, and parental rights',       relevance:'Required for donor/surrogacy arrangements — establishes legal parentage',      budgetTier:'high' },
  state_law_guide:       { id:'state_law_guide',       name:'State Law Navigator',              type:'legal',      subcategory:'Regulatory Guidance',           description:'Guidance on state-specific fertility insurance mandates and surrogacy laws',  relevance:'State laws determine coverage requirements and legal pathway',                 budgetTier:'low' },
}

// ─── IUI Journey ──────────────────────────────────────────────────────────────

const IUI_JOURNEY: Journey = {
  id:'IUI', title:'IUI (Intrauterine Insemination) Journey',
  subtitle:'Complete IUI pathway from eligibility assessment through pregnancy confirmation',
  totalDuration:'2–4 weeks per cycle', totalCostRange:'$700–$3,500 per cycle',
  steps:[
    { id:'iui-1', stepNumber:1, icon:'🎯', color:'#E07B39',
      title:'Intake & Eligibility Assessment', duration:'1–2 weeks',
      subtitle:'Comprehensive evaluation to confirm you\'re a good candidate for IUI, including tubal patency testing and ovarian function assessment.',
      totalCost:1000, insuranceCoverage:400, yourCost:600,
      requirements:['Government-issued ID','Medical history documentation','Pelvic ultrasound','Tubal patency test (HSG or HyCoSy)','Hormonal labs (FSH, LH, TSH)','Infectious disease screening','Treatment consent signed'],
      keyTasks:[
        {task:'Complete identity verification',duration:'30 min',priority:'high'},
        {task:'Complete reproductive and medical history',duration:'1 hour',priority:'high'},
        {task:'Complete pelvic ultrasound',duration:'1 hour',priority:'high'},
        {task:'Complete HSG or HyCoSy (tubal patency test)',duration:'1 hour',priority:'high'},
        {task:'Complete hormonal panel (FSH, LH, TSH)',duration:'30 min',priority:'high'},
        {task:'Complete infectious disease screening',duration:'30 min',priority:'high'},
        {task:'Obtain medical clearance for IUI',duration:'1 hour',priority:'high'},
      ],
      providers:[P.fertility_clinic, P.obgyn, P.diagnostic_lab, P.imaging_center, P.insurance_coordinator, P.state_law_guide, P.employer_benefits],
    },
    { id:'iui-2', stepNumber:2, icon:'🔬', color:'#E07B39',
      title:'Sperm Source Selection & Testing', duration:'Immediate to 1 week',
      subtitle:'Confirm sperm source (partner or donor) meets quality requirements for IUI success.',
      totalCost:1000, insuranceCoverage:200, yourCost:800,
      requirements:['Semen analysis (partner) OR donor sperm selection','Infectious disease screening','Post-wash count prediction','FDA verification (if donor sperm)'],
      keyTasks:[
        {task:'Complete semen analysis (partner)',duration:'1 hour',priority:'high'},
        {task:'Select donor sperm (if applicable)',duration:'2–4 hours',priority:'high'},
        {task:'Complete partner infectious disease screening',duration:'30 min',priority:'high'},
        {task:'Verify FDA compliance (donor sperm)',duration:'30 min',priority:'high'},
        {task:'Obtain sperm source clearance',duration:'30 min',priority:'high'},
      ],
      providers:[P.andrology_lab, P.sperm_bank, P.urologist, P.fertility_clinic, P.insurance_coordinator],
    },
    { id:'iui-3', stepNumber:3, icon:'📅', color:'#E07B39',
      title:'Ovulation Tracking or Induction', duration:'10–14 days',
      subtitle:'Monitor natural ovulation or use medications to induce ovulation and time the IUI procedure perfectly.',
      totalCost:600, insuranceCoverage:200, yourCost:400,
      requirements:['Baseline ultrasound (if medicated)','Ovulation medications (if needed)','LH ovulation kits','Monitoring appointments','Trigger shot (if medicated)'],
      keyTasks:[
        {task:'Complete baseline ultrasound',duration:'30 min',priority:'high'},
        {task:'Start ovulation medications (if prescribed)',duration:'5 min daily',priority:'high'},
        {task:'Use LH ovulation predictor kits',duration:'5 min daily',priority:'high'},
        {task:'Attend follicle monitoring appointments',duration:'1 hour each',priority:'high'},
        {task:'Administer trigger shot (if prescribed)',duration:'10 min',priority:'high'},
        {task:'Schedule IUI procedure timing',duration:'15 min',priority:'high'},
      ],
      providers:[P.fertility_clinic, P.pharmacist, P.imaging_center, P.insurance_coordinator, P.fertility_counselor],
    },
    { id:'iui-4', stepNumber:4, icon:'⚗️', color:'#E07B39',
      title:'Sperm Preparation (Washing)', duration:'1–2 hours',
      subtitle:'Sperm is washed and concentrated in the lab to optimize for uterine placement.',
      totalCost:300, insuranceCoverage:100, yourCost:200,
      requirements:['Fresh sperm sample (partner) OR thawed donor sperm','CLIA-certified lab','Sperm washing procedure','Post-wash count ≥1–5 million'],
      keyTasks:[
        {task:'Provide fresh sperm sample (partner)',duration:'30 min',priority:'high'},
        {task:'Thaw donor sperm (if applicable)',duration:'30 min',priority:'high'},
        {task:'Lab performs sperm washing',duration:'1–2 hours',priority:'high'},
        {task:'Post-wash quality verification',duration:'15 min',priority:'high'},
      ],
      providers:[P.andrology_lab, P.fertility_clinic, P.sperm_bank, P.insurance_coordinator],
    },
    { id:'iui-5', stepNumber:5, icon:'💉', color:'#E07B39',
      title:'IUI Procedure', duration:'15–30 minutes',
      subtitle:'Quick, painless procedure where prepared sperm is placed directly into your uterus. No anesthesia needed.',
      totalCost:500, insuranceCoverage:200, yourCost:300,
      requirements:['Identity verification','Procedure consent signed','Prepared sperm ready','Optimal timing confirmed'],
      keyTasks:[
        {task:'Verify identity before procedure',duration:'5 min',priority:'high'},
        {task:'Sign procedure consent',duration:'10 min',priority:'high'},
        {task:'Undergo IUI insemination',duration:'10 min',priority:'high'},
        {task:'Rest for 10–15 minutes',duration:'15 min',priority:'medium'},
        {task:'Receive post-procedure instructions',duration:'10 min',priority:'high'},
      ],
      providers:[P.fertility_clinic, P.andrology_lab, P.insurance_coordinator, P.fertility_counselor, P.employer_benefits],
    },
    { id:'iui-6', stepNumber:6, icon:'💊', color:'#E07B39',
      title:'Luteal Support (If Medicated Cycle)', duration:'14 days',
      subtitle:'Take progesterone supplements to support implantation if you had a medicated IUI cycle.',
      totalCost:100, insuranceCoverage:30, yourCost:70,
      requirements:['Progesterone prescription (if medicated cycle)','Daily medication adherence','Symptom monitoring'],
      keyTasks:[
        {task:'Start progesterone supplementation',duration:'15 min daily',priority:'high'},
        {task:'Take progesterone daily as prescribed',duration:'15 min daily',priority:'high'},
        {task:'Track symptoms and side effects',duration:'5 min daily',priority:'medium'},
      ],
      providers:[P.pharmacist, P.fertility_clinic, P.obgyn, P.fertility_counselor, P.support_group],
    },
    { id:'iui-7', stepNumber:7, icon:'⏳', color:'#E07B39',
      title:'Two-Week Wait & Pregnancy Test', duration:'2–4 weeks',
      subtitle:'Wait 14 days after IUI for pregnancy blood test. If positive, ultrasound confirms pregnancy.',
      totalCost:250, insuranceCoverage:100, yourCost:150,
      requirements:['Continued medications (if prescribed)','Beta hCG scheduled','Emotional support resources'],
      keyTasks:[
        {task:'Continue all medications as prescribed',duration:'Daily',priority:'high'},
        {task:'Avoid home pregnancy tests (can be misleading)',duration:'N/A',priority:'medium'},
        {task:'Complete first β-hCG blood test (Day 14)',duration:'15 min',priority:'high'},
        {task:'Complete second β-hCG test (if positive)',duration:'15 min',priority:'high'},
        {task:'Attend 6–7 week ultrasound (if pregnant)',duration:'30 min',priority:'high'},
        {task:'Schedule OB appointment (if pregnant)',duration:'30 min',priority:'high'},
      ],
      providers:[P.diagnostic_lab, P.fertility_clinic, P.fertility_counselor, P.support_group, P.obgyn],
    },
    { id:'iui-8', stepNumber:8, icon:'🔄', color:'#E07B39',
      title:'Cycle Review & Next Steps', duration:'1–2 weeks',
      subtitle:'If cycle unsuccessful, review results and discuss whether to try IUI again or escalate to IVF.',
      totalCost:300, insuranceCoverage:150, yourCost:150,
      requirements:['Cycle data compiled','Emotional support accessed','Time for decision-making'],
      keyTasks:[
        {task:'Schedule follow-up consultation',duration:'1 hour',priority:'high'},
        {task:'Access grief/support counseling',duration:'1 hour',priority:'high'},
        {task:'Decide on next steps (try again, IVF, etc.)',duration:'Variable',priority:'high'},
        {task:'IVF consultation (if recommended)',duration:'1 hour',priority:'medium'},
      ],
      providers:[P.fertility_clinic, P.ivf_specialist, P.financial_counselor, P.grief_counselor, P.insurance_coordinator, P.state_law_guide, P.employer_benefits],
    },
  ],
}

// ─── IVF Journey ──────────────────────────────────────────────────────────────

const IVF_JOURNEY: Journey = {
  id:'IVF', title:'IVF (In Vitro Fertilization) Journey',
  subtitle:'Complete IVF pathway from ovarian stimulation through embryo transfer and pregnancy confirmation',
  totalDuration:'4–6 weeks per cycle', totalCostRange:'$15,000–$30,000 per cycle',
  steps:[
    { id:'ivf-1', stepNumber:1, icon:'🎯', color:'#4A7C59',
      title:'Comprehensive Fertility Workup', duration:'2–3 weeks',
      subtitle:'Full evaluation of ovarian reserve, uterine anatomy, and male factor before starting stimulation.',
      totalCost:2500, insuranceCoverage:800, yourCost:1700,
      requirements:['AMH, FSH, AFC ultrasound','Semen analysis','Uterine cavity evaluation','Genetic carrier screening','Infectious disease panel'],
      keyTasks:[
        {task:'Antral follicle count ultrasound',duration:'30 min',priority:'high'},
        {task:'AMH and full hormonal panel',duration:'30 min',priority:'high'},
        {task:'Saline infusion sonogram (SIS)',duration:'45 min',priority:'high'},
        {task:'Genetic carrier screening',duration:'30 min',priority:'high'},
        {task:'Male partner semen analysis',duration:'1 hour',priority:'high'},
      ],
      providers:[P.fertility_clinic, P.diagnostic_lab, P.imaging_center, P.genetic_counselor, P.insurance_coordinator, P.employer_benefits],
    },
    { id:'ivf-2', stepNumber:2, icon:'💉', color:'#4A7C59',
      title:'Ovarian Stimulation', duration:'8–14 days',
      subtitle:'Daily injectable medications stimulate multiple follicle development for egg retrieval.',
      totalCost:5000, insuranceCoverage:1500, yourCost:3500,
      requirements:['Injectable gonadotropins','Monitoring ultrasounds every 1–2 days','Estradiol blood tests','Trigger shot timing'],
      keyTasks:[
        {task:'Begin injectable stimulation medications',duration:'15 min daily',priority:'high'},
        {task:'Attend monitoring ultrasound appointments',duration:'45 min each',priority:'high'},
        {task:'Estradiol blood draws',duration:'15 min each',priority:'high'},
        {task:'Administer trigger shot at precise timing',duration:'15 min',priority:'high'},
      ],
      providers:[P.fertility_clinic, P.pharmacist, P.imaging_center, P.diagnostic_lab, P.fertility_counselor, P.financial_counselor],
    },
    { id:'ivf-3', stepNumber:3, icon:'⚗️', color:'#4A7C59',
      title:'Egg Retrieval', duration:'1 day + recovery',
      subtitle:'Transvaginal ultrasound-guided procedure to collect mature eggs under sedation.',
      totalCost:5000, insuranceCoverage:2000, yourCost:3000,
      requirements:['IV sedation consent','Empty stomach (NPO)','Escort home required','Recovery time 1–2 days'],
      keyTasks:[
        {task:'Pre-procedure intake and IV placement',duration:'30 min',priority:'high'},
        {task:'Egg retrieval procedure under sedation',duration:'20–30 min',priority:'high'},
        {task:'Recovery room monitoring',duration:'1–2 hours',priority:'high'},
        {task:'Receive fertilization report next day',duration:'15 min',priority:'high'},
      ],
      providers:[P.fertility_clinic, P.andrology_lab, P.insurance_coordinator, P.fertility_counselor],
    },
    { id:'ivf-4', stepNumber:4, icon:'🔬', color:'#4A7C59',
      title:'Fertilization & Embryo Development', duration:'5–6 days',
      subtitle:'Eggs fertilized with sperm in lab; embryos cultured 5–6 days to blastocyst stage.',
      totalCost:3000, insuranceCoverage:800, yourCost:2200,
      requirements:['Conventional IVF or ICSI','Embryo culture to day 5/6','Optional PGT-A testing','Embryo grading report'],
      keyTasks:[
        {task:'ICSI or conventional fertilization',duration:'Lab process',priority:'high'},
        {task:'Daily embryo development updates',duration:'15 min',priority:'high'},
        {task:'PGT-A biopsy (if elected)',duration:'Lab process',priority:'medium'},
        {task:'Review embryo grading with physician',duration:'30 min',priority:'high'},
      ],
      providers:[P.fertility_clinic, P.genetic_counselor, P.insurance_coordinator, P.fertility_counselor],
    },
    { id:'ivf-5', stepNumber:5, icon:'🌱', color:'#4A7C59',
      title:'Embryo Transfer', duration:'1 day',
      subtitle:'Selected embryo placed into the uterus via catheter — no anesthesia needed in most cases.',
      totalCost:3000, insuranceCoverage:1000, yourCost:2000,
      requirements:['Full bladder for ultrasound guidance','Progesterone supplementation started','Rest recommended day of transfer'],
      keyTasks:[
        {task:'Endometrial preparation confirmed',duration:'30 min',priority:'high'},
        {task:'Embryo transfer procedure',duration:'15–20 min',priority:'high'},
        {task:'Begin progesterone supplementation',duration:'15 min daily',priority:'high'},
        {task:'Post-transfer activity restrictions',duration:'1–2 days',priority:'medium'},
      ],
      providers:[P.fertility_clinic, P.pharmacist, P.fertility_counselor, P.support_group],
    },
    { id:'ivf-6', stepNumber:6, icon:'⏳', color:'#4A7C59',
      title:'Two-Week Wait & Pregnancy Test', duration:'2 weeks',
      subtitle:'Wait for β-hCG blood test to confirm implantation success.',
      totalCost:300, insuranceCoverage:100, yourCost:200,
      requirements:['Continue all medications','β-hCG scheduled at Day 10–14','Emotional support'],
      keyTasks:[
        {task:'Continue progesterone and medications',duration:'Daily',priority:'high'},
        {task:'First β-hCG blood test',duration:'15 min',priority:'high'},
        {task:'Confirmation ultrasound (if positive)',duration:'30 min',priority:'high'},
      ],
      providers:[P.diagnostic_lab, P.fertility_clinic, P.fertility_counselor, P.grief_counselor, P.support_group],
    },
  ],
}

// ─── IVF with Donor Journey ───────────────────────────────────────────────────

const IVF_DONOR_JOURNEY: Journey = {
  id:'IVF_donor', title:'IVF with Donor Egg or Sperm',
  subtitle:'PtP navigates you to SART-certified clinics with donor programs, legal agreements, and third-party coordination',
  totalDuration:'3–6 months', totalCostRange:'$25,000–$50,000',
  steps:[
    { id:'ivfd-1', stepNumber:1, icon:'🔍', color:'#185FA5',
      title:'Donor Program Consultation', duration:'2–3 weeks',
      subtitle:'PtP identifies SART-certified clinics with active donor egg or sperm programs that match your profile.',
      totalCost:500, insuranceCoverage:200, yourCost:300,
      requirements:['Medical history review','Donor type decision (egg vs sperm vs embryo)','Clinic program evaluation','Insurance benefit check for donor cycles'],
      keyTasks:[
        {task:'PtP matches you to clinics with donor programs',duration:'1 week',priority:'high'},
        {task:'Initial consultation with REI specialist',duration:'1 hour',priority:'high'},
        {task:'Verify insurance coverage for donor cycles',duration:'30 min',priority:'high'},
        {task:'Decide on fresh vs frozen donor',duration:'1 hour',priority:'high'},
      ],
      providers:[P.fertility_clinic, P.insurance_coordinator, P.genetic_counselor, P.fertility_counselor, P.financial_counselor, P.state_law_guide],
    },
    { id:'ivfd-2', stepNumber:2, icon:'🔬', color:'#185FA5',
      title:'Donor Selection & Matching', duration:'2–8 weeks',
      subtitle:'PtP navigates you to FDA-registered donor banks and clinic-based programs for egg or sperm selection.',
      totalCost:5000, insuranceCoverage:0, yourCost:5000,
      requirements:['Donor bank or clinic program access','Donor profile review','FDA compliance verification','Psychological clearance'],
      keyTasks:[
        {task:'Access donor profiles via clinic or bank',duration:'1–2 weeks',priority:'high'},
        {task:'Select donor with physician guidance',duration:'1 week',priority:'high'},
        {task:'Psychological evaluation (required)',duration:'1–2 hours',priority:'high'},
        {task:'Confirm FDA compliance of donor',duration:'1 week',priority:'high'},
      ],
      providers:[P.sperm_bank, P.fertility_clinic, P.genetic_counselor, P.fertility_counselor, P.insurance_coordinator],
    },
    { id:'ivfd-3', stepNumber:3, icon:'⚖️', color:'#185FA5',
      title:'Legal Agreements', duration:'2–4 weeks',
      subtitle:'Donor agreements protect all parties legally. PtP connects you to reproductive attorneys familiar with your state laws.',
      totalCost:3000, insuranceCoverage:0, yourCost:3000,
      requirements:['Donor agreement (anonymous or known)','Parental rights documentation','State law compliance review'],
      keyTasks:[
        {task:'Engage reproductive attorney via PtP referral',duration:'1 hour',priority:'high'},
        {task:'Review and sign donor agreement',duration:'1–2 weeks',priority:'high'},
        {task:'Confirm parental rights framework',duration:'1 week',priority:'high'},
      ],
      providers:[P.reproductive_attorney, P.state_law_guide, P.fertility_counselor, P.financial_counselor],
    },
    { id:'ivfd-4', stepNumber:4, icon:'💉', color:'#185FA5',
      title:'IVF Cycle with Donor Material', duration:'4–6 weeks',
      subtitle:'Standard IVF cycle using selected donor egg or sperm. PtP tracks every step and surfaces costs in real time.',
      totalCost:18000, insuranceCoverage:2000, yourCost:16000,
      requirements:['Recipient uterine preparation','Donor egg retrieval or sperm thaw','Fertilization and embryo culture','PGT-A testing (recommended)'],
      keyTasks:[
        {task:'Recipient endometrial preparation',duration:'3–4 weeks',priority:'high'},
        {task:'Donor egg retrieval or donor sperm thaw',duration:'1 day',priority:'high'},
        {task:'IVF fertilization and embryo culture',duration:'5–6 days',priority:'high'},
        {task:'PGT-A embryo testing',duration:'1–2 weeks',priority:'medium'},
        {task:'Embryo transfer',duration:'1 day',priority:'high'},
      ],
      providers:[P.fertility_clinic, P.andrology_lab, P.pharmacist, P.genetic_counselor, P.insurance_coordinator, P.fertility_counselor],
    },
    { id:'ivfd-5', stepNumber:5, icon:'🌱', color:'#185FA5',
      title:'Pregnancy Confirmation & Handoff', duration:'2–3 weeks',
      subtitle:'β-hCG confirmation and transition to OB care. PtP coordinates the handoff between fertility clinic and OB.',
      totalCost:500, insuranceCoverage:200, yourCost:300,
      requirements:['β-hCG blood test Day 14','Viability ultrasound at 6–7 weeks','OB referral and handoff'],
      keyTasks:[
        {task:'β-hCG blood test',duration:'15 min',priority:'high'},
        {task:'6–7 week viability ultrasound',duration:'30 min',priority:'high'},
        {task:'PtP coordinates OB referral',duration:'1 week',priority:'high'},
        {task:'Transition from fertility benefits to OB coverage',duration:'1 week',priority:'high'},
      ],
      providers:[P.fertility_clinic, P.obgyn, P.diagnostic_lab, P.insurance_coordinator, P.fertility_counselor, P.support_group],
    },
  ],
}

// ─── Exploring All Pathways Journey ──────────────────────────────────────────

const EXPLORING_JOURNEY: Journey = {
  id:'exploring', title:'Exploring All Pathways',
  subtitle:'PtP maps every remaining option — donor egg, gestational carrier agencies, adoption attorneys, international clinics — and guides you to the right next step',
  totalDuration:'4–8 weeks (decision phase)', totalCostRange:'Varies by pathway chosen',
  steps:[
    { id:'exp-1', stepNumber:1, icon:'📋', color:'#5C3D2E',
      title:'Comprehensive Case Review', duration:'1–2 weeks',
      subtitle:'PtP aggregates your full treatment history via SMART-on-FHIR and presents a clear picture of what has been tried and what remains.',
      totalCost:300, insuranceCoverage:100, yourCost:200,
      requirements:['Prior cycle records compiled','Lab history (AMH, FSH, AFC)','Embryo outcome data','Physician summary notes'],
      keyTasks:[
        {task:'PtP requests records via SMART-on-FHIR from prior clinics',duration:'3–5 days',priority:'high'},
        {task:'Review compiled treatment timeline',duration:'1 hour',priority:'high'},
        {task:'Second opinion consultation via PtP referral',duration:'1 hour',priority:'high'},
        {task:'Identify why prior cycles failed',duration:'1 hour',priority:'high'},
      ],
      providers:[P.fertility_clinic, P.ivf_specialist, P.genetic_counselor, P.fertility_counselor, P.diagnostic_lab],
    },
    { id:'exp-2', stepNumber:2, icon:'🔬', color:'#5C3D2E',
      title:'Donor Egg Pathway Evaluation', duration:'1–2 weeks',
      subtitle:'PtP navigates you to SART-certified clinics with donor egg programs and evaluates success rates for your age group.',
      totalCost:500, insuranceCoverage:0, yourCost:500,
      requirements:['Donor egg program shortlist','SART success rate comparison','Cost breakdown per program','Insurance verification for donor cycles'],
      keyTasks:[
        {task:'PtP identifies top donor egg programs by SART success rate',duration:'3 days',priority:'high'},
        {task:'Compare costs across programs',duration:'1 hour',priority:'high'},
        {task:'Verify insurance coverage for donor cycles',duration:'30 min',priority:'high'},
        {task:'Schedule consultations at top 2–3 programs',duration:'1 week',priority:'high'},
      ],
      providers:[P.fertility_clinic, P.sperm_bank, P.insurance_coordinator, P.financial_counselor, P.genetic_counselor],
    },
    { id:'exp-3', stepNumber:3, icon:'🤝', color:'#5C3D2E',
      title:'Gestational Carrier Guidance', duration:'2–4 weeks (information phase)',
      subtitle:'PtP does NOT find surrogates. It navigates you to licensed surrogacy agencies and reproductive attorneys who manage the carrier process.',
      totalCost:500, insuranceCoverage:0, yourCost:500,
      requirements:['State law review (surrogacy legality varies)','Agency shortlist','Cost range understanding ($80K–$180K total)','Legal requirements by state'],
      keyTasks:[
        {task:'PtP reviews state surrogacy laws for your location',duration:'1 day',priority:'high'},
        {task:'PtP refers you to 2–3 licensed surrogacy agencies',duration:'3 days',priority:'high'},
        {task:'PtP connects you to reproductive attorney',duration:'1 week',priority:'high'},
        {task:'Review full cost breakdown with financial counselor',duration:'1 hour',priority:'high'},
      ],
      providers:[P.surrogate_agency, P.reproductive_attorney, P.state_law_guide, P.financial_counselor, P.fertility_counselor],
    },
    { id:'exp-4', stepNumber:4, icon:'🏠', color:'#5C3D2E',
      title:'Adoption Pathway Navigation', duration:'2–4 weeks (information phase)',
      subtitle:'PtP does NOT place children for adoption. It navigates you to licensed adoption agencies and attorneys who manage the process.',
      totalCost:300, insuranceCoverage:0, yourCost:300,
      requirements:['Domestic vs international decision','Agency licensing verification','Home study requirements overview','Cost range ($25K–$50K typical)'],
      keyTasks:[
        {task:'PtP provides licensed adoption agency shortlist',duration:'3 days',priority:'high'},
        {task:'Review domestic vs international adoption tradeoffs',duration:'1 hour',priority:'high'},
        {task:'Connect with adoption attorney via PtP referral',duration:'1 week',priority:'high'},
        {task:'Understand home study requirements',duration:'1 hour',priority:'medium'},
      ],
      providers:[P.reproductive_attorney, P.state_law_guide, P.fertility_counselor, P.financial_counselor, P.support_group],
    },
    { id:'exp-5', stepNumber:5, icon:'🌍', color:'#5C3D2E',
      title:'International Treatment Options', duration:'2–4 weeks (research phase)',
      subtitle:'For patients whose budget limits domestic options, PtP surfaces accredited international clinic data and cost comparisons.',
      totalCost:300, insuranceCoverage:0, yourCost:300,
      requirements:['Passport and travel logistics','International clinic accreditation check','Medical record portability','Legal parentage in destination country'],
      keyTasks:[
        {task:'PtP surfaces accredited international clinics by country',duration:'3 days',priority:'high'},
        {task:'Compare success rates and costs vs domestic',duration:'1 hour',priority:'high'},
        {task:'Review legal parentage requirements',duration:'1 hour',priority:'high'},
        {task:'Prepare portable medical records for transfer',duration:'1 week',priority:'high'},
      ],
      providers:[P.fertility_clinic, P.reproductive_attorney, P.state_law_guide, P.financial_counselor, P.insurance_coordinator],
    },
    { id:'exp-6', stepNumber:6, icon:'🧭', color:'#5C3D2E',
      title:'Decision & Financial Planning', duration:'1–2 weeks',
      subtitle:'PtP consolidates all options with costs, timelines, and success rates so you can make a fully informed, pressure-free decision.',
      totalCost:200, insuranceCoverage:0, yourCost:200,
      requirements:['All pathway costs compared','Emotional readiness assessed','Financial assistance options reviewed','Final pathway selected'],
      keyTasks:[
        {task:'Review PtP pathway comparison report',duration:'1 hour',priority:'high'},
        {task:'Explore fertility grants and financing options',duration:'1 hour',priority:'high'},
        {task:'Final counseling session',duration:'1 hour',priority:'high'},
        {task:'Select pathway and initiate next steps',duration:'1 day',priority:'high'},
      ],
      providers:[P.financial_counselor, P.fertility_counselor, P.grief_counselor, P.support_group, P.employer_benefits, P.insurance_coordinator],
    },
  ],
}

// ─── Journeys Map ─────────────────────────────────────────────────────────────

export const JOURNEYS: Record<JourneyType, Journey> = {
  IUI:       IUI_JOURNEY,
  IVF:       IVF_JOURNEY,
  IVF_donor: IVF_DONOR_JOURNEY,
  exploring: EXPLORING_JOURNEY,
}

// ─── Patient Profiles ─────────────────────────────────────────────────────────

export const PATIENT_PROFILES: PatientProfile[] = [
  { id:'diagnosis-seeker',  name:'Priya, 34',         emoji:'🔍', description:'Just diagnosed with possible PCOS, doesn\'t know where to start', age:'34', maritalStatus:'Married',          goal:'IUI',       location:'Boston, MA',        state:'MA', insurance:'Aetna',                 budget:8000,  healthNotes:'Suspected PCOS, irregular cycles, no prior treatment',             statelaw:'Massachusetts mandates IUI/IVF coverage — Aetna fully compliant',                           color:'#E07B39' },
  { id:'active-treatment',  name:'Sarah & James',     emoji:'💉', description:'In active IVF cycle, overwhelmed by steps and costs',             age:'38 & 40', maritalStatus:'Married',     goal:'IVF',       location:'Chicago, IL',        state:'IL', insurance:'Blue Cross Blue Shield', budget:30000, healthNotes:'Diminished ovarian reserve, 1 failed IUI',                         statelaw:'Illinois mandates IVF coverage for fully-insured group health plans',                       color:'#4A7C59' },
  { id:'alternative-path',  name:'Marcus & David',    emoji:'🌈', description:'Gay couple needing donor egg + third-party coordination',         age:'36 & 39', maritalStatus:'Married',     goal:'IVF_donor', location:'San Francisco, CA',  state:'CA', insurance:'United Healthcare',     budget:60000, healthNotes:'Both healthy — need donor egg + gestational carrier guidance',      statelaw:'California is surrogacy-friendly — pre-birth orders available for same-sex couples',        color:'#185FA5' },
  { id:'out-of-options',    name:'Monica, 42',         emoji:'🧭', description:'3 failed IVF cycles, exploring all remaining pathways',          age:'42',      maritalStatus:'Single',       goal:'exploring', location:'New York, NY',        state:'NY', insurance:'Empire Blue Cross',     budget:20000, healthNotes:'Advanced maternal age, 3 failed IVF cycles, open to all options',   statelaw:'New York mandates IVF coverage — donor egg cycles may qualify under Empire plan',           color:'#5C3D2E' },
]