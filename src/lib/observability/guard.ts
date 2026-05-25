export function isObservabilityEnabled(): boolean {
	return process.env.NODE_ENV === "development";
}

export function assertObservabilityAccess(): boolean {
	return isObservabilityEnabled();
}