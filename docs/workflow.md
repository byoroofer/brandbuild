# Workflow

## Operator flow

1. Create or open a campaign.
2. Review the brief, platforms, offer, and audience.
3. Break the work into scenes and shots.
4. Build a structured prompt for each shot.
5. Confirm the model routing recommendation.
6. Track generations, reference assets, and delivery assets.
7. Review realism, brand fit, hook strength, editability, motion quality, and prompt fidelity.
8. Mark selects, rejects, or holds for final handoff.

## Persistence behavior

- With full Supabase admin config, the dashboard can read and write live studio data.
- Without it, the app falls back to deterministic demo content.
- The current editor persists the composed prompt text plus stored shot fields, while `subject` and `action` are derived from the composed prompt text for compatibility with the richer schema.
