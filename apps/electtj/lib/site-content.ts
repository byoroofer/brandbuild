export type NavItem = {
  href: string;
  label: string;
};

export type HighlightCard = {
  eyebrow: string;
  title: string;
  description: string;
};

export type PolicyCard = {
  title: string;
  description: string;
};

export type MediaCard = {
  outlet: string;
  title: string;
  summary: string;
};

export type VolunteerTrack = {
  title: string;
  description: string;
};

export type SocialLink = {
  href: string;
  label: string;
};

export type StatItem = {
  value: string;
  label: string;
  detail: string;
};

export type ActionPath = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
};

export type StepItem = {
  title: string;
  description: string;
};

export type DonateTier = {
  amount: string;
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
};

export const siteMeta = {
  title: "TJ Ware for Congress",
  shortTitle: "ElectTJ",
  districtLabel: "Texas District 24",
  description:
    "Official campaign website for TJ Ware for Congress in Texas District 24. Donate, volunteer, request signs, invite TJ, and follow the campaign.",
  email: "info@ElectTJ.com",
  phoneLabel: "(214) 299-2480",
  phoneHref: "tel:+12142992480",
};

export const actionLinks = {
  actBlue: "https://secure.actblue.com/donate/tj-ware-for-congress-1",
  anedot: "https://secure.anedot.com/45c0a862-5ac1-4505-9edb-bf78f0063047/d445",
  volunteer: "https://forms.gle/UnVVGxHi7WW7gn3y7",
  requestSign:
    "https://docs.google.com/forms/d/e/1FAIpQLSdqlL1vT_4jR_k3aP3gNVUrwvPuNiYstoIt0brgCr21DyU6SQ/viewform?usp=header",
  survey: "https://electtj.com/voter-survey",
  liveMediaHub: "https://electtj.com/media",
  merchHub: "https://electtj.com/campaign-merch",
  eventsHub: "https://electtj.com/events",
  email: "mailto:info@ElectTJ.com",
  pressEmail: "mailto:info@ElectTJ.com?subject=Press%20Inquiry%20for%20TJ%20Ware",
  speakEmail: "mailto:info@ElectTJ.com?subject=Invite%20TJ%20Ware%20to%20Speak",
};

export const primaryNavigation: NavItem[] = [
  { href: "/about-tj", label: "About" },
  { href: "/policy", label: "Policy" },
  { href: "/cd-24", label: "District" },
  { href: "/media", label: "Media" },
  { href: "/events", label: "Events" },
  { href: "/volunteer", label: "Volunteer" },
];

export const utilityNavigation: NavItem[] = [
  { href: "/campaign-merch", label: "Merch" },
  { href: "/donate", label: "Donate" },
];

export const socialLinks: SocialLink[] = [
  { label: "Facebook", href: "https://www.facebook.com/285876691277627" },
  { label: "Instagram", href: "https://www.instagram.com/tjwareforcongress/" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/tj-ware-18b90a16/" },
  { label: "TikTok", href: "https://www.tiktok.com/@tj_ware" },
  { label: "X", href: "https://www.x.com/therealTJWare" },
  { label: "YouTube", href: "https://www.youtube.com/@TJWareForCongress" },
];

export const imageUrls = {
  hero:
    "https://img1.wsimg.com/isteam/ip/6f424ad8-19a0-45ba-8188-3f05813aac8e/I%E2%80%99m%20running%20for%20Congress%20because%20I%20love%20this%20c.png/%3A/cr%3Dt%3A0%25%2Cl%3A0%25%2Cw%3A100%25%2Ch%3A100%25/rs%3Dw%3A700%2Ccg%3Atrue",
  summit:
    "https://img1.wsimg.com/isteam/ip/6f424ad8-19a0-45ba-8188-3f05813aac8e/485036564_29830527346546510_301951443090146667.jpg/%3A/cr%3Dt%3A12.49%25%2Cl%3A0%25%2Cw%3A100%25%2Ch%3A75.02%25/rs%3Dw%3A600%2Ch%3A300%2Ccg%3Atrue",
  district:
    "https://img1.wsimg.com/isteam/ip/6f424ad8-19a0-45ba-8188-3f05813aac8e/20240724_100352.jpg/%3A/cr%3Dt%3A12.52%25%2Cl%3A0%25%2Cw%3A100%25%2Ch%3A74.97%25/rs%3Dw%3A600%2Ch%3A300%2Ccg%3Atrue",
  logo:
    "https://img1.wsimg.com/isteam/ip/6f424ad8-19a0-45ba-8188-3f05813aac8e/image4.png/%3A/rs%3Dh%3A247%2Ccg%3Atrue%2Cm/qt%3Dq%3A95",
};

export const heroProof = [
  "Marine Corps Iraq veteran",
  "Pilot, electrician, roofer, and small-business operator",
  "Consumer advocate and father of ten",
];

export const homeStats: StatItem[] = [
  {
    value: "10",
    label: "children and a direct stake in the future",
    detail:
      "The family story gives the campaign real stakes and keeps the message grounded in what policy means at home.",
  },
  {
    value: "CBS + NBCDFW",
    label: "public proof already in market",
    detail:
      "Coverage tied to crisis response and community action raises credibility much faster than campaign copy alone.",
  },
  {
    value: "2",
    label: "live contribution routes supporters already trust",
    detail:
      "ActBlue and Anedot are both already available, which lets the rebuild focus on confidence and clarity instead of new payment plumbing.",
  },
  {
    value: "TX-24",
    label: "one district, one focused story",
    detail:
      "Everything is organized around North Texas families, employers, neighborhoods, and a campaign built to show up locally.",
  },
];

export const supporterPaths: ActionPath[] = [
  {
    eyebrow: "Donate",
    title: "Fund district outreach, creative production, and campaign momentum.",
    description:
      "The fastest path for supporters who are ready to move the campaign from attention into execution.",
    href: "/donate",
    ctaLabel: "Donate now",
  },
  {
    eyebrow: "Volunteer",
    title: "Join field outreach, events, visibility, or digital response.",
    description:
      "The volunteer application is already live. The upgraded site simply makes the entry point feel far more credible and organized.",
    href: "/volunteer",
    ctaLabel: "Join the team",
  },
  {
    eyebrow: "Invite TJ",
    title: "Bring TJ into a room, neighborhood, or coalition conversation.",
    description:
      "Speaking invitations, community gatherings, and local organizing requests should be easy to start from the site.",
    href: actionLinks.speakEmail,
    ctaLabel: "Invite TJ",
  },
  {
    eyebrow: "Voter survey",
    title: "Tell the campaign what matters most across District 24.",
    description:
      "The survey remains one of the best low-friction ways for local voters to shape the campaign conversation.",
    href: actionLinks.survey,
    ctaLabel: "Take the survey",
  },
  {
    eyebrow: "Signs and merch",
    title: "Turn support into visible district presence.",
    description:
      "Request yard signs, review merch, and help the campaign show up physically in neighborhoods and local events.",
    href: "/campaign-merch",
    ctaLabel: "Request signs",
  },
  {
    eyebrow: "Media and proof",
    title: "Review the public record before you commit.",
    description:
      "The media hub turns scattered proof points into a cleaner credibility surface for supporters, donors, and press.",
    href: "/media",
    ctaLabel: "Open media",
  },
];

export const homeHighlights: HighlightCard[] = [
  {
    eyebrow: "Credibility over theater",
    title: "A campaign that feels earned instead of manufactured.",
    description:
      "The strongest case for TJ Ware comes from service, work, advocacy, and visible action, not generic political staging.",
  },
  {
    eyebrow: "District first",
    title: "Grounded in North Texas families, employers, and neighborhoods.",
    description:
      "The site keeps returning to affordability, healthcare access, growth, resilience, and everyday public trust in TX-24.",
  },
  {
    eyebrow: "Action oriented",
    title: "Built to turn attention into donations, volunteers, events, and local visibility.",
    description:
      "The conversion architecture is designed to be clean and disciplined, not noisy or consultant-made.",
  },
];

export const storyBeats: HighlightCard[] = [
  {
    eyebrow: "Built around work",
    title: "The story starts with labor, family, and real-world responsibility.",
    description:
      "TJ Ware's public narrative begins in Fort Worth around trades work, family pressure, small-business hustle, and early exposure to public institutions.",
  },
  {
    eyebrow: "Shaped by service",
    title: "Military service after 9/11 still anchors the campaign's seriousness.",
    description:
      "The Marine Corps chapter gives the story a weight that feels lived, disciplined, and harder to dismiss as politics by branding.",
  },
  {
    eyebrow: "Validated in the field",
    title: "Aviation, business, disaster response, and advocacy keep the message grounded.",
    description:
      "That mix of operator experience helps the campaign read more like a high-agency public servant and less like a media product.",
  },
];

export const trustPoints = [
  "Worked with the U.S. Department of Justice before age 17",
  "Enlisted after 9/11 and served in Iraq with the Marine Corps",
  "Used the GI Bill to become an instrument-rated pilot",
  "Built and operated businesses across multiple states",
  "Advocated for consumers and policyholders in insurance reform",
  "Father of ten with deep family stakes in the country's future",
];

export const coalitionCards: HighlightCard[] = [
  {
    eyebrow: "Working families",
    title: "Built for parents, caregivers, and households feeling pressure every month.",
    description:
      "Affordability, healthcare access, education, and housing fairness are not side notes. They are part of the campaign's central argument.",
  },
  {
    eyebrow: "Veterans and service-minded Texans",
    title: "Seriousness comes through when service is part of the candidate's real biography.",
    description:
      "The campaign has an easier time earning trust from voters who care about discipline, sacrifice, and public duty.",
  },
  {
    eyebrow: "Builders and employers",
    title: "Small-business operators, tradespeople, and problem solvers need representation too.",
    description:
      "TJ's operator background gives the economic message a practical tone that feels closer to the district's working reality.",
  },
  {
    eyebrow: "Voters tired of corruption",
    title: "This campaign is strongest when it sounds allergic to insider games and public gaslighting.",
    description:
      "The trust-and-accountability lane is not just rhetorical. It is one of the cleanest strategic contrasts in the entire platform.",
  },
];

export const aboutMilestones: HighlightCard[] = [
  {
    eyebrow: "Early responsibility",
    title: "Blue-collar roots and early public-service exposure.",
    description:
      "Raised in Fort Worth around small-business operators and trades work, TJ entered the workforce young and saw public institutions up close at the Department of Justice.",
  },
  {
    eyebrow: "Military service",
    title: "A Marine Corps path shaped by post-9/11 conviction.",
    description:
      "After witnessing the impact of 9/11 firsthand, he enlisted, trained as a leader, and deployed to Iraq during a brutal phase of the war.",
  },
  {
    eyebrow: "Operator mindset",
    title: "Pilot, electrician, roofer, founder, and field operator.",
    description:
      "That mix of trades, aviation, small-business ownership, and disaster response informs a campaign voice that reads more practical than polished for television.",
  },
  {
    eyebrow: "Advocacy and community",
    title: "Consumer advocacy, nonprofit service, and family leadership.",
    description:
      "The public biography highlights work with policyholder associations, disaster relief, special-needs advocacy, maternal-health nonprofits, and a large family anchored in North Texas.",
  },
];

export const policyThemes: HighlightCard[] = [
  {
    eyebrow: "Clean government",
    title: "Rebuild trust with consequences for corruption and deception.",
    description:
      "Truth in government, term limits, anti-stock-trading rules, and stronger campaign-finance reform all reinforce the accountability frame.",
  },
  {
    eyebrow: "Working families",
    title: "Protect affordability, access, and the dignity of ordinary households.",
    description:
      "Housing fairness, healthcare access, education, and economic breathing room remain central to how the campaign speaks to the district.",
  },
  {
    eyebrow: "Consumer protection",
    title: "Bring operator-level scrutiny to insurance and claims abuse.",
    description:
      "The insurance oversight proposals stand out because they are tied to the candidate's real experience in that ecosystem.",
  },
  {
    eyebrow: "Economic resilience",
    title: "Treat reshoring, logistics, preparedness, and food security as public-value issues.",
    description:
      "The broader economic agenda is framed around resilience and long-term national strength instead of short-term applause lines.",
  },
];

export const featuredPolicies: PolicyCard[] = [
  {
    title: "Truth-in-Government Act of 2027",
    description:
      "Creates accountability for knowingly misleading the public while acting in official capacity, aiming to restore trust in public office.",
  },
  {
    title: "Fair Housing and Anti-Monopoly Homeownership Act",
    description:
      "Treats bulk corporate ownership of single-family homes as a market-fairness problem and pushes housing access back toward families.",
  },
  {
    title: "Congressional Anti-Stock Trading Act",
    description:
      "Blocks members of Congress from trading individual stocks while in office to reduce conflicts of interest and insider-knowledge abuse.",
  },
  {
    title: "Campaign Finance Reform Act",
    description:
      "Pushes for tighter contribution rules, greater transparency, and a smaller role for untraceable institutional money in federal elections.",
  },
  {
    title: "FAA Medical Reform Bill",
    description:
      "Seeks a less punitive certification process for pilots while protecting safety and reinforcing general aviation as a public good.",
  },
  {
    title: "Insurance Oversight and Accountability Act",
    description:
      "Proposes an enforcement body funded through fines on insurers that violate claims-handling laws or engage in deceptive conduct.",
  },
  {
    title: "NAREPA",
    description:
      "The North American Reshoring and Economic Partnership Act aims to rebuild manufacturing strength through coordinated U.S., Mexico, and Canada policy.",
  },
  {
    title: "Food Security and Civil Preparedness Act",
    description:
      "Builds stronger public-private emergency food protocols so communities are more resilient during disasters and unrest.",
  },
];

export const supportPoints = [
  "Smart Medicaid expansion and broader healthcare access",
  "Voting rights and electoral reform",
  "Women's bodily autonomy",
  "Environmental protection and clean energy",
  "Education funding and stronger public schools",
  "A working-class economic focus",
  "Flood relief and disaster preparedness",
  "Term limits and accountability reforms",
];

export const opposePoints = [
  "Pay-to-play politics and revolving-door influence",
  "Corporate tax breaks over public welfare",
  "Abortion bans",
  "Industrial monopoly and anti-competitive practices",
  "ICE raids on non-criminals",
  "Political purges and Hatch Act violations",
  "Unlimited presidential pardon powers",
  "Public deception from elected officials",
];

export const districtCommunities = [
  "Addison",
  "Arlington",
  "Carrollton",
  "Coppell",
  "Dallas",
  "Euless",
  "Fort Worth",
  "Frisco",
  "Grapevine",
  "Lewisville",
  "Richardson",
  "Southlake",
];

export const districtPriorities: HighlightCard[] = [
  {
    eyebrow: "Family economics",
    title: "Lower pressure on housing, healthcare, and day-to-day costs.",
    description:
      "The public platform keeps coming back to middle-class breathing room: wages, affordability, housing access, and a less rigged economy.",
  },
  {
    eyebrow: "Growth with backbone",
    title: "Support North Texas business growth without selling out the public.",
    description:
      "District 24 is framed as a place of builders, employers, and working families that deserves practical growth instead of insider favoritism.",
  },
  {
    eyebrow: "Prepared communities",
    title: "Take disaster readiness and infrastructure resilience seriously.",
    description:
      "Flood response, storm recovery, food security, and public preparedness appear repeatedly across the campaign's media and policy posture.",
  },
  {
    eyebrow: "Fairness and safety",
    title: "Push for public safety without abandoning fairness or civil rights.",
    description:
      "The public message pairs accountability, anti-corruption, and sensible criminal-justice reform with a clear rejection of cruelty and performative chaos.",
  },
];

export const mediaMoments: MediaCard[] = [
  {
    outlet: "CBS News Texas",
    title: "Flood coverage tied to visible, on-the-ground response",
    summary:
      "The strongest local television proof positions TJ as active and present when communities are under pressure, not just politically visible when cameras are on.",
  },
  {
    outlet: "NBCDFW",
    title: "Winter storm response and public-service credibility",
    summary:
      "That coverage supports one of the clearest campaign contrasts: practical response, community action, and preparedness instead of performance politics.",
  },
  {
    outlet: "Audacy and radio",
    title: "Long-form conversation instead of stump-speech repetition",
    summary:
      "Radio and interview appearances make the campaign sound more substantive, more comfortable in detail, and more prepared to handle real questions.",
  },
  {
    outlet: "YouTube and podcasts",
    title: "A broader record across insurance, roofing, advocacy, and civic issues",
    summary:
      "Those conversations reinforce the operator profile and make the campaign feel more durable than a social-only presence.",
  },
];

export const pressHighlights: StatItem[] = [
  {
    value: "CBS + NBCDFW",
    label: "local television proof already in market",
    detail:
      "The most credible clips tie the campaign to visible response during real public emergencies and local pressure points.",
  },
  {
    value: "Audacy",
    label: "radio and long-form public explanation",
    detail:
      "Those interviews help the campaign feel more durable than a stream of shallow social posts.",
  },
  {
    value: "YouTube",
    label: "industry and issue-specific conversation",
    detail:
      "The archive supports a narrative of experience across insurance, roofing, recovery, and advocacy.",
  },
  {
    value: "Live archive",
    label: "one place for proof and press follow-up",
    detail:
      "The rebuilt media page acts like a front door, while the live archive remains available as source material.",
  },
];

export const volunteerTracks: VolunteerTrack[] = [
  {
    title: "Neighborhood outreach",
    description:
      "Help the campaign make voter contact, distribute signs, and grow a visible presence in neighborhoods and community events.",
  },
  {
    title: "Digital rapid response",
    description:
      "Support social clips, event amplification, issue communication, and the quick-turn content that makes a modern campaign feel alive.",
  },
  {
    title: "Events and coalition support",
    description:
      "Help coordinate speaking invitations, room logistics, local hosts, and coalition-building opportunities across District 24.",
  },
  {
    title: "Paid staff interest",
    description:
      "The live volunteer application also invites paid staff applicants, so the new page keeps that pathway visible and credible.",
  },
];

export const volunteerSteps: StepItem[] = [
  {
    title: "Choose your lane",
    description:
      "Start with the area where you can move fastest: field, events, digital support, or staffing interest.",
  },
  {
    title: "Complete the application",
    description:
      "The existing form stays live, but the redesigned page gives it a clearer context and much stronger conversion framing.",
  },
  {
    title: "Get deployed with purpose",
    description:
      "A premium volunteer page should make people feel useful quickly, not confused about what happens next.",
  },
];

export const donorPaths: ActionPath[] = [
  {
    eyebrow: "Primary route",
    title: "Use the campaign's clearest checkout path.",
    description:
      "ActBlue remains the most familiar option for supporters who want a fast, campaign-native donation flow.",
    href: actionLinks.actBlue,
    ctaLabel: "Give with ActBlue",
  },
  {
    eyebrow: "Backup route",
    title: "Use the second trusted processor if you prefer.",
    description:
      "Anedot keeps a second path available for supporters who want a different payment experience or device behavior.",
    href: actionLinks.anedot,
    ctaLabel: "Give with Anedot",
  },
  {
    eyebrow: "Visibility support",
    title: "Pair your contribution with district presence.",
    description:
      "Supporters who want to do more than donate can move directly into signs, merch, and visible campaign support.",
    href: "/campaign-merch",
    ctaLabel: "Request signs",
  },
];

export const donationTiers: DonateTier[] = [
  {
    amount: "$10",
    title: "Help cover small-dollar digital outreach.",
    description:
      "A modest contribution can still support voter contact, updates, and campaign communication across the district.",
    href: actionLinks.actBlue,
    ctaLabel: "Contribute",
  },
  {
    amount: "$25",
    title: "Support literature, signs, and local visibility.",
    description:
      "This level helps the campaign show up in neighborhoods, at events, and in direct voter contact materials.",
    href: actionLinks.actBlue,
    ctaLabel: "Contribute",
  },
  {
    amount: "$50",
    title: "Back event logistics and volunteer support.",
    description:
      "Contributions at this level help power the real-world work required to host stops and activate supporters.",
    href: actionLinks.actBlue,
    ctaLabel: "Contribute",
  },
  {
    amount: "$100",
    title: "Fuel district travel, media, and campaign operations.",
    description:
      "Larger gifts help the campaign move faster, communicate better, and sustain a more visible presence across TX-24.",
    href: actionLinks.actBlue,
    ctaLabel: "Contribute",
  },
];

export const donationTrustPoints = [
  "Primary donation path through ActBlue",
  "Secondary path through Anedot if preferred",
  "Existing campaign processors stay in place",
  "Support funds district communications, events, signs, and organizing",
];

export const donationUses = [
  "Digital outreach and creative production",
  "Volunteer support, field materials, and printing",
  "District travel, speaking stops, and local events",
  "Yard signs, direct voter communication, and campaign infrastructure",
];

export const merchHighlights = [
  {
    title: "Campaign t-shirts",
    description:
      "Keep the merch experience clean, intentional, and campaign-grade instead of throwing voters into a cluttered storefront.",
  },
  {
    title: "Campaign koozies",
    description:
      "Low-friction campaign items matter when they feel cohesive, locally rooted, and easy to request or distribute.",
  },
  {
    title: "Yard signs",
    description:
      "The current public site offers free sign drop-off in DFW, with suggested donations at the $25 to $50 level to help cover campaign costs.",
  },
];
