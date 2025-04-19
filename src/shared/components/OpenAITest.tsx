import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ApiClient, ApiError } from "@/lib/api";
import { useState } from "react";
import { toast } from "sonner";

export function OpenAITest() {
	const [response, setResponse] = useState<string>("");
	const [isLoading, setIsLoading] = useState(false);

	const testOpenAI = async () => {
		try {
			setIsLoading(true);
			setResponse("");

			const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
			if (!apiKey) {
				throw new Error('VITE_OPENAI_API_KEY is not set in environment variables');
			}

			const client = new ApiClient();
			const result = await client.createChatCompletion([
				{ role: "user", content: "Hello, who are you" },
			]);

			setResponse(result.choices[0].message.content);
			toast.success("AI response received!");
		} catch (error) {
			console.error("API test failed:", error);
			
			let errorMessage = "Failed to get response from AI";
			if (error instanceof ApiError) {
				errorMessage = error.message;
			} else if (error instanceof Error) {
				errorMessage = error.message;
			}

			toast.error(`AI test failed: ${errorMessage}`);
			setResponse(`Error: ${errorMessage}\n\nConfiguration:\n- API Base: ${import.meta.env.VITE_OPENAI_API_BASE}\n- Environment: ${import.meta.env.MODE}\n\nPlease ensure:\n1. VITE_OPENAI_API_KEY is set\n2. VITE_OPENAI_API_BASE is set correctly\n3. Check browser console for more details`);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>AI Test</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<Button onClick={testOpenAI} disabled={isLoading} className="w-full">
						{isLoading ? "Asking AI..." : "Ask AI: Who are you?"}
					</Button>

					{response && (
						<div className={`p-4 rounded-lg ${response.startsWith('Error:') ? 'bg-destructive/10' : 'bg-muted'}`}>
							<p className="text-sm font-medium mb-2">
								{response.startsWith('Error:') ? 'Error:' : 'AI Response:'}
							</p>
							<p className="text-sm whitespace-pre-wrap">{response.replace('Error: ', '')}</p>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
