import { useMutation } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import axios from "axios";

const Logout = () => {
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post("/api/auth/logout");
      return response.data;
    },
    onError: (error) => {
      console.error("Logout failed:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Logout failed",
      });
    },
  });

  if (logoutMutation.isSuccess) {
    localStorage.removeItem("session_token");
    const { setUserData } = useAuthStore();
    const router = useRouter();
    router.push("/login");
    setUserData({
      isLoggedIn: false,
      firstname: "",
      lastname: "",
      email: "",
      id: "",
      type: "",
      interest: [],
      location: [],
      addr: "",
      phone: "",
      city: "",
      zip: "",
      applied_at: "",
      accepted_at: "",
    });
    toast({
      title: "Success",
      description: "Logged out successfully",
    });
  }

  return (
    <DropdownMenuItem asChild>
      <Button
        onClick={() => logoutMutation.mutate()}
        className="w-full justify-start h-8"
        variant="ghost"
      >
        <LogOut />
        Log out
      </Button>
    </DropdownMenuItem>
  );
};
export default Logout;
