const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-5.6-luna';

function buildFallback(riskAnalysis = {}) {
  const score = Number(riskAnalysis.score || 0);
  const level = riskAnalysis.level || 'LOW';
  const factors = Array.isArray(riskAnalysis.contributingFactors) ? riskAnalysis.contributingFactors : [];
  const anomalies = Array.isArray(riskAnalysis.detectedAnomalies) ? riskAnalysis.detectedAnomalies : [];
  const actions = Array.isArray(riskAnalysis.recommendedActions) ? riskAnalysis.recommendedActions : [];
  const proxWarn = riskAnalysis.proximityWarning;

  // This is a deterministic, explainable fallback — no API, internet or paid model required.
  const positiveWeights = factors
    .map((f) => Number(f.weight) || 0)
    .filter((w) => w > 0)
    .sort((a, b) => b - a);
  const signalCount = new Set([
    ...factors.map((f) => f.factor),
    ...anomalies,
    proxWarn ? `PROXIMITY:${proxWarn.tier}` : null
  ].filter(Boolean)).size;

  // Confidence here means "assessment confidence", not a probability of an incident.
  // More independent signals increase confidence; an unmapped location reduces it.
  let confidence = 68 + Math.min(22, signalCount * 5);
  if (riskAnalysis.zoneType === 'UNMAPPED') confidence -= 8;
  if (proxWarn) confidence += 3;
  confidence = Math.max(55, Math.min(96, confidence));

  let summary = 'Safety conditions are stable. Continue standard monitoring.';
  let decision = 'MONITOR';
  let urgency = 'ROUTINE';
  if (level === 'MEDIUM') {
    summary = 'Moderate risk detected. Increase monitoring and address the active warning before risk escalates.';
    decision = 'WARN';
    urgency = 'ELEVATED';
  }
  if (level === 'HIGH') {
    summary = 'Elevated risk detected from multiple safety signals. Active authority monitoring is recommended now.';
    decision = 'ESCALATE';
    urgency = 'HIGH';
  }
  if (level === 'CRITICAL') {
    summary = 'Critical safety condition detected. Treat this assessment as an immediate response priority.';
    decision = 'EMERGENCY';
    urgency = 'IMMEDIATE';
  }

  const topFactors = [...factors]
    .filter((f) => Number(f.weight) > 0)
    .sort((a, b) => Number(b.weight) - Number(a.weight))
    .slice(0, 3);

  const reasoning = topFactors.length
    ? `Signal fusion identified ${signalCount} safety indicator${signalCount === 1 ? '' : 's'}. Highest contributors: ${topFactors.map((f) => `${f.factor} (+${f.weight})`).join(', ')}. Current assessment is ${level} at ${score}/100.`
    : anomalies.length
      ? `The engine detected ${signalCount} safety indicator${signalCount === 1 ? '' : 's'}, including ${anomalies.slice(0, 2).join(' and ')}.`
      : 'No elevated safety indicators are currently contributing to the assessment.';

  const signalSummary = [
    ...topFactors.map((f) => ({
      signal: f.factor,
      impact: `+${Number(f.weight) || 0}`,
      status: 'ACTIVE',
      detail: f.description
    })),
    ...(proxWarn ? [{
      signal: `${proxWarn.tier} proximity`,
      impact: proxWarn.distanceMeters === 0 ? 'BREACH' : `${proxWarn.distanceMeters}m`,
      status: proxWarn.severity || 'WARNING',
      detail: proxWarn.message
    }] : [])
  ].slice(0, 5);

  return {
    provider: 'fallback-explainable-engine',
    model: null,
    mode: 'deterministic',
    summary,
    reasoning: reasoning.slice(0, 800),
    priority: level,
    decision,
    urgency,
    confidence,
    signalCount,
    signalSummary,
    topRiskDrivers: topFactors.map((f) => ({
      name: f.factor,
      weight: Number(f.weight) || 0,
      description: f.description
    })),
    recommendedActions: actions.slice(0, 4),
    generatedAt: new Date().toISOString()
  };
}
function extractJson(text) {
  const cleaned = String(text || '').trim().replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
  const first = cleaned.indexOf('{');
  const last = cleaned.lastIndexOf('}');
  if (first === -1 || last === -1 || last <= first) throw new Error('AI returned invalid JSON');
  return JSON.parse(cleaned.slice(first, last + 1));
}

async function generateSafetyAdvice(riskAnalysis, context = {}) {
  if (!process.env.OPENAI_API_KEY) return buildFallback(riskAnalysis);

  const safePayload = {
    score: riskAnalysis?.score ?? 0,
    level: riskAnalysis?.level || 'LOW',
    zone: riskAnalysis?.zone || 'Unmapped Area',
    zoneType: riskAnalysis?.zoneType || 'UNMAPPED',
    contributingFactors: (riskAnalysis?.contributingFactors || []).slice(0, 8).map((f) => ({
      factor: f.factor,
      weight: f.weight,
      description: f.description
    })),
    detectedAnomalies: (riskAnalysis?.detectedAnomalies || []).slice(0, 8),
    recommendedActions: (riskAnalysis?.recommendedActions || []).slice(0, 8),
    proximityWarning: riskAnalysis?.proximityWarning
      ? {
          tier: riskAnalysis.proximityWarning.tier,
          severity: riskAnalysis.proximityWarning.severity,
          zoneName: riskAnalysis.proximityWarning.zoneName,
          distanceMeters: riskAnalysis.proximityWarning.distanceMeters
        }
      : null,
    telemetry: {
      inactivityMinutes: context.inactivityMinutes ?? null,
      routeDeviationKm: context.routeDeviationKm ?? null,
      isLiveGps: context.isLiveGps ?? null
    }
  };

  const prompt = `You are SafeTour NE's safety-assistance AI. Analyze ONLY the supplied deterministic risk assessment. Do not change the numeric score or invent events. Return valid JSON with exactly these keys: summary, reasoning, priority, decision, urgency, confidence, recommendedActions. Keep summary under 35 words, reasoning under 60 words, priority must be LOW, MEDIUM, HIGH, or CRITICAL; decision must be MONITOR, WARN, ESCALATE, or EMERGENCY; urgency must be ROUTINE, ELEVATED, HIGH, or IMMEDIATE; confidence must be an integer from 50 to 99 and represents assessment confidence, not incident probability; recommendedActions must be an array of 2-4 short operational actions. This is a safety support tool, not a replacement for emergency authorities. Data: ${JSON.stringify(safePayload)}`;

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        store: false,
        input: prompt,
        max_output_tokens: 300
      })
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`OpenAI API ${response.status}: ${body.slice(0, 300)}`);
    }

    const data = await response.json();
    const parsed = extractJson(data.output_text || '');

    return {
      provider: 'openai',
      model: DEFAULT_MODEL,
      mode: 'generative',
      summary: String(parsed.summary || '').slice(0, 500),
      reasoning: String(parsed.reasoning || '').slice(0, 800),
      priority: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(parsed.priority) ? parsed.priority : riskAnalysis.level,
      decision: ['MONITOR', 'WARN', 'ESCALATE', 'EMERGENCY'].includes(parsed.decision) ? parsed.decision : buildFallback(riskAnalysis).decision,
      urgency: String(parsed.urgency || buildFallback(riskAnalysis).urgency),
      confidence: Number.isFinite(Number(parsed.confidence)) ? Math.max(50, Math.min(99, Number(parsed.confidence))) : buildFallback(riskAnalysis).confidence,
      signalCount: buildFallback(riskAnalysis).signalCount,
      signalSummary: buildFallback(riskAnalysis).signalSummary,
      topRiskDrivers: buildFallback(riskAnalysis).topRiskDrivers,
      recommendedActions: Array.isArray(parsed.recommendedActions)
        ? parsed.recommendedActions.slice(0, 4).map(String)
        : riskAnalysis.recommendedActions.slice(0, 4),
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.warn('AI advisor unavailable; using deterministic fallback:', error.message);
    return {
      ...buildFallback(riskAnalysis),
      provider: 'fallback-after-ai-error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
  }
}

module.exports = { generateSafetyAdvice, buildFallback };
