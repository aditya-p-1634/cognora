import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

import { WorkspaceProvider } from "../providers/workspace-provider";
import { ObservabilityProvider } from "../providers/observability-provider";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Cognora",
	description: "A continuity layer for human cognition.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={`${geistSans.variable} ${geistMono.variable}`}
		>
			<body>
				<WorkspaceProvider>
					<ObservabilityProvider>
						{children}
					</ObservabilityProvider>
				</WorkspaceProvider>
			</body>
		</html>
	);
}