export { computeThreadRelationships } from "./compute-thread-relationships";
export { computeLatentContinuityWeights } from "./latent-continuity";
export {
  computeRecurringConceptWeights,
  extractThoughtProfile,
  extractProfilesForThreads,
} from "./semantic/extract-profile";
export {
  normalizeSemanticKey,
  toDisplayLabel,
  tokenizeSemanticText,
  formatThemeList,
} from "./semantic/normalize";
export { scoreRelationshipPair } from "./scoring/score-pair";
export { RELATIONSHIP_THRESHOLDS, RELATIONSHIP_WEIGHTS } from "./scoring/constants";
export { computeInfluenceField } from "./compute-influence-field";
export type {
  RelatedThought,
  RelationshipAffinity,
  RelationshipEngineInput,
  RelationshipScoreComponents,
  ScoredThreadRelationship,
  ThreadRelationshipSnapshot,
  ThoughtSemanticProfile,
  InfluenceBand,
  InfluenceEntry,
  InfluenceField,
} from "./types";