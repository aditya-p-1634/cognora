export type DiagnosticTemporalState =
	| "emerging"
	| "stable"
	| "fading"
	| "approaching-floor";

export type DiagnosticSignalStrength =
	| "weak"
	| "moderate"
	| "strong"
	| "dominant";

export interface DiagnosticGravityState {
	raw: number;
	effective: number;
	integrityModulation: number;
	temporalState: DiagnosticTemporalState;
	signalStrength: DiagnosticSignalStrength;
}

export interface DiagnosticResurfacingReason {
	label: string;
	influence: number;
	description: string;
}

export interface DiagnosticRelationshipSignal {
	relationshipId: string;

	targetThoughtId: string;

	relationshipKind:
		| "extends"
		| "relates"
		| "continues"
		| "contrasts"
		| "informs";

	confidence: number;

	integrityWeight: number;

	resonanceWeight: number;

	description: string;
}

export interface DiagnosticUnresolvedInfluence {
	active: boolean;

	tension: number;

	resurfacingPressure: number;

	description: string;
}

export interface ThoughtDiagnosticSnapshot {
	thoughtId: string;

	gravity: DiagnosticGravityState;

	unresolved: DiagnosticUnresolvedInfluence;

	relationships: DiagnosticRelationshipSignal[];

	resurfacingReasons: DiagnosticResurfacingReason[];

	semanticIntegrity: {
		score: number;
		description: string;
	};

	continuity: {
		sessionDepth: number;
		recurrenceStrength: number;
		topologyDensity: number;
	};

	createdAt: string;

	lastActiveAt?: string;
}