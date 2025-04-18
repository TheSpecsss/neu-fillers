import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { Layers } from "lucide-react";
import React from "react";

interface AppSidebarProps {
	elements: Array<{
		id: string;
		text: string;
	}>;
	selectedElementId: string | null;
	onSelectElement: (id: string) => void;
}

const AppSidebar = ({
	elements,
	selectedElementId,
	onSelectElement,
}: AppSidebarProps) => {
	return (
		<Sidebar collapsible="icon">
			<SidebarHeader>
				<SidebarTrigger className="shrink-0" />
				<div className="flex items-center justify-between px-2 h-10">
					<div className="flex items-center gap-2">
						<Layers className="h-5 w-5 text-element shrink-0" />
						<span className="font-medium group-data-[collapsible=icon]:hidden">
							Elements
						</span>
					</div>
				</div>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
						All Elements
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<ScrollArea className="h-[calc(100vh-180px)]">
							<SidebarMenu>
								{elements.length === 0 ? (
									<div className="px-4 py-3 text-sm text-muted-foreground italic group-data-[collapsible=icon]:hidden">
										No elements created yet
									</div>
								) : (
									elements.map((element) => (
										<SidebarMenuItem key={element.id}>
											<SidebarMenuButton
												isActive={element.id === selectedElementId}
												onClick={() => onSelectElement(element.id)}
												tooltip={element.text || "Unnamed Element"}
												className="flex items-center gap-2"
											>
												<div className="w-2 h-2 rounded-full bg-element shrink-0" />
												<span className="group-data-[collapsible=icon]:hidden truncate">
													{element.text || "Unnamed Element"}
												</span>
											</SidebarMenuButton>
										</SidebarMenuItem>
									))
								)}
							</SidebarMenu>
						</ScrollArea>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter className="text-xs text-muted-foreground px-4 pb-4 group-data-[collapsible=icon]:hidden">
				Click on an element to select it
			</SidebarFooter>

			<SidebarRail />
		</Sidebar>
	);
};

export default AppSidebar;
