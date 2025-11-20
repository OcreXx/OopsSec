export interface SidebarItem {
  title: string;
  children: {
    title: string;
    slug: string;
  }[];
}
