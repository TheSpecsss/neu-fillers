import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OpenAIClient } from "@/lib/openai";
import { useState } from "react";
import { toast } from "sonner";

export function OpenAITest() {
	const [response, setResponse] = useState<string>("");
	const [isLoading, setIsLoading] = useState(false);

	const testOpenAI = async () => {
		try {
			setIsLoading(true);
			setResponse("");

			const client = new OpenAIClient();
			const result = await client.createChatCompletion([
				{ role: "user", content: "who are you" },
			]);

			setResponse(result.content);
			toast.success("OpenAI API test successful!");
		} catch (error) {
			console.error("OpenAI API test failed:", error);
			toast.error("OpenAI API test failed. Check console for details.");
			setResponse("Error: Failed to get response from OpenAI");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>OpenAI API Test</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<Button onClick={testOpenAI} disabled={isLoading} className="w-full">
						{isLoading ? "Testing..." : "Test OpenAI Connection"}
					</Button>

					{response && (
						<div className="p-4 bg-muted rounded-lg">
							<p className="text-sm font-medium mb-2">Response:</p>
							<p className="text-sm whitespace-pre-wrap">{response}</p>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
