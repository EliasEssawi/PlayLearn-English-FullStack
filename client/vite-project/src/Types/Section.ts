

// Represents a navigation menu item in the UI


export interface MenuItem {
    name: string;
    icon: string;
    url?: string;
}
// Represents an action item inside a sidebar section

export interface SidebarAction {
  section: string;
  label: string;
  icon: string;
}