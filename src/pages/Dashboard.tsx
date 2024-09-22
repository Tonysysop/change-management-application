'use client'

import { Sidebar, SidebarItem } from '@/components/Sidebar';
import { ThemeProvider } from '@/components/theme-provider';

import {
  LifeBuoy,
  Receipt,
  Boxes,
  Package,
  UserCircle,
  LayoutDashboard,
  Settings,
  BarChart3,
} from 'lucide-react'

const Dashboard = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="flex">
        <Sidebar>
          <SidebarItem
            
            icon = {<LayoutDashboard size={20} />}
            text = "Dashboard"
            active
            alert
          />
          <SidebarItem icon={<BarChart3 size={20}  />} text="Statistics" />
          <SidebarItem icon={<UserCircle size={20}  />} text="Users" />
          <SidebarItem icon={<Boxes size={20}  />} text="Inventory" />
          <SidebarItem icon={<Package size={20}  />} text="Orders" alert />
          <SidebarItem icon={<Receipt size={20}  />} text="Billings" />
          <hr className="my-3" />
          <SidebarItem icon={<Settings size={20}  />} text="Settings" />
          <SidebarItem icon={<LifeBuoy size={20}  />} text="Help" />
        </Sidebar>
        <main className="flex-1 p-6">
          <h1>Hello</h1>
          {/* Other content here */}
        </main>
      </div>
    </ThemeProvider>
  );
};

export default Dashboard;
