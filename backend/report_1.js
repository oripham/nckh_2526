const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType,
  PageNumber, NumberFormat, Footer, Header, TabStopType, TabStopPosition,
  LevelFormat, UnderlineType, PageBreak
} = require('docx');
const fs = require('fs');

// ─── Helpers ───────────────────────────────────────────────────────────────

const FONT = "Times New Roman";
const BODY_SIZE = 24; // 12pt
const H1_SIZE = 28;   // 14pt
const H2_SIZE = 26;   // 13pt
const H3_SIZE = 24;   // 12pt
const LINE_SPACING = { line: 480, lineRule: "auto" }; // double spacing
const PARA_SPACE = { before: 0, after: 200 };

const thickBorder = { style: BorderStyle.SINGLE, size: 2, color: "000000" };
const thinBorder  = { style: BorderStyle.SINGLE, size: 1, color: "AAAAAA" };
const noBorder    = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };

function body(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text, font: FONT, size: BODY_SIZE, ...opts })],
    spacing: { ...LINE_SPACING, ...PARA_SPACE },
    alignment: AlignmentType.JUSTIFIED,
  });
}

function bodyRuns(runs, indent = {}) {
  return new Paragraph({
    children: runs.map(r => new TextRun({ font: FONT, size: BODY_SIZE, ...r })),
    spacing: { ...LINE_SPACING, ...PARA_SPACE },
    alignment: AlignmentType.JUSTIFIED,
    indent,
  });
}

function h1(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: FONT, size: H1_SIZE, bold: true })],
    heading: HeadingLevel.HEADING_1,
    spacing: { line: 480, before: 400, after: 200 },
    alignment: AlignmentType.LEFT,
  });
}

function h2(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: FONT, size: H2_SIZE, bold: true })],
    heading: HeadingLevel.HEADING_2,
    spacing: { line: 480, before: 300, after: 160 },
    alignment: AlignmentType.LEFT,
  });
}

function h3(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: FONT, size: H3_SIZE, bold: true, italics: true })],
    heading: HeadingLevel.HEADING_3,
    spacing: { line: 480, before: 240, after: 120 },
    alignment: AlignmentType.LEFT,
  });
}

function blank() {
  return new Paragraph({ children: [new TextRun("")], spacing: { line: 240, before: 0, after: 0 } });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()], spacing: { line: 240, before: 0, after: 0 } });
}

function centeredBold(text, size = BODY_SIZE) {
  return new Paragraph({
    children: [new TextRun({ text, font: FONT, size, bold: true })],
    alignment: AlignmentType.CENTER,
    spacing: { line: 360, before: 120, after: 120 },
  });
}

function centered(text, size = BODY_SIZE) {
  return new Paragraph({
    children: [new TextRun({ text, font: FONT, size })],
    alignment: AlignmentType.CENTER,
    spacing: { line: 360, before: 80, after: 80 },
  });
}

// ─── Content ────────────────────────────────────────────────────────────────

const children = [

  // ── Title Page ──────────────────────────────────────────────────────────
  blank(), blank(), blank(),
  centeredBold("GRETAA CORPORATION IN VIETNAM'S E-COMMERCE LANDSCAPE:", 32),
  centeredBold("OPPORTUNITIES, THREATS, STRATEGIES, AND FUNDING", 32),
  blank(), blank(),
  centeredBold("Business Report", 26),
  blank(), blank(),
  centered("Submitted in Partial Fulfilment of Course Requirements", 22),
  blank(),
  centered("Course: E-Commerce and Digital Business", 22),
  centered("Academic Year: 2025–2026", 22),
  blank(), blank(),
  centered("Author: [Student Name]", 22),
  centered("Student ID: [Student ID]", 22),
  centered("Instructor: [Instructor Name]", 22),
  centered("Institution: [University Name]", 22),
  blank(), blank(),
  centered("Date of Submission: May 2026", 22),
  pageBreak(),

  // ── 1. Executive Summary ────────────────────────────────────────────────
  h1("1. EXECUTIVE SUMMARY"),
  blank(),
  h2("1.1 Overview of the Report"),
  body("Vietnam's e-commerce sector has emerged as one of Southeast Asia's most dynamic digital economies, driven by rapid internet adoption, a young and mobile-first consumer base, and accelerating government-led digital transformation initiatives. Against this backdrop, Gretaa Corporation — a Ho Chi Minh City-based e-commerce platform founded in 2011 by Nguyen Nhat Pham — exemplifies both the entrepreneurial opportunities and structural challenges that define the competitive landscape for small and medium enterprises (SMEs) operating in Vietnam's online retail market. This report systematically evaluates the industry's growth context, identifies key opportunities and threats relevant to businesses such as Gretaa, proposes evidence-based strategies to address competitive and operational pressures, and analyses appropriate funding pathways alongside investor concerns regarding sustainability, profitability, and management capability."),
  blank(),
  h2("1.2 Key Findings"),
  body("Three principal opportunities have been identified: a rapidly expanding digital consumer base fuelled by rising middle-class incomes and high smartphone penetration; growing consumer demand for authentic, quality-assured products in an environment historically plagued by counterfeit goods; and government-backed digital economy policies that reduce structural barriers for SME adoption of digital tools and payment infrastructure. Conversely, the three most critical threats are the overwhelming competitive dominance of large platform players — notably Shopee, Lazada, and TikTok Shop — whose economies of scale structurally disadvantage smaller operators; persistent last-mile logistics inefficiencies, particularly outside major urban centres; and cybersecurity vulnerabilities and consumer trust erosion arising from fraud and counterfeit proliferation. Recommended strategies include deliberate niche market positioning, strategic third-party logistics partnerships, and systematic investment in brand transparency and customer service infrastructure."),
  blank(),
  h2("1.3 Overall Conclusion"),
  body("Vietnam's e-commerce market presents compelling long-term growth potential; however, the ability of SMEs to capture that value will depend not on volume-driven expansion but on operational discipline, genuine product differentiation, and the cultivation of verifiable consumer trust — qualities that large incumbent platforms have historically underinvested in and that represent the most viable competitive space for businesses like Gretaa."),
  blank(),
  pageBreak(),

  // ── 2. Introduction ──────────────────────────────────────────────────────
  h1("2. INTRODUCTION TO THE CASE"),
  blank(),
  h2("2.1 Background of Vietnam's E-Commerce Industry"),
  body("Vietnam's digital economy has undergone a structural transformation over the past decade that few analysts anticipated at the speed and scale it ultimately occurred. According to the Google, Temasek, and Bain & Company e-Conomy SEA 2024 report, Vietnam's digital economy reached approximately USD 36 billion in Gross Merchandise Value (GMV) in 2024, with the e-commerce vertical remaining the single largest contributor, and is projected to exceed USD 60 billion by 2030 (Google, Temasek, & Bain & Company, 2024). Internet penetration surpassed 79% of the population by 2024 (Statista, 2024a), while smartphone penetration exceeded 73%, providing the foundational infrastructure for mobile-first commerce behaviours that now define the majority of online shopping interactions in Vietnam (GSMA Intelligence, 2024)."),
  body("These technological conditions have coincided with meaningful demographic and economic shifts. Vietnam's rising middle class — projected by the World Bank (2023) to grow to approximately 26 million households by 2026 — increasingly expects the convenience, pricing transparency, and product variety that online retail uniquely delivers. Younger consumers, particularly the Gen Z and millennial cohorts that represent over half of Vietnam's 98 million population, have been socialised into digital commerce to an extent that physical retail alone cannot satisfy (McKinsey & Company, 2024). Critically, consumer behaviour is not simply shifting toward online channels; it is becoming increasingly sophisticated. Shoppers now compare prices across platforms, read peer reviews, and demand faster, more reliable delivery — creating both competitive pressure and differentiation opportunity for platform operators."),
  body("The Vietnamese government's National Digital Transformation Program (Decision No. 749/QD-TTg), which targets 50% of economic activities to be digitised by 2025, has further accelerated this trajectory (Ministry of Information and Communications of Vietnam, 2023). Policy support includes preferential access to credit for digitising SMEs, investment in national logistics corridors, and the expansion of interoperable digital payment infrastructure — all of which lower the structural barriers that historically restricted small operators from competing effectively in online channels."),
  blank(),
  h2("2.2 Background of Gretaa Corporation"),
  body("Founded in 2011 by Nguyen Nhat Pham, a technology professional who identified critical gaps in Vietnam's nascent online retail environment, Gretaa Corporation began as a specialised online bookstore operating out of Ho Chi Minh City. This origin is strategically significant and deserves analytical attention beyond its narrative value. The decision to begin with books was not merely a matter of personal affinity or market familiarity; it reflected a coherent business logic rooted in inventory controllability, supply chain simplicity, and trust-building potential. Books are a standardised, non-perishable product category with well-established supplier relationships, low return rates, and a consumer base that — in the early 2010s — was among the most digitally literate and earliest to adopt online purchasing behaviours in Vietnam. By concentrating initial operations on a single, manageable product category, Pham's team was able to build repeatable fulfilment processes, establish supplier credibility, and accumulate customer trust before introducing the operational complexity that broader categories inherently bring."),
  body("From this foundation, Gretaa progressively expanded into electronics, lifestyle products, and household goods — sectors that carry higher margins but also higher operational and reputational risks, particularly in a market where counterfeit products and unreliable delivery have historically deterred consumer adoption. The company's early investment in proprietary inventory management systems, rather than relying solely on third-party seller models, gave it a quality assurance advantage that distinguished it from more open-marketplace competitors. Over the subsequent decade, Gretaa evolved into a multi-category e-commerce platform competing within a market increasingly dominated by well-funded regional giants, a position that encapsulates the broader strategic challenge facing Vietnam's independent e-commerce operators."),
  blank(),
  h2("2.3 Purpose of the Report"),
  body("This report pursues four interrelated objectives. First, it evaluates the specific opportunities available to e-commerce SMEs such as Gretaa within Vietnam's digital economy, grounded in current market data and contextualised against structural industry dynamics. Second, it identifies the most significant threats facing such businesses, with particular attention to competitive asymmetries, operational vulnerabilities, and consumer trust risks. Third, it proposes practical, implementable business strategies with clear rationale, expected outcomes, and acknowledged limitations. Fourth, it analyses appropriate funding pathways for Gretaa's growth stage and critically examines the investor concerns that would most likely govern external capital decisions. The report draws on peer-reviewed academic literature, industry reports from credible institutions, and Vietnam-specific policy and market data to ensure the analysis is both theoretically grounded and practically relevant."),
  blank(),
  pageBreak(),

  // ── 3. Case Evaluation ────────────────────────────────────────────────────
  h1("3. CASE EVALUATION: OPPORTUNITIES AND THREATS"),
  blank(),
  h2("3.1 Current Situation of Vietnam's E-Commerce Industry"),
  blank(),
  h3("3.1.1 Industry Growth"),
  body("Vietnam's e-commerce market recorded a compound annual growth rate (CAGR) of approximately 20% between 2020 and 2024, outpacing the regional average for Southeast Asia and maintaining its position among the sector's fastest-growing markets globally (Google, Temasek, & Bain & Company, 2024). Digital payment infrastructure has expanded significantly, with the State Bank of Vietnam reporting a 50% year-on-year increase in non-cash transactions in 2023 (State Bank of Vietnam, 2023), and mobile payment adoption accelerating substantially through platforms such as MoMo, VNPay, and ZaloPay. Investment in logistics infrastructure — including the expansion of J&T Express, Ninja Van, and GHTK delivery networks — has reduced average urban delivery times, though rural coverage remains inadequate."),
  body("What these aggregate figures do not reveal, however, is the distributional reality of market growth. The majority of GMV growth has concentrated within the top three to four platform operators, meaning that industry-level expansion does not uniformly translate into growth for all participants. This distinction is critical: a rising tide does not lift all boats equally when market power is as concentrated as it is in Vietnam's e-commerce sector."),
  blank(),
  h3("3.1.2 Consumer Trends"),
  body("Vietnamese online consumers exhibit a distinctive combination of price sensitivity and quality consciousness — a duality that creates both tension and opportunity for platform operators. On one hand, promotional pricing, free shipping campaigns, and flash sales have become deeply embedded in consumer expectations, largely as a consequence of Shopee and Lazada's aggressive customer acquisition strategies. On the other hand, a countervailing trend toward quality verification and brand authenticity has emerged, particularly among higher-income urban consumers who have experienced the frustration of counterfeit or substandard products (Nguyen & Nguyen, 2023). Social commerce — particularly through TikTok Shop and Facebook Marketplace — is reshaping discovery patterns, with a growing proportion of online purchase journeys beginning through short-form video content rather than direct platform searches (McKinsey & Company, 2024). This structural shift in the consumer funnel has profound implications for how smaller operators must allocate marketing resources and design their brand communications."),
  blank(),
  h3("3.1.3 Competitive Landscape"),
  body("The Vietnamese e-commerce competitive environment is characterised by pronounced platform oligopoly. Shopee, operated by Sea Limited, commands an estimated 63% market share by active buyers as of 2024, supported by a USD multi-billion investment mandate that enables sustained losses in exchange for market penetration (Statista, 2024b). Lazada, backed by Alibaba Group, occupies the second tier with a strategic emphasis on logistics infrastructure investment and premium brand partnerships. TikTok Shop — which merged with Tokopedia's Southeast Asia operations — has executed one of the most disruptive market entries in the region's digital retail history, leveraging its algorithmically driven content platform to create an integrated discovery-to-purchase funnel that fundamentally challenges the search-and-browse model on which traditional marketplaces depend (Financial Times, 2024). Tiki, Vietnam's domestically founded platform, has increasingly struggled to maintain competitive relevance against these capitalised regional players, illustrating precisely the structural challenge that confronts any independent Vietnamese e-commerce operator."),
  body("The structural disadvantage for SMEs in this environment operates at multiple levels simultaneously. In terms of customer acquisition costs (CAC), large platforms benefit from dramatically lower marginal cost of acquiring new users because their existing user bases create network effects that organic referral, cross-promotion, and data-driven personalisation amplify — advantages that cannot be replicated with the budget constraints typical of an SME. In terms of pricing, the ability of Shopee and Lazada to absorb sustained losses across entire product categories through cross-subsidisation makes it functionally impossible for smaller operators to compete on price without destroying their own unit economics. In terms of logistics, the investment large platforms have made in proprietary fulfilment networks provides them cost and speed advantages that small operators dependent on third-party providers cannot match at equivalent service levels. This is not simply a matter of being outspent; it reflects fundamental asymmetries in market structure that require strategic responses beyond conventional cost-reduction measures."),
  blank(),
  h2("3.2 Key Opportunities for Small E-Commerce Businesses"),
  blank(),
  h3("Opportunity 1: Growing Digital Consumer Market"),
  body("Vietnam's digital consumer base continues to expand at a pace that creates genuine incremental market opportunity for operators at all scales. Statista (2024c) projects that Vietnam's e-commerce user penetration will reach 60% of the total population by 2027, implying the addition of several million first-time online shoppers annually. Crucially, the geographic distribution of this growth increasingly includes secondary cities and peri-urban areas — markets where large platforms have less concentrated presence and where first-mover advantages for localised operators remain available. The expansion of Vietnam's middle class, projected by the World Bank (2023) to grow at 5–7% annually through 2027, is simultaneously increasing average per-transaction values and reducing the extreme price sensitivity that has historically constrained margin potential in Vietnamese e-commerce."),
  body("The structural rise of younger consumers — those born after 1995 who have never experienced commerce without digital options — is particularly consequential. Research by McKinsey & Company (2024) indicates that Vietnamese Gen Z consumers demonstrate above-average willingness to pay premiums for brands that signal quality, sustainability, and authenticity. This preference pattern creates a credible market segment that volume-first platforms are structurally ill-equipped to serve, precisely because their business model optimises for breadth and price rather than depth and trust."),
  body("However, market growth alone constitutes neither a strategy nor a guarantee of success. A market that is growing by 20% annually is also a market that is attracting an increasing number of competitors — including well-capitalised foreign entrants — who will compete for the same marginal consumer. The critical question for Gretaa is not whether the market is growing but whether the company possesses a differentiation strategy sufficiently robust to claim a defensible share of that growth. Without that differentiation, expansion of the addressable market simply means more competition for undifferentiated demand."),
  blank(),
  h3("Opportunity 2: Increasing Demand for Authentic and Quality Products"),
  body("Consumer distrust of counterfeit and substandard products represents one of the most persistent structural vulnerabilities in Vietnamese e-commerce, and simultaneously one of the most commercially exploitable opportunities for operators that can credibly address it. A 2023 survey by the Vietnam E-Commerce Association (VECOM, 2023) found that 58% of Vietnamese online shoppers reported having received a product that did not match its online description, and 41% had encountered suspected counterfeit goods through major marketplace platforms. These figures are not merely statistics of consumer disappointment; they represent a fundamental deficit of trust that constrains market expansion and suppresses average transaction values."),
  body("Gretaa's original business model, centred on proprietary inventory management and direct sourcing rather than open third-party seller models, positions the company to address this trust deficit in a manner that open marketplaces structurally cannot. When a platform operates on a marketplace model that allows any seller to list products, the enforcement of authenticity standards becomes a reactive, compliance-based exercise rather than an intrinsic feature of the business model. By contrast, when a platform directly manages its inventory and assumes responsibility for product quality before sale, authenticity becomes an embedded operational characteristic. This is the brand trust architecture that Gretaa's history suggests it is positioned to develop, and it corresponds directly to an identifiable consumer demand that is growing rather than diminishing."),
  body("The strategic implication is that trust-based branding is not simply a marketing positioning exercise; it is a sustainable competitive moat when it is operationally grounded. Research in e-commerce consumer behaviour by Gefen, Karahanna, and Straub (2003) — foundational work whose conclusions have been repeatedly validated in emerging market contexts — demonstrates that perceived trustworthiness is the single most significant predictor of purchase intention in online environments where product quality cannot be physically verified. More recent empirical work by Nguyen and Nguyen (2023) confirms that Vietnamese consumers who have experienced product authenticity assurance from a platform demonstrate significantly higher repeat purchase rates and lower price sensitivity, creating the conditions for the long-term customer lifetime value that Gretaa must build to compete sustainably."),
  blank(),
  h3("Opportunity 3: Government Support for Digital Transformation"),
  body("Vietnam's national digital transformation agenda has created a structural tailwind for e-commerce SMEs that extends beyond rhetorical policy commitment. The Ministry of Industry and Trade's (MOIT) e-commerce development plan for 2021–2025 specifically targets an increase in the proportion of the population participating in e-commerce to 55% and the growth of e-commerce in total retail sales to 10% (Ministry of Industry and Trade of Vietnam, 2021). The accompanying policy instruments include preferential credit access for SME digitalisation through the Vietnam Development Bank, VAT incentives for digital payment transactions, and investments in the national logistics infrastructure that reduce last-mile delivery costs in underserved regions."),
  body("The expansion of Vietnam's digital payment ecosystem is particularly significant. The State Bank of Vietnam (2023) reported that mobile payment transaction volumes grew by 103% in 2023, driven by regulatory encouragement of interoperable payment rails and the widespread adoption of QR-code-based payments across retail settings. For e-commerce operators, lower payment friction translates directly into higher conversion rates at the point of purchase — a measurable operational benefit that compounds over time as digital payment habits become normalised across demographic groups."),
  body("Nonetheless, the limits of policy support must be acknowledged with analytical honesty. Government programmes create enabling conditions; they do not generate operational success. SMEs that rely on policy support as a primary competitive strategy rather than as a complement to genuine capability development tend to underperform when support mechanisms are restructured or when implementation lags between policy announcement and operational impact prove longer than anticipated. For Gretaa, the appropriate framing of government digital transformation initiatives is as a facilitating environment that reduces structural barriers, rather than as a strategic substitute for differentiated positioning and operational excellence."),
  blank(),
  h2("3.3 Major Threats for Similar Businesses"),
  blank(),
  h3("Threat 1: Intense Competition from Large E-Commerce Platforms"),
  body("The competitive threat posed by Shopee, Lazada, and TikTok Shop to smaller Vietnamese e-commerce operators is not simply a matter of scale — it is a matter of the fundamental mechanics through which platform economics create self-reinforcing advantages that become progressively harder to challenge as incumbents grow. Shopee's free-shipping programme, for example, is not a promotional tactic; it is a strategic investment in suppressing consumer price sensitivity to shipping costs in ways that redefine the baseline service expectation for the entire industry. When Shopee conditions millions of consumers to expect free shipping as a standard feature, any platform that charges for delivery becomes comparatively inferior in consumer perception, regardless of the actual quality difference in products or service. The cost of meeting this expectation is absorbed by Shopee's cross-subsidisation model — but it is simultaneously imposed on every other operator in the market as a new baseline that must be matched."),
  body("Customer acquisition costs represent a second dimension of competitive asymmetry that receives insufficient attention in analyses focused primarily on price competition. Acquiring a new customer through paid digital advertising in Vietnam's e-commerce market now costs an estimated USD 8–15 per acquired user, depending on product category and targeting specificity (Deloitte, 2024). For an incumbent platform with 50 million registered users, the marginal cost of reactivating a dormant customer is a fraction of this figure, because data-driven personalisation, push notification infrastructure, and established brand recognition reduce the reliance on paid media. For an SME attempting to grow its customer base from a smaller installed base, the full burden of paid acquisition costs must be absorbed in unit economics that may not yet support those expenditures sustainably."),
  body("The consequence for businesses like Gretaa is a structural trap: competing on price accelerates cash burn without building sustainable competitive advantage, while maintaining premium positioning risks abandoning volume markets where large platforms dominate. The only strategically coherent resolution is a third path — differentiation into market segments where large platforms' competitive strengths become less relevant and where smaller operators can build loyalty through depth of specialisation rather than breadth of assortment."),
  blank(),
  h3("Threat 2: Logistics and Supply Chain Challenges"),
  body("Vietnam's logistics infrastructure, while improving, remains characterised by significant geographic and operational unevenness that imposes disproportionate costs and operational risks on smaller e-commerce operators. The World Bank's Logistics Performance Index (2023) ranks Vietnam 43rd globally — a creditable position that nonetheless masks substantial variation between the well-serviced Ho Chi Minh City–Hanoi corridor and the rural provinces where last-mile delivery costs can exceed three to four times urban equivalents, where road quality imposes transit time penalties, and where cold-chain capabilities for perishable products are effectively absent."),
  body("For an e-commerce platform attempting to serve a national customer base, these logistics realities translate into a fundamental service quality inequality: customers in major urban centres receive a materially different delivery experience than those in rural or semi-urban areas. When that quality gap manifests as delayed, damaged, or lost shipments, the reputational consequences fall on the platform brand rather than the logistics provider — even when the fault is operationally attributable to the third-party carrier. This dynamic creates a trust erosion risk that is particularly acute for an operator like Gretaa whose brand positioning depends precisely on the reliability and quality assurance that poor logistics performance directly undermines."),
  body("Furthermore, the cost structure of logistics for SMEs is inherently more burdensome than for large platforms. Major marketplace operators can negotiate preferential rates with logistics providers based on volume commitments that a smaller platform cannot match. The resulting cost differential — estimated by Deloitte (2024) to be in the range of 15–25% per shipment for SMEs compared to large platform rates — compounds directly into either margin compression or customer-facing price disadvantages. Managing this structural cost asymmetry requires deliberate strategic choices about logistics partnerships, geographic market focus, and inventory positioning."),
  blank(),
  h3("Threat 3: Cybersecurity and Consumer Trust Issues"),
  body("Cybersecurity risk and the erosion of consumer trust through fraudulent activity represent a threat dimension that is simultaneously external in origin and internal in consequence. Vietnam's e-commerce ecosystem has experienced multiple high-profile incidents of payment fraud, account hijacking, and counterfeit product operations in recent years, with the Ministry of Public Security reporting a 42% increase in e-commerce-related fraud cases between 2022 and 2024 (Ministry of Public Security of Vietnam, 2024). These incidents do not affect only the platforms that experience them directly; they generate industry-wide trust deficits that suppress consumer willingness to conduct high-value transactions online, with disproportionate impact on smaller platforms whose brand recognition is insufficient to independently counteract the reputational contamination of sector-wide fraud news."),
  body("For Gretaa, the cybersecurity threat operates at multiple levels. At the transactional level, inadequate payment security infrastructure exposes both consumers and the platform to direct financial fraud. At the data level, inadequate protection of customer personal information creates regulatory exposure under Vietnam's Cybersecurity Law (Law No. 24/2018/QH14) and its implementing regulations, which impose significant penalties for data breaches. At the brand level, any association with fraudulent activity — even if the platform is itself a victim rather than a perpetrator — can permanently alter consumer trust perceptions that may have taken years to build. The reputational asymmetry here is severe: trust can be eroded by a single incident and may require sustained investment over multiple years to recover."),
  body("The academic literature on trust in e-commerce contexts is unambiguous on this point. Kim, Ferrin, and Rao (2008) demonstrate that security risk perceptions have a significantly stronger negative effect on purchase intentions than the positive effect of perceived trust, implying that the marginal impact of a negative security event is disproportionate relative to the equivalent investment in trust-building. For a platform like Gretaa whose competitive advantage is predicated on trust, the strategic imperative is not simply to build trust but to protect it with the same rigour applied to product quality and customer service."),
  blank(),
  pageBreak(),

  // ── 4. Strategies ──────────────────────────────────────────────────────────
  h1("4. STRATEGIES AND SOLUTIONS"),
  blank(),
  h2("4.1 Strategy to Overcome Competitive Pressure: Niche Market Positioning"),
  body("The logic of niche market positioning as a competitive response to platform oligopoly is not simply theoretical. It is the empirically validated pathway through which the majority of successful SME e-commerce operators in mature digital economies have achieved sustainable differentiation. The academic framework most applicable here is Porter's (1985) focus strategy — the deliberate concentration of competitive effort on a narrowly defined market segment in which the operator can achieve cost or differentiation advantages that are not replicable by broader competitors. Applied to Gretaa's context, this means identifying product verticals or customer segments where the platform's existing strengths in quality assurance, authentic sourcing, and service reliability create genuinely superior value propositions relative to what Shopee or Lazada can practically deliver."),
  body("Viable niche directions for Gretaa include premium specialty books and educational materials — an extension of the company's founding category strength — as well as certified authentic electronics, curated eco-friendly household products, and locally sourced artisanal goods. Each of these segments shares a common structural characteristic: consumers in these categories exhibit above-average willingness to pay premiums for verified quality and authenticity, are comparatively less responsive to price-driven promotions, and demonstrate higher brand loyalty once trust is established. This combination of characteristics directly neutralises the price-war dynamics through which large platforms most powerfully suppress smaller competitors."),
  body("The implementation logic requires disciplined restraint. Niche positioning only delivers its competitive benefits if the operator resists the temptation to expand product range in pursuit of volume — a temptation that is particularly acute when growth metrics are a primary performance indicator for investors or internal stakeholders. The expected outcome of a coherent niche strategy, executed consistently over a two-to-three-year horizon, is a customer base of lower volume but substantially higher lifetime value, lower churn rates, and stronger word-of-mouth acquisition that progressively reduces dependence on paid marketing spend. The primary limitation of this approach is its inherent growth ceiling: a niche market is by definition smaller than the broader addressable market, which may create tension with investor expectations of rapid revenue growth. This trade-off must be explicitly managed in Gretaa's stakeholder communications."),
  blank(),
  h2("4.2 Strategy to Improve Logistics Efficiency: Strategic Logistics Partnerships"),
  body("Given the structural cost disadvantages that Gretaa faces as an SME in accessing favourable logistics pricing, the most practically achievable strategy is not to build proprietary delivery infrastructure — a capital requirement far beyond the reach of most SMEs — but to develop strategic partnerships with third-party logistics (3PL) providers that optimise service quality and cost efficiency within realistic budgetary constraints. Vietnam's 3PL market has matured significantly, with providers including GHTK, J&T Express, and Viettel Post offering tiered service agreements that can be tailored to the specific volume and delivery speed requirements of different customer segments."),
  body("The strategic implementation should be differentiated by customer segment and geographic zone. For urban customers with high order frequency and high product value, a partnership with a premium 3PL provider offering same-day or next-day delivery capability — even at a higher per-shipment cost — is justified by the trust reinforcement and repeat purchase stimulation that reliable fast delivery generates. For rural or semi-urban customers, a different logistics arrangement that prioritises cost efficiency and reasonable delivery time windows over speed premium is more appropriate. This segmented logistics architecture requires investment in an order management system capable of routing orders intelligently based on customer location, product type, and delivery priority — an investment in operational technology that pays dividends across multiple dimensions of platform performance."),
  body("Complementary to logistics partnerships, Gretaa should evaluate the implementation of a distributed micro-fulfilment model — positioning small inventory buffers in secondary cities to reduce the last-mile delivery distance and cost for markets where demand is predictable and concentrated. This approach has been successfully piloted by several mid-sized regional e-commerce operators in Indonesia and Thailand, and the operational learnings are transferable to the Vietnamese context (PwC, 2023). The expected outcome is a measurable reduction in average delivery time and cost for the targeted geographic zones, with corresponding improvements in customer satisfaction scores and repeat purchase rates. The primary limitation is the upfront capital requirement for inventory positioning and warehouse agreements, which must be carefully calibrated against demand projections."),
  blank(),
  h2("4.3 Strategy to Strengthen Consumer Trust: Brand Transparency and Customer Service Excellence"),
  body("Building sustainable consumer trust in Vietnam's e-commerce environment is not achievable through marketing communications alone. It requires the systematic implementation of operational practices that make trust claims verifiable rather than merely asserted. The most impactful mechanisms in this regard are product authenticity certification — partnering with recognised certification bodies or manufacturer authorisation programmes to provide third-party verified assurance of product genuineness — explicit and friction-free returns policies that signal confidence in product quality, and customer service infrastructure that resolves complaints at a pace and quality that exceeds consumer expectations established by large platform competitors."),
  body("Gretaa's existing history of direct inventory management gives it a structural foundation for credible authenticity claims that marketplace platforms cannot match. The strategic imperative is to make this operational reality visible to consumers through transparent sourcing documentation, manufacturer authorisation displays, and product provenance information that differentiates the purchasing experience. Research by Pavlou and Fygenson (2006) demonstrates that the provision of verifiable assurances — as opposed to mere assertion — significantly increases consumer trust formation, particularly in product categories where quality is difficult to assess from product images alone."),
  body("The implementation of a proactive customer service function — rather than the reactive complaint-handling model that characterises most e-commerce platforms — is a further dimension of trust-building that carries disproportionate commercial value. Academic research consistently demonstrates that customers who experience a service failure that is subsequently resolved with speed and genuine ownership of responsibility exhibit higher long-term loyalty than customers who never experienced a failure at all — a phenomenon known as the service recovery paradox (McCollough, Berry, & Yadav, 2000). For Gretaa, building a customer service capability that treats every post-purchase interaction as an opportunity to reinforce trust rather than simply to close a complaint ticket represents a sustainable competitive investment. The limitation of this strategy is its time horizon: genuine trust-building operates on a multi-year timescale and cannot be accelerated through short-term promotional substitutes. Consistency of execution over time is the only mechanism through which trust is genuinely accumulated."),
  blank(),
  pageBreak(),

  // ── 5. Funding and Resources ──────────────────────────────────────────────
  h1("5. FUNDING AND RESOURCES"),
  blank(),
  h2("5.1 Funding Strategy 1: Personal Savings (Bootstrapping)"),
  body("Bootstrapping — the self-financing of business operations through personal savings and retained earnings — was the necessary funding mode of Gretaa's earliest operational stage and remains a strategically legitimate option at certain growth phases. The primary advantage of bootstrapping is the preservation of full ownership control, which allows the founder to make strategic decisions aligned with long-term platform integrity rather than short-term investor metrics. This ownership coherence is particularly valuable in trust-building strategies, which may require sustained investment over periods during which immediate financial returns are limited. A second advantage is the discipline imposed by capital scarcity: companies that cannot rely on external funding to finance operational inefficiencies are compelled to develop lean operational capabilities and focus on genuine unit economics from early stages — habits that compound favourably over time."),
  body("The decisive limitation of bootstrapping is scale constraint. Self-funded growth is necessarily linear and capital-limited, making it poorly suited to the rapid inventory expansion, technology investment, and customer acquisition required to compete effectively in a market where well-funded competitors can grow exponentially. For Gretaa at its current stage of development — where the competitive environment demands investment in logistics partnerships, technology infrastructure, and marketing — bootstrapping as the sole funding strategy risks ceding market position to better-capitalised competitors at precisely the moment when differentiation investments are most commercially critical."),
  blank(),
  h2("5.2 Funding Strategy 2: Bank Loans"),
  body("Debt financing through commercial bank loans offers a more substantial capital base than bootstrapping while preserving full equity ownership. Vietnam's banking sector has expanded access to SME lending in recent years, supported by the State Bank of Vietnam's directed credit programmes and the Vietnam Development Bank's preferential rate facilities for qualifying digital enterprises (State Bank of Vietnam, 2023). For Gretaa, bank financing is most appropriately applied to investments with predictable, measurable returns and manageable repayment timelines — logistics infrastructure improvements, inventory management system upgrades, and warehouse lease agreements are examples where the cash flow impact can be modelled with reasonable precision."),
  body("The critical limitation of bank financing is the repayment obligation, which introduces fixed cash outflows that can become structurally problematic during periods of revenue volatility or market disruption. Vietnam's SME lending rates typically range from 8–12% per annum for commercial loans (State Bank of Vietnam, 2023), creating an interest burden that must be managed against operating margins that are already under pressure from competitive and logistics cost dynamics. A further consideration is collateral requirements: Vietnamese commercial banks typically require tangible asset collateral that digital-first businesses — whose primary assets are brand value, customer data, and operational capabilities — may struggle to provide at the scale required for substantial loan facilities."),
  blank(),
  h2("5.3 Funding Strategy 3: Angel Investors"),
  body("Angel investment — early-stage equity capital provided by high-net-worth individuals with relevant sector experience — offers Gretaa access to capital combined with mentorship, industry networks, and strategic guidance that purely financial sources cannot provide. In Vietnam's developing startup ecosystem, angel investors with backgrounds in e-commerce, logistics, or consumer technology can contribute market knowledge, supplier introductions, and operational expertise that meaningfully accelerates capability development beyond what capital alone enables. The Vietnam Angel Investment Network and Ho Chi Minh City's growing technology entrepreneurship community provide accessible channels for identifying appropriate angel investors."),
  body("The primary disadvantage of angel investment is equity dilution — the transfer of an ownership stake that reduces the founder's long-term economic participation in the business's value creation. This dilution is most consequential if early-round valuations are insufficiently favourable, as initial equity percentages establish the reference point for subsequent funding rounds. A secondary consideration is alignment risk: angel investors vary widely in their investment time horizons, return expectations, and involvement preferences. A poorly structured angel investment relationship can introduce governance tensions that distract from operational execution at precisely the stage when operational focus is most critical."),
  blank(),
  h2("5.4 Funding Strategy 4: Venture Capital"),
  body("Venture capital funding provides access to the largest and fastest capital deployment of any funding mechanism available to Gretaa, and is the mechanism most associated with the kind of rapid platform scaling that defines the competitive strategies of Shopee, Lazada, and TikTok Shop. Vietnamese VC activity has grown significantly, with Deal Street Asia (2024) reporting USD 630 million invested across Vietnamese technology and e-commerce companies in 2023. Regional VC firms including Do Ventures, Monk's Hill Ventures, and 500 Global have established active Vietnam portfolios, indicating genuine investor appetite for e-commerce opportunities that demonstrate scalability."),
  body("However, venture capital carries the most demanding set of expectations of any funding source, and those expectations create strategic obligations that must be evaluated honestly. VC investors typically require compound annual returns of 25–35% over a five-to-seven-year investment horizon, which implies growth trajectories that may not be compatible with the trust-building, quality-focused niche positioning recommended as Gretaa's primary competitive strategy. The tension between VC growth imperatives and operational sustainability is one of the most consistently observed failure patterns in e-commerce SMEs: companies that raise venture capital and prioritise user acquisition metrics over unit economics frequently discover that their business models become structurally unviable at scale (Damodaran, 2023). This dynamic is the underlying explanation for why many high-growth e-commerce companies that achieved impressive GMV figures ultimately failed to generate sustainable profits."),
  blank(),
  h2("5.5 Investors' Concerns"),
  blank(),
  h3("Concern 1: Business Sustainability"),
  body("The most fundamental question that any investor — angel, venture, or institutional — will apply to Gretaa is whether the business can achieve and maintain competitive relevance in a market structured for consolidation around large incumbents. This is not a question that can be answered with market growth statistics alone. The investor must be persuaded that Gretaa possesses a defensible competitive position — a structural reason why customers would choose Gretaa over Shopee or Lazada on a repeat basis, independent of promotional incentives. A business that is growing because the market is growing, rather than because it is capturing incremental market share from a distinct value proposition, does not represent a sustainable investment thesis. Gretaa's management must articulate — with operational evidence rather than strategic assertion — how the company's trust-based positioning, quality assurance infrastructure, and niche differentiation strategy constitute a durable competitive advantage rather than a temporary positioning opportunity."),
  blank(),
  h3("Concern 2: Profitability and Cash Flow"),
  body("Investor concern about profitability in Vietnam's e-commerce sector has intensified following the global re-rating of growth-stage technology businesses that occurred between 2022 and 2024 (Damodaran, 2023). The era of patient capital tolerating multi-year losses in exchange for GMV growth has substantially contracted; investors across the risk spectrum are now considerably more demanding about the visibility of the path to profitability and the quality of the unit economics underlying revenue growth. For Gretaa, the critical metrics are contribution margin per order (revenue minus variable fulfilment costs), customer lifetime value relative to customer acquisition cost (CLV:CAC ratio), and the trajectory of gross margin improvement as the company scales. A CLV:CAC ratio below 3:1 would raise serious investor concern about the sustainability of the customer acquisition model."),
  body("The high operational costs associated with e-commerce — marketing spend, logistics, returns management, technology maintenance, and customer service — can collectively generate a negative cash flow position even for businesses with nominally positive gross margins. Investors will scrutinise the cash conversion cycle, working capital requirements, and the degree to which operational cost efficiency is improving with scale rather than deteriorating."),
  blank(),
  h3("Concern 3: Management Capability"),
  body("A dimension of investor assessment that entrepreneurs frequently underestimate is the weight placed on management quality relative to business concept quality. The venture capital literature is consistent on this point: experienced investors often express the view that they would rather back a strong management team with a mediocre business idea than a weak team with an excellent one, because execution capability is the primary determinant of whether a business plan becomes operational reality (Kaplan & Strömberg, 2004). For Gretaa, this means that investor confidence will be substantially shaped by the founder's demonstrated ability to build and retain operational talent, make data-driven strategic decisions under competitive pressure, adapt the business model in response to market feedback, and communicate transparently with capital providers."),
  body("Specific management capability concerns for a platform of Gretaa's profile would include whether the leadership team possesses sufficient depth beyond the founder — a single-founder dependency creates significant key-person risk that investors price as a governance vulnerability. The demonstrated ability to manage the operational complexity of a multi-category e-commerce platform — including inventory management, supplier relationships, logistics partnerships, technology development, and customer service — requires competencies across multiple functional domains that early-stage teams frequently lack. Investors will evaluate whether the management team is building towards these capabilities through strategic hiring or whether it remains operationally dependent on the founder's individual bandwidth."),
  blank(),
  pageBreak(),

  // ── 6. Conclusion ──────────────────────────────────────────────────────────
  h1("6. CONCLUSION"),
  blank(),
  h2("6.1 Summary of Main Findings"),
  body("This report has evaluated Gretaa Corporation's strategic position within Vietnam's rapidly evolving e-commerce landscape, identifying three primary opportunities — the expansion of the digital consumer base, growing demand for authentic and quality-assured products, and a supportive government digital transformation policy environment — alongside three significant threats: the structural competitive dominance of large platform incumbents, persistent logistics infrastructure challenges, and the systemic erosion of consumer trust through fraud and counterfeit activity. In response to these dynamics, three implementable strategies have been proposed: deliberate niche market positioning to circumvent direct price competition with incumbents, strategic logistics partnerships to reduce delivery cost asymmetries, and systematic brand transparency investment to build verifiable consumer trust. These strategies are mutually reinforcing: a niche positioning strategy increases the commercial return on trust-building investment, while logistics reliability directly supports the product quality promise that trust positioning requires."),
  blank(),
  h2("6.2 Personal Evaluation"),
  body("Vietnam's e-commerce market genuinely offers significant long-term commercial potential, and the structural conditions — demographics, digital infrastructure, payment ecosystem maturity, and policy direction — are broadly favourable for sustained growth. However, survival and value creation for an SME such as Gretaa will not be determined by whether the market grows but by whether the company can build operational capabilities and brand equity that are genuinely differentiated from what large incumbent platforms deliver."),
  body("There is a critical and frequently observed failure pattern in this sector that deserves direct acknowledgement: many e-commerce SMEs focus disproportionately on revenue growth and order volume while neglecting the unit economics, operational infrastructure, and customer retention mechanics that determine long-term sustainability. Businesses that optimise for growth metrics — GMV, registered users, product listings — without proportional investment in fulfilment quality, customer satisfaction, and financial discipline frequently encounter inflection points at which rapid growth becomes a liability rather than an asset. The operational burden of serving a large, poorly retained customer base at inadequate margins is more damaging than the managed growth of a smaller, highly loyal, margin-positive one."),
  body("The long-term implication for Gretaa is that its most strategically durable path is not to attempt replication of the scale strategies that define Shopee or Lazada — strategies for which it lacks the capital, infrastructure, and market position to compete effectively — but to construct the operational, brand, and customer experience infrastructure that commands genuine loyalty within a well-defined market segment. In a competitive environment where scale advantages are structurally entrenched, differentiation through quality, trust, and operational excellence is not merely a defensive strategy. It is the only strategy with a credible long-term logic."),
  blank(),
  pageBreak(),

  // ── 7. References ──────────────────────────────────────────────────────────
  h1("7. REFERENCES"),
  blank(),
  body("Damodaran, A. (2023). The dark side of valuation: Valuing young, distressed, and complex businesses (3rd ed.). Pearson Education."),
  blank(),
  body("Deal Street Asia. (2024). Vietnam startup funding report 2023. https://www.dealstreetasia.com"),
  blank(),
  body("Deloitte. (2024). Vietnam e-commerce and digital economy outlook 2024. Deloitte Southeast Asia. https://www2.deloitte.com"),
  blank(),
  body("Financial Times. (2024, March 14). TikTok Shop reshapes Southeast Asia's e-commerce landscape. Financial Times. https://www.ft.com"),
  blank(),
  body("Gefen, D., Karahanna, E., & Straub, D. W. (2003). Trust and TAM in online shopping: An integrated model. MIS Quarterly, 27(1), 51–90. https://doi.org/10.2307/30036519"),
  blank(),
  body("Google, Temasek, & Bain & Company. (2024). e-Conomy SEA 2024: Steady states, new frontiers. https://economysea.withgoogle.com"),
  blank(),
  body("GSMA Intelligence. (2024). The mobile economy: Asia Pacific 2024. GSMA. https://www.gsma.com/solutions-and-impact/connectivity/gsma-intelligence/"),
  blank(),
  body("Kaplan, S. N., & Strömberg, P. (2004). Characteristics, contracts, and actions: Evidence from venture capitalist analyses. Journal of Finance, 59(5), 2177–2210. https://doi.org/10.1111/j.1540-6261.2004.00696.x"),
  blank(),
  body("Kim, D. J., Ferrin, D. L., & Rao, H. R. (2008). A trust-based consumer decision-making model in electronic commerce: The role of trust, perceived risk, and their antecedents. Decision Support Systems, 44(2), 544–564. https://doi.org/10.1016/j.dss.2007.07.001"),
  blank(),
  body("McCollough, M. A., Berry, L. L., & Yadav, M. S. (2000). An empirical investigation of customer satisfaction after service failure and recovery. Journal of Service Research, 3(2), 121–137. https://doi.org/10.1177/109467050032002"),
  blank(),
  body("McKinsey & Company. (2024). Digital consumers in Southeast Asia: Evolving behaviours and emerging opportunities. McKinsey Global Institute. https://www.mckinsey.com"),
  blank(),
  body("Ministry of Industry and Trade of Vietnam. (2021). Decision No. 645/QD-TTg: Approving the national e-commerce development master plan for the 2021–2025 period. Government of the Socialist Republic of Vietnam."),
  blank(),
  body("Ministry of Information and Communications of Vietnam. (2023). Vietnam national digital transformation program: Progress report 2023. Ministry of Information and Communications."),
  blank(),
  body("Ministry of Public Security of Vietnam. (2024). Annual cybercrime and e-commerce fraud report 2024. Ministry of Public Security."),
  blank(),
  body("Nguyen, T. D., & Nguyen, T. T. M. (2023). Consumer trust and purchase intention in Vietnam's e-commerce platforms: The mediating role of perceived authenticity. Journal of Retailing and Consumer Services, 72, 103279. https://doi.org/10.1016/j.jretconser.2023.103279"),
  blank(),
  body("Pavlou, P. A., & Fygenson, M. (2006). Understanding and predicting electronic commerce adoption: An extension of the theory of planned behaviour. MIS Quarterly, 30(1), 115–143. https://doi.org/10.2307/25148720"),
  blank(),
  body("Porter, M. E. (1985). Competitive advantage: Creating and sustaining superior performance. Free Press."),
  blank(),
  body("PwC. (2023). Navigating e-commerce logistics in Southeast Asia: Strategies for sustainable growth. PricewaterhouseCoopers. https://www.pwc.com/sg"),
  blank(),
  body("State Bank of Vietnam. (2023). Annual payment systems and digital banking report 2023. State Bank of Vietnam. https://www.sbv.gov.vn"),
  blank(),
  body("Statista. (2024a). Internet usage in Vietnam — Statistics and facts. Statista Research Department. https://www.statista.com/topics/4935/internet-usage-in-vietnam/"),
  blank(),
  body("Statista. (2024b). E-commerce in Vietnam — Market overview. Statista Research Department. https://www.statista.com/outlook/dmo/ecommerce/vietnam"),
  blank(),
  body("Statista. (2024c). E-commerce user penetration rate in Vietnam 2020–2027. Statista Research Department. https://www.statista.com"),
  blank(),
  body("Vietnam E-Commerce Association (VECOM). (2023). Vietnam e-commerce index report 2023. VECOM. https://www.vecom.vn"),
  blank(),
  body("World Bank. (2023). Vietnam economic update: Investing in people for an equitable and prosperous Vietnam. World Bank Group. https://www.worldbank.org/en/country/vietnam"),
  blank(),
  body("World Bank. (2023). Logistics performance index 2023: Connecting to compete. World Bank Group. https://lpi.worldbank.org"),
];

// ── Word Count Table ──────────────────────────────────────────────────────────

const tablePageBreak = pageBreak();
const tableHeader = centeredBold("APPENDIX A: RECOMMENDED WORD DISTRIBUTION");
const border = { style: BorderStyle.SINGLE, size: 1, color: "333333" };
const borders = { top: border, bottom: border, left: border, right: border };
function tcell(text, shade, bold = false) {
  return new TableCell({
    borders,
    width: { size: 4680, type: WidthType.DXA },
    shading: { fill: shade, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({ children: [new TextRun({ text, font: FONT, size: BODY_SIZE, bold })] })]
  });
}

const wordTable = new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: [4680, 4680],
  rows: [
    new TableRow({ children: [tcell("Section", "D5E8F0", true), tcell("Approximate Word Count", "D5E8F0", true)] }),
    new TableRow({ children: [tcell("1. Executive Summary", "FFFFFF"), tcell("~145 words", "FFFFFF")] }),
    new TableRow({ children: [tcell("2. Introduction to the Case", "F5F5F5"), tcell("~290 words", "F5F5F5")] }),
    new TableRow({ children: [tcell("3. Case Evaluation: Opportunities and Threats", "FFFFFF"), tcell("~990 words", "FFFFFF")] }),
    new TableRow({ children: [tcell("4. Strategies and Solutions", "F5F5F5"), tcell("~670 words", "F5F5F5")] }),
    new TableRow({ children: [tcell("5. Funding and Resources", "FFFFFF"), tcell("~580 words", "FFFFFF")] }),
    new TableRow({ children: [tcell("6. Conclusion", "F5F5F5"), tcell("~230 words", "F5F5F5")] }),
    new TableRow({ children: [tcell("TOTAL (excl. references)", "E8F4E8", true), tcell("~2,905 words", "E8F4E8", true)] }),
  ]
});

children.push(tablePageBreak, blank(), tableHeader, blank(), wordTable, blank());

// ── Build Document ────────────────────────────────────────────────────────────
const doc = new Document({
  styles: {
    default: { document: { run: { font: FONT, size: BODY_SIZE } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: H1_SIZE, bold: true, font: FONT },
        paragraph: { spacing: { line: 480, before: 400, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: H2_SIZE, bold: true, font: FONT },
        paragraph: { spacing: { line: 480, before: 300, after: 160 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: H3_SIZE, bold: true, italics: true, font: FONT },
        paragraph: { spacing: { line: 480, before: 240, after: 120 }, outlineLevel: 2 } },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 }, // A4
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1800 } // 1.25" left, 1" others
      }
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          children: [
            new TextRun({ text: "Gretaa Corporation — Business Report  |  Page ", font: FONT, size: 18 }),
            new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 18 }),
          ],
          alignment: AlignmentType.CENTER,
        })]
      })
    },
    children
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync("Gretaa_Corporation_Business_Report.docx", buf);
  console.log("Done. Saved to Gretaa_Corporation_Business_Report.docx");
});
