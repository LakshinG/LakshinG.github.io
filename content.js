// Everything on the site comes from this file. Edit it and refresh the page.

window.SITE = {
  name: "Lakshin Ganesha",
  role: "Computer Science and Statistics student at UNC Chapel Hill",
  location: "Chapel Hill, NC",
  email: "lakshinganesha@gmail.com",
  links: {
    github: "https://github.com/LakshinG",
    linkedin: "https://www.linkedin.com/in/lakshinganesha",
    resume: "resume.pdf",
  },

  about: [
    "I study Computer Science and Statistics at UNC Chapel Hill. Class of 2028. Most of my work so far has been in medical AI and software engineering. At the Boerwinkle Lab I used a local Qwen model to pull seizure histories out of messy neurology notes, and at ACM I built an agent that fact-checks results against PubMed and OpenAlex. This fall I start a co-op at ViiV Healthcare.",
    "I also worked as a full-stack developer at Venuehorn this past summer. On the backend I built FastAPI services that hand slow jobs to Celery workers, and added Pydantic validation that cut ingestion errors by 40%. I wrote a computer vision API where YOLOv8 spots objects in venue images and maps them to feature tags. On the front end I built the Next.js app with JWT sign-in and tested it against a simulated database of 5,000+ users, all running on PostgreSQL with Alembic migrations and pgvector.",
  ],

  // Tags are used for the filter buttons above the project list.
  // Give a project links.demo plus embed: true to add a "Try it here" button that opens
  // the live site in a window on this page. demoNote shows under the title in that window.
  // Set featured: true on the one project you most want people to see.
  projects: [
    {
      title: "NovaKV",
      year: 2026,
      featured: true,
      summary: "A distributed key-value database written from scratch in Go.",
      details:
        "NovaKV replicates writes across a multi-node cluster using the HashiCorp Raft consensus algorithm, so it keeps serving with automatic leader election and no data loss when a server fails. Reads and writes stay under a millisecond using sync.RWMutex and goroutines, and gRPC, BoltDB, and write-ahead-log snapshot compaction keep data durable and make crash recovery fast.",
      tags: ["Go", "Distributed systems", "gRPC"],
      links: { code: "https://github.com/LakshinG/novakv", demo: "demos/novakv/" },
      embed: true,
      demoNote: "Interactive simulation of the cluster in JavaScript. Browsers can't run the Go server, so this follows its code instead.",
    },
    {
      title: "Cloud-Native AI Research Agent",
      year: 2025,
      summary: "A RAG agent that finds contradictions in dense scientific literature.",
      details:
        "A containerized FastAPI backend drives a LangChain and ChromaDB retrieval pipeline, with an LLM critic agent that flags claims contradicting each other across papers. HuggingFace embedding models cut latency by 40%. The AWS infrastructure (EC2, ECR) is defined in Terraform and deployed through GitHub Actions and Docker with zero downtime.",
      tags: ["Python", "LLMs", "AWS", "Terraform"],
      links: { code: "https://github.com/LakshinG/Cloud-Native-AI-Research-Agent", demo: "demos/research/" },
      embed: true,
      demoNote: "Recorded replay of the real pipeline on the repo's sample papers. The live version needs a paid LLM API and AWS.",
    },
    {
      title: "REDCap Clinical Note Extractor",
      year: 2026,
      summary: "Built at the Boerwinkle Lab: turns free-text epilepsy clinic notes into REDCap-ready research records, with 96.3% field accuracy.",
      details:
        "A local Qwen model running through Ollama, so notes never leave the machine, first condenses each note. Then three structured-output passes pull history, medications, and imaging fields against the lab's REDCap codebook, and every field comes with the quote that justifies it. Rules in the prompts handle negations, PRN rescue meds, and admission vs. discharge notes, and the checkbox fields are expanded into a CSV ready for REDCap import. An evaluator scores the output against a hand-labeled answer key, with 96.3% field accuracy on the lab's notes.",
      tags: ["Python", "LLMs", "Pydantic"],
      links: { code: "https://github.com/LakshinG/Epic-api", demo: "demos/redcap/" },
      embed: true,
      demoNote: "Illustrative walkthrough of the real pipeline on a fictional note. Real patient notes can't leave the lab.",
    },
    {
      title: "CyberNeuro",
      year: 2026,
      summary: "Built at the ACM Lab: a multi-agent platform where researchers chat with their neuroimaging data.",
      details:
        "Researchers ask questions like \"Study the correlation between orbital amyloid and global tau, grouped by diagnosis\" and get back editable charts and analyses. I built the Validator agent, which checks results against PubMed and OpenAlex and uses TxGemma-27B to catch flawed reasoning, plus its statistics tools. I also replaced the manual merge screen with an MCP Data Manipulator agent that finds and runs merges across uploaded datasets on its own.",
      tags: ["Python", "LLMs", "TypeScript"],
      links: { code: "https://github.com/LakshinG/brain-network-chart", demo: "https://acmlab.github.io/brain-network-chart/" },
      embed: true,
      demoNote: "The chat needs Ollama running on your computer. Click Demo inside to load sample data.",
    },
    {
      title: "Concurrency Models",
      year: 2026,
      summary: "What breaks when you move Erlang actors, Go channels, and Java shared memory into each other's languages.",
      details:
        "My COMP 590 final project maps six translations, like Erlang actors in Java and Go's select in Elixir, and works out what each host can do natively and what it has to fake. Java has no supervision tree, so let-it-crash means writing restart logic by hand. Go's select picks randomly among ready channels, and Elixir's receive can't. The best fit I found is Java-style shared memory in Go, and the worst is the same model in Elixir, where an Agent only imitates shared state with message passing.",
      tags: ["Java", "Go", "Elixir", "Distributed systems"],
      links: { code: "https://github.com/LakshinG/Concurrency-Models", demo: "demos/concurrency/" },
      embed: true,
      demoNote: "Interactive illustrations of two arguments from the paper.",
    },
    {
      title: "Quantitative Stock Evaluation Engine",
      year: 2024,
      summary: "A full-stack platform for evaluating S&P 500 stocks with sentiment and forecasting models.",
      details:
        "The Next.js and FastAPI app shows live heatmaps for 500+ S&P equities. A PyTorch and FinBERT pipeline scores daily market sentiment, Scikit-learn random forests produce weighted daily price forecasts with confidence scores, and a Pandas portfolio optimizer runs 6,500 Monte Carlo simulations to maximize the Sharpe ratio.",
      tags: ["Python", "TypeScript", "Next.js", "Machine learning"],
      links: { code: "https://github.com/LakshinG/Quantitative-Stock-Evaluation-Engine", demo: "demos/quant/" },
      embed: true,
      demoNote: "Snapshot data, not live. FinBERT and PyTorch are too heavy for free hosting, so this replays saved results from the real backend. Download the project and run it locally for live prices, news, and sentiment.",
    },
  ],

  experience: [
    {
      role: "Data Analytics & AI Co-op (incoming)",
      org: "ViiV Healthcare (GSK)",
      start: "Sep 2026",
      end: "Apr 2027",
      points: [],
    },
    {
      role: "Full Stack Software Engineering Intern",
      org: "Venuehorn",
      start: "Jun 2026",
      end: "Aug 2026",
      points: [
        "Built RESTful APIs backed by Celery workers so long background tasks no longer blocked the main event loop.",
        "Added Pydantic validation layers that reduced ingestion errors by 40%.",
        "Built a computer vision ingestion API with YOLOv8 and NumPy that maps detected objects to venue feature tags.",
        "Designed a Next.js frontend with JWT authentication, tuned to render a simulated database of 5,000+ users.",
        "Managed PostgreSQL schemas with Alembic migrations and pgvector indexing.",
      ],
    },
    {
      role: "Machine Learning Engineer & Researcher",
      org: "UNC Boerwinkle Lab for Neuroinformatics",
      start: "Jan 2026",
      end: "Jun 2026",
      points: [
        "Built a zero-shot clinical data extraction pipeline on a locally deployed Qwen2.5:32B model.",
        "Removed patient identifiers from unstructured neurological notes before processing to keep the pipeline HIPAA compliant.",
        "Reached 96.3% extraction accuracy in FHIR JSON format with a Pydantic and Pandas validation engine, and filtered outputs to catch hallucinated seizure histories.",
        "Added a ChromaDB-backed natural language Q&A feature so doctors can ask about a patient's medical history.",
      ],
      link: { label: "Extraction pipeline source code", href: "https://github.com/LakshinG/Epic-api" },
    },
    {
      role: "Agentic AI Development Intern",
      org: "Advanced Computational Medicine (ACM)",
      start: "Jun 2025",
      end: "Nov 2025",
      points: [
        "Helped build a multi-agent RAG pipeline for doctors and patients working on cyber neuro analysis.",
        "Built an agent that synthesizes insights from 5,000+ PubMed articles, reaching 95.8% accuracy across 500 evaluations.",
        "Wrote a Pandas data agent that ingests complex clinical data and resolves schema conflicts, and automated neuro-anomaly detection with statistical scripts.",
        "Cut average query response time to under 20 seconds.",
      ],
      link: { label: "CyberNeuro live demo", href: "https://acmlab.github.io/brain-network-chart/" },
    },
  ],

  education: [
    {
      school: "University of North Carolina at Chapel Hill",
      degree: "B.S. Computer Science and B.S. Statistics & Analytics, GPA 3.8",
      dates: "expected May 2028",
      notes:
        "Coursework: Data Structures & Algorithms, Artificial Intelligence, Systems Programming, Software Engineering Lab, Probability for Data Science, Discrete Math, Assembly and C.",
    },
  ],

  skills: {
    Languages: ["Python", "Java", "C", "C++", "TypeScript", "Go", "SQL", "Bash", "R", "C#", "RISC-V assembly"],
    "Frameworks and libraries": ["PyTorch", "FastAPI", "Next.js", "React", "Pandas", "NumPy", "Pydantic", "Celery", "LangChain", "gRPC"],
    "Infrastructure and tools": ["AWS", "GCP", "Docker", "Kubernetes", "Terraform", "PostgreSQL", "MySQL", "CI/CD"],
    Areas: ["Machine learning", "LLM and RAG systems", "Computer vision", "Distributed systems"],
  },
};
