
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Truck, User } from "lucide-react";

const companyLinks = [
  { title: "Dashboard", href: "/company-dashboard" },
  { title: "Solicitar Frete", href: "/freight-request" },
  { title: "Fretes Ativos", href: "/active-freights" },
  { title: "Colaboradores", href: "/collaborator-registration" },
];

const driverLinks = [
  { title: "Verificar Documentos", href: "/driver-document-verification" },
];

const Navbar = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const navLinks = profile?.user_type === 'company' ? companyLinks : (profile?.user_type === 'driver' ? driverLinks : []);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to={user ? (profile?.user_type === 'company' ? '/company-dashboard' : '/') : '/'} className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 hidden sm:block">FreightConnect</h1>
          </Link>

          {user && (
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList>
                {navLinks.map((link) => (
                  <NavigationMenuItem key={link.href}>
                    <Link to={link.href}>
                      <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                        {link.title}
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          )}

          <div className="flex items-center space-x-2">
            {user && profile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage src={profile.logo_url || ''} alt={profile.company_name || profile.full_name || 'User'} />
                      <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">{getInitials(profile.company_name || profile.full_name || 'U')}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{profile.company_name || profile.full_name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate(profile.user_type === 'company' ? '/company-profile' : '#')} disabled={profile.user_type !== 'company'}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/lista-fretes')}>Ver Fretes</Button>
                <Button onClick={() => navigate('/login')}>Login</Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
