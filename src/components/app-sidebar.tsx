import * as React from "react"
import { Link, useLocation } from "react-router-dom"

// import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
// import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { 
  LayoutDashboardIcon, 
  ListIcon, 
  // ChartBarIcon, 
  // FolderIcon, 
  // UsersIcon, 
  CameraIcon, 
  FileTextIcon, 
  Settings2Icon, 
  CircleHelpIcon, 
  SearchIcon, 
  DatabaseIcon, 
  FileChartColumnIcon, 
  ChevronDownIcon,
  NewspaperIcon,
  // CommandIcon,
  FileIcon} from "lucide-react"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Agentes",
      url: "/",
      icon: (
        <LayoutDashboardIcon
        />
      ),
    },
    {
      title: "Dependencias",
      url: "/dependencias",
      icon: (
        <ListIcon
        />
      ),
    },
    {
      title: "Novedades",
      url: "/novedades",
      icon: <NewspaperIcon />,
    },
    // {
    //   title: "Analytics",
    //   url: "#",
    //   icon: (
    //     <ChartBarIcon
    //     />
    //   ),
    // },
    // {
    //   title: "Projects",
    //   url: "#",
    //   icon: (
    //     <FolderIcon
    //     />
    //   ),
    // },
    // {
    //   title: "Team",
    //   url: "#",
    //   icon: (
    //     <UsersIcon
    //     />
    //   ),
    // },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: (
        <CameraIcon
        />
      ),
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: (
        <FileTextIcon
        />
      ),
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: (
        <FileTextIcon
        />
      ),
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: (
        <Settings2Icon
        />
      ),
    },
    {
      title: "Get Help",
      url: "#",
      icon: (
        <CircleHelpIcon
        />
      ),
    },
    {
      title: "Search",
      url: "#",
      icon: (
        <SearchIcon
        />
      ),
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: (
        <DatabaseIcon
        />
      ),
    },
    {
      name: "Reports",
      url: "#",
      icon: (
        <FileChartColumnIcon
        />
      ),
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: (
        <FileIcon
        />
      ),
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation()
  const [licenciasOpen, setLicenciasOpen] = React.useState(false)

  React.useEffect(() => {
    if (location.pathname.startsWith("/licencias") || location.pathname === "/ver-licencias") {
      setLicenciasOpen(true)
    }
  }, [location.pathname])

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <a
              href="#"
              className="flex items-center justify-center px-2 py-2"
            >
              <img
                src="/logo-color.png"
                alt="Municipalidad de Rivadavia"
                className="h-16 w-auto max-w-full object-contain dark:hidden"
              />
              <img
                src="/logo-white.png"
                alt="Municipalidad de Rivadavia"
                className="hidden h-16 w-auto max-w-full object-contain dark:inline"
              />
            </a>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <SidebarMenu className="mt-2 px-2">
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Licencias">
              <button
                type="button"
                className="flex w-full items-center gap-2"
                onClick={() => setLicenciasOpen((open) => !open)}
              >
                <FileTextIcon />
                <span>Licencias</span>
                <ChevronDownIcon
                  className={`ml-auto transition-transform ${
                    licenciasOpen ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>
            </SidebarMenuButton>
            {licenciasOpen && (
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton asChild>
                    <Link to="/licencias">Crear Licencias</Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton asChild>
                    <Link to="/ver-licencias">Ver Licencias</Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton asChild>
                    <Link to="/licencias-expiradas">Licencia Exp</Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
        {/* <NavDocuments items={data.documents} /> */}
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
